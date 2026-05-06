import { and, desc, eq, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { memberships, restaurants, user as userTable } from "@/lib/db/schema";
import { TIER_CONFIG } from "@/lib/stripe";

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      monthlyActive: sql<number>`(count(*) filter (where ${restaurants.tier} = 'monthly' and ${restaurants.subStatus} = 'active'))::int`,
      annualActive: sql<number>`(count(*) filter (where ${restaurants.tier} = 'annual' and ${restaurants.subStatus} = 'active'))::int`,
      lifetimeActive: sql<number>`(count(*) filter (where ${restaurants.tier} = 'lifetime' and ${restaurants.subStatus} = 'active'))::int`,
      pastDue: sql<number>`(count(*) filter (where ${restaurants.subStatus} = 'past_due'))::int`,
      canceled: sql<number>`(count(*) filter (where ${restaurants.subStatus} = 'canceled'))::int`,
      noSub: sql<number>`(count(*) filter (where ${restaurants.subStatus} is null))::int`,
    })
    .from(restaurants);

  const monthlyActive = Number(stats?.monthlyActive ?? 0);
  const annualActive = Number(stats?.annualActive ?? 0);
  const lifetimeActive = Number(stats?.lifetimeActive ?? 0);
  const total = Number(stats?.total ?? 0);
  const pastDue = Number(stats?.pastDue ?? 0);
  const canceled = Number(stats?.canceled ?? 0);
  const noSub = Number(stats?.noSub ?? 0);

  const mrr =
    monthlyActive * TIER_CONFIG.monthly.amountEur +
    annualActive * (TIER_CONFIG.annual.amountEur / 12);
  const arr = mrr * 12;
  const lifetimeRevenue = lifetimeActive * TIER_CONFIG.lifetime.amountEur;

  // Liste des restos avec owner
  const list = await db
    .select({
      restaurant: restaurants,
      ownerEmail: userTable.email,
      ownerName: userTable.name,
    })
    .from(restaurants)
    .leftJoin(
      memberships,
      and(eq(memberships.restaurantId, restaurants.id), eq(memberships.role, "owner")),
    )
    .leftJoin(userTable, eq(userTable.id, memberships.userId))
    .orderBy(desc(restaurants.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground mt-1">
          Métriques business calculées sur les restos actifs.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="MRR"
          value={eurFormatter.format(mrr)}
          subtitle={`${monthlyActive} mensuels + ${annualActive} annuels`}
        />
        <KpiCard title="ARR projeté" value={eurFormatter.format(arr)} subtitle="MRR × 12" />
        <KpiCard
          title="Lifetime"
          value={eurFormatter.format(lifetimeRevenue)}
          subtitle={`${lifetimeActive} acheteur${lifetimeActive > 1 ? "s" : ""}`}
        />
        <KpiCard
          title="Restos"
          value={String(total)}
          subtitle={`${monthlyActive + annualActive + lifetimeActive} actifs · ${noSub} sans abo`}
        />
      </div>

      {pastDue + canceled > 0 ? (
        <div className="bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded-md border-l-4 border-amber-500 px-4 py-2 text-sm">
          ⚠️ {pastDue} en retard de paiement · {canceled} annulé{canceled > 1 ? "s" : ""}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Restaurants ({list.length})</CardTitle>
          <CardDescription>Tous les comptes inscrits sur la plateforme.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              Aucun restaurant inscrit.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Resto</th>
                    <th className="px-4 py-2 text-left font-medium">Owner</th>
                    <th className="px-4 py-2 text-left font-medium">Plan</th>
                    <th className="px-4 py-2 text-left font-medium">Statut</th>
                    <th className="px-4 py-2 text-left font-medium">Inscrit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((row) => (
                    <tr key={row.restaurant.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <div className="font-medium">{row.restaurant.name}</div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {row.restaurant.slug}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div>{row.ownerName ?? "—"}</div>
                        <div className="text-muted-foreground text-xs">
                          {row.ownerEmail ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {row.restaurant.tier ? (
                          <span className="bg-muted rounded px-1.5 py-0.5 text-xs">
                            {TIER_CONFIG[row.restaurant.tier].label}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <SubStatusBadge status={row.restaurant.subStatus} />
                      </td>
                      <td className="text-muted-foreground px-4 py-2 text-xs">
                        {dateFormatter.format(row.restaurant.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function SubStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-muted-foreground text-xs">aucun</span>;
  }
  const colors: Record<string, string> = {
    active:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    trialing: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    past_due: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    canceled: "bg-muted text-muted-foreground",
    paused: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
