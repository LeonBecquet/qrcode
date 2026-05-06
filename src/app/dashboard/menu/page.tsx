import { eq } from "drizzle-orm";
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
import { menus } from "@/lib/db/schema";
import { requireRestaurant } from "@/lib/server/session";

export default async function MenusPage() {
  const ctx = await requireRestaurant();
  const list = await db
    .select()
    .from(menus)
    .where(eq(menus.restaurantId, ctx.restaurant.id))
    .orderBy(menus.sortOrder, menus.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Menus</h1>
          <p className="text-muted-foreground mt-1">
            Construisez vos cartes. Catégories, plats, options et allergènes.
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Créez votre premier menu</CardTitle>
            <CardDescription>
              Une carte unique ou plusieurs (midi, soir, brunch...). Vous pourrez en ajouter
              d&apos;autres après.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateMenuForm />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((menu) => (
              <Link key={menu.id} href={`/dashboard/menu/${menu.id}`} className="group block">
                <Card className="group-hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{menu.name}</CardTitle>
                      {menu.isPublished ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          Publié
                        </span>
                      ) : (
                        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      Modifié le {new Intl.DateTimeFormat("fr-FR").format(menu.updatedAt)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ajouter un menu</CardTitle>
              <CardDescription>Pour les services distincts (midi, soir, brunch).</CardDescription>
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
