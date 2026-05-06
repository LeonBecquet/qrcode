"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { restaurants } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export type DesignResult = { error: string } | { success: true };

const designSchema = z.object({
  primary: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur principale invalide.")
    .optional()
    .or(z.literal("")),
  accent: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur d'accent invalide.")
    .optional()
    .or(z.literal("")),
  font: z.enum(["modern", "elegant", "rustic", "playful"]).optional(),
  preset: z
    .enum(["elegant", "bistrot", "moderne", "trattoria", "minimal", "vibrant", "custom"])
    .optional(),
});

export async function updateMenuDesignAction(formData: FormData): Promise<DesignResult> {
  const ctx = await requireRestaurant();

  const parsed = designSchema.safeParse({
    primary: formData.get("primary") ?? "",
    accent: formData.get("accent") ?? "",
    font: formData.get("font") || undefined,
    preset: formData.get("preset") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Design invalide." };
  }

  const nextTheme = { ...(ctx.restaurant.theme ?? {}) };
  if (parsed.data.primary) nextTheme.primary = parsed.data.primary;
  else if (parsed.data.primary === "") delete nextTheme.primary;

  if (parsed.data.accent) nextTheme.accent = parsed.data.accent;
  else if (parsed.data.accent === "") delete nextTheme.accent;

  if (parsed.data.font) nextTheme.font = parsed.data.font;
  if (parsed.data.preset) nextTheme.preset = parsed.data.preset;

  await db
    .update(restaurants)
    .set({ theme: nextTheme, updatedAt: new Date() })
    .where(eq(restaurants.id, ctx.restaurant.id));

  revalidatePath("/dashboard/menu", "layout");
  revalidatePath("/dashboard/settings/branding");
  return { success: true };
}
