"use client";

import { useState, useTransition } from "react";
import { callWaiterAction } from "./cart/actions";
import { Button } from "@/components/ui/button";

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

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={pending || feedback === "sent"}
    >
      {feedback === "sent" ? "✓ Demandé" : feedback === "error" ? "Erreur" : "Appeler"}
    </Button>
  );
}
