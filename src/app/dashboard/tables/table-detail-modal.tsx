"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Copy,
  ExternalLink,
  Power,
  Printer,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  deleteTableAction,
  regenerateTableTokenAction,
  toggleTableActiveAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import type { Table } from "@/lib/db/schema";

type Props = {
  table: Table | null;
  scanUrl: string;
  qrDataUrl: string | null;
  accent: string;
  onClose: () => void;
};

export function TableDetailModal({ table, scanUrl, qrDataUrl, accent, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ESC pour fermer
  useEffect(() => {
    if (!table) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [table, onClose]);

  // Lock scroll quand ouvert
  useEffect(() => {
    if (!table) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [table]);

  function handleRegenerate() {
    if (!table) return;
    if (!confirm(`Régénérer le token de « ${table.label} » ?`)) return;
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await regenerateTableTokenAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleToggleActive() {
    if (!table) return;
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await toggleTableActiveAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDelete() {
    if (!table) return;
    if (!confirm(`Supprimer « ${table.label} » ? Action définitive.`)) return;
    setError(null);
    const formData = new FormData();
    formData.append("tableId", table.id);
    startTransition(async () => {
      const result = await deleteTableAction(formData);
      if (result && "error" in result) setError(result.error);
      else onClose();
    });
  }

  function handleCopy() {
    if (!scanUrl) return;
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AnimatePresence>
      {table ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            onClick={onClose}
            className="bg-foreground/40 absolute inset-0 backdrop-blur-sm"
            aria-label="Fermer"
          />

          {/* Modal */}
          <motion.div
            className="bg-card relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Top bar */}
            <div
              className="relative flex items-start justify-between gap-3 p-5 text-white"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              }}
            >
              <div>
                <p className="text-xs font-medium tracking-wide uppercase opacity-80">
                  {table.groupName ?? "Sans groupe"}
                </p>
                <p className="text-3xl font-bold tracking-tight">{table.label}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                  <span
                    className={`size-1.5 rounded-full ${
                      table.isActive ? "bg-emerald-300" : "bg-stone-300"
                    }`}
                  />
                  {table.isActive ? "Active" : "Désactivée"}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* QR card en grand */}
            <div className="p-5">
              <div
                className="mx-auto flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl border-2 p-4 shadow-inner"
                style={{
                  background: "var(--brand-cream)",
                  borderColor: `${accent}40`,
                }}
              >
                {qrDataUrl ? (
                  <div className="relative size-full">
                    <Image
                      src={qrDataUrl}
                      alt={`QR scannable de la table ${table.label}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center text-xs">
                    QR indisponible
                  </p>
                )}
              </div>

              <p className="text-muted-foreground mt-3 text-center text-[11px]">
                Scannable avec n&apos;importe quel téléphone — ouvre la table {table.label}.
              </p>

              {/* URL avec bouton copier */}
              <div className="bg-muted/40 mt-3 flex items-center gap-2 rounded-lg border p-2.5">
                <ExternalLink className="text-muted-foreground size-3.5 shrink-0" />
                <Link
                  href={scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--brand-orange)] min-w-0 flex-1 truncate font-mono text-xs transition-colors"
                  title={scanUrl}
                >
                  {scanUrl}
                </Link>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="hover:bg-background shrink-0 rounded p-1 transition-colors"
                  aria-label="Copier l'URL"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="text-muted-foreground size-3.5" />
                  )}
                </button>
              </div>

              {/* Actions principales */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/api/qr-pdf?tableId=${table.id}`}
                  target="_blank"
                  className="bg-[var(--brand-forest)] text-[var(--brand-cream)] hover:bg-[var(--brand-forest)]/90 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                >
                  <Printer className="size-4" />
                  PDF imprimable
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={pending}
                  className="h-auto py-2.5"
                >
                  <RotateCcw className="mr-1.5 size-4" />
                  Régénérer token
                </Button>
              </div>

              {/* Actions secondaires */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleToggleActive}
                  disabled={pending}
                  className="h-auto py-2.5"
                >
                  <Power className="mr-1.5 size-4" />
                  {table.isActive ? "Désactiver" : "Réactiver"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={pending}
                  className="text-destructive h-auto py-2.5"
                >
                  <Trash2 className="mr-1.5 size-4" />
                  Supprimer
                </Button>
              </div>

              {error ? (
                <p className="text-destructive mt-3 text-center text-xs">{error}</p>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
