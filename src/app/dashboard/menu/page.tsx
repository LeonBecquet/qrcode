import { count, eq } from "drizzle-orm";
import { ArrowRight, BookOpen, ChevronRight, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { CreateMenuForm } from "./create-menu-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { menuCategories, menuItems, menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

export default async function MenusPage() {
  const ctx = await requireRestaurant();
  const list = await db
    .select()
    .from(menus)
    .where(eq(menus.restaurantId, ctx.restaurant.id))
    .orderBy(menus.sortOrder, menus.createdAt);

  // Compte items par menu pour le badge
  const itemCounts = await Promise.all(
    list.map(async (menu) => {
      const result = await db
        .select({ c: count() })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuCategories.menuId, menu.id));
      return { menuId: menu.id, count: result[0]?.c ?? 0 };
    }),
  );
  const countsByMenu = new Map(itemCounts.map((c) => [c.menuId, c.count]));

  return (
    <div className="space-y-6">
      {/* Header avec icône + titre */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] flex size-12 items-center justify-center rounded-xl">
            <UtensilsCrossed className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Menus</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Construisez vos cartes. Catégories, plats, options et allergènes.
            </p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        // Empty state stylé
        <Card className="relative overflow-hidden border-dashed">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-[var(--brand-saffron)]/15 blur-3xl"
          />
          <CardHeader className="relative items-center text-center">
            <div className="bg-[var(--brand-saffron)]/30 text-[var(--brand-orange)] mb-2 flex size-16 items-center justify-center rounded-2xl">
              <BookOpen className="size-8" />
            </div>
            <CardTitle className="text-2xl">Créez votre premier menu</CardTitle>
            <CardDescription className="max-w-md">
              Une carte unique, ou plusieurs (midi, soir, brunch). Vous pourrez en ajouter
              d&apos;autres à tout moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative mx-auto max-w-md">
            <CreateMenuForm />
            <p className="text-muted-foreground mt-3 text-center text-xs">
              Astuce : commencez par « Carte » et ajoutez les variantes plus tard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((menu) => {
              const itemsCount = countsByMenu.get(menu.id) ?? 0;
              return (
                <Link key={menu.id} href={`/dashboard/menu/${menu.id}`} className="group block">
                  <Card className="group-hover:border-[var(--brand-orange)]/50 group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 relative overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] flex size-9 shrink-0 items-center justify-center rounded-md">
                            <UtensilsCrossed className="size-4" />
                          </div>
                          <CardTitle className="text-base truncate">{menu.name}</CardTitle>
                        </div>
                        {menu.isPublished ? (
                          <span className="bg-[var(--brand-forest)]/15 text-[var(--brand-forest)] shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                            Publié
                          </span>
                        ) : (
                          <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-xs">
                            Brouillon
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {itemsCount} plat{itemsCount > 1 ? "s" : ""} ·{" "}
                        {dateFmt.format(menu.updatedAt)}
                      </span>
                      <ChevronRight className="text-muted-foreground size-4 transition-all group-hover:translate-x-1 group-hover:text-[var(--brand-orange)]" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted text-muted-foreground flex size-9 items-center justify-center rounded-md">
                  <ArrowRight className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base">Ajouter un autre menu</CardTitle>
                  <CardDescription>
                    Pour les services distincts (midi / soir / brunch).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CreateMenuForm defaultName="Nouveau menu" />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
