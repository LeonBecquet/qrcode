"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { tables } from "@/lib/db/schema";
import { generateTableToken } from "@/lib/qr";
import { requireRestaurant } from "@/lib/server/session";

export type ActionResult = { error: string };

const tableSchema = z.object({
  label: z.string().trim().min(1, "Label requis.").max(32),
  groupName: z.string().trim().max(64).optional().or(z.literal("")),
});

async function generateUniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = generateTableToken();
    const existing = await db
      .select({ id: tables.id })
      .from(tables)
      .where(eq(tables.token, token))
      .limit(1);
    if (existing.length === 0) return token;
  }
  throw new Error("Impossible de générer un token unique. Réessayez.");
}

export async function createTableAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const parsed = tableSchema.safeParse({
    label: formData.get("label"),
    groupName: formData.get("groupName") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  const token = await generateUniqueToken();

  const existing = await db
    .select({ id: tables.id })
    .from(tables)
    .where(eq(tables.restaurantId, ctx.restaurant.id));

  await db.insert(tables).values({
    restaurantId: ctx.restaurant.id,
    label: parsed.data.label,
    groupName: parsed.data.groupName || null,
    token,
    sortOrder: existing.length,
  });

  revalidatePath("/dashboard/tables");
}

export async function bulkCreateTablesAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const countRaw = Number.parseInt(String(formData.get("count") ?? "0"), 10);
  const startRaw = Number.parseInt(String(formData.get("start") ?? "1"), 10);
  const prefix = String(formData.get("prefix") ?? "T").trim().slice(0, 8);
  const groupName = String(formData.get("groupName") ?? "").trim().slice(0, 64) || null;

  if (!Number.isFinite(countRaw) || countRaw < 1 || countRaw > 100) {
    return { error: "Nombre de tables invalide (1 à 100)." };
  }
  const start = Number.isFinite(startRaw) ? startRaw : 1;

  const existing = await db
    .select({ id: tables.id })
    .from(tables)
    .where(eq(tables.restaurantId, ctx.restaurant.id));

  const baseSortOrder = existing.length;
  const rows: (typeof tables.$inferInsert)[] = [];
  for (let i = 0; i < countRaw; i++) {
    rows.push({
      restaurantId: ctx.restaurant.id,
      label: `${prefix}${start + i}`,
      groupName,
      token: await generateUniqueToken(),
      sortOrder: baseSortOrder + i,
    });
  }

  await db.insert(tables).values(rows);

  revalidatePath("/dashboard/tables");
}

export async function updateTableAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const tableId = String(formData.get("tableId") ?? "");
  const parsed = tableSchema.safeParse({
    label: formData.get("label"),
    groupName: formData.get("groupName") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  await db
    .update(tables)
    .set({
      label: parsed.data.label,
      groupName: parsed.data.groupName || null,
      updatedAt: new Date(),
    })
    .where(and(eq(tables.id, tableId), eq(tables.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/tables");
}

export async function deleteTableAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const tableId = String(formData.get("tableId") ?? "");

  await db
    .delete(tables)
    .where(and(eq(tables.id, tableId), eq(tables.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/tables");
}

export async function regenerateTableTokenAction(
  formData: FormData,
): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const tableId = String(formData.get("tableId") ?? "");
  const newToken = await generateUniqueToken();

  await db
    .update(tables)
    .set({ token: newToken, updatedAt: new Date() })
    .where(and(eq(tables.id, tableId), eq(tables.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/tables");
}

export async function toggleTableActiveAction(
  formData: FormData,
): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const tableId = String(formData.get("tableId") ?? "");

  await db
    .update(tables)
    .set({
      isActive: sql`NOT ${tables.isActive}`,
      updatedAt: new Date(),
    })
    .where(and(eq(tables.id, tableId), eq(tables.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/tables");
}
