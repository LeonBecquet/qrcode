import { and, asc, count, eq, gte } from "drizzle-orm";
import { Printer, QrCode } from "lucide-react";
import Link from "next/link";
import { AddTableForms } from "./add-table-form";
import { EmptyFloor } from "./empty-floor";
import { QuickPresets } from "./quick-presets";
import { TablesStats } from "./tables-stats";
import { TablesView } from "./tables-view";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/lib/db/client";
import { orders, tables } from "@/lib/db/schema";
import { buildTableUrl, generateQRDataURL } from "@/lib/qr";
import { requireRestaurant } from "@/lib/server/session";

export default async function TablesPage() {
  const ctx = await requireRestaurant();

  const rows = await db
    .select()
    .from(tables)
    .where(eq(tables.restaurantId, ctx.restaurant.id))
    .orderBy(asc(tables.sortOrder), asc(tables.createdAt));

  const groupsMap = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const list = groupsMap.get(row.groupName) ?? [];
    list.push(row);
    groupsMap.set(row.groupName, list);
  }
  const groups = Array.from(groupsMap.entries())
    .sort(([a], [b]) => {
      if (a === null) return 1;
      if (b === null) return -1;
      return a.localeCompare(b, "fr");
    })
    .map(([name, ts]) => ({ name, tables: ts }));

  // URLs scan + QR data URL réel pour chaque table (utilisé dans le modal détail)
  const scanUrls: Record<string, string> = {};
  for (const t of rows) {
    scanUrls[t.id] = buildTableUrl(ctx.restaurant.slug, t.token);
  }

  const qrEntries = await Promise.all(
    rows.map(async (t) => [t.id, await generateQRDataURL(scanUrls[t.id]!)] as const),
  );
  const qrDataUrls: Record<string, string> = Object.fromEntries(qrEntries);

  const totalActive = rows.filter((r) => r.isActive).length;

  // Commandes des dernières 24h (proxy "scans aujourd'hui")
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [{ c: ordersToday } = { c: 0 }] = await db
    .select({ c: count() })
    .from(orders)
    .where(
      and(eq(orders.restaurantId, ctx.restaurant.id), gte(orders.createdAt, startOfDay)),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--brand-forest)]/10 text-[var(--brand-forest)] flex size-12 items-center justify-center rounded-xl">
            <QrCode className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tables</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {rows.length > 0
                ? `${rows.length} table${rows.length > 1 ? "s" : ""} · ${totalActive} active${totalActive > 1 ? "s" : ""} · ${groups.length} groupe${groups.length > 1 ? "s" : ""}`
                : "Une URL scannable par table. Régénérez un token pour invalider un QR perdu."}
            </p>
          </div>
        </div>
        {rows.length > 0 ? (
          <Link
            href="/api/qr-pdf"
            target="_blank"
            className={
              buttonVariants({ size: "lg" }) +
              " bg-[var(--brand-orange)] text-white shadow-md shadow-[var(--brand-orange)]/30 hover:bg-[var(--brand-orange)]/90"
            }
          >
            <Printer className="mr-2 size-4" />
            Télécharger tous les QR
          </Link>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <>
          <QuickPresets />
          <div className="flex items-center gap-3">
            <div className="border-muted-foreground/20 h-px flex-1 border-t border-dashed" />
            <span className="text-muted-foreground text-xs">ou ajoutez manuellement</span>
            <div className="border-muted-foreground/20 h-px flex-1 border-t border-dashed" />
          </div>
          <AddTableForms />
          <EmptyFloor />
        </>
      ) : (
        <>
          <TablesStats
            total={rows.length}
            active={totalActive}
            zones={groups.length}
            scansToday={ordersToday}
          />
          <AddTableForms />
          <TablesView groups={groups} scanUrls={scanUrls} qrDataUrls={qrDataUrls} />
        </>
      )}
    </div>
  );
}
