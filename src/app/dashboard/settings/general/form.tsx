"use client";

import { useState, useTransition } from "react";
import { updateGeneralAction } from "./actions";
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
import type { Restaurant } from "@/lib/db/schema";

export function GeneralForm({ restaurant }: { restaurant: Restaurant }) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateGeneralAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>Coordonnées et langues affichées au client.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du restaurant</Label>
            <Input
              id="name"
              name="name"
              defaultValue={restaurant.name}
              required
              minLength={2}
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description courte</Label>
            <Input
              id="description"
              name="description"
              defaultValue={restaurant.description ?? ""}
              maxLength={500}
              placeholder="Bistrot français, cuisine du marché"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              defaultValue={restaurant.address ?? ""}
              maxLength={200}
              placeholder="12 rue Saint-Martin"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={restaurant.postalCode ?? ""}
                maxLength={10}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                defaultValue={restaurant.city ?? ""}
                maxLength={80}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={restaurant.phone ?? ""}
                maxLength={32}
                placeholder="01 23 45 67 89"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de contact</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={restaurant.email ?? ""}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="enableEnglish"
                defaultChecked={restaurant.languages.includes("en")}
                className="size-4 accent-current"
              />
              <span>
                <span className="block">Afficher le menu en anglais</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Bilingue FR + EN — utile pour les touristes.
                </span>
              </span>
            </Label>
          </div>

          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          {saved ? <p className="text-sm text-emerald-600">Enregistré.</p> : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
