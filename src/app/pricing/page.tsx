import { redirect } from "next/navigation";
import { PlanCard } from "./plan-card";
import { requireRestaurant } from "@/lib/server/session";

const ACTIVE_STATUSES = ["active", "trialing"] as const;

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const ctx = await requireRestaurant();
  const params = await searchParams;
  const wasCanceled = params.checkout === "canceled";

  if (
    ctx.restaurant.subStatus &&
    (ACTIVE_STATUSES as readonly string[]).includes(ctx.restaurant.subStatus)
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-svh px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Choisissez votre formule</h1>
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
