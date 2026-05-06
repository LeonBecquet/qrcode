import { and, asc, eq, gte, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orderItems, orders } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export async function GET(request: Request) {
  const ctx = await requireRestaurant();
  const { searchParams } = new URL(request.url);
  const daysParam = Number.parseInt(searchParams.get("days") ?? "30", 10);
  const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 365) : 30;
  const since = new Date(Date.now() - days * 24 * 3600 * 1000);

  const orderRows = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.restaurantId, ctx.restaurant.id), gte(orders.createdAt, since)),
    )
    .orderBy(asc(orders.createdAt));

  const itemsByOrder = new Map<string, (typeof orderItems.$inferSelect)[]>();
  if (orderRows.length > 0) {
    const items = await db
      .select()
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          orderRows.map((o) => o.id),
        ),
      );
    for (const item of items) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }
  }

  const headers = [
    "Date",
    "Heure",
    "Table",
    "Client",
    "Statut",
    "Plats",
    "Note",
    "Total (€)",
  ];
  const lines: string[] = [headers.join(";")];

  for (const order of orderRows) {
    const items = itemsByOrder.get(order.id) ?? [];
    const platsLabel = items
      .map((it) => {
        const opts =
          it.optionsSnapshot.length > 0
            ? ` (${it.optionsSnapshot.map((o) => o.choiceName).join(", ")})`
            : "";
        return `${it.quantity}× ${it.nameSnapshot}${opts}`;
      })
      .join(" | ");

    lines.push(
      [
        dateFmt.format(order.createdAt),
        timeFmt.format(order.createdAt),
        order.tableLabelSnapshot,
        order.customerName ?? "",
        order.status,
        platsLabel,
        order.customerNote ?? "",
        (order.subtotalCents / 100).toFixed(2).replace(".", ","),
      ]
        .map(csvEscape)
        .join(";"),
    );
  }

  // BOM UTF-8 pour Excel FR
  const csv = `﻿${lines.join("\r\n")}\r\n`;
  const filename = `commandes-${ctx.restaurant.slug}-${days}j.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
