import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemImageUploader } from "./image-uploader";
import { OptionsSection } from "./options-section";
import { ItemForm } from "../item-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/client";
import {
  menuCategories,
  menuItemOptionChoices,
  menuItemOptions,
  menuItems,
  menus,
} from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ menuId: string; itemId: string }>;
}) {
  const { menuId, itemId } = await params;
  const ctx = await requireRestaurant();
  const bilingual = ctx.restaurant.languages.includes("en");

  const found = await db
    .select({ item: menuItems, category: menuCategories })
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(
      and(
        eq(menuItems.id, itemId),
        eq(menuCategories.menuId, menuId),
        eq(menus.restaurantId, ctx.restaurant.id),
      ),
    )
    .limit(1);

  if (found.length === 0) notFound();
  const { item, category } = found[0]!;

  const options = await db
    .select()
    .from(menuItemOptions)
    .where(eq(menuItemOptions.itemId, item.id))
    .orderBy(asc(menuItemOptions.sortOrder), asc(menuItemOptions.id));

  const choicesByOption = new Map<string, (typeof menuItemOptionChoices.$inferSelect)[]>();
  if (options.length > 0) {
    const allChoices = await db
      .select({ choice: menuItemOptionChoices })
      .from(menuItemOptionChoices)
      .innerJoin(menuItemOptions, eq(menuItemOptionChoices.optionId, menuItemOptions.id))
      .where(eq(menuItemOptions.itemId, item.id))
      .orderBy(asc(menuItemOptionChoices.sortOrder), asc(menuItemOptionChoices.id));

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

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/menu/${menuId}`}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Retour au menu
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{item.nameFr}</h1>
        <p className="text-muted-foreground mt-1">Catégorie : {category.nameFr}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemImageUploader itemId={item.id} currentUrl={item.imageUrl} />
        </CardContent>
      </Card>

      <ItemForm mode="edit" bilingual={bilingual} item={item} itemId={itemId} />

      <OptionsSection itemId={item.id} options={optionsWithChoices} bilingual={bilingual} />
    </div>
  );
}
