"use client";

import { useState, useTransition } from "react";
import { createRestaurantAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createRestaurantAction(formData);
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom du restaurant</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          placeholder="Le Bistrot du Coin"
          className="h-11"
        />
      </div>

      {error ? (
        <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-[var(--brand-orange)] text-white shadow-md shadow-[var(--brand-orange)]/20 hover:bg-[var(--brand-orange)]/90"
      >
        {pending ? "Création..." : "Créer mon restaurant →"}
      </Button>
    </form>
  );
}
