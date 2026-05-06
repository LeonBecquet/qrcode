"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { restaurants, type SubTier } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { requireRestaurant } from "@/lib/server/session";
import { getPriceIdForTier, getStripe, TIER_CONFIG } from "@/lib/stripe";

export type CheckoutResult = { url: string } | { error: string };

export async function startCheckoutAction(formData: FormData): Promise<CheckoutResult> {
  const tierRaw = formData.get("tier");
  if (typeof tierRaw !== "string" || !(tierRaw in TIER_CONFIG)) {
    return { error: "Plan invalide." };
  }
  const tier = tierRaw as SubTier;
  const config = TIER_CONFIG[tier];

  let ctx;
  try {
    ctx = await requireRestaurant();
  } catch {
    return { error: "Session expirée. Reconnectez-vous." };
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Stripe non configuré." };
  }

  let customerId = ctx.restaurant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ctx.user.email,
      name: ctx.restaurant.name,
      metadata: {
        restaurantId: ctx.restaurant.id,
        userId: ctx.user.id,
      },
    });
    customerId = customer.id;
    await db
      .update(restaurants)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(restaurants.id, ctx.restaurant.id));
  }

  let priceId: string;
  try {
    priceId = getPriceIdForTier(tier);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Prix Stripe non configuré." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: config.mode,
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.APP_URL}/dashboard?checkout=success`,
    cancel_url: `${env.APP_URL}/pricing?checkout=canceled`,
    metadata: {
      restaurantId: ctx.restaurant.id,
      tier,
    },
    locale: "fr",
    allow_promotion_codes: config.mode === "subscription",
  });

  if (!session.url) {
    return { error: "Impossible de créer la session de paiement." };
  }

  return { url: session.url };
}
