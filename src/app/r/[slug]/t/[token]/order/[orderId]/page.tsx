import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PollStatus } from "./poll-status";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { orderItems, orders, type OrderStatus } from "@/lib/db/schema";
import { resolvePublicTable } from "@/lib/server/public-resolver";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const STATUS_FLOW: OrderStatus[] = ["pending", "accepted", "in_kitchen", "ready", "served"];

const STATUS_LABELS: Record<OrderStatus, { label: string; description: string }> = {
  pending: {
    label: "Reçue",
    description: "Le restaurant a bien reçu votre commande.",
  },
  accepted: {
    label: "Acceptée",
    description: "Le restaurant a confirmé votre commande.",
  },
  in_kitchen: {
    label: "En préparation",
    description: "La cuisine s'en occupe.",
  },
  ready: {
    label: "Prête",
    description: "Un serveur va l'apporter à votre table.",
  },
  served: {
    label: "Servie",
    description: "Bon appétit !",
  },
  canceled: {
    label: "Annulée",
    description: "Votre commande a été annulée.",
  },
};

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ slug: string; token: string; orderId: string }>;
}) {
  const { slug, token, orderId } = await params;
  const { restaurant } = await resolvePublicTable(slug, token);

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)))
    .limit(1);

  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.createdAt));

  const isFinal = order.status === "served" || order.status === "canceled";
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const status = STATUS_LABELS[order.status];

  return (
    <div className="space-y-5 py-4">
      {!isFinal ? <PollStatus /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{status.label}</CardTitle>
          <CardDescription>{status.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {order.status !== "canceled" ? (
            <ol className="space-y-2">
              {STATUS_FLOW.map((step, idx) => {
                const reached = idx <= currentIdx;
                const current = idx === currentIdx;
                return (
                  <li
                    key={step}
                    className={`flex items-center gap-3 rounded px-3 py-2 ${
                      current
                        ? "bg-foreground text-background font-medium"
                        : reached
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        current
                          ? "bg-background text-foreground"
                          : reached
                            ? "border-foreground border"
                            : "border-muted-foreground/30 border"
                      }`}
                    >
                      {reached ? "✓" : idx + 1}
                    </span>
                    <span className="text-sm">{STATUS_LABELS[step].label}</span>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Récapitulatif</CardTitle>
          <CardDescription>
            Table {order.tableLabelSnapshot}
            {order.customerName ? ` · ${order.customerName}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{item.quantity}×</span> {item.nameSnapshot}
                  </p>
                  {item.optionsSnapshot.length > 0 ? (
                    <ul className="text-muted-foreground mt-0.5 text-xs">
                      {item.optionsSnapshot.map((opt, idx) => (
                        <li key={idx}>
                          {opt.optionName} : {opt.choiceName}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <span className="font-mono">{formatter.format(item.subtotalCents / 100)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-3">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono text-base font-semibold">
            {formatter.format(order.subtotalCents / 100)}
          </span>
        </CardFooter>
      </Card>

      {order.customerNote ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Note transmise</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{order.customerNote}</CardContent>
        </Card>
      ) : null}

      <p className="text-muted-foreground text-center text-xs">
        Le règlement se fait au restaurant en fin de repas.
      </p>

      <div className="text-center">
        <Link
          href={`/r/${slug}/t/${token}`}
          className="text-sm underline-offset-4 hover:underline"
        >
          Commander autre chose
        </Link>
      </div>
    </div>
  );
}
