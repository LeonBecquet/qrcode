"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ThemeForm({ initialPrimary }: { initialPrimary: string }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [primary, setPrimary] = useState(initialPrimary);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateThemeAction(formData);
      if ("error" in result) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="primary">Couleur principale</Label>
        <p className="text-muted-foreground text-xs">
          Affichée sur le menu client. Format hex (ex : #FF6600).
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          name="primary"
          value={primary || "#000000"}
          onChange={(e) => setPrimary(e.target.value)}
          className="h-10 w-16 cursor-pointer rounded border"
        />
        <Input
          id="primary"
          value={primary}
          onChange={(e) => setPrimary(e.target.value)}
          placeholder="#000000"
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "..." : "Enregistrer la couleur"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-600">Enregistré.</p> : null}
      </div>
    </form>
  );
}
