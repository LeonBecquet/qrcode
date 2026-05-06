"use client";

import { useState, useTransition } from "react";
import { deleteItemAction, toggleItemAvailableAction } from "./actions";
import { Button } from "@/components/ui/button";

export function ItemRowActions({
  itemId,
  itemName,
  isAvailable,
}: {
  itemId: string;
  itemName: string;
  isAvailable: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);
    const formData = new FormData();
    formData.append("itemId", itemId);
    formData.append("isAvailable", String(isAvailable));
    startTransition(async () => {
      const result = await toggleItemAvailableAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`Supprimer le plat « ${itemName} » ?`)) return;
    setError(null);
    const formData = new FormData();
    formData.append("itemId", itemId);
    startTransition(async () => {
      const result = await deleteItemAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        disabled={pending}
        title={isAvailable ? "Marquer comme rupture" : "Remettre en disponibilité"}
      >
        {isAvailable ? "En stock" : "Rupture"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={pending}
        className="text-destructive"
      >
        Supprimer
      </Button>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
