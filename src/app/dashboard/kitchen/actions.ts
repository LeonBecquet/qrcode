"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { type OrderStatus, orders, serviceRequests } from "@/lib/db/schema";
import { triggerRestaurantEvent, triggerTableEvent } from "@/lib/pusher";
import { requireRestaurant } from "@/lib/server/session";

export type ActionResult = { error: string } | { success: true };

const orderStatusSchema = z.enum([
  "pending",
  "accepted",
  "in_kitchen",
  "ready",
  "served",
  "canceled",
]);

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "canceled"],
  accepted: ["in_kitchen", "canceled"],
  in_kitchen: ["ready", "canceled"],
  ready: ["served", "canceled"],
  served: [],
  canceled: [],
};

export async function updateOrderStatusAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireRestaurant();
  const orderId = String(formData.get("orderId") ?? "");
  const nextRaw = formData.get("nextStatus");
  const parsed = orderStatusSchema.safeParse(nextRaw);
  if (!parsed.success || !orderId) {
    return { error: "Paramètres invalides." };
  }
  const nextStatus = parsed.data;

  const [current] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, ctx.restaurant.id)))
    .limit(1);
  if (!current) return { error: "Commande introuvable." };

  if (!VALID_TRANSITIONS[current.status].includes(nextStatus)) {
    return { error: `Transition impossible : ${current.status} → ${nextStatus}.` };
  }

  await db
    .update(orders)
    .set({
      status: nextStatus,
      servedAt: nextStatus === "served" ? new Date() : current.servedAt,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  await Promise.all([
    triggerRestaurantEvent(ctx.restaurant.id, "order:updated", {
      orderId,
      status: nextStatus,
    }),
    current.tableId
      ? triggerTableEvent(current.tableId, "order:updated", {
          orderId,
          status: nextStatus,
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/dashboard/kitchen");
  return { success: true };
}

export async function resolveServiceRequestAction(formData: FormData): Promise<ActionResult> {
  const ctx = await requireRestaurant();
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return { error: "ID manquant." };

  const updated = await db
    .update(serviceRequests)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(
      and(
        eq(serviceRequests.id, requestId),
        eq(serviceRequests.restaurantId, ctx.restaurant.id),
      ),
    )
    .returning({ id: serviceRequests.id });

  if (updated.length === 0) return { error: "Demande introuvable." };

  await triggerRestaurantEvent(ctx.restaurant.id, "service-request:resolved", {
    requestId,
  });

  revalidatePath("/dashboard/kitchen");
  return { success: true };
}
