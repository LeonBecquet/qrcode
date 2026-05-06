import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemForm } from "../item-form";
import { db } from "@/lib/db/client";
import { menuCategories, menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export default async function NewItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ menuId: string }>;
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { menuId } = await params;
  const { categoryId } = await searchParams;
  if (!categoryId) notFound();

  const ctx = await requireRestaurant();
  const bilingual = ctx.restaurant.languages.includes("en");

  const found = await db
    .select({ category: menuCategories })
    .from(menuCategories)
    .innerJoin(menus, eq(menuCategories.menuId, menus.id))
    .where(
      and(
        eq(menuCategories.id, categoryId),
        eq(menuCategories.menuId, menuId),
        eq(menus.restaurantId, ctx.restaurant.id),
      ),
    )
    .limit(1);

  if (found.length === 0) notFound();
  const category = found[0]!.category;

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/menu/${menuId}`}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Retour au menu
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Nouveau plat</h1>
        <p className="text-muted-foreground mt-1">Catégorie : {category.nameFr}</p>
      </div>
      <ItemForm mode="create" bilingual={bilingual} categoryId={categoryId} />
    </div>
  );
}
