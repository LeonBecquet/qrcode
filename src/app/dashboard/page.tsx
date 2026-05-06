import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRestaurant } from "@/lib/server/session";

export default async function DashboardPage() {
  const ctx = await requireRestaurant();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue {ctx.user.name}. Le reste arrive : menus, tables, commandes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant</CardTitle>
            <CardDescription>Infos de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Slug :</span>{" "}
              <code className="text-xs">{ctx.restaurant.slug}</code>
            </div>
            <div>
              <span className="text-muted-foreground">Langues :</span>{" "}
              {ctx.restaurant.languages.join(", ")}
            </div>
            <div>
              <span className="text-muted-foreground">Statut abo :</span>{" "}
              {ctx.restaurant.subStatus ?? "aucun"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Phase 2 — Stripe</CardTitle>
            <CardDescription>Abonnement à brancher</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page pricing, checkout, webhook, sub gate.
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Phase 3+ — Builder</CardTitle>
            <CardDescription>Branding, menus, tables, QR</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Tout le coeur métier.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
