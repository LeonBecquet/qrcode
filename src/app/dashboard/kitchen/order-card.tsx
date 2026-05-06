"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "./actions";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/lib/db/schema";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

type Item = {
  id: string;
  nameSnapshot: string;
  quantity: number;
  optionsSnapshot: { optionName: string; choiceName: string; priceDeltaCents: number }[];
};

type Props = {
  order: {
    id: string;
    status: OrderStatus;
    tableLabelSnapshot: string;
    customerName: string | null;
    customerNote: string | null;
    subtotalCents: number;
    createdAt: Date;
  };
  items: Item[];
  primaryAction: { label: string; nextStatus: OrderStatus } | null;
};

export function OrderCard({ order, items, primaryAction }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function callAction(nextStatus: OrderStatus, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) return;
    setError(null);
    const formData = new FormData();
    formData.append("orderId", order.id);
    formData.append("nextStatus", nextStatus);
    startTransition(async () => {
      const result = await updateOrderStatusAction(formData);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Table {order.tableLabelSnapshot}</span>
            {order.customerName ? (
              <span className="text-muted-foreground text-xs">· {order.customerName}</span>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{timeFormatter.format(order.createdAt)}</p>
        </div>
        <span className="font-mono text-sm font-semibold">
          {formatter.format(order.subtotalCents / 100)}
        </span>
      </div>

      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <span className="font-medium">{item.quantity}×</span> {item.nameSnapshot}
            {item.optionsSnapshot.length > 0 ? (
              <span className="text-muted-foreground text-xs">
                {" "}
                ({item.optionsSnapshot.map((o) => o.choiceName).join(", ")})
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {order.customerNote ? (
        <p className="bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded border-l-2 border-amber-400 px-2 py-1.5 text-xs">
          📝 {order.customerNote}
        </p>
      ) : null}

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <div className="flex gap-2 border-t pt-2">
        {primaryAction ? (
          <Button
            type="button"
            size="sm"
            onClick={() => callAction(primaryAction.nextStatus)}
            disabled={pending}
            className="flex-1"
          >
            {pending ? "..." : primaryAction.label}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            callAction("canceled", `Annuler la commande de la table ${order.tableLabelSnapshot} ?`)
          }
          disabled={pending}
          className="text-destructive"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
