import { and, asc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "./add-to-cart";
import { db } from "@/lib/db/client";
import {
  type Allergen,
  menuCategories,
  menuItemOptionChoices,
  menuItemOptions,
  menuItems,
  menus,
} from "@/lib/db/schema";
import {
  getPublicLocale,
  pickLocalizedDescription,
  pickLocalizedText,
} from "@/lib/server/locale";
import { resolvePublicTable } from "@/lib/server/public-resolver";

const ALLERGEN_LABELS: Record<"fr" | "en", Record<Allergen, string>> = {
  fr: {
    gluten: "Gluten",
    crustaces: "Crustacés",
    oeufs: "Œufs",
    poisson: "Poisson",
    arachide: "Arachide",
    soja: "Soja",
    lait: "Lait",
    "fruits-coque": "Fruits à coque",
    celeri: "Céleri",
    moutarde: "Moutarde",
    sesame: "Sésame",
    sulfites: "Sulfites",
    lupin: "Lupin",
    mollusques: "Mollusques",
  },
  en: {
    gluten: "Gluten",
    crustaces: "Crustaceans",
    oeufs: "Eggs",
    poisson: "Fish",
    arachide: "Peanuts",
    soja: "Soy",
    lait: "Dairy",
    "fruits-coque": "Tree nuts",
    celeri: "Celery",
    moutarde: "Mustard",
    sesame: "Sesame",
    sulfites: "Sulphites",
    lupin: "Lupin",
    mollusques: "Molluscs",
  },
};

export default async function PublicItemPage({
  params,
}: {
  params: Promise<{ slug: string; token: string; itemId: string }>;
}) {
  const { slug, token, itemId } = await params;
  const { restaurant } = await resolvePublicTable(slug, token);
  const locale = await getPublicLocale(restaurant.languages);

  const found = await db
    .select({ item: menuItems })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(
      and(
        eq(menuItems.id, itemId),
        eq(menus.restaurantId, restaurant.id),
        eq(menus.isPublished, true),
      ),
    )
    .limit(1);

  if (found.length === 0) notFound();
  const item = found[0]!.item;

  const options = await db
    .select()
    .from(menuItemOptions)
    .where(eq(menuItemOptions.itemId, item.id))
    .orderBy(asc(menuItemOptions.sortOrder));

  const choicesByOption = new Map<string, (typeof menuItemOptionChoices.$inferSelect)[]>();
  if (options.length > 0) {
    const allChoices = await db
      .select({ choice: menuItemOptionChoices })
      .from(menuItemOptionChoices)
      .innerJoin(menuItemOptions, eq(menuItemOptionChoices.optionId, menuItemOptions.id))
      .where(eq(menuItemOptions.itemId, item.id))
      .orderBy(asc(menuItemOptionChoices.sortOrder));

    for (const opt of options) choicesByOption.set(opt.id, []);
    for (const row of allChoices) {
      const list = choicesByOption.get(row.choice.optionId) ?? [];
      list.push(row.choice);
      choicesByOption.set(row.choice.optionId, list);
    }
  }

  const optionsWithChoices = options.map((opt) => ({
    ...opt,
    choices: choicesByOption.get(opt.id) ?? [],
  }));

  const allergenList = item.allergens.filter((a): a is Allergen => a in ALLERGEN_LABELS.fr);
  const itemName = pickLocalizedText(item, locale);
  const itemDesc = pickLocalizedDescription(item, locale);

  return (
    <article className="space-y-5 py-4">
      <Link
        href={`/r/${slug}/t/${token}`}
        className="text-muted-foreground hover:text-foreground inline-block text-sm"
      >
        ← {locale === "en" ? "Back to menu" : "Retour au menu"}
      </Link>

      {item.imageUrl ? (
        <div className="bg-muted relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image
            src={item.imageUrl}
            alt={itemName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
          />
        </div>
      ) : null}

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{itemName}</h1>
        {itemDesc ? <p className="text-muted-foreground">{itemDesc}</p> : null}
        {allergenList.length > 0 ? (
          <p className="text-muted-foreground text-xs">
            {locale === "en" ? "Allergens: " : "Allergènes : "}
            {allergenList.map((a) => ALLERGEN_LABELS[locale][a]).join(", ")}
          </p>
        ) : null}
      </header>

      <AddToCart
        slug={slug}
        token={token}
        item={item}
        options={optionsWithChoices}
        locale={locale}
      />
    </article>
  );
}
