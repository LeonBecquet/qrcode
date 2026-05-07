/**
 * Affiche le count de toutes les tables principales.
 * Usage : pnpm tsx --env-file=.env.local scripts/db-state.ts
 */

import { count } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import {
  account,
  memberships,
  menuCategories,
  menuItemOptionChoices,
  menuItemOptions,
  menuItems,
  menus,
  orderItems,
  orders,
  restaurantHours,
  restaurants,
  serviceRequests,
  session,
  tables,
  user,
  verification,
} from "../src/lib/db/schema";

const TABLES = [
  ["user", user],
  ["session", session],
  ["account", account],
  ["verification", verification],
  ["memberships", memberships],
  ["restaurants", restaurants],
  ["restaurantHours", restaurantHours],
  ["tables", tables],
  ["menus", menus],
  ["menuCategories", menuCategories],
  ["menuItems", menuItems],
  ["menuItemOptions", menuItemOptions],
  ["menuItemOptionChoices", menuItemOptionChoices],
  ["orders", orders],
  ["orderItems", orderItems],
  ["serviceRequests", serviceRequests],
] as const;

async function main() {
  console.log("=== État DB ===\n");
  let total = 0;
  for (const [name, table] of TABLES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ c }] = await db.select({ c: count() }).from(table as any);
    total += c;
    const indicator = c === 0 ? "✓" : "•";
    console.log(`  ${indicator} ${name.padEnd(25)} : ${c}`);
  }
  console.log(`\n  TOTAL : ${total} ligne(s)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur:", err);
  process.exit(1);
});
