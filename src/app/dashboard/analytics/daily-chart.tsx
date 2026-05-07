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
  const totalRevenue = series.reduce((sum, p) => sum + p.revenueCents, 0);
  const totalOrders = series.reduce((sum, p) => sum + p.ordersCount, 0);
  const peak = series.reduce(
    (best, p) => (p.revenueCents > (best?.revenueCents ?? 0) ? p : best),
    null as DailyPoint | null,
  );

  return (
    <div className="space-y-3">
      {/* Petit résumé au-dessus du graphe */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span className="text-muted-foreground">
          Total · <strong className="text-foreground">{formatter.format(totalRevenue / 100)}</strong>
        </span>
        <span className="text-muted-foreground">
          Commandes ·{" "}
          <strong className="text-foreground tabular-nums">{totalOrders}</strong>
        </span>
        {peak && peak.revenueCents > 0 ? (
          <span className="text-muted-foreground">
            Pic ·{" "}
            <strong className="text-foreground">
              {dateFormatter.format(new Date(`${peak.day}T00:00:00`))}
            </strong>{" "}
            ({formatter.format(peak.revenueCents / 100)})
          </span>
        ) : null}
      </div>

      {/* Barchart */}
      <div className="relative">
        {/* Grid lines en arrière-plan */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-foreground/5 border-t border-dashed" />
          ))}
        </div>

        <div className="relative flex h-44 items-end gap-1">
          {series.map((point) => {
            const heightPct = (point.revenueCents / maxRevenue) * 100;
            const date = new Date(`${point.day}T00:00:00`);
            const isPeak = peak && point.day === peak.day && point.revenueCents > 0;
            const hasData = point.ordersCount > 0;
            return (
              <div
                key={point.day}
                className="group relative flex flex-1 flex-col items-center justify-end"
                title={`${dateFormatter.format(date)} : ${point.ordersCount} commandes · ${formatter.format(point.revenueCents / 100)}`}
              >
                <div
                  className="w-full overflow-hidden rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(heightPct, hasData ? 3 : 0)}%`,
                    background: hasData
                      ? isPeak
                        ? "linear-gradient(180deg, var(--brand-orange) 0%, var(--brand-tomato) 100%)"
                        : "linear-gradient(180deg, var(--brand-forest) 0%, color-mix(in oklab, var(--brand-forest) 60%, transparent) 100%)"
                      : "transparent",
                  }}
                />
                {/* Tooltip on hover */}
                {hasData ? (
                  <div className="bg-foreground text-background pointer-events-none absolute bottom-full mb-1 hidden rounded-md px-2 py-1 text-[10px] whitespace-nowrap shadow-lg group-hover:block">
                    {formatter.format(point.revenueCents / 100)} · {point.ordersCount}cmd
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Axe X */}
      <div className="text-muted-foreground flex justify-between text-[10px]">
        <span>{series[0] ? dateFormatter.format(new Date(`${series[0].day}T00:00:00`)) : ""}</span>
        <span>Aujourd&apos;hui</span>
      </div>
    </div>
  );
}
