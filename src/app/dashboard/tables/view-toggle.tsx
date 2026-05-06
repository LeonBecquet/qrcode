"use client";

import { LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";

export type TablesView = "list" | "grid";

const STORAGE_KEY = "qr_tables_view";

export function ViewToggle({
  onChange,
}: {
  onChange: (view: TablesView) => void;
}) {
  const [view, setView] = useState<TablesView>("grid");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(stored);
      onChange(stored);
    }
  }, [onChange]);

  function pick(next: TablesView) {
    setView(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    onChange(next);
  }

  return (
    <div className="bg-muted/50 inline-flex items-center rounded-lg p-1">
      <button
        type="button"
        onClick={() => pick("grid")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          view === "grid"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={view === "grid"}
      >
        <LayoutGrid className="size-3.5" />
        Plan de salle
      </button>
      <button
        type="button"
        onClick={() => pick("list")}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          view === "list"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={view === "list"}
      >
        <List className="size-3.5" />
        Liste
      </button>
    </div>
  );
}
