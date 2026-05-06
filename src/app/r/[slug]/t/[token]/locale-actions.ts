"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setPublicLocaleAction(locale: "fr" | "en") {
  const cookieStore = await cookies();
  cookieStore.set("qr_locale", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/r", "layout");
}
