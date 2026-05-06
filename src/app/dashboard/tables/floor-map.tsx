"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { TableDetailModal } from "./table-detail-modal";
import { TableShape } from "./table-shape";
import type { Table } from "@/lib/db/schema";

type Props = {
  groups: { name: string | null; tables: Table[] }[];
  scanUrls: Record<string, string>;
};

const ZONES = [
  { color: "#EE8033", emoji: "🌳", keywords: ["terrasse", "patio", "jardin"] },
  { color: "#1F4F1F", emoji: "🪟", keywords: ["intérieur", "interieur", "salle", "indoor"] },
  { color: "#D4A017", emoji: "🍷", keywords: ["bar", "comptoir"] },
  { color: "#D04A33", emoji: "✨", keywords: ["salon", "vip", "privé", "prive"] },
  { color: "#5C7C5A", emoji: "🌿", keywords: ["véranda", "veranda"] },
] as const;

function zoneFor(name: string | null): { color: string; emoji: string } {
  if (!name) return { color: "#7C766F", emoji: "🍴" };
  const low = name.toLowerCase();
  for (const z of ZONES) {
    if (z.keywords.some((kw) => low.includes(kw))) {
      return { color: z.color, emoji: z.emoji };
    }
  }
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const z = ZONES[hash % ZONES.length]!;
  return { color: z.color, emoji: z.emoji };
}

const SIM_EVENTS = [
  { type: "order", label: "vient de commander", emoji: "🛎️", color: "var(--brand-orange)" },
  { type: "kitchen", label: "envoyé en cuisine", emoji: "👨‍🍳", color: "var(--brand-saffron)" },
  { type: "ready", label: "plat prêt", emoji: "🍽️", color: "var(--brand-forest)" },
  { type: "served", label: "servi", emoji: "✓", color: "var(--brand-forest)" },
  { type: "call", label: "appelle un serveur", emoji: "🔔", color: "var(--brand-tomato)" },
] as const;

