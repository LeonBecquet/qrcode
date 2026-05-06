"use client";

import { useState } from "react";
import { TableDetailModal } from "./table-detail-modal";
import { TableShape } from "./table-shape";
import type { Table } from "@/lib/db/schema";

type Props = {
  groups: { name: string | null; tables: Table[] }[];
  scanUrls: Record<string, string>;
};

const ZONE_COLORS = [
  { color: "#EE8033", emoji: "🌳", defaultFor: ["terrasse", "patio", "jardin"] },
  { color: "#1F4F1F", emoji: "🪟", defaultFor: ["intérieur", "interieur", "salle", "indoor"] },
  { color: "#D4A017", emoji: "🍷", defaultFor: ["bar", "comptoir"] },
  { color: "#D04A33", emoji: "✨", defaultFor: ["salon", "vip", "privé", "prive"] },
  { color: "#5C7C5A", emoji: "🌿", defaultFor: ["véranda", "veranda"] },
];

function zoneFor(name: string | null): { color: string; emoji: string; idx: number } {
  if (!name) return { color: "#7C766F", emoji: "🍴", idx: 0 };
  const low = name.toLowerCase();
  for (let i = 0; i < ZONE_COLORS.length; i++) {
    const z = ZONE_COLORS[i]!;
    if (z.defaultFor.some((kw) => low.includes(kw))) {
      return { color: z.color, emoji: z.emoji, idx: i };
    }
  }
  // Fallback hash
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const z = ZONE_COLORS[hash % ZONE_COLORS.length]!;
  return { color: z.color, emoji: z.emoji, idx: hash % ZONE_COLORS.length };
}

export function FloorMap({ groups, scanUrls }: Props) {
  const [selected, setSelected] = useState<Table | null>(null);
  const selectedZone = selected ? zoneFor(selected.groupName) : null;

  return (
    <>
      <div className="space-y-6">
        {groups.map((group) => {
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
              {/* Decorative corner */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-20 blur-3xl"
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
              <div className="relative px-6 py-10">
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
                  <div className="relative grid place-items-center gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {group.tables.map((table, idx) => (
                      <TableShape
                        key={table.id}
                        table={table}
                        color={zone.color}
                        index={idx}
                        onClick={() => setSelected(table)}
                      />
                    ))}
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
