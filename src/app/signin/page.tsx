import Link from "next/link";
import { Suspense } from "react";
import SignInForm from "./form";
import { AuthSidePanel } from "@/components/auth-side-panel";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <AuthSidePanel
        tagline="Vos commandes en cuisine en temps réel. Sans appli, sans commission."
        highlights={[
          { value: "0%", label: "Commission" },
          { value: "5 min", label: "Setup" },
          { value: "FR/EN", label: "Bilingue" },
        ]}
      />

      <main className="bg-background relative flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Logo en haut visible mobile (caché desktop car déjà dans panel) */}
        <Link
          href="/"
          className="absolute top-6 left-6 transition-opacity hover:opacity-80 md:hidden"
        >
          <Logo variant="full" size={28} />
        </Link>

        {/* Decorative blob mobile only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl md:hidden"
        />

        <div className="relative w-full max-w-sm space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Bon retour 👋</h1>
            <p className="text-muted-foreground text-sm">
              Connectez-vous à votre tableau de bord.
            </p>
          </div>

          <Suspense>
            <SignInForm />
          </Suspense>

          <p className="text-muted-foreground text-center text-sm">
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-foreground font-medium underline-offset-4 hover:text-[var(--brand-orange)] hover:underline"
            >
              Créer un compte
            </Link>
          </p>

          <div className="text-muted-foreground flex items-center justify-center gap-3 border-t pt-6 text-xs">
            <span className="flex items-center gap-1">
              <span className="text-[var(--brand-forest)]">✓</span> Sécurisé
            </span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--brand-forest)]">✓</span> RGPD
            </span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--brand-forest)]">✓</span> Made in France
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
