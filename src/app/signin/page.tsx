import { Globe, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import SignInForm from "./form";
import { SignInIntro } from "./intro";
import { AuthSidePanel } from "@/components/auth-side-panel";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <AuthSidePanel tagline="Vos commandes en cuisine en temps réel. Sans appli, sans commission." />

      <main className="bg-background relative flex flex-col items-center justify-center p-6 sm:p-10">
        <Link
          href="/"
          className="absolute top-6 left-6 transition-opacity hover:opacity-80 md:hidden"
        >
          <Logo variant="full" size={28} />
        </Link>

        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="animate-blob-1 pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-blob-2 pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[var(--brand-saffron)]/12 blur-3xl"
        />

        <div className="relative w-full max-w-sm space-y-7">
          <SignInIntro />

          <Suspense>
            <SignInForm />
          </Suspense>

          <p className="text-muted-foreground text-center text-sm">
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-foreground font-semibold underline-offset-4 transition-colors hover:text-[var(--brand-orange)] hover:underline"
            >
              Créer un compte
            </Link>
          </p>

          <div className="text-muted-foreground flex items-center justify-center gap-4 border-t pt-6 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-[var(--brand-forest)]" />
              Sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[var(--brand-forest)]" />
              RGPD
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-[var(--brand-forest)]" />
              Made in France
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
