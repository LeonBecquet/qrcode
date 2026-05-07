/**
 * Script one-shot : supprime tous les users de la DB.
 * Cascade : sessions, accounts, memberships.
 * Restaurants restent orphelins (les supprimer manuellement si besoin).
 *
 * Usage : pnpm tsx --env-file=.env.local scripts/wipe-users.ts
 */

import { count } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { account, memberships, restaurants, session, user, verification } from "../src/lib/db/schema";

async function countTable(name: string, query: Promise<{ c: number }[]>) {
  const [{ c }] = await query;
  console.log(`  ${name.padEnd(15)} : ${c}`);
}

async function main() {
  console.log("=== Avant ===");
  await countTable("users", db.select({ c: count() }).from(user) as never);
  await countTable("sessions", db.select({ c: count() }).from(session) as never);
  await countTable("accounts", db.select({ c: count() }).from(account) as never);
  await countTable("memberships", db.select({ c: count() }).from(memberships) as never);
  await countTable("verifications", db.select({ c: count() }).from(verification) as never);
  await countTable("restaurants", db.select({ c: count() }).from(restaurants) as never);

  console.log("\n→ Suppression de tous les users (cascade sessions/accounts/memberships)...");
  const deleted = await db.delete(user).returning({ id: user.id });
  console.log(`  ${deleted.length} user(s) supprimé(s).`);

  // Cleanup verification (pas de FK directe vers user dans certains schemas)
  await db.delete(verification);

  console.log("\n=== Après ===");
  await countTable("users", db.select({ c: count() }).from(user) as never);
  await countTable("sessions", db.select({ c: count() }).from(session) as never);
  await countTable("accounts", db.select({ c: count() }).from(account) as never);
  await countTable("memberships", db.select({ c: count() }).from(memberships) as never);
  await countTable("verifications", db.select({ c: count() }).from(verification) as never);
  await countTable("restaurants", db.select({ c: count() }).from(restaurants) as never);

  console.log("\n✓ Fait. Restaurants restent (orphelins). Pour les supprimer aussi, relance avec --restos");

  if (process.argv.includes("--restos")) {
    console.log("\n→ Suppression des restaurants (cascade sur menus, tables, items, orders…)...");
    const deletedR = await db.delete(restaurants).returning({ id: restaurants.id });
    console.log(`  ${deletedR.length} restaurant(s) supprimé(s).`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
