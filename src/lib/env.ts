import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.url(),

  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "Must be at least 32 chars (use `openssl rand -base64 32`)"),
  BETTER_AUTH_URL: z.url(),

  APP_URL: z.url(),

  // Stripe — optionnels en dev tant que pas configuré.
  // Au runtime, les endpoints Stripe throw si absents (voir src/lib/stripe.ts).
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ANNUAL: z.string().optional(),
  STRIPE_PRICE_LIFETIME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables — see above.");
}

export const env = parsed.data;
