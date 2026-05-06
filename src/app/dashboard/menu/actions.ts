"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const createMenuSchema = z.object({
  name: z.string().trim().min(2, "Au moins 2 caractères.").max(80, "Max 80 caractères."),
});

export type MenuActionResult = { error: string };

export async function createMenuAction(formData: FormData): Promise<MenuActionResult | void> {
  const ctx = await requireRestaurant();
  const parsed = createMenuSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nom invalide." };
  }

  const existing = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.restaurantId, ctx.restaurant.id));

  const inserted = await db
    .insert(menus)
    .values({
      restaurantId: ctx.restaurant.id,
      name: parsed.data.name,
      sortOrder: existing.length,
    })
    .returning({ id: menus.id });

  const created = inserted[0];
  if (!created) return { error: "Impossible de créer le menu." };

  revalidatePath("/dashboard/menu");
  redirect(`/dashboard/menu/${created.id}`);
}

export async function deleteMenuAction(formData: FormData): Promise<MenuActionResult | void> {
  const ctx = await requireRestaurant();
  const menuId = formData.get("menuId");
  if (typeof menuId !== "string") return { error: "ID manquant." };

  await db
    .delete(menus)
    .where(and(eq(menus.id, menuId), eq(menus.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/menu");
  redirect("/dashboard/menu");
}

export async function toggleMenuPublishedAction(
  formData: FormData,
): Promise<MenuActionResult | void> {
  const ctx = await requireRestaurant();
  const menuId = formData.get("menuId");
  const isPublished = formData.get("isPublished") === "true";
  if (typeof menuId !== "string") return { error: "ID manquant." };

  await db
    .update(menus)
    .set({ isPublished: !isPublished, updatedAt: new Date() })
    .where(and(eq(menus.id, menuId), eq(menus.restaurantId, ctx.restaurant.id)));

  revalidatePath("/dashboard/menu");
  revalidatePath(`/dashboard/menu/${menuId}`);
}
