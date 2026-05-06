"use client";

import { useState, useTransition } from "react";
import { startCheckoutAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubTier } from "@/lib/db/schema";

type Props = {
  tier: SubTier;
  label: string;
  amountEur: number;
  cadence: string;
  description: string;
  highlight?: boolean;
  ctaLabel: string;
};

export function PlanCard({ tier, label, amountEur, cadence, description, highlight, ctaLabel }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await startCheckoutAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        window.location.href = result.url;
      }
    });
  }

  return (
    <Card className={highlight ? "border-primary shadow-md" : undefined}>
      <CardHeader>
        <CardTitle className="text-xl">{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{amountEur} €</span>
          <span className="text-muted-foreground text-sm">{cadence}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2">
        <form action={handleAction}>
          <input type="hidden" name="tier" value={tier} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Redirection..." : ctaLabel}
          </Button>
        </form>
        {error ? <p className="text-destructive text-center text-sm">{error}</p> : null}
      </CardFooter>
    </Card>
  );
}
