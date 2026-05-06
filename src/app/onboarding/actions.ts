"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { memberships, restaurants } from "@/lib/db/schema";

const slugify = (raw: string): string =>
  raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "resto";

const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Au moins 2 caractères.").max(80, "Max 80 caractères."),
});

export type OnboardingResult = { error: string } | { success: true };

export async function createRestaurantAction(formData: FormData): Promise<OnboardingResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const parsed = onboardingSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nom invalide." };
  }

  const existingMembership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.userId, session.user.id))
    .limit(1);
  if (existingMembership.length > 0) {
    redirect("/dashboard");
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  for (let attempt = 0; attempt < 6; attempt++) {
    const exists = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.slug, slug))
      .limit(1);
    if (exists.length === 0) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  // 14 jours d'essai gratuit pour tout nouveau resto
  const TRIAL_DAYS = 14;
  const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 3600 * 1000);

  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(restaurants)
      .values({
        slug,
        name: parsed.data.name,
        subStatus: "trialing",
        currentPeriodEnd: trialEnd,
      })
      .returning({ id: restaurants.id });
    const restaurant = inserted[0];
    if (!restaurant) {
      throw new Error("Impossible de créer le restaurant.");
    }
    await tx.insert(memberships).values({
      userId: session.user.id,
      restaurantId: restaurant.id,
      role: "owner",
    });
  });

  redirect("/dashboard");
}
