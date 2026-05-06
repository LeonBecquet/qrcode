import { asc, eq } from "drizzle-orm";
import { Printer, QrCode } from "lucide-react";
import Link from "next/link";
import { AddTableForms } from "./add-table-form";
import { TableRow } from "./table-row";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db/client";
import { tables } from "@/lib/db/schema";
import { buildTableUrl } from "@/lib/qr";
import { requireRestaurant } from "@/lib/server/session";

export default async function TablesPage() {
  const ctx = await requireRestaurant();

  const rows = await db
    .select()
    .from(tables)
    .where(eq(tables.restaurantId, ctx.restaurant.id))
    .orderBy(asc(tables.sortOrder), asc(tables.createdAt));

  // Group tables by groupName
  const groups = new Map<string | null, typeof rows>();
  for (const row of rows) {
    const list = groups.get(row.groupName) ?? [];
    list.push(row);
    groups.set(row.groupName, list);
  }
  const groupEntries = Array.from(groups.entries()).sort(([a], [b]) => {
    if (a === null) return 1;
    if (b === null) return -1;
    return a.localeCompare(b, "fr");
  });

  const totalActive = rows.filter((r) => r.isActive).length;

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
                ? `${rows.length} table${rows.length > 1 ? "s" : ""} · ${totalActive} active${totalActive > 1 ? "s" : ""}`
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

      <AddTableForms />

      {rows.length === 0 ? (
        <Card className="relative overflow-hidden border-dashed">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-[var(--brand-forest)]/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-[var(--brand-orange)]/15 blur-3xl"
          />
          <CardContent className="relative flex flex-col items-center gap-3 py-12 text-center">
            <div className="bg-[var(--brand-forest)]/15 text-[var(--brand-forest)] flex size-16 items-center justify-center rounded-2xl">
              <QrCode className="size-8" />
            </div>
            <div>
              <p className="font-semibold">Aucune table configurée</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Ajoutez une ou plusieurs tables ci-dessus, puis téléchargez le PDF des QR codes
                à plastifier.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupEntries.map(([groupName, list]) => (
            <Card key={groupName ?? "_none"}>
              <CardHeader>
                <CardTitle className="text-base">
                  {groupName ?? "Sans groupe"}
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({list.length})
                  </span>
                </CardTitle>
                <CardDescription>
                  {list.filter((t) => t.isActive).length} active{list.filter((t) => t.isActive).length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {list.map((table) => (
                    <TableRow
                      key={table.id}
                      table={table}
                      scanUrl={buildTableUrl(ctx.restaurant.slug, table.token)}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
