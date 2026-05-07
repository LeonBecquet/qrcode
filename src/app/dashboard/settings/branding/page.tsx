import { Palette } from "lucide-react";
import { ImageUploader } from "./image-uploader";
import { ThemeForm } from "./theme-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRestaurant } from "@/lib/server/session";

export default async function BrandingSettingsPage() {
  const ctx = await requireRestaurant();
  const primary = ctx.restaurant.theme?.primary ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-[var(--brand-tomato)]/15 text-[var(--brand-tomato)] flex size-12 items-center justify-center rounded-xl">
          <Palette className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Branding</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Logo, couverture et couleur d&apos;accent. Visible sur le menu client.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>JPG, PNG ou WebP. 5 Mo max.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ImageUploader
            type="logo"
            label="Logo"
            hint="Carré ou circulaire. Idéal 512×512 px."
            currentUrl={ctx.restaurant.logoUrl}
            aspectClassName="aspect-square w-32"
          />
          <ImageUploader
            type="cover"
            label="Couverture"
            hint="Bandeau d'en-tête du menu. Idéal 1600×600 px."
            currentUrl={ctx.restaurant.coverUrl}
            aspectClassName="aspect-[16/6] w-full max-w-md"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Couleur principale</CardTitle>
          <CardDescription>
            Pour des thèmes plus poussés, utilisez le drawer Design dans l&apos;éditeur de menu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeForm initialPrimary={primary} />
        </CardContent>
      </Card>
    </div>
  );
}
