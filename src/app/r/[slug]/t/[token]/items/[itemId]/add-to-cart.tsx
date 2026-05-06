"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "../../cart-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { MenuItem, MenuItemOption, MenuItemOptionChoice } from "@/lib/db/schema";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

type Props = {
  slug: string;
  token: string;
  item: MenuItem;
  options: (MenuItemOption & { choices: MenuItemOptionChoice[] })[];
};

export function AddToCart({ slug, token, item, options }: Props) {
  const router = useRouter();
  const { addLine } = useCart(token);

  const [selected, setSelected] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    for (const opt of options) {
      const set = new Set<string>();
      const defaults = opt.choices.filter((c) => c.isDefault);
      if (opt.type === "single") {
        const def = defaults[0] ?? opt.choices[0];
        if (def && opt.isRequired) set.add(def.id);
        else if (def) set.add(def.id);
      } else {
        for (const d of defaults) set.add(d.id);
      }
      initial[opt.id] = set;
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const totalCents = useMemo(() => {
    let total = item.priceCents;
    for (const opt of options) {
      const chosen = selected[opt.id] ?? new Set();
      for (const choice of opt.choices) {
        if (chosen.has(choice.id)) total += choice.priceDeltaCents;
      }
    }
    return total * quantity;
  }, [item.priceCents, options, selected, quantity]);

  const missingRequired = options.filter(
    (o) => o.isRequired && (selected[o.id]?.size ?? 0) === 0,
  );
  const canAdd = item.isAvailable && missingRequired.length === 0 && quantity >= 1;

  function toggleChoice(option: MenuItemOption, choiceId: string) {
    setSelected((prev) => {
      const next = { ...prev };
      const current = new Set(next[option.id] ?? []);
      if (option.type === "single") {
        next[option.id] = new Set([choiceId]);
      } else {
        if (current.has(choiceId)) current.delete(choiceId);
        else current.add(choiceId);
        next[option.id] = current;
      }
      return next;
    });
  }

  function handleAdd() {
    setSubmitting(true);
    const chosen = options.flatMap((opt) => {
      const set = selected[opt.id] ?? new Set();
      return opt.choices
        .filter((c) => set.has(c.id))
        .map((c) => ({
          optionId: opt.id,
          optionName: opt.nameFr,
          choiceId: c.id,
          choiceName: c.nameFr,
          priceDeltaCents: c.priceDeltaCents,
        }));
    });

    addLine({
      itemId: item.id,
      nameSnapshot: item.nameFr,
      priceCentsSnapshot: item.priceCents,
      quantity,
      options: chosen,
    });

    router.push(`/r/${slug}/t/${token}`);
  }

  return (
    <div className="space-y-6">
      {options.length > 0 ? (
        <div className="space-y-5">
          {options.map((opt) => {
            const chosenIds = selected[opt.id] ?? new Set();
            return (
              <fieldset key={opt.id} className="space-y-2">
                <legend className="font-medium">
                  {opt.nameFr}
                  {opt.isRequired ? (
                    <span className="text-destructive ml-1">*</span>
                  ) : null}
                  <span className="text-muted-foreground ml-2 text-xs font-normal">
                    {opt.type === "single" ? "Choisir un" : "Choix multiples"}
                  </span>
                </legend>
                <div className="space-y-1.5">
                  {opt.choices.map((choice) => {
                    const checked = chosenIds.has(choice.id);
                    return (
                      <Label
                        key={choice.id}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 ${
                          checked ? "border-foreground bg-muted/30" : "hover:bg-muted/40"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type={opt.type === "single" ? "radio" : "checkbox"}
                            name={`opt-${opt.id}`}
                            value={choice.id}
                            checked={checked}
                            onChange={() => toggleChoice(opt, choice.id)}
                            className="size-4 accent-current"
                          />
                          <span className="text-sm">{choice.nameFr}</span>
                        </span>
                        {choice.priceDeltaCents !== 0 ? (
                          <span className="text-muted-foreground font-mono text-xs">
                            {choice.priceDeltaCents > 0 ? "+" : ""}
                            {formatter.format(choice.priceDeltaCents / 100)}
                          </span>
                        ) : null}
                      </Label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={submitting || quantity <= 1}
            aria-label="Diminuer"
          >
            −
          </Button>
          <span className="w-6 text-center font-medium">{quantity}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            disabled={submitting}
            aria-label="Augmenter"
          >
            +
          </Button>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={handleAdd}
          disabled={!canAdd || submitting}
          className="flex-1"
        >
          {!item.isAvailable
            ? "Indisponible"
            : missingRequired.length > 0
              ? "Choisissez une option"
              : `Ajouter — ${formatter.format(totalCents / 100)}`}
        </Button>
      </div>
    </div>
  );
}
