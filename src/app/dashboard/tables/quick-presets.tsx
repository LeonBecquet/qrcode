"use client";

import { Sparkles, Wine, TreePine, Utensils } from "lucide-react";
import { useState, useTransition } from "react";
import { bulkCreateTablesAction } from "./actions";

const PRESETS = [
  {
    icon: <Utensils className="size-5" />,
    label: "Salle classique",
    description: "8 tables intérieures",
    config: { count: 8, prefix: "T", start: 1, groupName: "Intérieur" },
    accent: "var(--brand-forest)",
  },
  {
    icon: <TreePine className="size-5" />,
    label: "Terrasse",
    description: "6 tables extérieures",
    config: { count: 6, prefix: "T", start: 1, groupName: "Terrasse" },
    accent: "var(--brand-orange)",
  },
  {
    icon: <Wine className="size-5" />,
    label: "Bar / Comptoir",
    description: "4 places au bar",
    config: { count: 4, prefix: "B", start: 1, groupName: "Bar" },
    accent: "var(--brand-saffron)",
  },
  {
    icon: <Sparkles className="size-5" />,
    label: "Bistrot complet",
    description: "12 tables · 2 zones",
    config: [
      { count: 8, prefix: "T", start: 1, groupName: "Intérieur" },
      { count: 4, prefix: "T", start: 9, groupName: "Terrasse" },
    ],
    accent: "var(--brand-tomato)",
  },
];

export function QuickPresets() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  function applyPreset(label: string, config: (typeof PRESETS)[number]["config"]) {
    setError(null);
    setAppliedKey(label);
    startTransition(async () => {
      const configs = Array.isArray(config) ? config : [config];
      for (const c of configs) {
        const fd = new FormData();
        fd.append("count", String(c.count));
        fd.append("prefix", c.prefix);
        fd.append("start", String(c.start));
        if (c.groupName) fd.append("groupName", c.groupName);
        const result = await bulkCreateTablesAction(fd);
        if (result && "error" in result) {
          setError(result.error);
          setAppliedKey(null);
          return;
        }
      }
      setAppliedKey(null);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        Démarrage rapide
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PRESETS.map((preset) => {
          const isApplying = pending && appliedKey === preset.label;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.label, preset.config)}
              disabled={pending}
              className="group bg-card hover:border-[var(--brand-orange)]/50 hover:shadow-lg flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-110"
                style={{ background: preset.accent }}
              >
                {preset.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{preset.label}</p>
                <p className="text-muted-foreground text-xs">
                  {isApplying ? "Création..." : preset.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
