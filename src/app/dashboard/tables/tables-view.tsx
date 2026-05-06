"use client";

import { useState } from "react";
import { TableCard } from "./table-card";
import { TableRow } from "./table-row";
import { ViewToggle, type TablesView } from "./view-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Table } from "@/lib/db/schema";

type Props = {
  groups: { name: string | null; tables: Table[] }[];
  scanUrls: Record<string, string>;
};

export function TablesView({ groups, scanUrls }: Props) {
  const [view, setView] = useState<TablesView>("grid");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle onChange={setView} />
      </div>

      {view === "grid" ? (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.name ?? "_none"} className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  {group.name ?? "Sans groupe"}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {group.tables.length} table{group.tables.length > 1 ? "s" : ""} ·{" "}
                  {group.tables.filter((t) => t.isActive).length} active
                  {group.tables.filter((t) => t.isActive).length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {group.tables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    scanUrl={scanUrls[table.id] ?? ""}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.name ?? "_none"}>
              <CardHeader>
                <CardTitle className="text-base">
                  {group.name ?? "Sans groupe"}
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    ({group.tables.length})
                  </span>
                </CardTitle>
                <CardDescription>
                  {group.tables.filter((t) => t.isActive).length} active
                  {group.tables.filter((t) => t.isActive).length > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {group.tables.map((table) => (
                    <TableRow
                      key={table.id}
                      table={table}
                      scanUrl={scanUrls[table.id] ?? ""}
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
