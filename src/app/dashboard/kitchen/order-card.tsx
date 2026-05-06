"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, useTransition } from "react";
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

const URGENT_THRESHOLDS: Record<OrderStatus, number> = {
  pending: 3,       // 3 min sans accept = urgent
  accepted: 8,      // 8 min sans démarrer
  in_kitchen: 20,   // 20 min en cuisine
  ready: 5,         // 5 min sans servir
  served: Infinity,
  canceled: Infinity,
};

export function OrderCard({ order, items, primaryAction }: Props) {
  const prefersReduced = useReducedMotion();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Live elapsed time, mis à jour côté client via setInterval (pas dans render)
  const [elapsedMin, setElapsedMin] = useState<number>(() =>
    Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60_000)),
  );
  const startMs = useRef(new Date(order.createdAt).getTime());

  useEffect(() => {
    const update = () => {
      setElapsedMin(Math.max(0, Math.floor((Date.now() - startMs.current) / 60_000)));
    };
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const threshold = URGENT_THRESHOLDS[order.status];
  const isUrgent = elapsedMin >= threshold;
  const isVeryUrgent = elapsedMin >= threshold * 2;

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
    <motion.div
      layout
      initial={prefersReduced ? false : { opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`relative flex flex-col gap-3 rounded-xl border p-3.5 shadow-sm transition-all ${
        isVeryUrgent
          ? "bg-[var(--brand-tomato)]/10 border-[var(--brand-tomato)]/40 shadow-md shadow-[var(--brand-tomato)]/20"
          : isUrgent
            ? "bg-[var(--brand-orange)]/5 border-[var(--brand-orange)]/40"
            : "bg-card"
      }`}
    >
      {/* Status accent bar à gauche */}
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${
          isVeryUrgent
            ? "bg-[var(--brand-tomato)]"
            : isUrgent
              ? "bg-[var(--brand-orange)]"
              : "bg-[var(--brand-forest)]"
        }`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold">
              {order.tableLabelSnapshot.length > 3
                ? order.tableLabelSnapshot.slice(0, 1)
                : order.tableLabelSnapshot}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                Table {order.tableLabelSnapshot}
              </p>
              {order.customerName ? (
                <p className="text-muted-foreground truncate text-[10px]">
                  {order.customerName}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-bold">
            {formatter.format(order.subtotalCents / 100)}
          </p>
          <p
            className={`flex items-center justify-end gap-1 text-[10px] ${
              isVeryUrgent
                ? "text-[var(--brand-tomato)] font-bold"
                : isUrgent
                  ? "text-[var(--brand-orange)] font-medium"
                  : "text-muted-foreground"
            }`}
          >
            {isVeryUrgent ? (
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-tomato)] opacity-75" />
                <span className="relative size-1.5 rounded-full bg-[var(--brand-tomato)]" />
              </span>
            ) : null}
            {timeFormatter.format(order.createdAt)} · {elapsedMin} min
          </p>
        </div>
      </div>

      <ul className="space-y-0.5 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex gap-1">
            <span className="bg-muted text-muted-foreground inline-flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold">
              {item.quantity}
            </span>
            <div className="min-w-0">
              <span className="font-medium">{item.nameSnapshot}</span>
              {item.optionsSnapshot.length > 0 ? (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({item.optionsSnapshot.map((o) => o.choiceName).join(", ")})
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {order.customerNote ? (
        <p className="rounded-md border-l-4 border-[var(--brand-saffron)] bg-[var(--brand-saffron)]/15 px-3 py-2 text-xs text-[color:oklch(0.35_0.08_60)]">
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
            className="flex-1 bg-[var(--brand-forest)] text-white shadow-sm hover:bg-[var(--brand-forest)]/90"
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
    </motion.div>
  );
}
