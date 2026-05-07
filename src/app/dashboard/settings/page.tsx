import { CalendarClock, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import Link from "next/link";
import { openBillingPortalAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRestaurant } from "@/lib/server/session";
import { TIER_CONFIG } from "@/lib/stripe";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const STATUS_LABEL: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  active: { label: "Actif", tone: "good" },
  trialing: { label: "Essai gratuit", tone: "good" },
  past_due: { label: "Paiement échoué", tone: "bad" },
  canceled: { label: "Annulé", tone: "warn" },
  incomplete: { label: "À finaliser", tone: "warn" },
  incomplete_expired: { label: "Expiré", tone: "bad" },
  unpaid: { label: "Impayé", tone: "bad" },
  paused: { label: "En pause", tone: "warn" },
};

export default async function SettingsPage() {
  const ctx = await requireRestaurant();
  const tier = ctx.restaurant.tier;
  const isLifetime = tier === "lifetime";
  const renewalDate = ctx.restaurant.currentPeriodEnd;
  const lifetimeDate = ctx.restaurant.lifetimePurchasedAt;
  const subStatus = ctx.restaurant.subStatus;
  const status = subStatus ? (STATUS_LABEL[subStatus] ?? { label: subStatus, tone: "neutral" as const }) : null;
  const isTrialing = subStatus === "trialing";
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const daysLeft =
    isTrialing && renewalDate
      ? Math.max(0, Math.ceil((renewalDate.getTime() - nowMs) / (24 * 3600 * 1000)))
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex size-12 items-center justify-center rounded-xl">
          <CreditCard className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Abonnement</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Formule, échéances et facturation Stripe.
          </p>
        </div>
      </div>

      {/* Hero subscription card */}
      <div className="bg-card relative overflow-hidden rounded-3xl border shadow-sm">
        {/* Top gradient accent */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)]"
        />
        {/* Decorative blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
        />

        <div className="relative grid items-center gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {tier ? (
                <span className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <Sparkles className="size-3" />
                  {TIER_CONFIG[tier].label}
                </span>
              ) : (
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-semibold">
                  Aucune formule
                </span>
              )}
              {status ? <StatusPill tone={status.tone} label={status.label} /> : null}
            </div>

            {tier ? (
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Tarif
                </p>
                <p className="text-4xl font-bold tracking-tight">
                  {TIER_CONFIG[tier].amountEur} €
                  <span className="text-muted-foreground ml-1.5 text-base font-normal">
                    {isLifetime ? "à vie" : tier === "annual" ? "/ an" : "/ mois"}
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  Vous n&apos;avez pas encore choisi de formule.
                </p>
                <p className="text-muted-foreground text-sm">
                  Choisissez une formule pour activer votre compte au-delà de l&apos;essai.
                </p>
              </div>
            )}

            {isTrialing && daysLeft !== null ? (
              <div className="border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 flex items-center gap-3 rounded-xl border p-3">
                <CalendarClock className="text-[var(--brand-orange)] size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {daysLeft === 0
                      ? "Votre essai se termine aujourd'hui"
                      : daysLeft === 1
                        ? "1 jour restant d'essai"
                        : `${daysLeft} jours restants d'essai`}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Choisissez une formule pour ne pas perdre l&apos;accès.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Choisir
                </Link>
              </div>
            ) : null}

            {isLifetime && lifetimeDate ? (
              <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                <CheckCircle2 className="text-[var(--brand-forest)] size-4" />
                Acheté le {dateFormatter.format(lifetimeDate)} — accès illimité.
              </p>
            ) : null}

            {!isLifetime && tier && renewalDate ? (
              <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                <CalendarClock className="size-4" />
                Prochaine échéance : <strong>{dateFormatter.format(renewalDate)}</strong>
              </p>
            ) : null}
          </div>

          {/* Actions à droite */}
          <div className="flex flex-col gap-2 lg:items-end">
            {!isLifetime && tier ? (
              <form action={openBillingPortalAction}>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full lg:w-auto"
                >
                  Gérer chez Stripe
                </Button>
              </form>
            ) : null}
            {!tier ? (
              <Link
                href="/pricing"
                className="bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--brand-orange)]/30"
              >
                Voir les formules
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Inclus dans la formule */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Inclus dans toutes les formules</CardTitle>
          <CardDescription>Aucune fonctionnalité bridée par tier.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              "Tables illimitées",
              "Catégories et plats illimités",
              "0% de commission sur les commandes",
              "Multi-langue FR/EN",
              "Allergènes UE intégrés",
              "Support FR par mail",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="text-[var(--brand-forest)] size-4 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({
  tone,
  label,
}: {
  tone: "good" | "warn" | "bad" | "neutral";
  label: string;
}) {
  const styles = {
    good: "bg-[var(--brand-forest)]/15 text-[var(--brand-forest)]",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    bad: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-muted-foreground",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
