"use client";

import { useState, useTransition } from "react";
import { resolveServiceRequestAction } from "./actions";
import { Button } from "@/components/ui/button";

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function ServiceRequestCard({
  request,
}: {
  request: { id: string; tableLabelSnapshot: string; type: string; createdAt: Date };
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleResolve() {
    setError(null);
    const formData = new FormData();
    formData.append("requestId", request.id);
    startTransition(async () => {
      const result = await resolveServiceRequestAction(formData);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
      <div>
        <p className="font-semibold">
          🔔 Table {request.tableLabelSnapshot}
          <span className="text-muted-foreground ml-2 text-xs font-normal">
            {timeFormatter.format(request.createdAt)}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">
          {request.type === "call_waiter" ? "Demande un serveur" : "Demande l'addition"}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Button type="button" size="sm" variant="outline" onClick={handleResolve} disabled={pending}>
          {pending ? "..." : "Vu ✓"}
        </Button>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    </div>
  );
}
