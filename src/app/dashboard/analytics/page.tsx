import {
  BarChart3,
  Calendar,
  Crown,
  Download,
  Receipt,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { DailyChart } from "./daily-chart";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
const formatter0 = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const ctx = await requireRestaurant();

  const [kpis, topItems, dailySeries] = await Promise.all([
    getRestaurantKpis(ctx.restaurant.id),
    getTopItems(ctx.restaurant.id, 30, 10),
    getDailySeries(ctx.restaurant.id, 30),
  ]);

  const maxQty = Math.max(1, ...topItems.map((i) => i.totalQty));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--brand-tomato)]/15 text-[var(--brand-tomato)] flex size-12 items-center justify-center rounded-xl">
            <BarChart3 className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Statistiques</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Basé sur les commandes servies. Les annulations et brouillons ne sont pas comptés.
            </p>
          </div>
        </div>
        <Link
          href="/api/analytics/export"
          className="bg-card border-input hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          <Download className="size-4" />
          Exporter en CSV
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          title="Aujourd'hui"
          icon={<Calendar className="size-4" />}
          color="var(--brand-forest)"
          bg="rgba(61,92,68,0.08)"
          stats={kpis.today}
          live
        />
        <KpiCard
          title="7 derniers jours"
          icon={<TrendingUp className="size-4" />}
          color="var(--brand-orange)"
          bg="rgba(238,128,51,0.10)"
          stats={kpis.week}
        />
        <KpiCard
          title="30 derniers jours"
          icon={<BarChart3 className="size-4" />}
          color="var(--brand-saffron)"
          bg="rgba(217,160,38,0.12)"
          stats={kpis.month}
        />
      </div>

      {/* Chart hero */}
      <div className="bg-card relative overflow-hidden rounded-3xl border shadow-sm">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-[var(--brand-orange)]/10 blur-3xl"
        />
        <div className="relative p-6 lg:p-7">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Chiffre d&apos;affaires
              </p>
              <h2 className="text-xl font-semibold">30 derniers jours</h2>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatter.format(kpis.month.revenueCents / 100)}
            </p>
          </div>
          <DailyChart series={dailySeries} />
        </div>
      </div>

      {/* Top items */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)] flex size-10 items-center justify-center rounded-lg">
              <Crown className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Top plats — 30 derniers jours</CardTitle>
              <CardDescription>Classés par quantité vendue.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {topItems.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Receipt}
                title="Pas encore de commandes servies"
                description="Les plats les plus commandés apparaîtront ici."
                tone="orange"
                size="md"
              />
            </div>
          ) : (
            <ul className="divide-y">
              {topItems.map((item, idx) => {
                const widthPct = (item.totalQty / maxQty) * 100;
                const isPodium = idx < 3;
                const podiumColors = [
                  "var(--brand-saffron)",
                  "#C0C0C0",
                  "#CD7F32",
                ];
                return (
                  <li
                    key={`${item.name}-${idx}`}
                    className="hover:bg-muted/30 group relative flex items-center gap-3 px-4 py-3 transition-colors"
                  >
                    {/* Rank badge */}
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                        isPodium ? "text-white shadow-md" : "bg-muted text-muted-foreground"
                      }`}
                      style={
                        isPodium
                          ? { background: podiumColors[idx] }
                          : undefined
                      }
                    >
                      {isPodium ? <Crown className="size-3.5" /> : idx + 1}
                    </span>

                    {/* Name + bar */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <div className="bg-muted/40 mt-1 h-1 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${widthPct}%`,
                            background: isPodium
                              ? podiumColors[idx]
                              : "var(--brand-forest)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Qty + revenue */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {item.totalQty}×
                      </p>
                      <p className="text-muted-foreground text-xs tabular-nums">
                        {formatter0.format(item.totalRevenueCents / 100)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  icon,
  color,
  bg,
  stats,
  live,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  stats: { ordersCount: number; revenueCents: number; avgTicketCents: number };
  live?: boolean;
}) {
  return (
    <div
      className="bg-card group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundImage: `linear-gradient(135deg, ${bg}, transparent 70%)` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: color }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 size-24 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />

      <div className="relative">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <span style={{ color }}>{icon}</span>
          {title}
          {live && stats.ordersCount > 0 ? (
            <span className="relative ml-0.5 flex size-1.5">
              <span
                className="absolute inset-0 animate-ping rounded-full opacity-60"
                style={{ background: color }}
              />
              <span
                className="relative size-1.5 rounded-full"
                style={{ background: color }}
              />
            </span>
          ) : null}
        </p>

        <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
          {stats.ordersCount}
        </p>
        <p className="text-muted-foreground text-xs">
          commande{stats.ordersCount > 1 ? "s" : ""} servie{stats.ordersCount > 1 ? "s" : ""}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-sm">
          <div>
            <p className="text-muted-foreground text-[10px] tracking-wider uppercase">CA</p>
            <p className="font-semibold tabular-nums" style={{ color }}>
              {formatter.format(stats.revenueCents / 100)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
              Ticket moyen
            </p>
            <p className="font-semibold tabular-nums">
              {formatter.format(stats.avgTicketCents / 100)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
