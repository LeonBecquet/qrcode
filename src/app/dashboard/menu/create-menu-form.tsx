"use client";

import { useState, useTransition } from "react";
import { createMenuAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateMenuForm({ defaultName = "Carte" }: { defaultName?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createMenuAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <form action={handleAction} className="flex gap-2">
      <Input
        name="name"
        defaultValue={defaultName}
        placeholder="Nom du menu (ex : Carte du midi)"
        required
        minLength={2}
        maxLength={80}
        className="max-w-sm"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer"}
      </Button>
      {error ? <p className="text-destructive self-center text-sm">{error}</p> : null}
    </form>
  );
}
