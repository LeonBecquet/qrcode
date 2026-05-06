"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { removeBrandingImageAction, uploadBrandingImageAction } from "./actions";
import { Button } from "@/components/ui/button";

type Props = {
  type: "logo" | "cover";
  label: string;
  hint: string;
  currentUrl: string | null;
  aspectClassName: string;
};

export function ImageUploader({ type, label, hint, currentUrl, aspectClassName }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    startTransition(async () => {
      const result = await uploadBrandingImageAction(formData);
      if ("error" in result) setError(result.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleRemove() {
    setError(null);
    const formData = new FormData();
    formData.append("type", type);
    startTransition(async () => {
      const result = await removeBrandingImageAction(formData);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>

      <div
        className={`bg-muted relative overflow-hidden rounded-md border ${aspectClassName}`}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt={label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Aucune image
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
          id={`upload-${type}`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => fileInputRef.current?.click()}
        >
          {pending ? "..." : currentUrl ? "Remplacer" : "Téléverser"}
        </Button>
        {currentUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
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
