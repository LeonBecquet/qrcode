import { asc, count, eq } from "drizzle-orm";
import { ArrowRight, BookOpen, Sparkles, UtensilsCrossed } from "lucide-react";
import { CreateMenuForm } from "./create-menu-form";
import { MenuShowcase } from "./menu-showcase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { menuCategories, menuItems, menus, tables } from "@/lib/db/schema";
import { buildTableUrl } from "@/lib/qr";
import { requireRestaurant } from "@/lib/server/session";

export default async function MenusPage() {
  const ctx = await requireRestaurant();

  const list = await db
    .select()
    .from(menus)
    .where(eq(menus.restaurantId, ctx.restaurant.id))
    .orderBy(menus.sortOrder, menus.createdAt);

  // Première table active : sert à construire l'URL d'aperçu client.
  const [firstTable] = await db
    .select({ token: tables.token })
    .from(tables)
    .where(eq(tables.restaurantId, ctx.restaurant.id))
    .orderBy(asc(tables.sortOrder), asc(tables.createdAt))
    .limit(1);

  const publicUrl = firstTable
    ? buildTableUrl(ctx.restaurant.slug, firstTable.token)
    : null;

  // Pour chaque menu : count catégories + items + 4 premiers items en preview
  const menuStats = await Promise.all(
    list.map(async (menu) => {
      const [{ c: catCount } = { c: 0 }] = await db
        .select({ c: count() })
        .from(menuCategories)
        .where(eq(menuCategories.menuId, menu.id));

      const [{ c: itemCount } = { c: 0 }] = await db
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
        .limit(4);

      return { menuId: menu.id, catCount, itemCount, previews };
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
          <div className="space-y-5">
            {list.map((menu) => {
              const stats = statsByMenu.get(menu.id);
              return (
                <MenuShowcase
                  key={menu.id}
                  menu={menu}
                  totalCategories={stats?.catCount ?? 0}
                  totalItems={stats?.itemCount ?? 0}
                  previews={stats?.previews ?? []}
                  restaurant={ctx.restaurant}
                  publicUrl={publicUrl}
                />
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
