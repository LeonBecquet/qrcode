import { and, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCategoryForm } from "./add-category-form";
import { CategoryHeader } from "./category-actions";
import { ItemRowActions } from "./item-row-actions";
import { MenuHeader } from "./menu-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { menuCategories, menuItems, menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default async function MenuEditPage({ params }: { params: Promise<{ menuId: string }> }) {
  const { menuId } = await params;
  const ctx = await requireRestaurant();
  const bilingual = ctx.restaurant.languages.includes("en");

  const [menu] = await db
    .select()
    .from(menus)
    .where(and(eq(menus.id, menuId), eq(menus.restaurantId, ctx.restaurant.id)))
    .limit(1);

  if (!menu) notFound();

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.menuId, menu.id))
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.createdAt));

  const allItems = categories.length
    ? await db
        .select()
        .from(menuItems)
        .where(
          and(
            ...(categories.length === 1
              ? [eq(menuItems.categoryId, categories[0]!.id)]
              : []),
          ),
        )
        .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt))
    : [];

  // Si plusieurs catégories, charger tous les items concernés
  const itemsByCategory = new Map<string, typeof allItems>();
  if (categories.length > 1) {
    const all = await db
      .select()
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(eq(menuCategories.menuId, menu.id))
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt));
    for (const row of all) {
      const list = itemsByCategory.get(row.menu_items.categoryId) ?? [];
      list.push(row.menu_items);
      itemsByCategory.set(row.menu_items.categoryId, list);
    }
  } else if (categories.length === 1) {
    itemsByCategory.set(categories[0]!.id, allItems);
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/menu"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Retour aux menus
      </Link>

      <MenuHeader menu={menu} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter une catégorie</CardTitle>
          <CardDescription>Entrées, Plats, Desserts, Boissons...</CardDescription>
        </CardHeader>
        <CardContent>
          <AddCategoryForm menuId={menu.id} bilingual={bilingual} />
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          Aucune catégorie pour le moment.
        </p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const items = itemsByCategory.get(category.id) ?? [];
            return (
              <section key={category.id} className="space-y-3">
                <CategoryHeader category={category} bilingual={bilingual} />

                {items.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    Aucun plat dans cette catégorie.
                  </p>
                ) : (
                  <ul className="divide-y rounded-md border">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/dashboard/menu/${menu.id}/items/${item.id}`}
                              className="font-medium hover:underline"
                            >
                              {item.nameFr}
                            </Link>
                            {!item.isAvailable ? (
                              <span className="text-destructive bg-destructive/10 rounded px-1.5 py-0.5 text-xs">
                                Rupture
                              </span>
                            ) : null}
                            {item.allergens.length > 0 ? (
                              <span className="text-muted-foreground text-xs">
                                {item.allergens.length} allergène{item.allergens.length > 1 ? "s" : ""}
                              </span>
                            ) : null}
                          </div>
                          {item.descriptionFr ? (
                            <p className="text-muted-foreground line-clamp-1 text-sm">
                              {item.descriptionFr}
                            </p>
                          ) : null}
                        </div>
                        <span className="font-mono text-sm">
                          {priceFormatter.format(item.priceCents / 100)}
                        </span>
                        <ItemRowActions
                          itemId={item.id}
                          itemName={item.nameFr}
                          isAvailable={item.isAvailable}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/dashboard/menu/${menu.id}/items/new?categoryId=${category.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  + Ajouter un plat
                </Link>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
