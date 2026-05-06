"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "qr_cookie_consent";

const subscribers = new Set<() => void>();
function subscribe(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
function notify() {
  for (const sub of subscribers) sub();
}
function getSnapshot(): "accepted" | "refused" | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(COOKIE_KEY);
  return value === "accepted" || value === "refused" ? value : null;
}
function getServerSnapshot(): null {
  return null;
}

function setConsent(value: "accepted" | "refused") {
  try {
    window.localStorage.setItem(COOKIE_KEY, value);
    notify();
  } catch {
    // ignore
  }
}

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (consent !== null) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="bg-card pointer-events-auto mx-auto flex max-w-2xl flex-col gap-3 rounded-lg border p-4 shadow-lg sm:flex-row sm:items-center">
        <div className="flex-1 text-sm">
          <p className="font-medium">Cookies essentiels uniquement</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Nous n&apos;utilisons que des cookies nécessaires au fonctionnement (session, langue).
            Aucun tracking publicitaire.{" "}
            <Link href="/legal/cookies" className="underline-offset-4 hover:underline">
              En savoir plus
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setConsent("refused")}>
            Refuser
          </Button>
          <Button type="button" size="sm" onClick={() => setConsent("accepted")}>
            J&apos;ai compris
          </Button>
        </div>
      </div>
    </div>
  );
}
