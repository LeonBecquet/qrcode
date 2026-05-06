"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import {
  ALLERGENS,
  type Allergen,
  menuCategories,
  menuItemOptions,
  menuItemOptionChoices,
  menuItems,
  menus,
} from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";
import { ALLOWED_IMAGE_MIME, inferExtension, MAX_IMAGE_SIZE, uploadToR2 } from "@/lib/storage";

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

export async function uploadItemImageAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Aucun fichier." };
  if (file.size > MAX_IMAGE_SIZE) return { error: "Trop lourd (max 5 MB)." };
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return { error: "Type non supporté (JPG, PNG, WebP)." };
  }

  const ext = inferExtension(file.type);
  const key = `restaurants/${ctx.restaurant.id}/items/${itemId}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    url = await uploadToR2({ key, body: buffer, contentType: file.type });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload échoué." };
  }

  await db
    .update(menuItems)
    .set({ imageUrl: url, updatedAt: new Date() })
    .where(eq(menuItems.id, itemId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${itemId}`);
}

export async function removeItemImageAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  await db
    .update(menuItems)
    .set({ imageUrl: null, updatedAt: new Date() })
    .where(eq(menuItems.id, itemId));

  revalidatePath(`/dashboard/menu/${owned.menuId}`);
  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${itemId}`);
}

// =====================================================
// Options + Choices
// =====================================================

const optionSchema = z.object({
  nameFr: z.string().trim().min(1, "Nom FR requis.").max(80),
  nameEn: z.string().trim().max(80).optional().or(z.literal("")),
  type: z.enum(["single", "multiple"]),
  isRequired: z.boolean(),
});

export async function createOptionAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const itemId = String(formData.get("itemId") ?? "");
  const owned = await ensureItemOwnership(itemId, ctx.restaurant.id);

  const parsed = optionSchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn") ?? "",
    type: formData.get("type") ?? "single",
    isRequired: formData.get("isRequired") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  const existing = await db
    .select({ id: menuItemOptions.id })
    .from(menuItemOptions)
    .where(eq(menuItemOptions.itemId, itemId));

  await db.insert(menuItemOptions).values({
    itemId,
    nameFr: parsed.data.nameFr,
    nameEn: parsed.data.nameEn || null,
    type: parsed.data.type,
    isRequired: parsed.data.isRequired,
    sortOrder: existing.length,
  });

  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${itemId}`);
}

export async function deleteOptionAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const optionId = String(formData.get("optionId") ?? "");

  const found = await db
    .select({
      itemId: menuItemOptions.itemId,
      categoryId: menuItems.categoryId,
      menuId: menuCategories.menuId,
    })
    .from(menuItemOptions)
    .innerJoin(menuItems, eq(menuItemOptions.itemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(and(eq(menuItemOptions.id, optionId), eq(menus.restaurantId, ctx.restaurant.id)))
    .limit(1);
  if (found.length === 0) return { error: "Option introuvable." };
  const owned = found[0]!;

  await db.delete(menuItemOptions).where(eq(menuItemOptions.id, optionId));

  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${owned.itemId}`);
}

const choiceSchema = z.object({
  nameFr: z.string().trim().min(1, "Nom FR requis.").max(80),
  nameEn: z.string().trim().max(80).optional().or(z.literal("")),
  priceDeltaCents: z.number().int().min(-100_000).max(100_000),
  isDefault: z.boolean(),
});

async function ensureOptionOwnership(optionId: string, restaurantId: string) {
  const found = await db
    .select({
      itemId: menuItemOptions.itemId,
      categoryId: menuItems.categoryId,
      menuId: menuCategories.menuId,
    })
    .from(menuItemOptions)
    .innerJoin(menuItems, eq(menuItemOptions.itemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(and(eq(menuItemOptions.id, optionId), eq(menus.restaurantId, restaurantId)))
    .limit(1);
  if (found.length === 0) throw new Error("Option introuvable.");
  return found[0]!;
}

export async function createChoiceAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const optionId = String(formData.get("optionId") ?? "");
  const owned = await ensureOptionOwnership(optionId, ctx.restaurant.id);

  const priceRaw = String(formData.get("priceDeltaEur") ?? "0").replace(",", ".");
  const priceFloat = Number.parseFloat(priceRaw);
  const priceDeltaCents = Number.isFinite(priceFloat) ? Math.round(priceFloat * 100) : 0;

  const parsed = choiceSchema.safeParse({
    nameFr: formData.get("nameFr"),
    nameEn: formData.get("nameEn") ?? "",
    priceDeltaCents,
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };

  const existing = await db
    .select({ id: menuItemOptionChoices.id })
    .from(menuItemOptionChoices)
    .where(eq(menuItemOptionChoices.optionId, optionId))
    .orderBy(asc(menuItemOptionChoices.sortOrder));

  await db.insert(menuItemOptionChoices).values({
    optionId,
    nameFr: parsed.data.nameFr,
    nameEn: parsed.data.nameEn || null,
    priceDeltaCents: parsed.data.priceDeltaCents,
    isDefault: parsed.data.isDefault,
    sortOrder: existing.length,
  });

  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${owned.itemId}`);
}

export async function deleteChoiceAction(formData: FormData): Promise<ActionResult | void> {
  const ctx = await requireRestaurant();
  const choiceId = String(formData.get("choiceId") ?? "");

  const found = await db
    .select({
      optionId: menuItemOptionChoices.optionId,
      itemId: menuItemOptions.itemId,
      menuId: menuCategories.menuId,
    })
    .from(menuItemOptionChoices)
    .innerJoin(menuItemOptions, eq(menuItemOptionChoices.optionId, menuItemOptions.id))
    .innerJoin(menuItems, eq(menuItemOptions.itemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(and(eq(menuItemOptionChoices.id, choiceId), eq(menus.restaurantId, ctx.restaurant.id)))
    .limit(1);
  if (found.length === 0) return { error: "Choix introuvable." };
  const owned = found[0]!;

  await db.delete(menuItemOptionChoices).where(eq(menuItemOptionChoices.id, choiceId));

  revalidatePath(`/dashboard/menu/${owned.menuId}/items/${owned.itemId}`);
}
