"use client";

import { useTransition } from "react";
import { setPublicLocaleAction } from "./locale-actions";

export function LocaleSwitcher({ current }: { current: "fr" | "en" }) {
  const [pending, startTransition] = useTransition();

  function switchTo(locale: "fr" | "en") {
    if (locale === current) return;
    startTransition(async () => {
      await setPublicLocaleAction(locale);
    });
  }

  return (
    <div className="bg-muted/50 inline-flex shrink-0 items-center rounded-full text-xs font-medium">
      <button
        type="button"
        onClick={() => switchTo("fr")}
        disabled={pending}
        className={`rounded-full px-2.5 py-1 ${
          current === "fr" ? "bg-background shadow-sm" : "text-muted-foreground"
        }`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        className={`rounded-full px-2.5 py-1 ${
          current === "en" ? "bg-background shadow-sm" : "text-muted-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
