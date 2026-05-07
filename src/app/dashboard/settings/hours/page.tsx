import { eq } from "drizzle-orm";
import { Clock, Info } from "lucide-react";
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

  const openDays = hours.filter((h) => !h.isClosed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)] flex size-12 items-center justify-center rounded-xl">
          <Clock className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Horaires</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Affichés à vos clients sur le menu.{" "}
            {openDays > 0 ? (
              <span className="text-foreground font-medium">
                Ouvert {openDays} jour{openDays > 1 ? "s" : ""} sur 7.
              </span>
            ) : (
              <span className="text-muted-foreground">Pas encore configurés.</span>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Info className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Ouverture hebdomadaire</CardTitle>
              <CardDescription>
                Cochez « Fermé » pour les jours sans service. Heure de fermeture &gt; heure
                d&apos;ouverture.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HoursForm initial={hours} />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        💡 Pour des services midi et soir distincts, gérez vos catégories de menu (« Plats du
        midi », « Plats du soir »).
      </p>
    </div>
  );
}
