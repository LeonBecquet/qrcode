"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { restaurants } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";
import { ALLOWED_IMAGE_MIME, inferExtension, MAX_IMAGE_SIZE, uploadToR2 } from "@/lib/storage";

export type BrandingResult = { error: string } | { success: true };

const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide (ex : #FF6600)")
  .optional()
  .or(z.literal(""));

export async function updateThemeAction(formData: FormData): Promise<BrandingResult> {
  const ctx = await requireRestaurant();
  const parsed = colorSchema.safeParse(formData.get("primary"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Couleur invalide." };
  }

  const primary = parsed.data;
  const nextTheme = { ...(ctx.restaurant.theme ?? {}) };
  if (primary) {
    nextTheme.primary = primary;
  } else {
    delete nextTheme.primary;
  }

  await db
    .update(restaurants)
    .set({ theme: nextTheme, updatedAt: new Date() })
    .where(eq(restaurants.id, ctx.restaurant.id));

  revalidatePath("/dashboard/settings/branding");
  return { success: true };
}

const imageTypeSchema = z.enum(["logo", "cover"]);

export async function uploadBrandingImageAction(formData: FormData): Promise<BrandingResult> {
  const ctx = await requireRestaurant();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Fichier trop lourd (max 5 MB)." };
  }
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return { error: "Type non supporté (JPG, PNG, WebP)." };
  }

  const parsedType = imageTypeSchema.safeParse(formData.get("type"));
  if (!parsedType.success) {
    return { error: "Type d'image invalide." };
  }
  const type = parsedType.data;

  const ext = inferExtension(file.type);
  const key = `restaurants/${ctx.restaurant.id}/${type}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    url = await uploadToR2({ key, body: buffer, contentType: file.type });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload échoué." };
  }

  const update = type === "logo" ? { logoUrl: url } : { coverUrl: url };
  await db
    .update(restaurants)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(restaurants.id, ctx.restaurant.id));

  revalidatePath("/dashboard/settings/branding");
  return { success: true };
}

export async function removeBrandingImageAction(formData: FormData): Promise<BrandingResult> {
  const ctx = await requireRestaurant();
  const parsedType = imageTypeSchema.safeParse(formData.get("type"));
  if (!parsedType.success) {
    return { error: "Type invalide." };
  }
  const type = parsedType.data;

  const update = type === "logo" ? { logoUrl: null } : { coverUrl: null };
  await db
    .update(restaurants)
    .set({ ...update, updatedAt: new Date() })
    .where(eq(restaurants.id, ctx.restaurant.id));

  revalidatePath("/dashboard/settings/branding");
  return { success: true };
}
