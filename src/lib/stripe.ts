import Stripe from "stripe";
import type { SubTier } from "@/lib/db/schema";
import { env } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY not configured. Add it to .env.local before using Stripe endpoints.",
    );
  }
  _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "QR Restaurant",
      version: "0.1.0",
    },
  });
  return _stripe;
}

export type CheckoutMode = "subscription" | "payment";

export const TIER_CONFIG: Record<
  SubTier,
  { mode: CheckoutMode; priceEnvKey: keyof typeof env; label: string; amountEur: number }
> = {
  monthly: {
    mode: "subscription",
    priceEnvKey: "STRIPE_PRICE_MONTHLY",
    label: "Mensuel",
    amountEur: 49,
  },
  annual: {
    mode: "subscription",
    priceEnvKey: "STRIPE_PRICE_ANNUAL",
    label: "Annuel",
    amountEur: 499,
  },
  lifetime: {
    mode: "payment",
    priceEnvKey: "STRIPE_PRICE_LIFETIME",
    label: "À vie",
    amountEur: 2000,
  },
};

export function getPriceIdForTier(tier: SubTier): string {
  const config = TIER_CONFIG[tier];
  const priceId = env[config.priceEnvKey];
  if (!priceId) {
    throw new Error(`${config.priceEnvKey} not configured.`);
  }
  return priceId;
}

export function getWebhookSecret(): string {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured.");
  }
  return env.STRIPE_WEBHOOK_SECRET;
}
