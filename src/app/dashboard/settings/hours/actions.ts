"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { restaurantHours } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export type HoursResult = { error: string } | { success: true };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalizeTime(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!TIME_RE.test(trimmed)) return null;
  return `${trimmed}:00`;
}

export async function updateHoursAction(formData: FormData): Promise<HoursResult> {
  const ctx = await requireRestaurant();
  const now = new Date();

  const rows: (typeof restaurantHours.$inferInsert)[] = [];
  for (let day = 0; day < 7; day++) {
    const isClosed = formData.get(`day_${day}_closed`) === "on";
    const openTime = normalizeTime(formData.get(`day_${day}_open`));
    const closeTime = normalizeTime(formData.get(`day_${day}_close`));

    if (!isClosed && (!openTime || !closeTime)) {
      return { error: `Horaires invalides pour le jour ${day}.` };
    }
    if (!isClosed && openTime && closeTime && openTime >= closeTime) {
      return { error: `L'heure de fermeture doit être après l'ouverture.` };
    }

    rows.push({
      restaurantId: ctx.restaurant.id,
      dayOfWeek: day,
      isClosed,
      openTime: isClosed ? null : openTime,
      closeTime: isClosed ? null : closeTime,
      updatedAt: now,
    });
  }

  await db.transaction(async (tx) => {
    for (const row of rows) {
      await tx
        .insert(restaurantHours)
        .values(row)
        .onConflictDoUpdate({
          target: [restaurantHours.restaurantId, restaurantHours.dayOfWeek],
          set: {
            isClosed: row.isClosed,
            openTime: row.openTime,
            closeTime: row.closeTime,
            updatedAt: row.updatedAt,
          },
        });
    }
  });

  revalidatePath("/dashboard/settings/hours");
  return { success: true };
}
