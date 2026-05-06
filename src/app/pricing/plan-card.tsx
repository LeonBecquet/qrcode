"use client";

import { useState, useTransition } from "react";
import { startCheckoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubTier } from "@/lib/db/schema";

type Props = {
  tier: SubTier;
  label: string;
  amountEur: number;
  cadence: string;
  description: string;
  highlight?: boolean;
  ctaLabel: string;
};

const STRIPE_NOT_READY_RE = /STRIPE_(SECRET_KEY|PRICE_)/i;

export function PlanCard({
  tier,
  label,
  amountEur,
  cadence,
  description,
  highlight,
  ctaLabel,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await startCheckoutAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.href = result.url;
      }
    });
  }

  const stripeNotReady = error !== null && STRIPE_NOT_READY_RE.test(error);

  return (
    <Card className={highlight ? "border-[var(--brand-orange)] shadow-md" : undefined}>
      <CardHeader>
        <CardTitle className="text-xl">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{amountEur} €</span>
          <span className="text-muted-foreground text-sm">{cadence}</span>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          ✨ 14 jours d&apos;essai gratuit inclus
        </p>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <form action={handleAction}>
          <input type="hidden" name="tier" value={tier} />
          <Button
            type="submit"
            className={
              highlight
                ? "w-full bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange)]/90"
                : "w-full"
            }
            disabled={pending}
          >
            {pending ? "Redirection..." : ctaLabel}
          </Button>
        </form>
        {error ? (
          stripeNotReady ? (
            <div className="border-[var(--brand-saffron)]/40 bg-[var(--brand-saffron)]/15 rounded-md border px-3 py-2 text-xs">
              <p className="font-medium">🚧 Paiement en ligne bientôt disponible</p>
              <p className="text-muted-foreground mt-1">
                Profitez de votre essai gratuit en attendant. On vous contactera quand
                l&apos;abonnement sera ouvert.
              </p>
            </div>
          ) : (
            <p className="text-destructive text-center text-sm">{error}</p>
          )
        ) : null}
      </CardFooter>
    </Card>
  );
}
