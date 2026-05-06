"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  deleteTableAction,
  regenerateTableTokenAction,
  toggleTableActiveAction,
  updateTableAction,
} from "./actions";
import { MiniQr } from "@/components/mini-qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Table } from "@/lib/db/schema";

export function TableRow({ table, scanUrl }: { table: Table; scanUrl: string }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEdit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateTableAction(formData);
      if (result && "error" in result) setError(result.error);
      else setEditing(false);
    });
  }

  function handleRegenerate() {
    if (
      !confirm(
        `Régénérer le token de « ${table.label} » ? L'ancien QR ne fonctionnera plus, il faudra réimprimer.`,
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

  if (editing) {
    return (
      <li className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[120px_180px_1fr_auto]">
        <form
          action={handleEdit}
          className="contents"
          id={`edit-${table.id}`}
        >
          <input type="hidden" name="tableId" value={table.id} />
          <Input name="label" defaultValue={table.label} required maxLength={32} />
          <Input
            name="groupName"
            defaultValue={table.groupName ?? ""}
            placeholder="Groupe (optionnel)"
            maxLength={64}
          />
          <div />
          <div className="flex gap-1">
            <Button type="submit" size="sm" disabled={pending}>
              OK
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={pending}
            >
              Annuler
            </Button>
          </div>
        </form>
        {error ? <p className="text-destructive col-span-full text-xs">{error}</p> : null}
      </li>
    );
  }

  return (
    <li
      className={`hover:bg-muted/30 flex flex-wrap items-center gap-3 px-4 py-3 transition-colors ${
        !table.isActive ? "opacity-60" : ""
      }`}
    >
      {/* Mini QR visuel */}
      <div className="bg-[var(--brand-cream)] flex size-12 shrink-0 items-center justify-center rounded-lg border shadow-sm">
        <MiniQr
          token={table.token}
          size={44}
          color="var(--brand-forest)"
          accent="var(--brand-orange)"
          bg="transparent"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{table.label}</span>
          {table.groupName ? (
            <span className="bg-[var(--brand-saffron)]/20 text-[color:oklch(0.4_0.1_60)] rounded-full px-2 py-0.5 text-xs">
              {table.groupName}
            </span>
          ) : null}
          {!table.isActive ? (
            <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5 text-xs">
              Désactivée
            </span>
          ) : null}
        </div>
        <Link
          href={scanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-[var(--brand-orange)] block truncate font-mono text-xs transition-colors"
          title="Ouvrir l'URL scannée"
        >
          {scanUrl}
        </Link>
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={`/api/qr-pdf?tableId=${table.id}`}
          target="_blank"
          className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/20 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
        >
          PDF
        </Link>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(true)}
          disabled={pending}
        >
          Modifier
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleRegenerate}
          disabled={pending}
        >
          Régénérer
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleToggleActive}
          disabled={pending}
        >
          {table.isActive ? "Désactiver" : "Réactiver"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={pending}
          className="text-destructive"
        >
          Supprimer
        </Button>
      </div>
      {error ? <p className="text-destructive w-full text-xs">{error}</p> : null}
    </li>
  );
}
