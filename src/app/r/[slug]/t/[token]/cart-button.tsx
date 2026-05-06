"use client";

import Link from "next/link";
import { cartTotalCents, useCart } from "./cart-store";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function CartButton({
  slug,
  token,
}: {
  slug: string;
  token: string;
}) {
  const { cart, hydrated, itemCount } = useCart(token);

  if (!hydrated || itemCount === 0) return null;

  const total = cartTotalCents(cart);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
      <Link
        href={`/r/${slug}/t/${token}/cart`}
        className="bg-foreground text-background pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-3 rounded-full px-5 py-3 shadow-lg"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className="bg-background text-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
            {itemCount}
          </span>
          Voir mon panier
        </span>
        <span className="font-mono text-sm">{formatter.format(total / 100)}</span>
      </Link>
    </div>
  );
}
