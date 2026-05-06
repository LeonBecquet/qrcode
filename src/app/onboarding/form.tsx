"use client";

import { useState, useTransition } from "react";
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
import { createRestaurantAction } from "./actions";

export default function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createRestaurantAction(formData);
      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Bienvenue !</CardTitle>
        <CardDescription>
          Donnez un nom à votre restaurant. Vous pourrez tout configurer ensuite (logo, horaires,
          menu).
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du restaurant</Label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Le Bistrot du Coin"
            />
          </div>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Création..." : "Créer mon restaurant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
