"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Palette, Sparkles, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { updateMenuDesignAction } from "./design-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FONT_CSS_VAR,
  FONT_LABELS,
  type FontSlug,
  MENU_PRESETS,
  type MenuPreset,
  type PresetSlug,
} from "@/lib/menu-presets";

type Props = {
  initial: {
    primary?: string;
    accent?: string;
    font?: FontSlug;
    preset?: PresetSlug;
  };
};

export function DesignButton({ initial }: Props) {
  const [open, setOpen] = useState(false);
  const [primary, setPrimary] = useState(initial.primary ?? "#3D5C44");
  const [accent, setAccent] = useState(initial.accent ?? "#EE8033");
  const [font, setFont] = useState<FontSlug>(initial.font ?? "modern");
  const [preset, setPreset] = useState<PresetSlug>(initial.preset ?? "bistrot");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = orig;
    };
  }, [open]);

  function applyPreset(p: MenuPreset) {
    setPreset(p.slug);
    setPrimary(p.primary);
    setAccent(p.accent);
    setFont(p.font);
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.append("primary", primary);
    fd.append("accent", accent);
    fd.append("font", font);
    fd.append("preset", preset);
    startTransition(async () => {
      const result = await updateMenuDesignAction(fd);
      if ("error" in result) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group bg-card border-input hover:bg-muted/50 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md"
      >
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded text-white shadow-sm transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${initial.primary ?? "#3D5C44"}, ${initial.accent ?? "#EE8033"})`,
          }}
        >
          <Palette className="size-3" />
        </span>
        Personnaliser le design
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
              aria-label="Fermer"
            />

            {/* Drawer right */}
            <motion.div
              className="bg-card absolute top-0 right-0 bottom-0 flex w-full max-w-md flex-col border-l shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {/* Top */}
              <div className="bg-gradient-to-br from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] flex items-start justify-between gap-3 p-5 text-white">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-90">
                    <Sparkles className="size-3.5" />
                    Design de la carte
                  </div>
                  <p className="mt-1 text-xl font-bold tracking-tight">
                    Donnez votre style
                  </p>
                  <p className="mt-0.5 text-xs opacity-80">
                    Couleur, police, ambiance — visible par vos clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Body scrollable */}
              <div className="flex-1 space-y-6 overflow-y-auto p-5">
                {/* Presets */}
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Ambiances</h3>
                    <p className="text-muted-foreground text-xs">
                      Cliquez pour appliquer un style cohérent.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {MENU_PRESETS.map((p) => {
                      const active = preset === p.slug;
                      return (
                        <button
                          key={p.slug}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className={`group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                            active
                              ? "border-foreground shadow-md"
                              : "border-transparent bg-muted/40 hover:border-foreground/20"
                          }`}
                        >
                          {active ? (
                            <span className="bg-foreground text-background absolute top-2 right-2 flex size-5 items-center justify-center rounded-full">
                              <Check className="size-3" />
                            </span>
                          ) : null}
                          {/* Mini preview */}
                          <div
                            className="mb-2 h-12 rounded-md"
                            style={{
                              background: `linear-gradient(135deg, ${p.primary} 0%, ${p.primary} 50%, ${p.accent} 50%, ${p.accent} 100%)`,
                            }}
                          />
                          <p className="text-sm font-semibold">{p.label}</p>
                          <p className="text-muted-foreground line-clamp-1 text-[10px]">
                            {p.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Couleurs custom */}
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Couleurs</h3>
                    <p className="text-muted-foreground text-xs">
                      Affinez si vous voulez vos teintes exactes.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      id="primary"
                      label="Principale"
                      value={primary}
                      onChange={(v) => {
                        setPrimary(v);
                        setPreset("custom");
                      }}
                    />
                    <ColorField
                      id="accent"
                      label="Accent"
                      value={accent}
                      onChange={(v) => {
                        setAccent(v);
                        setPreset("custom");
                      }}
                    />
                  </div>
                </section>

                {/* Police */}
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">Police</h3>
                    <p className="text-muted-foreground text-xs">
                      Inspire l&apos;ambiance des titres et des prix.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(FONT_LABELS) as FontSlug[]).map((slug) => {
                      const active = font === slug;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => {
                            setFont(slug);
                            setPreset("custom");
                          }}
                          className={`flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                            active
                              ? "border-foreground bg-muted/40"
                              : "border-transparent bg-muted/20 hover:border-foreground/20"
                          }`}
                        >
                          <span
                            className="text-base"
                            style={{ fontFamily: FONT_CSS_VAR[slug] }}
                          >
                            La carte du Chef
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {FONT_LABELS[slug]}
                          </span>
                          {active ? (
                            <Check className="size-4 shrink-0" />
                          ) : (
                            <span className="size-4 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Live mini preview */}
                <section
                  className="rounded-xl border-2 p-4"
                  style={{
                    background: `linear-gradient(180deg, ${primary}10, transparent)`,
                    borderColor: `${primary}30`,
                  }}
                >
                  <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                    Aperçu
                  </p>
                  <div
                    className="rounded-lg p-3 text-white"
                    style={{ background: primary, fontFamily: FONT_CSS_VAR[font] }}
                  >
                    <p className="text-lg font-bold">Entrées</p>
                    <p className="text-xs opacity-80">Démarrez votre repas</p>
                  </div>
                  <div
                    className="mt-2 flex items-center justify-between rounded-lg border bg-white p-3 dark:bg-stone-900"
                    style={{ fontFamily: FONT_CSS_VAR[font] }}
                  >
                    <div>
                      <p className="font-medium">Burrata, tomates anciennes</p>
                      <p
                        className="text-xs opacity-70"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        Pesto basilic, huile d&apos;olive
                      </p>
                    </div>
                    <span className="font-bold" style={{ color: accent }}>
                      14 €
                    </span>
                  </div>
                </section>
              </div>

              {/* Footer save */}
              <div className="bg-card sticky bottom-0 flex items-center gap-3 border-t p-4">
                {error ? (
                  <p className="text-destructive flex-1 text-xs">{error}</p>
                ) : saved ? (
                  <p className="flex-1 text-xs text-emerald-600">
                    ✓ Design enregistré, visible côté client.
                  </p>
                ) : (
                  <p className="text-muted-foreground flex-1 text-xs">
                    Les changements s&apos;appliquent à votre carte publique.
                  </p>
                )}
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={pending}
                  className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white"
                >
                  {pending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          id={`${id}-color`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-lg border-2 border-transparent ring-2 ring-transparent transition-all hover:ring-[var(--brand-orange)]/50"
          aria-label={`${label} (sélecteur)`}
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}
