"use client";

import { useRef, useState, useTransition } from "react";
import { bulkCreateTablesAction, createTableAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddTableForms() {
  const singleRef = useRef<HTMLFormElement>(null);
  const bulkRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"single" | "bulk">("single");

  function handleSingle(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTableAction(formData);
      if (result && "error" in result) setError(result.error);
      else singleRef.current?.reset();
    });
  }

  function handleBulk(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await bulkCreateTablesAction(formData);
      if (result && "error" in result) setError(result.error);
      else bulkRef.current?.reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Ajouter des tables</CardTitle>
            <CardDescription>
              Une à la fois, ou en lot (T1, T2, ..., T20).
            </CardDescription>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`rounded px-2 py-1 ${
                mode === "single" ? "bg-muted font-medium" : "text-muted-foreground"
              }`}
            >
              Une
            </button>
            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={`rounded px-2 py-1 ${
                mode === "bulk" ? "bg-muted font-medium" : "text-muted-foreground"
              }`}
            >
              En lot
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "single" ? (
          <form
            ref={singleRef}
            action={handleSingle}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="space-y-1">
              <Label htmlFor="label" className="text-xs">
                Libellé
              </Label>
              <Input
                id="label"
                name="label"
                placeholder="T1"
                required
                maxLength={32}
                className="w-32"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="groupName" className="text-xs">
                Groupe (optionnel)
              </Label>
              <Input
                id="groupName"
                name="groupName"
                placeholder="Intérieur"
                maxLength={64}
                className="w-48"
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "..." : "Ajouter"}
            </Button>
          </form>
        ) : (
          <form
            ref={bulkRef}
            action={handleBulk}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="space-y-1">
              <Label htmlFor="prefix" className="text-xs">
                Préfixe
              </Label>
              <Input
                id="prefix"
                name="prefix"
                defaultValue="T"
                required
                maxLength={8}
                className="w-20"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="start" className="text-xs">
                Début
              </Label>
              <Input
                id="start"
                name="start"
                type="number"
                min="1"
                defaultValue="1"
                required
                className="w-20"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="count" className="text-xs">
                Quantité
              </Label>
              <Input
                id="count"
                name="count"
                type="number"
                min="1"
                max="100"
                defaultValue="10"
                required
                className="w-24"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="bulkGroupName" className="text-xs">
                Groupe (optionnel)
              </Label>
              <Input
                id="bulkGroupName"
                name="groupName"
                placeholder="Intérieur"
                maxLength={64}
                className="w-48"
              />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? "..." : "Créer le lot"}
            </Button>
          </form>
        )}
        {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
