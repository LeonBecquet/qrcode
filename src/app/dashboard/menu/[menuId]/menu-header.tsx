"use client";

import { useState, useTransition } from "react";
import { renameMenuAction } from "./actions";
import { deleteMenuAction, toggleMenuPublishedAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Menu } from "@/lib/db/schema";

export function MenuHeader({ menu }: { menu: Menu }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRename(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await renameMenuAction(formData);
      if (result && "error" in result) setError(result.error);
      else setEditing(false);
    });
  }

  function handleTogglePublish() {
    const formData = new FormData();
    formData.append("menuId", menu.id);
    formData.append("isPublished", String(menu.isPublished));
    startTransition(async () => {
      const result = await toggleMenuPublishedAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Supprimer le menu « ${menu.name} » et toutes ses catégories/plats ? Action définitive.`,
      )
    )
      return;
    const formData = new FormData();
    formData.append("menuId", menu.id);
    startTransition(async () => {
      const result = await deleteMenuAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      {editing ? (
        <form action={handleRename} className="flex items-center gap-2">
          <input type="hidden" name="menuId" value={menu.id} />
          <Input
            name="name"
            defaultValue={menu.name}
            required
            minLength={2}
            maxLength={80}
            className="max-w-md text-2xl font-semibold"
          />
          <Button type="submit" disabled={pending}>
            Enregistrer
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            Annuler
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{menu.name}</h1>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Renommer
          </Button>
          <span
            className={
              menu.isPublished
                ? "rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                : "bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
            }
          >
            {menu.isPublished ? "Publié" : "Brouillon"}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleTogglePublish}
            disabled={pending}
          >
            {menu.isPublished ? "Dépublier" : "Publier"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={pending}
            className="text-destructive ml-auto"
          >
            Supprimer le menu
          </Button>
        </div>
      )}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
