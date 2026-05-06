import { cookies } from "next/headers";

export type PublicLocale = "fr" | "en";

const COOKIE_NAME = "qr_locale";

export async function getPublicLocale(availableLanguages: string[]): Promise<PublicLocale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_NAME)?.value;
  if (stored === "en" && availableLanguages.includes("en")) return "en";
  return "fr";
}

export function pickLocalizedText<
  T extends { nameFr: string; nameEn: string | null },
>(item: T, locale: PublicLocale): string {
  if (locale === "en" && item.nameEn) return item.nameEn;
  return item.nameFr;
}

export function pickLocalizedDescription<
  T extends { descriptionFr: string | null; descriptionEn: string | null },
>(item: T, locale: PublicLocale): string | null {
  if (locale === "en" && item.descriptionEn) return item.descriptionEn;
  return item.descriptionFr;
}
