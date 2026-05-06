import { openBillingPortalAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRestaurant } from "@/lib/server/session";
import { TIER_CONFIG } from "@/lib/stripe";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function SettingsPage() {
  const ctx = await requireRestaurant();
  const tier = ctx.restaurant.tier;
  const isLifetime = tier === "lifetime";
  const renewalDate = ctx.restaurant.currentPeriodEnd;
  const lifetimeDate = ctx.restaurant.lifetimePurchasedAt;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Réglages</h1>
        <p className="text-muted-foreground mt-1">Votre abonnement et vos préférences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Gérez votre formule et votre moyen de paiement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {tier ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Formule actuelle</span>
                <span className="font-medium">{TIER_CONFIG[tier].label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className="font-medium">{ctx.restaurant.subStatus ?? "—"}</span>
              </div>
              {isLifetime && lifetimeDate ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Acheté le</span>
                  <span className="font-medium">{dateFormatter.format(lifetimeDate)}</span>
                </div>
              ) : null}
              {!isLifetime && renewalDate ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prochaine échéance</span>
                  <span className="font-medium">{dateFormatter.format(renewalDate)}</span>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">Aucune formule active.</p>
          )}
        </CardContent>
        {!isLifetime && tier ? (
          <CardFooter>
            <form action={openBillingPortalAction}>
              <Button type="submit" variant="outline">
                Gérer mon abonnement
              </Button>
            </form>
          </CardFooter>
        ) : null}
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Restaurant</CardTitle>
          <CardDescription>Branding, horaires, équipe — Phase 3</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
