import { GeneralForm } from "./form";
import { requireRestaurant } from "@/lib/server/session";

export default async function GeneralSettingsPage() {
  const ctx = await requireRestaurant();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Informations</h1>
        <p className="text-muted-foreground mt-1">Coordonnées de votre restaurant.</p>
      </div>
      <GeneralForm restaurant={ctx.restaurant} />
    </div>
  );
}
