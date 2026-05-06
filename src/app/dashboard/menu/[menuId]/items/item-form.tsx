"use client";

import { useState, useTransition } from "react";
import { createItemAction, updateItemAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALLERGENS, type Allergen, type MenuItem } from "@/lib/db/schema";

const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: "Gluten",
  crustaces: "Crustacés",
  oeufs: "Œufs",
  poisson: "Poisson",
  arachide: "Arachide",
  soja: "Soja",
  lait: "Lait",
  "fruits-coque": "Fruits à coque",
  celeri: "Céleri",
  moutarde: "Moutarde",
  sesame: "Sésame",
  sulfites: "Sulfites",
  lupin: "Lupin",
  mollusques: "Mollusques",
};

type Props = {
  mode: "create" | "edit";
  bilingual: boolean;
  item?: MenuItem;
  categoryId?: string;
  itemId?: string;
};

export function ItemForm({ mode, bilingual, item, categoryId, itemId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result =
        mode === "create" ? await createItemAction(formData) : await updateItemAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  const initialAllergens = new Set<Allergen>(
    (item?.allergens ?? []).filter((a): a is Allergen =>
      (ALLERGENS as readonly string[]).includes(a),
    ),
  );

  return (
    <form action={handleAction}>
      {mode === "create" && categoryId ? (
        <input type="hidden" name="categoryId" value={categoryId} />
      ) : null}
      {mode === "edit" && itemId ? (
        <input type="hidden" name="itemId" value={itemId} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Nouveau plat" : "Modifier le plat"}</CardTitle>
          <CardDescription>
            Renseignez le nom, le prix et les allergènes. La photo viendra plus tard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameFr">Nom (FR) *</Label>
              <Input
                id="nameFr"
                name="nameFr"
                defaultValue={item?.nameFr ?? ""}
                required
                maxLength={120}
                placeholder="Tartare de bœuf"
              />
            </div>
            {bilingual ? (
              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (EN)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={item?.nameEn ?? ""}
                  maxLength={120}
                  placeholder="Beef tartare"
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="descriptionFr">Description (FR)</Label>
              <Input
                id="descriptionFr"
                name="descriptionFr"
                defaultValue={item?.descriptionFr ?? ""}
                maxLength={500}
                placeholder="Au couteau, câpres, échalote, jaune d'œuf"
              />
            </div>
            {bilingual ? (
              <div className="space-y-2">
                <Label htmlFor="descriptionEn">Description (EN)</Label>
                <Input
                  id="descriptionEn"
                  name="descriptionEn"
                  defaultValue={item?.descriptionEn ?? ""}
                  maxLength={500}
                />
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priceEur">Prix (€) *</Label>
              <Input
                id="priceEur"
                name="priceEur"
                type="number"
                step="0.10"
                min="0"
                required
                defaultValue={item ? (item.priceCents / 100).toFixed(2) : "0.00"}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  defaultChecked={item?.isAvailable ?? true}
                  className="size-4 accent-current"
                />
                <span>
                  <span className="block">Disponible</span>
                  <span className="text-muted-foreground text-xs font-normal">
                    Décochez si rupture de stock.
                  </span>
                </span>
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Allergènes (UE 14)</Label>
            <p className="text-muted-foreground text-xs">
              Obligatoire en France. Cochez tous les allergènes présents dans le plat.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {ALLERGENS.map((allergen) => (
                <label
                  key={allergen}
                  className="hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name={`allergen_${allergen}`}
                    defaultChecked={initialAllergens.has(allergen)}
                    className="size-4 accent-current"
                  />
                  {ALLERGEN_LABELS[allergen]}
                </label>
              ))}
            </div>
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : mode === "create" ? "Créer le plat" : "Enregistrer"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
