"use client";

import { Coffee, IceCream, Pizza, Sparkles, Utensils, Wine } from "lucide-react";
import { useState, useTransition } from "react";
import { createCategoryAction } from "./actions";

const QUICK_CATEGORIES = [
  { icon: <Utensils className="size-5" />, name: "Entrées", color: "var(--brand-orange)" },
  { icon: <Pizza className="size-5" />, name: "Plats", color: "var(--brand-tomato)" },
  { icon: <IceCream className="size-5" />, name: "Desserts", color: "var(--brand-saffron)" },
  { icon: <Wine className="size-5" />, name: "Boissons", color: "var(--brand-forest)" },
  { icon: <Coffee className="size-5" />, name: "Cafés", color: "#8B5A3C" },
];

const PRESETS = [
  {
    icon: <Sparkles className="size-5" />,
    label: "Bistrot complet",
    description: "Entrées · Plats · Desserts · Boissons",
    categories: ["Entrées", "Plats", "Desserts", "Boissons"],
    accent: "var(--brand-orange)",
  },
  {
    icon: <Pizza className="size-5" />,
    label: "Pizzeria",
    description: "Antipasti · Pizzas · Desserts · Boissons",
    categories: ["Antipasti", "Pizzas", "Desserts", "Boissons"],
    accent: "var(--brand-tomato)",
  },
  {
    icon: <Coffee className="size-5" />,
    label: "Café / Brunch",
    description: "Petits-déj · Plats · Pâtisseries · Boissons chaudes",
    categories: ["Petits-déjeuners", "Plats", "Pâtisseries", "Boissons chaudes"],
    accent: "#8B5A3C",
  },
];

export function CategoryPresets({ menuId, bilingual }: { menuId: string; bilingual: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  function applyPreset(key: string, categories: string[]) {
    setError(null);
    setAppliedKey(key);
    startTransition(async () => {
      for (const name of categories) {
        const fd = new FormData();
        fd.append("menuId", menuId);
        fd.append("nameFr", name);
        const result = await createCategoryAction(fd);
        if (result && "error" in result) {
          setError(result.error);
          setAppliedKey(null);
          return;
        }
      }
      setAppliedKey(null);
    });
  }

  function applySingle(name: string) {
    applyPreset(`single-${name}`, [name]);
  }

  return (
    <div className="space-y-5">
      {/* Presets complets */}
      <div className="space-y-2.5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          🚀 Démarrage rapide
        </p>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PRESETS.map((preset) => {
            const isApplying = pending && appliedKey === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.label, preset.categories)}
                disabled={pending}
                className="group bg-card hover:border-[var(--brand-orange)]/50 hover:shadow-lg flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: preset.accent }}
                >
                  {preset.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{preset.label}</p>
                  <p className="text-muted-foreground line-clamp-1 text-[10px]">
                    {isApplying ? "Création..." : preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick add une catégorie */}
      <div className="space-y-2.5">
        <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Ou ajoutez une catégorie
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_CATEGORIES.map((cat) => {
            const isApplying = pending && appliedKey === `single-${cat.name}`;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => applySingle(cat.name)}
                disabled={pending}
                className="group bg-card hover:bg-muted/50 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span
                  className="flex size-5 items-center justify-center rounded-full text-white"
                  style={{ background: cat.color }}
                >
                  <span className="scale-[0.55]">{cat.icon}</span>
                </span>
                {isApplying ? "Création..." : `+ ${cat.name}`}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      {/* Voile bilingue note */}
      {bilingual ? (
        <p className="text-muted-foreground text-xs">
          💡 Les noms anglais peuvent être ajoutés ensuite en éditant chaque catégorie.
        </p>
      ) : null}
    </div>
  );
}
