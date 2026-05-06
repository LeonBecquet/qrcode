"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthSidePanel } from "@/components/auth-side-panel";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const { error: signUpError } = await signUp.email({ name, email, password });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? "Une erreur est survenue.");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <AuthSidePanel
        tagline="Premier QR code prêt à imprimer en moins d'une heure."
        highlights={[
          { value: "0%", label: "Commission" },
          { value: "5 min", label: "Setup" },
          { value: "FR/EN", label: "Bilingue" },
        ]}
      />

      <main className="bg-background relative flex flex-col items-center justify-center p-6 sm:p-10">
        <Link
          href="/"
          className="absolute top-6 left-6 transition-opacity hover:opacity-80 md:hidden"
        >
          <Logo variant="full" size={28} />
        </Link>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl md:hidden"
        />

        <div className="relative w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Démarrer votre restaurant
            </h1>
            <p className="text-muted-foreground text-sm">
              Créez votre compte. Aucune carte bancaire pour l&apos;essai.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Votre prénom</Label>
              <Input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="Marie"
                className="h-11"
              />
            </div>
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
                minLength={8}
                autoComplete="new-password"
                placeholder="Au moins 8 caractères"
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
              {loading ? "Création..." : "Créer mon compte →"}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              En créant un compte, vous acceptez nos{" "}
              <Link href="/legal/cgu" className="underline-offset-4 hover:underline">
                CGU
              </Link>{" "}
              et notre{" "}
              <Link href="/legal/confidentialite" className="underline-offset-4 hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </form>

          <p className="text-muted-foreground text-center text-sm">
            Déjà un compte ?{" "}
            <Link
              href="/signin"
              className="text-foreground font-medium underline-offset-4 hover:text-[var(--brand-orange)] hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