export function FloorMap({ groups, scanUrls }: Props) {
  const prefersReduced = useReducedMotion();
  const [selected, setSelected] = useState<Table | null>(null);
  const [pulse, setPulse] = useState<{
    tableId: string;
    label: string;
    type: (typeof SIM_EVENTS)[number];
  } | null>(null);

  const allActiveTables = useMemo(
    () => groups.flatMap((g) => g.tables).filter((t) => t.isActive),
    [groups],
  );

  // Simulation live : toutes les 4s, choisir une table active aléatoire et déclencher un event
  useEffect(() => {
    if (prefersReduced || allActiveTables.length === 0) return;
    let timeoutId: number | undefined;
    const tick = () => {
      const table =
        allActiveTables[Math.floor(Math.random() * allActiveTables.length)]!;
      const event = SIM_EVENTS[Math.floor(Math.random() * SIM_EVENTS.length)]!;
      setPulse({ tableId: table.id, label: table.label, type: event });
      timeoutId = window.setTimeout(() => setPulse(null), 2400);
    };
    const interval = window.setInterval(tick, 4000);
    // Premier tick après 1.5s pour que ça démarre vite
    const firstTick = window.setTimeout(tick, 1500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(firstTick);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [allActiveTables, prefersReduced]);

  const selectedZone = selected ? zoneFor(selected.groupName) : null;

  return (
    <>
      {/* Demo banner — explique l'animation live */}
      {!prefersReduced && allActiveTables.length > 0 ? (
        <div className="bg-[var(--brand-saffron)]/15 border-[var(--brand-saffron)]/30 mb-4 flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-saffron)] opacity-75" />
            <span className="relative size-2 rounded-full bg-[var(--brand-saffron)]" />
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">Démo en direct</strong> · les notifications
            simulées montrent à quoi ressemble votre service en pleine activité
          </span>
        </div>
      ) : null}

      <div className="space-y-6">
        {groups.map((group, groupIdx) => {
          const zone = zoneFor(group.name);
          const activeCount = group.tables.filter((t) => t.isActive).length;
          return (
            <section
              key={group.name ?? "_none"}
              className="relative overflow-hidden rounded-2xl border-2 border-dashed"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(124,118,111,0.04) 0 1px, transparent 1px 24px), linear-gradient(135deg, oklch(0.96 0.018 85), oklch(0.93 0.025 88))",
              }}
            >
              {/* Light beam qui drift */}
              {!prefersReduced ? (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 40% 20% at 50% 50%, ${zone.color}25, transparent)`,
                  }}
                  animate={{
                    x: ["-30%", "30%", "-30%"],
                    y: ["-10%", "10%", "-10%"],
                  }}
                  transition={{
                    duration: 14 + groupIdx * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : null}

              {/* Decorative corner */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-25 blur-3xl"
                style={{ background: zone.color }}
              />

              {/* Header de zone */}
              <div className="bg-card/80 relative flex items-center justify-between gap-3 border-b px-5 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-sm"
                    style={{ background: `${zone.color}25` }}
                  >
                    {zone.emoji}
                  </span>
                  <div>
                    <h2 className="font-semibold tracking-tight">
                      {group.name ?? "Sans zone"}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {group.tables.length} table{group.tables.length > 1 ? "s" : ""} ·{" "}
                      <span className="font-medium" style={{ color: zone.color }}>
                        {activeCount} active{activeCount > 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan : tables disposées */}
              <div className="relative px-6 py-12">
                {/* Lignes de plancher décoratives */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent 0 119px, rgba(124,118,111,0.08) 119px 120px)",
                  }}
                />

                {group.tables.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    Aucune table dans cette zone
                  </p>
                ) : (
                  <div className="relative grid place-items-center gap-x-8 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {group.tables.map((table, idx) => {
                      const isPulsing = pulse?.tableId === table.id;
                      return (
                        <div key={table.id} className="relative">
                          <TableShape
                            table={table}
                            color={zone.color}
                            index={idx}
                            onClick={() => setSelected(table)}
                          />

                          {/* Pulse highlight quand cette table est l'event live */}
                          <AnimatePresence>
                            {isPulsing ? (
                              <motion.span
                                key="pulse"
                                aria-hidden="true"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.6, 1.8] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.4, repeat: 1 }}
                                className="pointer-events-none absolute top-1/2 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
                                style={{ background: pulse.type.color, filter: "blur(8px)" }}
                              />
                            ) : null}
                          </AnimatePresence>

                          {/* Notification flottante au-dessus de la table */}
                          <AnimatePresence>
                            {isPulsing ? (
                              <motion.div
                                key="notif"
                                initial={{ opacity: 0, y: 10, scale: 0.85 }}
                                animate={{ opacity: 1, y: -56, scale: 1 }}
                                exit={{ opacity: 0, y: -76, scale: 0.9 }}
                                transition={{
                                  duration: 0.45,
                                  ease: [0.21, 0.47, 0.32, 0.98],
                                }}
                                className="bg-card pointer-events-none absolute top-0 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium whitespace-nowrap shadow-xl"
                              >
                                <span
                                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] text-white"
                                  style={{ background: pulse.type.color }}
                                >
                                  {pulse.type.emoji}
                                </span>
                                <span className="text-foreground">
                                  Table {pulse.label} · {pulse.type.label}
                                </span>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}

        {/* Légende */}
        <div className="bg-muted/30 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border p-3 text-xs">
          <span className="text-muted-foreground font-medium">Légende :</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative size-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </span>
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-stone-400 ring-2 ring-white" />
            Désactivée
          </span>
          <span className="text-muted-foreground">
            Cliquez sur une table pour voir son QR + actions
          </span>
        </div>
      </div>

      <TableDetailModal
        table={selected}
        scanUrl={selected ? (scanUrls[selected.id] ?? "") : ""}
        accent={selectedZone?.color ?? "#EE8033"}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
