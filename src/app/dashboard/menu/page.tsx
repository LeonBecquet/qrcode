import { asc, count, eq } from "drizzle-orm";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
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

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

export default async function MenusPage() {
  const ctx = await requireRestaurant();
  const list = await db
    .select()
    .from(menus)
    .where(eq(menus.restaurantId, ctx.restaurant.id))
    .orderBy(menus.sortOrder, menus.createdAt);

  // Pour chaque menu : count items + 3 premiers items en preview
  const menuStats = await Promise.all(
    list.map(async (menu) => {
      const [{ c: total } = { c: 0 }] = await db
        .select({ c: count() })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuCategories.menuId, menu.id));

      const previews = await db
        .select({
          id: menuItems.id,
          nameFr: menuItems.nameFr,
          priceCents: menuItems.priceCents,
          imageUrl: menuItems.imageUrl,
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuCategories.menuId, menu.id))
        .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder))
        .limit(3);

      return { menuId: menu.id, total, previews };
    }),
  );
  const statsByMenu = new Map(menuStats.map((s) => [s.menuId, s]));

  return (
    <div className="space-y-6">
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
            <div className="text-muted-foreground mt-4 flex items-center justify-center gap-1.5 text-xs">
              <Sparkles className="size-3.5 text-[var(--brand-orange)]" />
              Astuce : commencez par « Carte » et ajoutez les variantes plus tard.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((menu) => {
              const stats = statsByMenu.get(menu.id);
              return (
                <Link key={menu.id} href={`/dashboard/menu/${menu.id}`} className="group block">
                  <Card className="group-hover:border-[var(--brand-orange)]/50 group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] flex size-10 shrink-0 items-center justify-center rounded-lg">
                            <UtensilsCrossed className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-base truncate">{menu.name}</CardTitle>
                            <p className="text-muted-foreground text-xs">
                              Modifié le {dateFmt.format(menu.updatedAt)}
                            </p>
                          </div>
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
                    <CardContent className="flex flex-1 flex-col gap-3">
                      {stats && stats.previews.length > 0 ? (
                        <ul className="space-y-1.5">
                          {stats.previews.map((item) => (
                            <li
                              key={item.id}
                              className="bg-muted/30 group-hover:bg-muted/50 flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors"
                            >
                              {item.imageUrl ? (
                                <div className="relative size-8 shrink-0 overflow-hidden rounded">
                                  <Image
                                    src={item.imageUrl}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="bg-[var(--brand-saffron)]/40 size-8 shrink-0 rounded" />
                              )}
                              <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                {item.nameFr}
                              </span>
                              <span className="text-muted-foreground font-mono text-xs">
                                {eurFormatter.format(item.priceCents / 100)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="bg-gradient-to-br from-[var(--brand-saffron)]/15 to-[var(--brand-orange)]/10 border-[var(--brand-orange)]/20 rounded-lg border-2 border-dashed p-4 text-center">
                          <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] mx-auto mb-2 flex size-10 items-center justify-center rounded-full">
                            <UtensilsCrossed className="size-5" />
                          </div>
                          <p className="text-foreground text-xs font-medium">
                            Carte vide
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-[10px]">
                            Ajoutez vos premières catégories et plats
                          </p>
                        </div>
                      )}
                      <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-3 text-xs">
                        <span>
                          {stats?.total ?? 0} plat{(stats?.total ?? 0) > 1 ? "s" : ""}
                          {stats && stats.total > stats.previews.length
                            ? ` · +${stats.total - stats.previews.length} de plus`
                            : ""}
                        </span>
                        <span className="inline-flex items-center gap-1 font-medium transition-all group-hover:translate-x-1 group-hover:text-[var(--brand-orange)]">
                          Modifier <ChevronRight className="size-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">
                  <ArrowRight className="size-5" />
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
