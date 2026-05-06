"use client";

import { useState, useTransition } from "react";
import { deleteCategoryAction, updateCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MenuCategory } from "@/lib/db/schema";

export function CategoryHeader({
  category,
  bilingual,
}: {
  category: MenuCategory;
  bilingual: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleEdit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateCategoryAction(formData);
      if (result && "error" in result) setError(result.error);
      else setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Supprimer la catégorie « ${category.nameFr} » et tous ses plats ?`)) return;
    const formData = new FormData();
    formData.append("categoryId", category.id);
    startTransition(async () => {
      const result = await deleteCategoryAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  if (editing) {
    return (
      <form action={handleEdit} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="categoryId" value={category.id} />
        <Input
          name="nameFr"
          defaultValue={category.nameFr}
          required
          maxLength={80}
          className="max-w-[220px]"
        />
        {bilingual ? (
          <Input
            name="nameEn"
            defaultValue={category.nameEn ?? ""}
            placeholder="EN"
            maxLength={80}
            className="max-w-[220px]"
          />
        ) : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "..." : "Enregistrer"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
          disabled={pending}
        >
          Annuler
        </Button>
        {error ? <p className="text-destructive w-full text-sm">{error}</p> : null}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold">{category.nameFr}</h2>
      {bilingual && category.nameEn ? (
        <span className="text-muted-foreground text-sm">/ {category.nameEn}</span>
      ) : null}
      <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}>
        Renommer
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
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
