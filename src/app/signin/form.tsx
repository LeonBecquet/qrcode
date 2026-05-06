"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const { error: signInError } = await signIn.email({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Identifiants invalides.");
      return;
    }

    const from = searchParams.get("from");
    router.push(from && from.startsWith("/") ? from : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@restaurant.fr"
          className="h-11"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        disabled={loading}
        className="w-full bg-[var(--brand-orange)] text-white shadow-md shadow-[var(--brand-orange)]/20 hover:bg-[var(--brand-orange)]/90"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
