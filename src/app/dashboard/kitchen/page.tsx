import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { ChefHat } from "lucide-react";
import { KitchenSubscriber } from "./subscribe";
import { OrderCard } from "./order-card";
import { ServiceRequestCard } from "./service-request-card";
import { EmptyState } from "@/components/empty-state";
import { db } from "@/lib/db/client";
import { type OrderStatus, orderItems, orders, serviceRequests } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const COLUMNS: {
  status: OrderStatus;
  title: string;
  emoji: string;
  color: string;
  bg: string;
  primary: { label: string; nextStatus: OrderStatus } | null;
}[] = [
  {
    status: "pending",
    title: "Reçues",
    emoji: "🛎️",
    color: "var(--brand-orange)",
    bg: "rgba(238,128,51,0.10)",
    primary: { label: "Accepter", nextStatus: "accepted" },
  },
  {
    status: "accepted",
    title: "Acceptées",
    emoji: "✅",
    color: "var(--brand-saffron)",
    bg: "rgba(217,160,38,0.12)",
    primary: { label: "Démarrer cuisine", nextStatus: "in_kitchen" },
  },
  {
    status: "in_kitchen",
    title: "En cuisine",
    emoji: "👨‍🍳",
    color: "var(--brand-tomato)",
    bg: "rgba(184,57,47,0.10)",
    primary: { label: "Marquer prête", nextStatus: "ready" },
  },
  {
    status: "ready",
    title: "Prêtes à servir",
    emoji: "🍽️",
    color: "var(--brand-forest)",
    bg: "rgba(61,92,68,0.10)",
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

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex size-12 items-center justify-center rounded-xl">
            <ChefHat className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Cuisine</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Vue temps réel — gardez cet écran ouvert pendant le service.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[var(--brand-forest)]/10 px-3 py-1.5 text-xs font-medium text-[var(--brand-forest)]">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-forest)] opacity-75" />
            <span className="relative size-2 rounded-full bg-[var(--brand-forest)]" />
          </span>
          En direct
        </div>
      </div>

      {pendingRequests.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            🔔 Appels serveur en attente
          </h2>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <ServiceRequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Commandes en cours
        </h2>
        {activeOrders.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="C'est calme..."
            description="Aucune commande active. La prochaine apparaîtra ici en temps réel."
            tone="saffron"
          />
        ) : (
          <div
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-4 lg:overflow-visible lg:px-0"
          >
            {COLUMNS.map((col) => {
              const list = ordersByStatus.get(col.status) ?? [];
              return (
                <div
                  key={col.status}
                  className="bg-card relative w-[80vw] shrink-0 snap-start overflow-hidden rounded-2xl border shadow-sm sm:w-[60vw] md:w-[44vw] lg:w-auto"
                  style={{
                    backgroundImage: `linear-gradient(180deg, ${col.bg}, transparent 200px)`,
                  }}
                >
                  {/* Top accent bar */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: col.color }}
                  />
                  {/* Column header */}
                  <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-base leading-none">{col.emoji}</span>
                      <h3 className="text-sm font-semibold tracking-tight">{col.title}</h3>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm"
                      style={{ background: col.color }}
                    >
                      {list.length}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="space-y-3 p-3 pt-1">
                    {list.length === 0 ? (
                      <p className="text-muted-foreground py-6 text-center text-xs">—</p>
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
