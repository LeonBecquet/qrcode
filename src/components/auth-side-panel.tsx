"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

type Props = {
  tagline: string;
};

const KITCHEN_ORDERS = [
  {
    id: 1,
    table: "T5",
    items: "2× Tartare · 1× Burrata",
    status: "in_kitchen" as const,
    color: "var(--brand-orange)",
    time: "il y a 2 min",
  },
  {
    id: 2,
    table: "Terrasse 3",
    items: "3× Pâtes truffe",
    status: "ready" as const,
    color: "var(--brand-saffron)",
    time: "il y a 4 min",
  },
  {
    id: 3,
    table: "T12",
    items: "1× Steak · 2× Frites",
    status: "pending" as const,
    color: "var(--brand-tomato)",
    time: "à l'instant",
  },
  {
    id: 4,
    table: "Bar 4",
    items: "2× Mojito",
    status: "ready" as const,
    color: "var(--brand-orange)",
    time: "il y a 1 min",
  },
  {
    id: 5,
    table: "T8",
    items: "1× Tiramisu",
    status: "in_kitchen" as const,
    color: "var(--brand-saffron)",
    time: "il y a 6 min",
  },
];

const STATUS_LABEL = {
  pending: "Reçue",
  in_kitchen: "En cuisine",
  ready: "Prête",
} as const;

const STATUS_STYLES = {
  pending: { bg: "rgba(208, 74, 51, 0.2)", color: "#FF8B7A" },
  in_kitchen: { bg: "rgba(238, 128, 51, 0.2)", color: "#EE8033" },
  ready: { bg: "rgba(245, 195, 66, 0.2)", color: "#F5C342" },
} as const;

export function AuthSidePanel({ tagline }: Props) {
  const prefersReduced = useReducedMotion();
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    const id = window.setInterval(() => {
      setShift((s) => (s + 1) % KITCHEN_ORDERS.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  const visibleOrders = [
    KITCHEN_ORDERS[shift % KITCHEN_ORDERS.length]!,
    KITCHEN_ORDERS[(shift + 1) % KITCHEN_ORDERS.length]!,
    KITCHEN_ORDERS[(shift + 2) % KITCHEN_ORDERS.length]!,
  ];

  return (
    <aside className="text-[var(--brand-cream)] relative hidden flex-col justify-between overflow-hidden bg-[var(--brand-forest)] p-10 md:flex lg:p-14">
      {/* Pattern grid subtil en background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-cream) 1px, transparent 1px), linear-gradient(90deg, var(--brand-cream) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Blobs animés */}
      <div
        aria-hidden="true"
        className="animate-blob-1 pointer-events-none absolute -top-32 -right-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-orange)]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-blob-2 pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-saffron)]/25 blur-3xl"
      />

      {/* Logo + tagline */}
      <div className="relative space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo size={32} />
          <span className="text-base font-semibold tracking-tight">QR Restaurant</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="space-y-3"
        >
          <div className="bg-[var(--brand-orange)] inline-block size-2 rounded-full" />
          <h2 className="text-2xl leading-tight font-semibold tracking-tight lg:text-[2rem]">
            {tagline}
          </h2>
        </motion.div>
      </div>

      {/* Mini dashboard cuisine en direct */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative"
      >
        <div className="border-[var(--brand-cream)]/15 bg-[var(--brand-cream)]/5 relative overflow-hidden rounded-2xl border p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--brand-cream)]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-saffron)] opacity-75" />
                <span className="relative size-2.5 rounded-full bg-[var(--brand-saffron)]" />
              </span>
              <span className="text-[var(--brand-saffron)] text-xs font-medium tracking-wide uppercase">
                Cuisine en direct
              </span>
            </div>
            <span className="text-[var(--brand-cream)]/50 text-[10px]">
              {String(shift + 1).padStart(2, "0")} / {KITCHEN_ORDERS.length}
            </span>
          </div>

          {/* Stack de cartes empilées */}
          <div className="relative h-[230px]">
            <AnimatePresence mode="popLayout">
              {visibleOrders.map((order, idx) => {
                const style = STATUS_STYLES[order.status];
                return (
                  <motion.div
                    key={`${order.id}-${shift}`}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{
                      opacity: idx === 0 ? 1 : idx === 1 ? 0.6 : 0.3,
                      y: idx * 72,
                      scale: idx === 0 ? 1 : 1 - idx * 0.04,
                    }}
                    exit={{ opacity: 0, y: 230, scale: 0.9 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.21, 0.47, 0.32, 0.98],
                      delay: idx * 0.05,
                    }}
                    className="border-[var(--brand-cream)]/15 bg-[var(--brand-cream)]/10 absolute inset-x-0 rounded-lg border p-3 backdrop-blur"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="text-[var(--brand-forest)] flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                        style={{ background: order.color }}
                      >
                        {order.table.length > 3 ? order.table.slice(0, 1) : order.table}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">Table {order.table}</span>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {STATUS_LABEL[order.status]}
                          </span>
                        </div>
                        <p className="text-[var(--brand-cream)]/70 truncate text-[11px]">
                          {order.items}
                        </p>
                        <p className="text-[var(--brand-cream)]/50 mt-0.5 text-[10px]">
                          {order.time}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Stats en bas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative grid grid-cols-3 gap-3 border-t border-[var(--brand-cream)]/15 pt-6"
      >
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">
            Commission
          </div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">0%</div>
        </div>
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">Setup</div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">5 min</div>
        </div>
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">Langues</div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">FR/EN</div>
        </div>
      </motion.div>
    </aside>
  );
}
