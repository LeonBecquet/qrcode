import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orderItems, orders } from "@/lib/db/schema";

const SERVED_STATUS = "served";

export type Kpis = {
  ordersCount: number;
  revenueCents: number;
  avgTicketCents: number;
};

async function kpiBetween(restaurantId: string, since: Date): Promise<Kpis> {
  const rows = await db
    .select({
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.subtotalCents}), 0)::int`,
      avg: sql<number>`coalesce(avg(${orders.subtotalCents}), 0)::float`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, SERVED_STATUS),
        gte(orders.createdAt, since),
      ),
    );

  const row = rows[0];
  return {
    ordersCount: Number(row?.count ?? 0),
    revenueCents: Number(row?.revenue ?? 0),
    avgTicketCents: Math.round(Number(row?.avg ?? 0)),
  };
}

export async function getRestaurantKpis(restaurantId: string) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const [today, week, month] = await Promise.all([
    kpiBetween(restaurantId, startOfDay),
    kpiBetween(restaurantId, sevenDaysAgo),
    kpiBetween(restaurantId, thirtyDaysAgo),
  ]);

  return { today, week, month };
}

export type TopItem = {
  name: string;
  totalQty: number;
  totalRevenueCents: number;
};

export async function getTopItems(
  restaurantId: string,
  sinceDays: number,
  limit = 10,
): Promise<TopItem[]> {
  const since = new Date(Date.now() - sinceDays * 24 * 3600 * 1000);
  const rows = await db
    .select({
      name: orderItems.nameSnapshot,
      totalQty: sql<number>`sum(${orderItems.quantity})::int`,
      totalRevenue: sql<number>`sum(${orderItems.subtotalCents})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, SERVED_STATUS),
        gte(orders.createdAt, since),
      ),
    )
    .groupBy(orderItems.nameSnapshot)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);

  return rows.map((r) => ({
    name: r.name,
    totalQty: Number(r.totalQty),
    totalRevenueCents: Number(r.totalRevenue),
  }));
}

export type DailyPoint = {
  day: string; // ISO date (YYYY-MM-DD)
  ordersCount: number;
  revenueCents: number;
};

/**
 * Retourne les counts/revenue par jour sur les N derniers jours,
 * pad les jours sans commandes avec 0.
 */
export async function getDailySeries(
  restaurantId: string,
  days: number,
): Promise<DailyPoint[]> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.subtotalCents}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, SERVED_STATUS),
        gte(orders.createdAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`);

  const byDay = new Map(
    rows.map((r) => [r.day, { count: Number(r.count), revenue: Number(r.revenue) }]),
  );

  const series: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const existing = byDay.get(key);
    series.push({
      day: key,
      ordersCount: existing?.count ?? 0,
      revenueCents: existing?.revenue ?? 0,
    });
  }
  return series;
}
