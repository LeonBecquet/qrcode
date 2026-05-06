"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

type Props = {
  tagline: string;
  highlights?: { value: string; label: string }[];
};

const LIVE_EVENTS = [
  { table: "T5", action: "vient de commander", item: "2× Burrata", color: "var(--brand-orange)" },
  { table: "Terrasse 3", action: "→ envoyé en cuisine", item: "Pâtes truffées", color: "var(--brand-forest)" },
  { table: "T12", action: "vient de scanner", item: "Carte du soir", color: "var(--brand-saffron)" },
  { table: "T8", action: "→ commande prête", item: "3 plats", color: "var(--brand-orange)" },
  { table: "T2", action: "vient de commander", item: "1× Tartare", color: "var(--brand-tomato)" },
  { table: "Bar 4", action: "→ servi", item: "Carafe + entrées", color: "var(--brand-forest)" },
];

export function AuthSidePanel({ tagline, highlights }: Props) {
  const prefersReduced = useReducedMotion();
  const [eventIdx, setEventIdx] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    const id = window.setInterval(() => {
      setEventIdx((i) => (i + 1) % LIVE_EVENTS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [prefersReduced]);

  const event = LIVE_EVENTS[eventIdx]!;

  return (
    <aside className="text-[var(--brand-cream)] relative hidden flex-col justify-between overflow-hidden bg-[var(--brand-forest)] p-10 md:flex lg:p-14">
      {/* Decorative blobs animés */}
      <div
        aria-hidden="true"
        className="animate-blob-1 pointer-events-none absolute -top-32 -right-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-orange)]/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-blob-2 pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-[var(--brand-saffron)]/25 blur-3xl"
      />

      {/* Mini QR pattern décoratif qui flotte */}
      <div
        aria-hidden="true"
        className="animate-float-rotate absolute top-12 right-12 size-28 rotate-12 rounded-2xl bg-[var(--brand-cream)]/10 p-3 backdrop-blur"
      >
        <div className="grid h-full grid-cols-5 grid-rows-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const corners = [0, 4, 20];
            const isCorner = corners.includes(i);
            const isAccent = i === 24;
            const random = [6, 8, 12, 13, 16, 18];
            const filled = isCorner || isAccent || random.includes(i);
            return (
              <div
                key={i}
                className={
                  isAccent
                    ? "rounded bg-[var(--brand-orange)]"
                    : isCorner
                      ? "rounded bg-[var(--brand-saffron)]"
                      : filled
                        ? "rounded bg-[var(--brand-cream)]"
                        : ""
                }
              />
            );
          })}
        </div>
      </div>

      {/* Logo */}
      <div className="relative">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo size={32} />
          <span className="text-base font-semibold tracking-tight">QR Restaurant</span>
        </Link>
      </div>

      {/* Live ticker — événements qui défilent */}
      <div className="relative space-y-6">
        <div className="bg-[var(--brand-orange)] inline-block size-2 rounded-full" />

        <blockquote className="text-3xl leading-tight font-semibold tracking-tight lg:text-4xl">
          {tagline}
        </blockquote>

        {/* Live events ticker */}
        <div className="border-[var(--brand-cream)]/15 rounded-xl border bg-[var(--brand-cream)]/5 p-4 backdrop-blur">
          <div className="text-[var(--brand-saffron)] mb-3 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-saffron)] opacity-75" />
              <span className="relative size-2 rounded-full bg-[var(--brand-saffron)]" />
            </span>
            En direct dans nos restaurants
          </div>
          <div className="relative h-12 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={eventIdx}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="absolute inset-0 flex items-center gap-3"
              >
                <span
                  className="text-[var(--brand-forest)] flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                  style={{ background: event.color }}
                >
                  {event.table.slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    Table {event.table} <span className="text-[var(--brand-cream)]/70">{event.action}</span>
                  </p>
                  <p className="text-[var(--brand-cream)]/60 truncate text-xs">{event.item}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 ? (
        <dl className="text-[var(--brand-cream)]/80 relative grid grid-cols-3 gap-3 border-t border-[var(--brand-cream)]/15 pt-6">
          {highlights.map((h) => (
            <div key={h.label}>
              <dt className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">
                {h.label}
              </dt>
              <dd className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </aside>
  );
}
