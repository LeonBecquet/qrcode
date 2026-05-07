"use client";

import { Layers, Plus, Sparkles, Tag } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { bulkCreateTablesAction, createTableAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ZONE_HINTS = ["Intérieur", "Terrasse", "Bar", "Salon", "Véranda"] as const;

export function AddTableForms() {
  const singleRef = useRef<HTMLFormElement>(null);
  const bulkRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"single" | "bulk">("single");

  // Inputs controlled pour la preview live
  const [label, setLabel] = useState("T1");
  const [groupName, setGroupName] = useState("");
  const [prefix, setPrefix] = useState("T");
  const [start, setStart] = useState("1");
  const [count, setCount] = useState("10");
  const [bulkGroup, setBulkGroup] = useState("");

  function handleSingle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTableAction(formData);
      if (result && "error" in result) setError(result.error);
      else {
        singleRef.current?.reset();
        setLabel("T1");
        setGroupName("");
      }
    });
  }

  function handleBulk(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await bulkCreateTablesAction(formData);
      if (result && "error" in result) setError(result.error);
      else {
        bulkRef.current?.reset();
        setPrefix("T");
        setStart("1");
        setCount("10");
        setBulkGroup("");
      }
    });
  }

  // Preview labels (4 max pour bulk preview)
  const previewLabels =
    mode === "single"
      ? [label || "T1"]
      : (() => {
          const startN = Math.max(1, Number(start) || 1);
          const c = Math.max(1, Math.min(4, Number(count) || 1));
          return Array.from({ length: c }, (_, i) => `${prefix || "T"}${startN + i}`);
        })();
  const previewGroup = mode === "single" ? groupName : bulkGroup;
  const previewCount = mode === "bulk" ? Math.max(1, Number(count) || 1) : 1;

  return (
    <div className="bg-card relative overflow-hidden rounded-3xl border shadow-sm">
      {/* Top accent bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)]"
      />

      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[var(--brand-orange)]/10 blur-3xl"
      />

      <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_220px]">
        {/* === Form === */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Plus className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Ajouter des tables</h2>
                <p className="text-muted-foreground text-xs">
                  Une à la fois, ou en lot (T1, T2, …, T20).
                </p>
              </div>
            </div>

            {/* Tab segmented */}
            <div className="bg-muted flex shrink-0 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  mode === "single"
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Une
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`rounded-md px-3 py-1 transition-colors ${
                  mode === "bulk"
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                En lot
              </button>
            </div>
          </div>

          {mode === "single" ? (
            <form
              ref={singleRef}
              action={handleSingle}
              className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end"
            >
              <div className="space-y-1.5">
                <Label htmlFor="label" className="flex items-center gap-1 text-xs">
                  <Tag className="size-3" />
                  Libellé
                </Label>
                <Input
                  id="label"
                  name="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="T1"
                  required
                  maxLength={32}
                  className="h-10 text-base font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="groupName" className="flex items-center gap-1 text-xs">
                  <Layers className="size-3" />
                  Zone (optionnel)
                </Label>
                <Input
                  id="groupName"
                  name="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Intérieur"
                  list="zone-hints"
                  maxLength={64}
                  className="h-10"
                />
                <datalist id="zone-hints">
                  {ZONE_HINTS.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 h-10 text-white shadow-md shadow-[var(--brand-orange)]/30"
              >
                {pending ? "..." : "Ajouter"}
              </Button>
            </form>
          ) : (
            <form
              ref={bulkRef}
              action={handleBulk}
              className="grid gap-3 sm:grid-cols-[80px_80px_100px_1fr_auto] sm:items-end"
            >
              <div className="space-y-1.5">
                <Label htmlFor="prefix" className="text-xs">
                  Préfixe
                </Label>
                <Input
                  id="prefix"
                  name="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  defaultValue="T"
                  required
                  maxLength={8}
                  className="h-10 text-center font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="start" className="text-xs">
                  Début
                </Label>
                <Input
                  id="start"
                  name="start"
                  type="number"
                  min="1"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                  className="h-10 text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="count" className="text-xs">
                  Quantité
                </Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  min="1"
                  max="100"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                  className="h-10 text-center"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bulkGroupName" className="flex items-center gap-1 text-xs">
                  <Layers className="size-3" />
                  Zone (optionnel)
                </Label>
                <Input
                  id="bulkGroupName"
                  name="groupName"
                  value={bulkGroup}
                  onChange={(e) => setBulkGroup(e.target.value)}
                  placeholder="Intérieur"
                  list="zone-hints-bulk"
                  maxLength={64}
                  className="h-10"
                />
                <datalist id="zone-hints-bulk">
                  {ZONE_HINTS.map((z) => (
                    <option key={z} value={z} />
                  ))}
                </datalist>
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 h-10 text-white shadow-md shadow-[var(--brand-orange)]/30"
              >
                {pending ? "..." : `Créer ${Math.max(1, Number(count) || 1)} tables`}
              </Button>
            </form>
          )}

          {error ? (
            <p className="text-destructive bg-destructive/5 border-destructive/20 rounded-md border px-2.5 py-1.5 text-xs">
              {error}
            </p>
          ) : (
            <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <Sparkles className="size-3 text-[var(--brand-orange)]" />
              Astuce : créez 5–10 tables d&apos;un coup et imprimez les QR ensuite.
            </p>
          )}
        </div>

        {/* === Live preview === */}
        <div className="bg-muted/30 hidden flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 lg:flex">
          <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase">
            Aperçu
          </p>

          {previewCount === 1 ? (
            <MiniTable label={previewLabels[0] ?? "T1"} group={previewGroup || null} />
          ) : (
            <div className="relative">
              <MiniTable label={previewLabels[0] ?? "T1"} group={previewGroup || null} />
              <p className="text-muted-foreground mt-2 text-center text-[10px]">
                + {previewCount - 1} autre{previewCount > 2 ? "s" : ""} (
                {previewLabels.slice(1).join(", ")}
                {previewCount > 4 ? ", …" : ""})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Mini illustration de la table avec son label, vue isométrique simplifiée. */
function MiniTable({ label, group }: { label: string; group: string | null }) {
  const display = label.length > 4 ? label.slice(0, 4) : label;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="size-28 drop-shadow-md">
        <defs>
          <radialGradient id="mt-top" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#EE8033" />
            <stop offset="60%" stopColor="#EE8033" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
          </radialGradient>
          <linearGradient id="mt-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C66B27" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="mt-shine" cx="35%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mt-chair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8DDD0" />
            <stop offset="100%" stopColor="#B8A99A" />
          </linearGradient>
        </defs>
        {/* Ombre */}
        <ellipse cx="60" cy="105" rx="40" ry="6" fill="rgba(0,0,0,0.18)" />
        {/* Chaise top */}
        <ellipse cx="60" cy="28" rx="11" ry="5" fill="url(#mt-chair)" />
        {/* Chaise gauche */}
        <ellipse cx="22" cy="64" rx="9" ry="8" fill="url(#mt-chair)" />
        {/* Chaise droite */}
        <ellipse cx="98" cy="64" rx="9" ry="8" fill="url(#mt-chair)" />
        {/* Pied */}
        <ellipse cx="60" cy="72" rx="32" ry="9" fill="url(#mt-side)" />
        <rect x="28" y="65" width="64" height="8" fill="url(#mt-side)" />
        {/* Plateau */}
        <ellipse cx="60" cy="65" rx="32" ry="9" fill="url(#mt-top)" />
        {/* Reflet */}
        <ellipse cx="50" cy="62" rx="18" ry="5" fill="url(#mt-shine)" />
        {/* Label */}
        <text
          x="60"
          y="68"
          textAnchor="middle"
          style={{
            fontSize: 10,
            fontFamily: "system-ui, sans-serif",
            fill: "white",
            paintOrder: "stroke fill",
            stroke: "rgba(0,0,0,0.25)",
            strokeWidth: 0.5,
            fontWeight: 700,
          }}
        >
          {display}
        </text>
        {/* Chaise bas */}
        <ellipse cx="60" cy="100" rx="11" ry="5" fill="url(#mt-chair)" />
      </svg>
      <p className="text-foreground mt-1 text-sm font-bold tracking-tight">
        {label || "T1"}
      </p>
      {group ? (
        <span className="bg-[var(--brand-saffron)]/20 text-[color:oklch(0.4_0.1_60)] mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
          {group}
        </span>
      ) : (
        <span className="text-muted-foreground mt-1 text-[10px]">Sans zone</span>
      )}
    </div>
  );
}
