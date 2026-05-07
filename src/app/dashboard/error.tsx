"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log côté serveur si on a un service d'erreur, sinon console
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="bg-card relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-dashed border-[var(--brand-tomato)]/30 p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[var(--brand-tomato)]/10 blur-3xl"
        />
        <div className="relative space-y-4">
          <div className="bg-[var(--brand-tomato)]/15 text-[var(--brand-tomato)] mx-auto flex size-16 items-center justify-center rounded-2xl shadow-sm">
            <AlertTriangle className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Quelque chose a mal tourné</h2>
            <p className="text-muted-foreground text-sm">
              Une erreur s&apos;est produite côté serveur. Pas de panique, vos données sont
              en sécurité.
            </p>
            {error.digest ? (
              <p className="text-muted-foreground/70 mt-2 font-mono text-xs">
                Code : {error.digest}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Button
              type="button"
              onClick={reset}
              className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 text-white"
            >
              <RefreshCw className="mr-1.5 size-4" />
              Réessayer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
