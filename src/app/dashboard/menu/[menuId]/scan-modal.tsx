"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, ExternalLink, QrCode, Smartphone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  qrDataUrl: string | null;
  scanUrl: string | null;
  restaurantName: string;
  tableLabel: string | null;
};

export function ScanButton({ qrDataUrl, scanUrl, restaurantName, tableLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    if (!scanUrl) return;
    navigator.clipboard.writeText(scanUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const disabled = !qrDataUrl || !scanUrl;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title={
          disabled
            ? "Ajoutez d'abord une table pour générer un QR scannable"
            : "Tester votre carte sur votre téléphone"
        }
        className="group bg-[var(--brand-forest)] text-[var(--brand-cream)] hover:bg-[var(--brand-forest)]/90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:hover:shadow-sm"
      >
        <QrCode className="size-4" />
        Scanner la carte
        <Smartphone className="size-3.5 opacity-70 transition-transform group-hover:translate-x-0.5" />
      </button>

      <AnimatePresence>
        {open && qrDataUrl && scanUrl ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

            <motion.div
              className="bg-card relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {/* Top : gradient brand */}
              <div className="relative bg-gradient-to-br from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] p-5 text-white">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="hover:bg-white/20 absolute top-3 right-3 rounded-lg p-1.5 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </button>
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase opacity-90">
                  <Smartphone className="size-3.5" />
                  Aperçu sur votre téléphone
                </div>
                <p className="mt-1 text-2xl font-bold tracking-tight">{restaurantName}</p>
                {tableLabel ? (
                  <p className="mt-0.5 text-xs opacity-80">
                    Table de démo : <span className="font-mono">{tableLabel}</span>
                  </p>
                ) : null}
              </div>

              {/* QR card */}
              <div className="p-5">
                <div className="bg-[var(--brand-cream)] mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center rounded-2xl border-2 p-4 shadow-inner">
                  {/* Vrai QR scannable */}
                  <div className="relative size-full">
                    <Image
                      src={qrDataUrl}
                      alt="QR à scanner"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                <p className="text-muted-foreground mt-4 text-center text-xs">
                  Pointez l&apos;appareil photo de votre téléphone vers ce QR pour voir
                  votre carte comme un client.
                </p>

                {/* URL avec copie */}
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

                <Link
                  href={scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-foreground text-background hover:bg-foreground/90 mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Ouvrir dans un nouvel onglet
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
