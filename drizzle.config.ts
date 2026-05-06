import { defineConfig } from "drizzle-kit";

// Charge .env.local (Node 20.6+). Sinon on retombe sur process.env (CI).
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local pas trouvé — c'est OK en CI / prod où les vars sont déjà set
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for drizzle-kit. Set it in .env.local.");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
