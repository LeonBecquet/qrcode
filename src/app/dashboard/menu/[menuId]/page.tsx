import { and, asc, eq } from "drizzle-orm";
import { ChevronLeft, FolderPlus, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCategoryForm } from "./add-category-form";
import { CategoryHeader } from "./category-actions";
import { ItemRowActions } from "./item-row-actions";
import { MenuHeader } from "./menu-header";
import { PhonePreview } from "./phone-preview";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { menuCategories, menuItems, menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const ALLERGEN_EMOJI: Record<string, string> = {
  gluten: "🌾",
  crustaces: "🦐",
  oeufs: "🥚",
  poisson: "🐟",
  arachide: "🥜",
  soja: "🫘",
  lait: "🥛",
  "fruits-coque": "🌰",
  celeri: "🌿",
  moutarde: "🟡",
  sesame: "🫛",
  sulfites: "🍷",
  lupin: "🌱",
  mollusques: "🦪",
};

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

  const itemsByCategory = new Map<string, (typeof menuItems.$inferSelect)[]>();
  if (categories.length > 0) {
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
  }

  // Pour le phone preview
  const previewCategories = categories.map((cat) => ({
    ...cat,
    items: itemsByCategory.get(cat.id) ?? [],
  }));

  const totalItems = previewCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* === Éditeur (gauche) === */}
      <div className="space-y-6 min-w-0">
        <Link
          href="/dashboard/menu"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Tous les menus
        </Link>

        <MenuHeader menu={menu} />

        {/* Stats du menu */}
        <div className="grid gap-3 sm:grid-cols-3">
          <StatChip
            icon={<FolderPlus className="size-4" />}
            label="Catégories"
            value={String(categories.length)}
            color="forest"
          />
          <StatChip
            icon={<UtensilsCrossed className="size-4" />}
            label="Plats"
            value={String(totalItems)}
            color="orange"
          />
          <StatChip
            icon={<Sparkles className="size-4" />}
            label="Statut"
            value={menu.isPublished ? "Publié" : "Brouillon"}
            color="saffron"
          />
        </div>

        {/* Add category */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex size-10 items-center justify-center rounded-lg">
                <FolderPlus className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base">Ajouter une catégorie</CardTitle>
                <CardDescription>Entrées, Plats, Desserts, Boissons...</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AddCategoryForm menuId={menu.id} bilingual={bilingual} />
          </CardContent>
        </Card>

        {categories.length === 0 ? (
          <Card className="relative overflow-hidden border-dashed">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
            />
            <CardContent className="relative flex flex-col items-center gap-3 py-16 text-center">
              <div className="bg-[var(--brand-saffron)]/30 text-[var(--brand-orange)] flex size-16 items-center justify-center rounded-2xl">
                <UtensilsCrossed className="size-8" />
              </div>
              <div>
                <p className="font-semibold">Commencez par une catégorie</p>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  Une catégorie regroupe vos plats (ex : Entrées, Plats, Desserts).
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const items = itemsByCategory.get(category.id) ?? [];
              return (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center justify-between gap-3">
                      <CategoryHeader category={category} bilingual={bilingual} />
                      <span className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
                        {items.length} plat{items.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardHeader>

                  {items.length === 0 ? (
                    <CardContent className="text-muted-foreground py-8 text-center text-sm">
                      Aucun plat dans cette catégorie
                    </CardContent>
                  ) : (
                    <ul className="divide-y">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="hover:bg-muted/30 group/item relative flex items-stretch gap-3 px-4 py-3 transition-colors"
                        >
                          {/* Photo */}
                          {item.imageUrl ? (
                            <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={item.imageUrl}
                                alt={item.nameFr}
                                fill
                                className="object-cover transition-transform group-hover/item:scale-105"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="bg-[var(--brand-saffron)]/30 text-[var(--brand-orange)] flex size-16 shrink-0 items-center justify-center rounded-lg">
                              <UtensilsCrossed className="size-6 opacity-50" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <Link
                              href={`/dashboard/menu/${menu.id}/items/${item.id}`}
                              className="block font-medium hover:text-[var(--brand-orange)]"
                            >
                              {item.nameFr}
                              {!item.isAvailable ? (
                                <span className="bg-destructive/10 text-destructive ml-2 rounded px-1.5 py-0.5 text-xs">
                                  Rupture
                                </span>
                              ) : null}
                            </Link>
                            {item.descriptionFr ? (
                              <p className="text-muted-foreground line-clamp-1 text-xs">
                                {item.descriptionFr}
                              </p>
                            ) : null}
                            {item.allergens.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1">
                                {item.allergens.slice(0, 6).map((a) => (
                                  <span
                                    key={a}
                                    title={a}
                                    className="bg-[var(--brand-saffron)]/20 inline-flex size-5 items-center justify-center rounded text-[10px]"
                                  >
                                    {ALLERGEN_EMOJI[a] ?? "⚠️"}
                                  </span>
                                ))}
                                {item.allergens.length > 6 ? (
                                  <span className="text-muted-foreground text-[10px]">
                                    +{item.allergens.length - 6}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="font-mono text-base font-bold">
                              {priceFormatter.format(item.priceCents / 100)}
                            </span>
                            <ItemRowActions
                              itemId={item.id}
                              itemName={item.nameFr}
                              isAvailable={item.isAvailable}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-t bg-muted/20 p-3">
                    <Link
                      href={`/dashboard/menu/${menu.id}/items/new?categoryId=${category.id}`}
                      className={`${buttonVariants({ variant: "outline", size: "sm" })} w-full sm:w-auto`}
                    >
                      <Plus className="mr-1 size-4" />
                      Ajouter un plat dans {category.nameFr}
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* === Phone preview (droite, sticky) === */}
      <aside className="hidden lg:block">
        <PhonePreview
          restaurant={ctx.restaurant}
          menuName={menu.name}
          categories={previewCategories}
        />
      </aside>
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "forest" | "orange" | "saffron";
}) {
  const styles = {
    forest: "bg-[var(--brand-forest)]/10 text-[var(--brand-forest)]",
    orange: "bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]",
    saffron: "bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)]",
  }[color];

  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border p-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${styles}`}>
        {icon}
      </span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
