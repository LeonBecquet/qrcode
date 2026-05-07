"use client";

import { Bell, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { callWaiterAction } from "./cart/actions";

export function CallWaiterButton({ slug, token }: { slug: string; token: string }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<"idle" | "sent" | "error">("idle");

  function handleClick() {
    if (feedback === "sent") return;
    startTransition(async () => {
      const result = await callWaiterAction({ slug, token });
      if ("error" in result) {
        setFeedback("error");
        return;
      }
      setFeedback("sent");
      window.setTimeout(() => setFeedback("idle"), 30_000);
    });
  }

  const sent = feedback === "sent";
  const error = feedback === "error";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || sent}
      className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        sent
          ? "bg-emerald-500 border-emerald-500 text-white"
          : error
            ? "bg-destructive border-destructive text-white"
            : "bg-card border-input hover:bg-[color-mix(in_oklab,var(--client-primary,currentColor)_8%,transparent)] hover:border-[color-mix(in_oklab,var(--client-primary,currentColor)_30%,transparent)]"
      }`}
      aria-label={sent ? "Demande envoyée" : "Appeler un serveur"}
    >
      {sent ? <Check className="size-3.5" /> : <Bell className="size-3.5" />}
      <span className="hidden sm:inline">
        {sent ? "Envoyé" : error ? "Erreur" : "Appeler"}
      </span>
    </button>
  );
}
