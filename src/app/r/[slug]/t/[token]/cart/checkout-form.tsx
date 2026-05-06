"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "../cart-store";
import { createOrderAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckoutForm({ slug, token }: { slug: string; token: string }) {
  const router = useRouter();
  const { cart, clear, hydrated } = useCart(token);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (cart.lines.length === 0) {
      setError("Votre panier est vide.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({
        slug,
        token,
        customerName: String(formData.get("customerName") ?? "").trim() || undefined,
        customerNote: String(formData.get("customerNote") ?? "").trim() || undefined,
        locale: "fr",
        lines: cart.lines.map((line) => ({
          itemId: line.itemId,
          quantity: line.quantity,
          options: line.options.map((o) => ({
            optionId: o.optionId,
            choiceId: o.choiceId,
          })),
        })),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      clear();
      router.push(`/r/${slug}/t/${token}/order/${result.orderId}`);
    });
  }

  const disabled = !hydrated || cart.lines.length === 0 || pending;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Votre prénom (optionnel)</Label>
        <Input
          id="customerName"
          name="customerName"
          maxLength={80}
          placeholder="Pour faciliter le service"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerNote">Note pour la cuisine (optionnel)</Label>
        <Input
          id="customerNote"
          name="customerNote"
          maxLength={500}
          placeholder="Allergies, sans oignon, bien cuit..."
        />
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={disabled}>
        {pending ? "Envoi..." : "Envoyer en cuisine"}
      </Button>
    </form>
  );
}
