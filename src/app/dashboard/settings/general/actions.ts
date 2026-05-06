"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { restaurants } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const generalSchema = z.object({
  name: z.string().trim().min(2, "Au moins 2 caractères.").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  email: z.email("Email invalide").optional().or(z.literal("")),
  enableEnglish: z.boolean(),
});

export type GeneralResult = { error: string } | { success: true };

export async function updateGeneralAction(formData: FormData): Promise<GeneralResult> {
  const ctx = await requireRestaurant();

  const parsed = generalSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    city: formData.get("city") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    enableEnglish: formData.get("enableEnglish") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  const data = parsed.data;
  const languages = data.enableEnglish ? ["fr", "en"] : ["fr"];

  await db
    .update(restaurants)
    .set({
      name: data.name,
      description: data.description || null,
      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      phone: data.phone || null,
      email: data.email || null,
      languages,
      updatedAt: new Date(),
    })
    .where(eq(restaurants.id, ctx.restaurant.id));

  revalidatePath("/dashboard/settings/general");
  revalidatePath("/dashboard");

  return { success: true };
}
