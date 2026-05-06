import { eq } from "drizzle-orm";
import { HoursForm } from "./form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { restaurantHours } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export default async function HoursSettingsPage() {
  const ctx = await requireRestaurant();
  const hours = await db
    .select()
    .from(restaurantHours)
    .where(eq(restaurantHours.restaurantId, ctx.restaurant.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Horaires</h1>
        <p className="text-muted-foreground mt-1">
          Un créneau par jour. Pour les services midi et soir distincts, ce sera ajouté plus tard.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ouverture hebdomadaire</CardTitle>
          <CardDescription>
            Cochez « Fermé » pour les jours sans service. Heure de fermeture &gt; heure
            d&apos;ouverture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HoursForm initial={hours} />
        </CardContent>
      </Card>
    </div>
  );
}
