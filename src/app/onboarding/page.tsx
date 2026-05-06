import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import OnboardingForm from "./form";
import { Logo } from "@/components/logo";
import { db } from "@/lib/db/client";
import { memberships } from "@/lib/db/schema";
import { requireSession } from "@/lib/server/session";

export default async function OnboardingPage() {
  const session = await requireSession();

  const existing = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background relative flex min-h-svh flex-col items-center justify-center p-6">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--brand-saffron)]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--brand-forest)]/15 blur-3xl"
      />

      <Link
        href="/"
        className="absolute top-6 left-6 transition-opacity hover:opacity-80"
      >
        <Logo variant="full" size={28} />
      </Link>

      <div className="relative w-full max-w-md space-y-6">
        <div className="space-y-3 text-center">
          <div className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
            <span className="size-2 rounded-full bg-[var(--brand-orange)]" />
            Étape 1 / 2
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Comment s&apos;appelle votre restaurant ?
          </h1>
          <p className="text-muted-foreground">
            Vous pourrez tout configurer ensuite : logo, horaires, menu, tables.
          </p>
          <p className="text-muted-foreground text-xs">
            ✨ <strong className="text-[var(--brand-orange)]">14 jours offerts</strong> dès la
            création.
          </p>
        </div>

        <OnboardingForm />

        <p className="text-muted-foreground text-center text-xs">
          Connecté en tant que <span className="font-medium">{session.user.email}</span>
        </p>
      </div>
    </div>
  );
}
