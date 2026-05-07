import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { env } from "@/lib/env";

/**
 * Origines autorisées pour CSRF.
 * Couvre :
 * - APP_URL (production / domaine custom)
 * - VERCEL_URL (déploiement courant — change à chaque commit)
 * - VERCEL_BRANCH_URL (URL stable par branche)
 * - VERCEL_PROJECT_PRODUCTION_URL (alias prod stable)
 * - localhost en dev
 */
function buildTrustedOrigins(): string[] {
  const origins = new Set<string>([env.APP_URL]);

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) origins.add(`https://${vercelUrl}`);

  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL;
  if (vercelBranchUrl) origins.add(`https://${vercelBranchUrl}`);

  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProdUrl) origins.add(`https://${vercelProdUrl}`);

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return Array.from(origins);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      isPlatformAdmin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: buildTrustedOrigins(),
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const tpl = welcomeEmail({ name: createdUser.name, appUrl: env.APP_URL });
          await sendEmail({ ...tpl, to: createdUser.email });
        },
      },
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
