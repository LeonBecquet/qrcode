"use client";

import { useRef, useState, useTransition } from "react";
import { createCategoryAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddCategoryForm({
  menuId,
  bilingual,
}: {
  menuId: string;
  bilingual: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategoryAction(formData);
      if (result && "error" in result) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="menuId" value={menuId} />
      <div className="flex-1 min-w-[200px]">
        <Input name="nameFr" placeholder="Nom (ex : Entrées)" required maxLength={80} />
      </div>
      {bilingual ? (
        <div className="flex-1 min-w-[200px]">
          <Input name="nameEn" placeholder="Name (EN, optionnel)" maxLength={80} />
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "..." : "Ajouter"}
      </Button>
      {error ? <p className="text-destructive w-full text-sm">{error}</p> : null}
    </form>
  );
}
