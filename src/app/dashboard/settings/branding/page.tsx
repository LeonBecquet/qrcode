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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Branding</h1>
        <p className="text-muted-foreground mt-1">Logo, image de couverture et couleur.</p>
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
          <CardTitle>Couleur</CardTitle>
          <CardDescription>Personnalisez l&apos;accent de votre menu.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeForm initialPrimary={primary} />
        </CardContent>
      </Card>
    </div>
  );
}
