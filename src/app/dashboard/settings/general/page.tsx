import { Building2 } from "lucide-react";
import { GeneralForm } from "./form";
import { requireRestaurant } from "@/lib/server/session";

export default async function GeneralSettingsPage() {
  const ctx = await requireRestaurant();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-[var(--brand-forest)]/10 text-[var(--brand-forest)] flex size-12 items-center justify-center rounded-xl">
          <Building2 className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Informations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Coordonnées affichées sur le menu client et les emails.
          </p>
        </div>
      </div>
      <GeneralForm restaurant={ctx.restaurant} />
    </div>
  );
}
