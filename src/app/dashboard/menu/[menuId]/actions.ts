"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  ALLERGENS,
  type Allergen,
  menuCategories,
  menuItems,
  menus,
} from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export type ActionResult = { error: string };

async function ensureMenuOwnership(menuId: string, restaurantId: string) {
  const found = await db
    .select({ id: menus.id })
    .from(menus)
    .where(and(eq(menus.id, menuId), eq(menus.restaurantId, restaurantId)))
    .limit(1);
  if (found.length === 0) throw new Error("Menu introuvable.");
}

async function ensureCategoryOwnership(categoryId: string, restaurantId: string) {
  const found = await db
    .select({ id: menuCategories.id, menuId: menuCategories.menuId })
    .from(menuCategories)
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(and(eq(menuCategories.id, categoryId), eq(menus.restaurantId, restaurantId)))
    .limit(1);
  if (found.length === 0) throw new Error("Catégorie introuvable.");
  return found[0]!;
}

async function ensureItemOwnership(itemId: string, restaurantId: string) {
  const found = await db
    .select({
      id: menuItems.id,
      categoryId: menuItems.categoryId,
      menuId: menuCategories.menuId,
    })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(and(eq(menuItems.id, itemId), eq(menus.restaurantId, restaurantId)))
    .limit(1);
  if (found.length === 0) throw new Error("Plat introuvable.");
  return found[0]!;
}

// =====================================================
// Menu meta
// =====================================================

const renameMenuSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function renameMenuAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const menuId = String(formData.get("menuId") ?? "");
  const parsed = renameMenuSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Nom invalide." };

  await db
    .update(menus)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(and(eq(menus.id, menuId), eq(menus.restaurantId, ctx.restaurant.id)));

  revalidatePath(`/dashboard/menu/${menuId}`);
  revalidatePath("/dashboard/menu");
}

// =====================================================
// Catégories
// =====================================================

const categorySchema = z.object({
  nameFr: z.string().trim().min(1, "Nom FR requis.").max(80),
  nameEn: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function createCategoryAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const menuId = String(formData.get("menuId") ?? "");
  await ensureMenuOwnership(menuId, ctx.restaurant.id);

  const parsed = categorySchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  const existing = await db
    .select({ id: menuCategories.id })
    .from(menuCategories)
    .where(eq(menuCategories.menuId, menuId));

  await db.insert(menuCategories).values({
    menuId,
    nameFr: parsed.data.nameFr,
    nameEn: parsed.data.nameEn || null,
    sortOrder: existing.length,
  });

  revalidatePath(`/dashboard/menu/${menuId}`);
}

export async function updateCategoryAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const categoryId = String(formData.get("categoryId") ?? "");
  const owned = await ensureCategoryOwnership(categoryId, ctx.restaurant.id);

  const parsed = categorySchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  await db
    .update(menuCategories)
    .set({
      nameFr: parsed.data.nameFr,
      nameEn: parsed.data.nameEn || null,
      updatedAt: new Date(),
    })
    .where(eq(menuCategories.id, categoryId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const categoryId = String(formData.get("categoryId") ?? "");
  const owned = await ensureCategoryOwnership(categoryId, ctx.restaurant.id);

  await db.delete(menuCategories).where(eq(menuCategories.id, categoryId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
}

// =====================================================
// Items
// =====================================================

const itemSchema = z.object({
  nameFr: z.string().trim().min(1, "Nom FR requis.").max(120),
  nameEn: z.string().trim().max(120).optional().or(z.literal("")),
  descriptionFr: z.string().trim().max(500).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(500).optional().or(z.literal("")),
  priceCents: z
    .number()
    .int()
    .min(0, "Prix invalide.")
    .max(1_000_000, "Prix trop élevé."),
  allergens: z.array(z.enum(ALLERGENS)),
  isAvailable: z.boolean(),
});

function parseItemFormData(formData: FormData) {
  const priceRaw = String(formData.get("priceEur") ?? "0").replace(",", ".");
  const priceFloat = Number.parseFloat(priceRaw);
  const priceCents = Number.isFinite(priceFloat) ? Math.round(priceFloat * 100) : 0;

  const allergens: Allergen[] = ALLERGENS.filter(
    (allergen) => formData.get(`allergen_${allergen}`) === "on",
  );

  return itemSchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn") ?? "",
    descriptionFr: formData.get("descriptionFr") ?? "",
    descriptionEn: formData.get("descriptionEn") ?? "",
    priceCents,
    allergens,
    isAvailable: formData.get("isAvailable") === "on",
  });
}

export async function createItemAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const categoryId = String(formData.get("categoryId") ?? "");
  const owned = await ensureCategoryOwnership(categoryId, ctx.restaurant.id);

  const parsed = parseItemFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  const existing = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId));

  await db.insert(menuItems).values({
    categoryId,
    nameFr: parsed.data.nameFr,
    nameEn: parsed.data.nameEn || null,
    descriptionFr: parsed.data.descriptionFr || null,
    descriptionEn: parsed.data.descriptionEn || null,
    priceCents: parsed.data.priceCents,
    allergens: parsed.data.allergens,
    isAvailable: parsed.data.isAvailable,
    sortOrder: existing.length,
  });

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
  redirect(`/dashboard/menu/${owned.menuId}`);
}

export async function updateItemAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  const parsed = parseItemFormData(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  await db
    .update(menuItems)
    .set({
      nameFr: parsed.data.nameFr,
      nameEn: parsed.data.nameEn || null,
      descriptionFr: parsed.data.descriptionFr || null,
      descriptionEn: parsed.data.descriptionEn || null,
      priceCents: parsed.data.priceCents,
      allergens: parsed.data.allergens,
      isAvailable: parsed.data.isAvailable,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, itemId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
  redirect(`/dashboard/menu/${owned.menuId}`);
}

export async function deleteItemAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  await db.delete(menuItems).where(eq(menuItems.id, itemId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
}

export async function toggleItemAvailableAction(
  formData: FormData,
): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const isAvailable = formData.get("isAvailable") === "true";
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  await db
    .update(menuItems)
    .set({ isAvailable: !isAvailable, updatedAt: new Date() })
    .where(eq(menuItems.id, itemId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
}
