"use client";

import { useRef, useState, useTransition } from "react";
import {
  createChoiceAction,
  createOptionAction,
  deleteChoiceAction,
  deleteOptionAction,
} from "../../actions";
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
import type { MenuItemOption, MenuItemOptionChoice } from "@/lib/db/schema";

type OptionWithChoices = MenuItemOption & { choices: MenuItemOptionChoice[] };

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  signDisplay: "always",
});

export function OptionsSection({
  itemId,
  options,
  bilingual,
}: {
  itemId: string;
  options: OptionWithChoices[];
  bilingual: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Options</CardTitle>
        <CardDescription>
          Cuisson, tailles, suppléments. Le client choisira au moment de la commande.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {options.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Aucune option pour ce plat.</p>
        ) : (
          <div className="space-y-4">
            {options.map((option) => (
              <OptionBlock key={option.id} option={option} bilingual={bilingual} />
            ))}
          </div>
        )}
        <AddOptionForm itemId={itemId} bilingual={bilingual} />
      </CardContent>
    </Card>
  );
}

function OptionBlock({
  option,
  bilingual,
}: {
  option: OptionWithChoices;
  bilingual: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm(`Supprimer l'option « ${option.nameFr} » ?`)) return;
    const formData = new FormData();
    formData.append("optionId", option.id);
    startTransition(async () => {
      const result = await deleteOptionAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  function handleDeleteChoice(choiceId: string, choiceName: string) {
    if (!confirm(`Supprimer le choix « ${choiceName} » ?`)) return;
    const formData = new FormData();
    formData.append("choiceId", choiceId);
    startTransition(async () => {
      const result = await deleteChoiceAction(formData);
      if (result && "error" in result) setError(result.error);
    });
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{option.nameFr}</span>
            {bilingual && option.nameEn ? (
              <span className="text-muted-foreground text-sm">/ {option.nameEn}</span>
            ) : null}
            <span className="bg-muted rounded px-1.5 py-0.5 text-xs">
              {option.type === "single" ? "Choix unique" : "Multiple"}
            </span>
            {option.isRequired ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                Obligatoire
              </span>
            ) : null}
          </div>
        </div>
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
      </div>

      {option.choices.length > 0 ? (
        <ul className="bg-muted/30 mt-2 divide-y rounded">
          {option.choices.map((choice) => (
            <li key={choice.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="flex-1">
                {choice.nameFr}
                {bilingual && choice.nameEn ? (
                  <span className="text-muted-foreground"> / {choice.nameEn}</span>
                ) : null}
                {choice.isDefault ? (
                  <span className="text-muted-foreground ml-2 text-xs">(défaut)</span>
                ) : null}
              </span>
              {choice.priceDeltaCents !== 0 ? (
                <span className="text-muted-foreground font-mono text-xs">
                  {priceFormatter.format(choice.priceDeltaCents / 100)}
                </span>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteChoice(choice.id, choice.nameFr)}
                disabled={pending}
                className="text-destructive"
              >
                ×
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <AddChoiceForm optionId={option.id} bilingual={bilingual} />
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}

function AddOptionForm({ itemId, bilingual }: { itemId: string; bilingual: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createOptionAction(formData);
      if (result && "error" in result) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleAction} className="space-y-2 border-t pt-4">
      <input type="hidden" name="itemId" value={itemId} />
      <div className="text-sm font-medium">Ajouter une option</div>
      <div className="grid gap-2 md:grid-cols-2">
        <Input name="nameFr" placeholder="Nom (ex : Cuisson)" required maxLength={80} />
        {bilingual ? (
          <Input name="nameEn" placeholder="Name (EN, optionnel)" maxLength={80} />
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Label className="flex items-center gap-2 text-sm">
          <input type="radio" name="type" value="single" defaultChecked />
          Choix unique
        </Label>
        <Label className="flex items-center gap-2 text-sm">
          <input type="radio" name="type" value="multiple" />
          Multiple
        </Label>
        <Label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isRequired" />
          Obligatoire
        </Label>
        <Button type="submit" size="sm" disabled={pending} className="ml-auto">
          {pending ? "..." : "Ajouter l'option"}
        </Button>
      </div>
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </form>
  );
}

function AddChoiceForm({ optionId, bilingual }: { optionId: string; bilingual: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAction(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createChoiceAction(formData);
      if (result && "error" in result) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleAction} className="mt-2 space-y-2 border-t pt-2">
      <input type="hidden" name="optionId" value={optionId} />
      <div className="text-muted-foreground text-xs font-medium">Ajouter un choix</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
        <Input name="nameFr" placeholder="Saignant" required maxLength={80} />
        {bilingual ? (
          <Input name="nameEn" placeholder="Rare" maxLength={80} />
        ) : (
          <input type="hidden" name="nameEn" value="" />
        )}
        <Input
          name="priceDeltaEur"
          type="number"
          step="0.10"
          defaultValue="0"
          placeholder="+ €"
          className="font-mono text-right"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "..." : "+"}
        </Button>
      </div>
      <Label className="flex items-center gap-2 text-xs">
        <input type="checkbox" name="isDefault" />
        Choix par défaut
      </Label>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </form>
  );
}
