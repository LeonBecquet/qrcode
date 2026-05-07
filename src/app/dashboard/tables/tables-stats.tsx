import { Activity, Layers, QrCode, ScanLine } from "lucide-react";

type Props = {
  total: number;
  active: number;
  zones: number;
  scansToday: number;
};

/**
 * Strip de KPIs en haut de la page Tables.
 * 4 cartes : Total · Actives · Zones · Scans aujourd'hui.
 */
export function TablesStats({ total, active, zones, scansToday }: Props) {
  const stats: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }[] = [
    {
      icon: <QrCode className="size-4" />,
      label: "Tables",
      value: String(total),
      color: "var(--brand-forest)",
      sub: `${total - active > 0 ? `${total - active} désactivée${total - active > 1 ? "s" : ""}` : "Toutes opérationnelles"}`,
    },
    {
      icon: <Activity className="size-4" />,
      label: "Actives",
      value: String(active),
      color: "var(--brand-orange)",
      sub: total > 0 ? `${Math.round((active / total) * 100)}% du parc` : "Aucune",
    },
    {
      icon: <Layers className="size-4" />,
      label: "Zones",
      value: String(zones),
      color: "var(--brand-saffron)",
      sub: zones > 1 ? "Multi-zones" : zones === 1 ? "Une zone" : "Sans zone",
    },
    {
      icon: <ScanLine className="size-4" />,
      label: "Scans · 24h",
      value: String(scansToday),
      color: "var(--brand-tomato)",
      sub: scansToday > 0 ? "Service en cours" : "Pas de scan aujourd'hui",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          {/* Decorative accent bar */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 opacity-50 transition-opacity group-hover:opacity-100"
            style={{ background: s.color }}
          />
          {/* Decorative blob */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 -right-8 size-20 rounded-full opacity-15 blur-2xl"
            style={{ background: s.color }}
          />
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <span style={{ color: s.color }}>{s.icon}</span>
                {s.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                {s.value}
              </p>
              {s.sub ? (
                <p className="text-muted-foreground mt-0.5 text-[11px]">{s.sub}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
