import { redirect } from "next/navigation";
import { PlanCard } from "./plan-card";
import { Logo } from "@/components/logo";
import { requireRestaurant } from "@/lib/server/session";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; trial?: string }>;
}) {
  const ctx = await requireRestaurant();
  const params = await searchParams;
  const wasCanceled = params.checkout === "canceled";
  const trialExpired = params.trial === "expired";

  // Si déjà active, redirect dashboard. Si trialing on laisse voir pricing (consultation).
  if (ctx.restaurant.subStatus === "active") {
    redirect("/dashboard");
  }

  const isTrialing = ctx.restaurant.subStatus === "trialing";
  const trialEnd = ctx.restaurant.currentPeriodEnd;
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const trialDaysLeft =
    isTrialing && trialEnd && trialEnd.getTime() > nowMs
      ? Math.ceil((trialEnd.getTime() - nowMs) / (24 * 3600 * 1000))
      : null;

  return (
    <main className="bg-background relative min-h-svh overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="animate-blob-1 pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-blob-2 pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[var(--brand-saffron)]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl space-y-10">
        <div className="flex justify-center">
          <Logo variant="full" size={32} />
        </div>

        <div className="space-y-3 text-center">
          {trialExpired ? (
            <div className="bg-destructive/10 text-destructive border-destructive/20 mx-auto inline-block rounded-full border px-3 py-1 text-xs font-medium">
              ⚠️ Votre essai gratuit est terminé — choisissez une formule pour continuer
            </div>
          ) : trialDaysLeft !== null ? (
            <div className="border-[var(--brand-orange)]/30 bg-[var(--brand-saffron)]/15 mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <span className="bg-[var(--brand-orange)] inline-block size-2 rounded-full" />
              <strong>Essai gratuit en cours</strong>
              <span className="text-muted-foreground">
                · {trialDaysLeft} jour{trialDaysLeft > 1 ? "s" : ""} restant
                {trialDaysLeft > 1 ? "s" : ""}
              </span>
            </div>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Choisissez votre formule
          </h1>
          <p className="text-muted-foreground">
            Sans engagement. Annulable à tout moment depuis votre espace.
          </p>
          {wasCanceled ? (
            <p className="text-muted-foreground text-sm">
              Paiement annulé — vous pouvez réessayer quand vous voulez.
            </p>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <PlanCard
            tier="monthly"
            label="Mensuel"
            amountEur={49}
            cadence="/mois"
            description="Pour démarrer sans engagement."
            ctaLabel="Choisir"
          />
          <PlanCard
            tier="annual"
            label="Annuel"
            amountEur={499}
            cadence="/an"
            description="2 mois offerts. Le plus populaire."
            highlight
            ctaLabel="Choisir"
          />
          <PlanCard
            tier="lifetime"
            label="À vie"
            amountEur={2000}
            cadence="une fois"
            description="Payez une seule fois, gardez à vie."
            ctaLabel="Acheter à vie"
          />
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Tarifs HT. Paiement sécurisé via Stripe. Vous pouvez annuler à tout moment depuis votre
          espace.
        </p>
      </div>
    </main>
  );
}
