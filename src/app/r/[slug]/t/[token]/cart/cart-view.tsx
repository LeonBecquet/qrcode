"use client";

import Link from "next/link";
import { lineSubtotalCents, lineUnitPriceCents, useCart } from "../cart-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function CartView({ slug, token }: { slug: string; token: string }) {
  const { cart, hydrated, totalCents, updateQuantity, removeLine } = useCart(token);

  if (!hydrated) {
    return <p className="text-muted-foreground py-8 text-center text-sm">Chargement...</p>;
  }

  if (cart.lines.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 py-12 text-center">
          <p className="text-muted-foreground">Votre panier est vide.</p>
          <Link
            href={`/r/${slug}/t/${token}`}
            className="text-foreground inline-block text-sm underline-offset-4 hover:underline"
          >
            Voir le menu
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Votre commande</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {cart.lines.map((line) => {
              const unit = lineUnitPriceCents(line);
              const subtotal = lineSubtotalCents(line);
              return (
                <li key={line.lineId} className="space-y-2 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{line.nameSnapshot}</p>
                      {line.options.length > 0 ? (
                        <ul className="text-muted-foreground mt-0.5 space-y-0.5 text-xs">
                          {line.options.map((opt, idx) => (
                            <li key={`${opt.optionId}-${opt.choiceId}-${idx}`}>
                              {opt.optionName} : {opt.choiceName}
                              {opt.priceDeltaCents !== 0
                                ? ` (${opt.priceDeltaCents > 0 ? "+" : ""}${formatter.format(opt.priceDeltaCents / 100)})`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    <span className="font-mono text-sm whitespace-nowrap">
                      {formatter.format(subtotal / 100)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        aria-label="Diminuer"
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-sm">{line.quantity}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        aria-label="Augmenter"
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground font-mono text-xs">
                        × {formatter.format(unit / 100)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLine(line.lineId)}
                        className="text-destructive"
                      >
                        Retirer
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono text-base font-semibold">
            {formatter.format(totalCents / 100)}
          </span>
        </CardFooter>
      </Card>

      <p className="text-muted-foreground text-center text-xs">
        La commande sera envoyée en cuisine. Vous payez à la fin du repas, comme d&apos;habitude.
      </p>
    </div>
  );
}
