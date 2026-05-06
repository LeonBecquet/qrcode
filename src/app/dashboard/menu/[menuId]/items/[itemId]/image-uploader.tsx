"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { removeItemImageAction, uploadItemImageAction } from "../../actions";
import { Button } from "@/components/ui/button";

export function ItemImageUploader({
  itemId,
  currentUrl,
}: {
  itemId: string;
  currentUrl: string | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", itemId);
    startTransition(async () => {
      const result = await uploadItemImageAction(formData);
      if (result && "error" in result) setError(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleRemove() {
    setError(null);
    const formData = new FormData();
    formData.append("itemId", itemId);
    startTransition(async () => {
      const result = await removeItemImageAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="bg-muted relative aspect-square w-48 overflow-hidden rounded-md border">
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt="Photo du plat"
            fill
            className="object-cover"
            sizes="192px"
            unoptimized
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
            Aucune photo
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={pending}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => fileInputRef.current?.click()}
        >
          {pending ? "..." : currentUrl ? "Remplacer" : "Ajouter une photo"}
        </Button>
        {currentUrl ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={handleRemove}
          >
            Retirer
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
