"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  menuCategories,
  menuItemOptionChoices,
  menuItemOptions,
  menuItems,
  menus,
  type OrderItemOptionSnapshot,
  orderItems,
  orders,
  restaurants,
  serviceRequests,
  tables,
} from "@/lib/db/schema";
import { triggerRestaurantEvent } from "@/lib/pusher";

const ACTIVE_SUB_STATUSES = ["active", "trialing", "past_due"];

const cartLineSchema = z.object({
  itemId: z.uuid(),
  quantity: z.number().int().min(1).max(50),
  options: z
    .array(
      z.object({
        optionId: z.uuid(),
        choiceId: z.uuid(),
      }),
    )
    .max(20),
});

const createOrderSchema = z.object({
  slug: z.string().min(1),
  token: z.string().min(1),
  customerName: z.string().trim().max(80).optional(),
  customerNote: z.string().trim().max(500).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
  lines: z.array(cartLineSchema).min(1, "Panier vide.").max(50),
});

export type CreateOrderResult = { error: string } | { orderId: string };

export async function createOrderAction(
  raw: unknown,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const input = parsed.data;

  // 1. Resolve resto + table + active sub
  const tableRow = await db
    .select({ table: tables, restaurant: restaurants })
    .from(tables)
    .innerJoin(restaurants, eq(tables.restaurantId, restaurants.id))
    .where(and(eq(restaurants.slug, input.slug), eq(tables.token, input.token)))
    .limit(1);
  const row = tableRow[0];
  if (!row) return { error: "Table inconnue." };
  if (!row.table.isActive) return { error: "Table désactivée." };
  if (
    !row.restaurant.subStatus ||
    !ACTIVE_SUB_STATUSES.includes(row.restaurant.subStatus)
  ) {
    return { error: "Restaurant indisponible." };
  }

  // 2. Re-fetch items, scoped à ce resto
  const itemIds = Array.from(new Set(input.lines.map((l) => l.itemId)));
  const itemsScoped = await db
    .select({ item: menuItems })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(
      and(
        inArray(menuItems.id, itemIds),
        eq(menus.restaurantId, row.restaurant.id),
        eq(menus.isPublished, true),
      ),
    );
  const itemMap = new Map(itemsScoped.map((r) => [r.item.id, r.item]));
  if (itemMap.size !== itemIds.length) {
    return { error: "Un plat n'existe plus dans le menu." };
  }

  // 3. Re-fetch options + choices, scoped au resto via les items
  const optionIds = Array.from(
    new Set(input.lines.flatMap((l) => l.options.map((o) => o.optionId))),
  );
  const choiceIds = Array.from(
    new Set(input.lines.flatMap((l) => l.options.map((o) => o.choiceId))),
  );
  const dbOptions = optionIds.length
    ? await db.select().from(menuItemOptions).where(inArray(menuItemOptions.id, optionIds))
    : [];
  const dbChoices = choiceIds.length
    ? await db
        .select()
        .from(menuItemOptionChoices)
        .where(inArray(menuItemOptionChoices.id, choiceIds))
    : [];
  const optionMap = new Map(dbOptions.map((o) => [o.id, o]));
  const choiceMap = new Map(dbChoices.map((c) => [c.id, c]));

  // 4. Compute server-authoritative lines
  type Line = {
    menuItemId: string;
    nameSnapshot: string;
    priceCentsSnapshot: number;
    quantity: number;
    optionsSnapshot: OrderItemOptionSnapshot[];
    subtotalCents: number;
  };
  const orderLines: Line[] = [];
  for (const line of input.lines) {
    const item = itemMap.get(line.itemId);
    if (!item) return { error: "Plat introuvable." };
    if (!item.isAvailable) return { error: `${item.nameFr} n'est plus disponible.` };

    const optionsSnapshot: OrderItemOptionSnapshot[] = [];
    for (const sel of line.options) {
      const option = optionMap.get(sel.optionId);
      const choice = choiceMap.get(sel.choiceId);
      if (!option || !choice) return { error: "Option invalide." };
      if (option.itemId !== item.id) return { error: "Option ne correspond pas au plat." };
      if (choice.optionId !== option.id) return { error: "Choix ne correspond pas à l'option." };
      optionsSnapshot.push({
        optionName: option.nameFr,
        choiceName: choice.nameFr,
        priceDeltaCents: choice.priceDeltaCents,
      });
    }

    const unitCents =
      item.priceCents + optionsSnapshot.reduce((s, o) => s + o.priceDeltaCents, 0);
    orderLines.push({
      menuItemId: item.id,
      nameSnapshot: item.nameFr,
      priceCentsSnapshot: item.priceCents,
      quantity: line.quantity,
      optionsSnapshot,
      subtotalCents: unitCents * line.quantity,
    });
  }
  const subtotal = orderLines.reduce((s, l) => s + l.subtotalCents, 0);

  // 5. Create order in transaction
  let createdId: string | null = null;
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(orders)
      .values({
        restaurantId: row.restaurant.id,
        tableId: row.table.id,
        tableLabelSnapshot: row.table.label,
        customerName: input.customerName || null,
        customerNote: input.customerNote || null,
        subtotalCents: subtotal,
        locale: input.locale,
      })
      .returning({ id: orders.id });
    const order = inserted[0];
    if (!order) throw new Error("Création commande échouée.");
    createdId = order.id;

    await tx.insert(orderItems).values(
      orderLines.map((line) => ({
        orderId: order.id,
        menuItemId: line.menuItemId,
        nameSnapshot: line.nameSnapshot,
        priceCentsSnapshot: line.priceCentsSnapshot,
        quantity: line.quantity,
        optionsSnapshot: line.optionsSnapshot,
        subtotalCents: line.subtotalCents,
      })),
    );
  });

  if (!createdId) return { error: "Erreur lors de la création." };

  await triggerRestaurantEvent(row.restaurant.id, "order:created", {
    orderId: createdId,
    tableLabel: row.table.label,
  });

  return { orderId: createdId };
}

export type ServiceRequestResult = { error: string } | { ok: true };

const callWaiterSchema = z.object({
  slug: z.string().min(1),
  token: z.string().min(1),
});

export async function callWaiterAction(raw: unknown): Promise<ServiceRequestResult> {
  const parsed = callWaiterSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données invalides." };

  const tableRow = await db
    .select({ table: tables, restaurant: restaurants })
    .from(tables)
    .innerJoin(restaurants, eq(tables.restaurantId, restaurants.id))
    .where(and(eq(restaurants.slug, parsed.data.slug), eq(tables.token, parsed.data.token)))
    .limit(1);
  const row = tableRow[0];
  if (!row) return { error: "Table inconnue." };
  if (!row.table.isActive) return { error: "Table désactivée." };

  await db.insert(serviceRequests).values({
    restaurantId: row.restaurant.id,
    tableId: row.table.id,
    tableLabelSnapshot: row.table.label,
    type: "call_waiter",
  });

  await triggerRestaurantEvent(row.restaurant.id, "service-request:created", {
    tableLabel: row.table.label,
  });

  return { ok: true };
}
