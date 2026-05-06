import Link from "next/link";
import { DailyChart } from "./daily-chart";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getDailySeries,
  getRestaurantKpis,
  getTopItems,
} from "@/lib/server/analytics";
import { requireRestaurant } from "@/lib/server/session";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const ctx = await requireRestaurant();

  const [kpis, topItems, dailySeries] = await Promise.all([
    getRestaurantKpis(ctx.restaurant.id),
    getTopItems(ctx.restaurant.id, 30, 10),
    getDailySeries(ctx.restaurant.id, 30),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground mt-1">
            Basé sur les commandes servies. Les annulations et brouillons ne sont pas comptés.
          </p>
        </div>
        <Link href="/api/analytics/export" className={buttonVariants({ variant: "outline" })}>
          Exporter en CSV
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Aujourd&apos;hui" stats={kpis.today} />
        <KpiCard title="7 derniers jours" stats={kpis.week} />
        <KpiCard title="30 derniers jours" stats={kpis.month} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chiffre d&apos;affaires — 30 derniers jours</CardTitle>
          <CardDescription>
            Total servi : {formatter.format(kpis.month.revenueCents / 100)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyChart series={dailySeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top plats — 30 derniers jours</CardTitle>
          <CardDescription>Classés par quantité vendue.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {topItems.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Pas encore de commandes servies.
            </p>
          ) : (
            <ul className="divide-y">
              {topItems.map((item, idx) => (
                <li
                  key={`${item.name}-${idx}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground w-5 text-right tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  <span className="text-muted-foreground w-12 text-right tabular-nums">
                    {item.totalQty}×
                  </span>
                  <span className="font-mono w-20 text-right">
                    {formatter.format(item.totalRevenueCents / 100)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  stats,
}: {
  title: string;
  stats: { ordersCount: number; revenueCents: number; avgTicketCents: number };
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold">{stats.ordersCount}</div>
        <p className="text-muted-foreground text-xs">
          commande{stats.ordersCount > 1 ? "s" : ""} servie{stats.ordersCount > 1 ? "s" : ""}
        </p>
        <div className="border-t pt-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">CA</span>
            <span className="font-mono font-medium">
              {formatter.format(stats.revenueCents / 100)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ticket moyen</span>
            <span className="font-mono">{formatter.format(stats.avgTicketCents / 100)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
