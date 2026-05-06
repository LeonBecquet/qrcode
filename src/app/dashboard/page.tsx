import { and, count, desc, eq, gte } from "drizzle-orm";
import {
  Activity,
  ArrowRight,
  ChefHat,
  CircleCheck,
  Clock,
  ImageIcon,
  Printer,
  Sparkles,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/sparkline";
import { db } from "@/lib/db/client";
import {
  menus,
  menuCategories,
  menuItems,
  orders,
  serviceRequests,
  tables,
} from "@/lib/db/schema";
import { getDailySeries, getRestaurantKpis } from "@/lib/server/analytics";
import { requireRestaurant } from "@/lib/server/session";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const timeFmt = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requireRestaurant();
  const restoId = ctx.restaurant.id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    kpis,
    daily7,
    tableCount,
    itemCount,
    todayOrdersCount,
    pendingRequests,
    recentOrders,
  ] = await Promise.all([
    getRestaurantKpis(restoId),
    getDailySeries(restoId, 7),
    db.select({ c: count() }).from(tables).where(eq(tables.restaurantId, restoId)),
    db
      .select({ c: count() })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .innerJoin(menus, eq(menuCategories.menuId, menus.id))
      .where(eq(menus.restaurantId, restoId)),
    db
      .select({ c: count() })
      .from(orders)
      .where(and(eq(orders.restaurantId, restoId), gte(orders.createdAt, startOfDay))),
    db
      .select()
      .from(serviceRequests)
      .where(
        and(eq(serviceRequests.restaurantId, restoId), eq(serviceRequests.isResolved, false)),
      )
      .orderBy(desc(serviceRequests.createdAt)),
    db
      .select()
      .from(orders)
      .where(eq(orders.restaurantId, restoId))
      .orderBy(desc(orders.createdAt))
      .limit(5),
  ]);

  const hasLogo = !!ctx.restaurant.logoUrl;
  const hasItems = (itemCount[0]?.c ?? 0) > 0;
  const hasTables = (tableCount[0]?.c ?? 0) > 0;
  const todayOrders = todayOrdersCount[0]?.c ?? 0;
  const activeRequests = pendingRequests.length;

  const greeting = getGreeting();
  const sparkValues = daily7.map((d) => d.ordersCount);

  const checklist = [
    {
      title: "Configurer mon restaurant",
      description: "Logo, horaires, langues",
      done: hasLogo,
      href: "/dashboard/settings/general",
    },
    {
      title: "Construire mon menu",
      description: `${itemCount[0]?.c ?? 0} plats configurés`,
      done: hasItems,
      href: "/dashboard/menu",
    },
    {
      title: "Ajouter mes tables",
      description: `${tableCount[0]?.c ?? 0} tables · PDF imprimable`,
      done: hasTables,
      href: "/dashboard/tables",
    },
  ];
  const completedSteps = checklist.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="space-y-6">
      {/* === HERO === */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-[var(--brand-forest)] via-[oklch(0.4_0.08_140)] to-[oklch(0.3_0.06_60)] p-6 text-[var(--brand-cream)] sm:p-10">
        {/* Decorative QR pattern dans le hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 size-48 rotate-12 opacity-10"
        >
          <div className="grid h-full grid-cols-8 grid-rows-8 gap-1.5">
            {Array.from({ length: 64 }, (_, i) => {
              const seed = (i * 7919) % 100;
              const filled = seed > 45;
              return (
                <div
                  key={i}
                  className={filled ? "rounded-sm bg-[var(--brand-cream)]" : ""}
                />
              );
            })}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-1/3 size-72 -translate-y-1/2 rounded-full bg-[var(--brand-orange)]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-1/4 size-72 rounded-full bg-[var(--brand-saffron)]/20 blur-3xl"
        />

        <div className="relative grid items-center gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[var(--brand-saffron)] text-sm font-medium tracking-wide uppercase">
              {greeting}, {ctx.user.name}
            </p>
            <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              {ctx.restaurant.name}
            </h1>
            <p className="text-[var(--brand-cream)]/80 text-base">
              Voici ce qui se passe dans votre restaurant aujourd&apos;hui.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="bg-[var(--brand-cream)]/10 border-[var(--brand-cream)]/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
                <Activity className="size-3.5" />
                {todayOrders} commande{todayOrders > 1 ? "s" : ""} aujourd&apos;hui
              </span>
              <span className="bg-[var(--brand-cream)]/10 border-[var(--brand-cream)]/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="size-3.5" />
                {ctx.restaurant.subStatus === "trialing"
                  ? "Essai gratuit"
                  : ctx.restaurant.subStatus ?? "—"}
              </span>
              {activeRequests > 0 ? (
                <Link
                  href="/dashboard/kitchen"
                  className="bg-[var(--brand-tomato)] inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md transition-transform hover:scale-105"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative size-2 rounded-full bg-white" />
                  </span>
                  {activeRequests} appel{activeRequests > 1 ? "s" : ""} serveur
                </Link>
              ) : null}
            </div>
          </div>

          {/* Mini sparkline 7 jours dans le hero */}
          <div className="bg-[var(--brand-cream)]/10 border-[var(--brand-cream)]/20 rounded-2xl border p-5 backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide uppercase opacity-80">
                Activité 7 derniers jours
              </span>
              <span className="text-xs opacity-60">
                {kpis.week.ordersCount} commande{kpis.week.ordersCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {eurFormatter.format(kpis.week.revenueCents / 100)}
            </div>
            <div className="mt-3">
              <Sparkline
                values={sparkValues.length ? sparkValues : [0, 0, 0, 0, 0, 0, 0]}
                color="#F5C342"
                height={48}
                fillOpacity={0.4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* === KPIs === */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<UtensilsCrossed className="size-5" />}
          label="Aujourd'hui"
          value={String(todayOrders)}
          unit={todayOrders > 1 ? "commandes" : "commande"}
          color="forest"
          spark={[
            kpis.today.ordersCount * 0.3,
            kpis.today.ordersCount * 0.5,
            kpis.today.ordersCount * 0.7,
            todayOrders,
          ]}
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="CA · 7 jours"
          value={eurFormatter.format(kpis.week.revenueCents / 100)}
          unit={`${kpis.week.ordersCount} servies`}
          color="orange"
          spark={daily7.map((d) => d.revenueCents)}
        />
        <KpiCard
          icon={<Zap className="size-5" />}
          label="Ticket moyen · 7j"
          value={
            kpis.week.avgTicketCents > 0
              ? eurFormatter.format(kpis.week.avgTicketCents / 100)
              : "—"
          }
          unit="par commande"
          color="saffron"
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="CA · 30 jours"
          value={eurFormatter.format(kpis.month.revenueCents / 100)}
          unit={`${kpis.month.ordersCount} commandes`}
          color="tomato"
        />
      </div>

      {/* === Grid principal : Checklist + Activity feed === */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Onboarding checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CircleCheck className="size-5 text-[var(--brand-forest)]" />
                  Checklist de démarrage
                </CardTitle>
                <CardDescription>
                  {completedSteps === checklist.length
                    ? "🎉 Tout est prêt — vous pouvez commencer le service."
                    : `${completedSteps} sur ${checklist.length} complété${completedSteps > 1 ? "s" : ""}`}
                </CardDescription>
              </div>
              <span className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] rounded-full px-3 py-1 text-xs font-bold">
                {progressPct}%
              </span>
            </div>
            <div className="bg-muted relative mt-3 h-2 overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.map((step, idx) => (
              <Link
                key={step.title}
                href={step.href}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:border-[var(--brand-orange)]/40 hover:bg-[var(--brand-orange)]/5 hover:-translate-y-0.5 hover:shadow-md ${
                  step.done ? "bg-muted/30" : "bg-card"
                }`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    step.done
                      ? "bg-[var(--brand-forest)] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.done ? <CircleCheck className="size-5" /> : idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${step.done ? "text-muted-foreground line-through" : ""}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{step.description}</p>
                </div>
                <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-all group-hover:translate-x-1 group-hover:text-[var(--brand-orange)]" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand-orange)] opacity-75" />
                <span className="relative size-2 rounded-full bg-[var(--brand-orange)]" />
              </span>
              <CardTitle className="text-base">Activité récente</CardTitle>
            </div>
            <CardDescription>5 dernières commandes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Clock className="text-muted-foreground/40 mx-auto size-10" />
                <p className="text-muted-foreground mt-3 text-sm">
                  Pas encore de commandes
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={`mt-0.5 size-2 shrink-0 rounded-full ${
                        order.status === "served"
                          ? "bg-[var(--brand-forest)]"
                          : order.status === "ready"
                            ? "bg-[var(--brand-saffron)]"
                            : order.status === "in_kitchen"
                              ? "bg-[var(--brand-orange)]"
                              : order.status === "canceled"
                                ? "bg-muted-foreground"
                                : "bg-[var(--brand-tomato)]"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Table {order.tableLabelSnapshot}
                        <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                          {eurFormatter.format(order.subtotalCents / 100)}
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {timeFmt.format(order.createdAt)} · {orderStatusLabel(order.status)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <Link
            href="/dashboard/kitchen"
            className="hover:bg-muted/40 flex items-center justify-between border-t px-5 py-3 text-sm font-medium transition-colors"
          >
            <span>Voir la cuisine</span>
            <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>

      {/* === Quick actions === */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickActionTile
          href="/dashboard/kitchen"
          icon={<ChefHat className="size-6" />}
          label="Cuisine en direct"
          description={
            todayOrders > 0
              ? `${todayOrders} commande${todayOrders > 1 ? "s" : ""} aujourd'hui`
              : "Recevez les nouvelles commandes"
          }
          color="forest"
        />
        <QuickActionTile
          href="/dashboard/menu"
          icon={<UtensilsCrossed className="size-6" />}
          label="Menu builder"
          description={
            hasItems ? `${itemCount[0]?.c ?? 0} plats configurés` : "Créer ma carte"
          }
          color="orange"
        />
        <QuickActionTile
          href="/api/qr-pdf"
          icon={<Printer className="size-6" />}
          label="Imprimer mes QR"
          description={
            hasTables
              ? `${tableCount[0]?.c ?? 0} table${(tableCount[0]?.c ?? 0) > 1 ? "s" : ""}`
              : "Ajoutez d'abord des tables"
          }
          color="saffron"
          external={hasTables}
          disabled={!hasTables}
        />
      </div>

      {/* === Infos resto === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mon restaurant</CardTitle>
          <CardDescription>Aperçu rapide de votre configuration.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <InfoBlock label="URL publique">
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">/r/{ctx.restaurant.slug}</code>
          </InfoBlock>
          <InfoBlock label="Langues">
            {ctx.restaurant.languages.join(" · ").toUpperCase()}
          </InfoBlock>
          <InfoBlock label="Logo">
            {hasLogo ? (
              <span className="inline-flex items-center gap-1 text-[var(--brand-forest)]">
                <CircleCheck className="size-3.5" /> Configuré
              </span>
            ) : (
              <Link
                href="/dashboard/settings/branding"
                className="text-[var(--brand-orange)] inline-flex items-center gap-1 hover:underline"
              >
                <ImageIcon className="size-3.5" /> Ajouter
              </Link>
            )}
          </InfoBlock>
          <InfoBlock label="Statut abo">
            <span className="bg-[var(--brand-saffron)]/20 text-[color:oklch(0.4_0.1_60)] rounded-full px-2 py-0.5 text-xs font-medium">
              {ctx.restaurant.subStatus ?? "—"}
            </span>
          </InfoBlock>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  unit,
  color,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: "forest" | "orange" | "saffron" | "tomato";
  spark?: number[];
}) {
  const styles = {
    forest: { bg: "bg-[var(--brand-forest)]/10", text: "text-[var(--brand-forest)]", spark: "var(--brand-forest)" },
    orange: { bg: "bg-[var(--brand-orange)]/15", text: "text-[var(--brand-orange)]", spark: "var(--brand-orange)" },
    saffron: { bg: "bg-[var(--brand-saffron)]/30", text: "text-[color:oklch(0.4_0.1_60)]", spark: "#D4A017" },
    tomato: { bg: "bg-[var(--brand-tomato)]/15", text: "text-[var(--brand-tomato)]", spark: "var(--brand-tomato)" },
  }[color];

  return (
    <Card className="group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${styles.bg} ${styles.text}`}>
            {icon}
          </span>
          {spark && spark.length > 1 ? (
            <div className="-mr-1 flex-1">
              <Sparkline values={spark} color={styles.spark} height={28} />
            </div>
          ) : null}
        </div>
        <p className="text-muted-foreground mt-3 text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-muted-foreground text-xs">{unit}</p>
      </CardContent>
    </Card>
  );
}

function QuickActionTile({
  href,
  icon,
  label,
  description,
  color,
  external,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: "forest" | "orange" | "saffron";
  external?: boolean;
  disabled?: boolean;
}) {
  const styles = {
    forest: "from-[var(--brand-forest)]/10 to-[var(--brand-forest)]/5 hover:from-[var(--brand-forest)]/15 text-[var(--brand-forest)]",
    orange: "from-[var(--brand-orange)]/15 to-[var(--brand-orange)]/5 hover:from-[var(--brand-orange)]/20 text-[var(--brand-orange)]",
    saffron: "from-[var(--brand-saffron)]/30 to-[var(--brand-saffron)]/10 hover:from-[var(--brand-saffron)]/40 text-[color:oklch(0.4_0.1_60)]",
  }[color];

  if (disabled) {
    return (
      <div className="bg-muted/30 flex cursor-not-allowed items-center gap-4 rounded-xl border p-4 opacity-50">
        <span className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-lg">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{label}</p>
          <p className="text-muted-foreground truncate text-xs">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border bg-gradient-to-br p-4 transition-all hover:-translate-y-1 hover:shadow-lg ${styles}`}
    >
      <span className="bg-card flex size-12 shrink-0 items-center justify-center rounded-lg shadow-sm">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground font-semibold">{label}</p>
        <p className="text-muted-foreground truncate text-xs">{description}</p>
      </div>
      <ArrowRight className="text-foreground/60 size-5 shrink-0 transition-all group-hover:translate-x-1 group-hover:text-[var(--brand-orange)]" />
    </Link>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function orderStatusLabel(status: string): string {
  return (
    {
      pending: "Reçue",
      accepted: "Acceptée",
      in_kitchen: "En cuisine",
      ready: "Prête",
      served: "Servie",
      canceled: "Annulée",
    }[status] ?? status
  );
}
