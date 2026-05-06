import { asc, eq } from "drizzle-orm";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tables</h1>
          <p className="text-muted-foreground mt-1">
            Une URL scannable par table. Régénérez le token pour invalider un QR perdu.
          </p>
        </div>
        {rows.length > 0 ? (
          <Link
            href="/api/qr-pdf"
            target="_blank"
            className={buttonVariants({ size: "lg" })}
          >
            Télécharger tous les QR (PDF)
          </Link>
        ) : null}
      </div>

      <AddTableForms />

      {rows.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            Aucune table pour le moment. Ajoutez-en une ci-dessus.
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
