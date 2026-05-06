import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { KitchenSubscriber } from "./subscribe";
import { OrderCard } from "./order-card";
import { ServiceRequestCard } from "./service-request-card";
import { db } from "@/lib/db/client";
import { type OrderStatus, orderItems, orders, serviceRequests } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const COLUMNS: { status: OrderStatus; title: string; primary: { label: string; nextStatus: OrderStatus } | null }[] = [
  {
    status: "pending",
    title: "Reçues",
    primary: { label: "Accepter", nextStatus: "accepted" },
  },
  {
    status: "accepted",
    title: "Acceptées",
    primary: { label: "Démarrer cuisine", nextStatus: "in_kitchen" },
  },
  {
    status: "in_kitchen",
    title: "En cuisine",
    primary: { label: "Marquer prête", nextStatus: "ready" },
  },
  {
    status: "ready",
    title: "Prêtes à servir",
    primary: { label: "Marquer servie", nextStatus: "served" },
  },
];

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const ctx = await requireRestaurant();

  const activeOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, ctx.restaurant.id),
        ne(orders.status, "served"),
        ne(orders.status, "canceled"),
      ),
    )
    .orderBy(asc(orders.createdAt));

  const orderIds = activeOrders.map((o) => o.id);
  const items = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  const ordersByStatus = new Map<OrderStatus, typeof activeOrders>();
  for (const order of activeOrders) {
    const list = ordersByStatus.get(order.status) ?? [];
    list.push(order);
    ordersByStatus.set(order.status, list);
  }

  const pendingRequests = await db
    .select()
    .from(serviceRequests)
    .where(
      and(
        eq(serviceRequests.restaurantId, ctx.restaurant.id),
        eq(serviceRequests.isResolved, false),
      ),
    )
    .orderBy(desc(serviceRequests.createdAt));

  return (
    <div className="space-y-6">
      <KitchenSubscriber restaurantId={ctx.restaurant.id} />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
        <p className="text-muted-foreground mt-1">
          Vue temps réel des commandes et appels serveur. Maintenez cet écran ouvert pendant le
          service.
        </p>
      </div>

      {pendingRequests.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-medium tracking-wide uppercase">Appels serveur</h2>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <ServiceRequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium tracking-wide uppercase">Commandes</h2>
        {activeOrders.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">
            Aucune commande active. La prochaine apparaîtra ici en temps réel.
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {COLUMNS.map((col) => {
              const list = ordersByStatus.get(col.status) ?? [];
              return (
                <div key={col.status} className="space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-semibold">{col.title}</h3>
                    <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
                      {list.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {list.length === 0 ? (
                      <p className="text-muted-foreground py-4 text-center text-xs">—</p>
                    ) : (
                      list.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          items={itemsByOrder.get(order.id) ?? []}
                          primaryAction={col.primary}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
