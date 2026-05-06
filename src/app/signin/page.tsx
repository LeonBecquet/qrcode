import { Globe, Lock, Shield, Sparkles, Star } from "lucide-react";
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
          className="animate-blob-1 pointer-events-none absolute top-20 right-10 h-72 w-72 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-blob-2 pointer-events-none absolute bottom-20 left-10 h-72 w-72 rounded-full bg-[var(--brand-saffron)]/12 blur-3xl"
        />

        {/* Decorative dot grid pattern */}
        <div
          aria-hidden="true"
          className="text-foreground/[0.04] pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative w-full max-w-md">
          {/* Gradient ring autour de la card */}
          <div
            aria-hidden="true"
            className="absolute -inset-px rounded-[20px] bg-gradient-to-br from-[var(--brand-orange)]/30 via-[var(--brand-saffron)]/20 to-[var(--brand-forest)]/20 opacity-60 blur-sm"
          />

          {/* Card form */}
          <div className="bg-card/90 relative overflow-hidden rounded-[18px] border p-7 shadow-xl backdrop-blur-md sm:p-8">
            {/* Top accent bar gradient */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)]"
            />

            {/* Corner blob décoratif */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--brand-orange)]/10 blur-2xl"
            />

            <div className="relative space-y-6">
              <SignInIntro />

              {/* Social proof */}
              <div className="bg-[var(--brand-saffron)]/10 border-[var(--brand-saffron)]/20 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
                <div className="flex -space-x-1">
                  {["#EE8033", "#1F4F1F", "#F5C342", "#D04A33"].map((color) => (
                    <span
                      key={color}
                      className="border-card size-5 rounded-full border-2"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">+147 restaurants</strong>
                </span>
                <div className="ml-auto flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="size-3 fill-[var(--brand-saffron)] text-[var(--brand-saffron)]"
                    />
                  ))}
                </div>
              </div>

              <Suspense>
                <SignInForm />
              </Suspense>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card text-muted-foreground px-3 text-xs">ou</span>
                </div>
              </div>

              <Link
                href="/signup"
                className="group bg-secondary/50 hover:bg-secondary border-input hover:border-foreground/30 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-all"
              >
                <span>Créer un nouveau compte</span>
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Trust signals sous la card */}
          <div className="text-muted-foreground mt-6 flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Shield className="size-3.5 text-[var(--brand-forest)]" />
              Sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-[var(--brand-forest)]" />
              Chiffré
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
