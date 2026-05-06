"use client";

import { useState, useTransition } from "react";
import { updateHoursAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RestaurantHours } from "@/lib/db/schema";

const DAYS = [
  { value: 1, label: "Lundi" },
  { value: 2, label: "Mardi" },
  { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" },
  { value: 5, label: "Vendredi" },
  { value: 6, label: "Samedi" },
  { value: 0, label: "Dimanche" },
];

function toHHMM(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export function HoursForm({ initial }: { initial: RestaurantHours[] }) {
  const byDay = new Map(initial.map((h) => [h.dayOfWeek, h]));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [closedState, setClosedState] = useState(() => {
    const map: Record<number, boolean> = {};
    for (const day of DAYS) {
      map[day.value] = byDay.get(day.value)?.isClosed ?? day.value === 0;
    }
    return map;
  });

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateHoursAction(formData);
      if ("error" in result) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {DAYS.map((day) => {
          const existing = byDay.get(day.value);
          const isClosed = closedState[day.value] ?? false;
          return (
            <div
              key={day.value}
              className="grid grid-cols-[110px_120px_1fr_auto_1fr] items-center gap-3 py-1"
            >
              <span className="font-medium">{day.label}</span>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`day_${day.value}_closed`}
                  checked={isClosed}
                  onChange={(e) =>
                    setClosedState((prev) => ({ ...prev, [day.value]: e.target.checked }))
                  }
                  className="size-4 accent-current"
                />
                <span>Fermé</span>
              </label>
              <Input
                type="time"
                name={`day_${day.value}_open`}
                defaultValue={toHHMM(existing?.openTime ?? null) || "12:00"}
                disabled={isClosed}
                required={!isClosed}
              />
              <span className="text-muted-foreground text-sm">→</span>
              <Input
                type="time"
                name={`day_${day.value}_close`}
                defaultValue={toHHMM(existing?.closeTime ?? null) || "23:00"}
                disabled={isClosed}
                required={!isClosed}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement..." : "Enregistrer"}
        </Button>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-600">Enregistré.</p> : null}
      </div>
    </form>
  );
}
