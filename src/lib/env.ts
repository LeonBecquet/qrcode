import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.url(),

  BETTER_AUTH_SECRET: z.string().min(32, "Must be at least 32 chars (use `openssl rand -base64 32`)"),
  BETTER_AUTH_URL: z.url(),

  APP_URL: z.url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables — see above.");
}

export const env = parsed.data;
