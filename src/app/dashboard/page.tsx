import { and, count, eq, gte } from "drizzle-orm";
import {
  ArrowRight,
  ChefHat,
  CircleCheck,
  CircleDashed,
  ImageIcon,
  Printer,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db/client";
import {
  menus,
  menuCategories,
  menuItems,
  orders,
  serviceRequests,
  tables,
} from "@/lib/db/schema";
import { getRestaurantKpis } from "@/lib/server/analytics";
import { requireRestaurant } from "@/lib/server/session";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requireRestaurant();
  const restoId = ctx.restaurant.id;

  // KPIs du jour
  const kpis = await getRestaurantKpis(restoId);

  // Compte des assets pour la checklist
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [menuCount, tableCount, itemCount, pendingOrders, pendingRequests] = await Promise.all([
    db.select({ c: count() }).from(menus).where(eq(menus.restaurantId, restoId)),
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
      .where(
        and(
          eq(orders.restaurantId, restoId),
          gte(orders.createdAt, startOfDay),
        ),
      ),
    db
      .select({ c: count() })
      .from(serviceRequests)
      .where(
        and(eq(serviceRequests.restaurantId, restoId), eq(serviceRequests.isResolved, false)),
      ),
  ]);

  const hasLogo = !!ctx.restaurant.logoUrl;
  const hasMenu = (menuCount[0]?.c ?? 0) > 0;
  const hasItems = (itemCount[0]?.c ?? 0) > 0;
  const hasTables = (tableCount[0]?.c ?? 0) > 0;
  const todayOrders = pendingOrders[0]?.c ?? 0;
  const activeRequests = pendingRequests[0]?.c ?? 0;

  const greeting = getGreeting();

  const checklist = [
    {
      title: "Configurer mon restaurant",
      description: "Logo, horaires, langues",
      done: hasLogo,
      href: "/dashboard/settings/general",
    },
    {
      title: "Construire mon menu",
      description: "Catégories, plats, prix, allergènes",
      done: hasItems,
      href: "/dashboard/menu",
    },
    {
      title: "Ajouter mes tables",
      description: "Et générer le PDF des QR codes",
      done: hasTables,
      href: "/dashboard/tables",
    },
  ];
  const completedSteps = checklist.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="space-y-8">
      {/* === Hero greeting === */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[var(--brand-saffron)]/15 via-card to-[var(--brand-orange)]/10 p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[var(--brand-orange)]/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">
              {greeting}, {ctx.user.name} 👋
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {ctx.restaurant.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Voici ce qui se passe dans votre restaurant aujourd&apos;hui.
            </p>
          </div>
          {activeRequests > 0 ? (
            <Link
              href="/dashboard/kitchen"
              className="bg-[var(--brand-tomato)] inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:scale-105"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
                <span className="relative size-2 rounded-full bg-white" />
              </span>
              {activeRequests} appel{activeRequests > 1 ? "s" : ""} serveur en cours
            </Link>
          ) : null}
        </div>
      </div>

      {/* === Stats KPIs du jour === */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<UtensilsCrossed className="size-5" />}
          label="Aujourd'hui"
          value={String(todayOrders)}
          unit={todayOrders > 1 ? "commandes" : "commande"}
          color="forest"
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
          label="CA · 7 jours"
          value={eurFormatter.format(kpis.week.revenueCents / 100)}
          unit={`${kpis.week.ordersCount} commandes servies`}
          color="orange"
        />
        <KpiCard
          icon={<TrendingUp className="size-5" />}
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
          icon={<UtensilsCrossed className="size-5" />}
          label="CA · 30 jours"
          value={eurFormatter.format(kpis.month.revenueCents / 100)}
          unit={`${kpis.month.ordersCount} commandes`}
          color="tomato"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* === Onboarding checklist === */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Checklist de démarrage</CardTitle>
                <CardDescription>
                  {completedSteps === checklist.length
                    ? "🎉 Tout est prêt — vous pouvez commencer le service."
                    : `${completedSteps} sur ${checklist.length} complété${completedSteps > 1 ? "s" : ""}`}
                </CardDescription>
              </div>
              <span className="bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] rounded-full px-3 py-1 text-xs font-semibold">
                {progressPct}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="bg-muted relative mt-3 h-2 overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--brand-forest)] via-[var(--brand-orange)] to-[var(--brand-saffron)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {checklist.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className={`group flex items-center gap-3 rounded-lg border px-4 py-3 transition-all hover:border-[var(--brand-orange)]/40 hover:bg-[var(--brand-orange)]/5 ${
                  step.done ? "bg-muted/30" : "bg-card"
                }`}
              >
                {step.done ? (
                  <CircleCheck className="size-5 shrink-0 text-[var(--brand-forest)]" />
                ) : (
                  <CircleDashed className="text-muted-foreground size-5 shrink-0" />
                )}
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

        {/* === Quick actions === */}
        <Card>
          <CardHeader>
            <CardTitle>Raccourcis</CardTitle>
            <CardDescription>Les actions du quotidien.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/dashboard/kitchen"
              icon={<ChefHat className="size-5" />}
              label="Cuisine en direct"
              description={
                todayOrders > 0
                  ? `${todayOrders} commande${todayOrders > 1 ? "s" : ""} aujourd'hui`
                  : "Recevez les nouvelles commandes"
              }
              color="forest"
            />
            <QuickAction
              href="/dashboard/menu"
              icon={<UtensilsCrossed className="size-5" />}
              label="Menu builder"
              description={hasMenu ? `${itemCount[0]?.c ?? 0} plats configurés` : "Créer ma carte"}
              color="orange"
            />
            <QuickAction
              href="/api/qr-pdf"
              icon={<Printer className="size-5" />}
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
          </CardContent>
        </Card>
      </div>

      {/* === Infos resto + statut abo === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mon restaurant</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <InfoBlock label="URL publique">
            <code className="text-xs">/r/{ctx.restaurant.slug}</code>
          </InfoBlock>
          <InfoBlock label="Langues">{ctx.restaurant.languages.join(" · ").toUpperCase()}</InfoBlock>
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: "forest" | "orange" | "saffron" | "tomato";
}) {
  const bg =
    color === "forest"
      ? "bg-[var(--brand-forest)]/10 text-[var(--brand-forest)]"
      : color === "orange"
        ? "bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]"
        : color === "saffron"
          ? "bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)]"
          : "bg-[var(--brand-tomato)]/15 text-[var(--brand-tomato)]";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
            {icon}
          </span>
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

function QuickAction({
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
  const bg =
    color === "forest"
      ? "bg-[var(--brand-forest)]/10 text-[var(--brand-forest)]"
      : color === "orange"
        ? "bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]"
        : "bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)]";

  if (disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-lg border p-3 opacity-50">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${bg}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-muted-foreground truncate text-xs">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="group hover:border-[var(--brand-orange)]/40 hover:bg-[var(--brand-orange)]/5 flex items-center gap-3 rounded-lg border p-3 transition-all"
    >
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${bg}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground truncate text-xs">{description}</p>
      </div>
      <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--brand-orange)]" />
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
