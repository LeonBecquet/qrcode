import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemForm } from "../item-form";
import { db } from "@/lib/db/client";
import { menuCategories, menuItems, menus } from "@/lib/db/schema";
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
      <ItemForm mode="edit" bilingual={bilingual} item={item} itemId={itemId} />
    </div>
  );
}
