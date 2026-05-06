"use client";

import { useState } from "react";
import { FloorMap } from "./floor-map";
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
        <FloorMap groups={groups} scanUrls={scanUrls} />
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
