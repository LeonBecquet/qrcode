import type { DailyPoint } from "@/lib/server/analytics";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

export function DailyChart({ series }: { series: DailyPoint[] }) {
  const maxRevenue = Math.max(1, ...series.map((p) => p.revenueCents));

  return (
    <div className="space-y-2">
      <div className="flex h-40 items-end gap-1">
        {series.map((point) => {
          const heightPct = (point.revenueCents / maxRevenue) * 100;
          const date = new Date(`${point.day}T00:00:00`);
          return (
            <div
              key={point.day}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${dateFormatter.format(date)} : ${point.ordersCount} commandes · ${formatter.format(point.revenueCents / 100)}`}
            >
              <div
                className="bg-foreground/80 group-hover:bg-foreground w-full rounded-t-sm transition-colors"
                style={{ height: `${Math.max(heightPct, point.ordersCount > 0 ? 2 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground flex justify-between text-[10px]">
        <span>{series[0] ? dateFormatter.format(new Date(`${series[0].day}T00:00:00`)) : ""}</span>
        <span>
          {series[series.length - 1]
            ? dateFormatter.format(new Date(`${series[series.length - 1]!.day}T00:00:00`))
            : ""}
        </span>
      </div>
    </div>
  );
}
