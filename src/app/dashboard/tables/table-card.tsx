"use client";

import { ExternalLink, Printer, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteTableAction,
  regenerateTableTokenAction,
  toggleTableActiveAction,
} from "./actions";
import { MiniQr } from "@/components/mini-qr";
import { Button } from "@/components/ui/button";
import type { Table } from "@/lib/db/schema";

const GROUP_COLORS = [
  { bg: "from-[var(--brand-orange)]/15 to-[var(--brand-orange)]/5", border: "border-[var(--brand-orange)]/30", accent: "var(--brand-orange)" },
  { bg: "from-[var(--brand-forest)]/15 to-[var(--brand-forest)]/5", border: "border-[var(--brand-forest)]/30", accent: "var(--brand-forest)" },
  { bg: "from-[var(--brand-saffron)]/30 to-[var(--brand-saffron)]/10", border: "border-[var(--brand-saffron)]/40", accent: "#D4A017" },
  { bg: "from-[var(--brand-tomato)]/15 to-[var(--brand-tomato)]/5", border: "border-[var(--brand-tomato)]/30", accent: "var(--brand-tomato)" },
];

function colorForGroup(name: string | null): (typeof GROUP_COLORS)[number] {
  if (!name) return GROUP_COLORS[0]!;
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GROUP_COLORS[hash % GROUP_COLORS.length]!;
}

export function TableCard({
  table,
  scanUrl,
}: {
  table: Table;
  scanUrl: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const colors = colorForGroup(table.groupName);

  function handleRegenerate() {
    if (
      !confirm(
        `Régénérer le token de « ${table.label} » ? L'ancien QR ne fonctionnera plus.`,
      )
    )
      return;
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await regenerateTableTokenAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleToggleActive() {
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await toggleTableActiveAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`Supprimer « ${table.label} » ? Action définitive.`)) return;
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await deleteTableAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div
      className={`group bg-gradient-to-br ${colors.bg} ${colors.border} hover:-translate-y-1 hover:shadow-xl relative flex flex-col rounded-2xl border-2 p-4 transition-all duration-300 ${
        !table.isActive ? "opacity-60" : ""
      }`}
    >
      {/* Header : label + status */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold tracking-tight">{table.label}</p>
          {table.groupName ? (
            <p className="text-muted-foreground text-xs">{table.groupName}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {!table.isActive ? (
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 text-[10px] font-medium">
              Off
            </span>
          ) : (
            <span
              className="size-2 rounded-full shadow-sm"
              style={{ background: colors.accent }}
              title="Active"
            />
          )}
        </div>
      </div>

      {/* QR card preview */}
      <div className="bg-card relative mx-auto mb-3 flex aspect-square w-full max-w-[140px] items-center justify-center rounded-xl border p-3 shadow-sm">
        <MiniQr
          token={table.token}
          size={120}
          color="var(--brand-forest)"
          accent={colors.accent}
          bg="white"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <Link
          href={`/api/qr-pdf?tableId=${table.id}`}
          target="_blank"
          className="bg-[var(--brand-forest)] text-[var(--brand-cream)] hover:bg-[var(--brand-forest)]/90 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors"
        >
          <Printer className="size-3.5" />
          Télécharger PDF
        </Link>

        <div className="grid grid-cols-3 gap-1">
          <Link
            href={scanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card hover:bg-muted/50 inline-flex items-center justify-center rounded-md border px-2 py-1.5 text-[10px] transition-colors"
            title="Ouvrir l'URL"
          >
            <ExternalLink className="size-3.5" />
          </Link>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRegenerate}
            disabled={pending}
            className="text-[10px]"
            title="Régénérer le token"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={pending}
            className="text-destructive text-[10px]"
            title="Supprimer"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        <button
          type="button"
          onClick={handleToggleActive}
          disabled={pending}
          className="text-muted-foreground hover:text-foreground text-[10px] underline-offset-4 hover:underline"
        >
          {table.isActive ? "Désactiver" : "Réactiver"}
        </button>
      </div>

      {error ? (
        <p className="text-destructive mt-2 text-[10px]">{error}</p>
      ) : null}
    </div>
  );
}
