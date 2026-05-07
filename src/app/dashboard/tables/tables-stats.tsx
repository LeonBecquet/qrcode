import { Activity, Layers, QrCode, ScanLine } from "lucide-react";

type Props = {
  total: number;
  active: number;
  zones: number;
  scansToday: number;
};

/**
 * Strip de KPIs en haut de la page Tables.
 * 4 cartes graphiques : Total · Actives · Zones · Scans 24h.
 * Chaque carte = grand chiffre + mini visualisation contextuelle (jauge / barres / dots).
 */
export function TablesStats({ total, active, zones, scansToday }: Props) {
  const activePct = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* === Tables — total avec pulse "vivant" === */}
      <StatCard
        icon={<QrCode className="size-4" />}
        label="Tables"
        value={total}
        color="var(--brand-forest)"
        bgFrom="rgba(61,92,68,0.08)"
        bgTo="rgba(61,92,68,0.02)"
        sub={
          total - active > 0
            ? `${total - active} désactivée${total - active > 1 ? "s" : ""}`
            : "Toutes opérationnelles"
        }
        viz={<DotsViz total={total} active={active} color="var(--brand-forest)" />}
      />

      {/* === Actives — jauge circulaire === */}
      <StatCard
        icon={<Activity className="size-4" />}
        label="Actives"
        value={active}
        color="var(--brand-orange)"
        bgFrom="rgba(238,128,51,0.10)"
        bgTo="rgba(238,128,51,0.02)"
        sub={total > 0 ? `${activePct}% du parc` : "Aucune"}
        live={active > 0}
        viz={<RingViz pct={activePct} color="var(--brand-orange)" />}
      />

      {/* === Zones — petits blocs empilés === */}
      <StatCard
        icon={<Layers className="size-4" />}
        label="Zones"
        value={zones}
        color="var(--brand-saffron)"
        bgFrom="rgba(217,160,38,0.12)"
        bgTo="rgba(217,160,38,0.02)"
        sub={zones > 1 ? "Multi-zones" : zones === 1 ? "Une zone" : "Sans zone"}
        viz={<StackViz count={zones} color="var(--brand-saffron)" />}
      />

      {/* === Scans 24h — mini barchart === */}
      <StatCard
        icon={<ScanLine className="size-4" />}
        label="Scans · 24h"
        value={scansToday}
        color="var(--brand-tomato)"
        bgFrom="rgba(184,57,47,0.10)"
        bgTo="rgba(184,57,47,0.02)"
        sub={
          scansToday > 0
            ? scansToday > 50
              ? "Pic d'activité"
              : "Service en cours"
            : "Pas de scan aujourd'hui"
        }
        live={scansToday > 0}
        viz={<BarsViz total={scansToday} color="var(--brand-tomato)" />}
      />
    </div>
  );
}

type CardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgFrom: string;
  bgTo: string;
  sub?: string;
  viz: React.ReactNode;
  live?: boolean;
};

function StatCard({ icon, label, value, color, bgFrom, bgTo, sub, viz, live }: CardProps) {
  return (
    <div
      className="bg-card group relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundImage: `linear-gradient(135deg, ${bgFrom}, ${bgTo})`,
      }}
    >
      {/* Top accent bar */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: color }}
      />
      {/* Decorative blob */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-10 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: color }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
            <span style={{ color }}>{icon}</span>
            {label}
            {live ? (
              <span className="relative ml-0.5 flex size-1.5">
                <span
                  className="absolute inset-0 animate-ping rounded-full opacity-60"
                  style={{ background: color }}
                />
                <span
                  className="relative size-1.5 rounded-full"
                  style={{ background: color }}
                />
              </span>
            ) : null}
          </p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
            {value}
          </p>
          {sub ? (
            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px]">
              {sub}
            </p>
          ) : null}
        </div>

        {/* Viz à droite */}
        <div className="shrink-0 self-center opacity-90">{viz}</div>
      </div>
    </div>
  );
}

/* ---------- Visualisations mini --------- */

function DotsViz({ total, active, color }: { total: number; active: number; color: string }) {
  // Grille 3×3 de dots, premiers `active` en color, le reste estompé
  const cells = Array.from({ length: 9 });
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {cells.map((_, i) => {
        const isShown = i < total;
        const isActive = i < active;
        return (
          <span
            key={i}
            className="size-1.5 rounded-full"
            style={{
              background: isShown ? (isActive ? color : "currentColor") : "transparent",
              opacity: isShown ? (isActive ? 1 : 0.25) : 0,
              border: !isShown ? "1px dashed currentColor" : undefined,
              borderColor: !isShown ? "rgba(0,0,0,0.1)" : undefined,
              borderRadius: "50%",
              boxSizing: "border-box",
            }}
          />
        );
      })}
    </div>
  );
}

function RingViz({ pct, color }: { pct: number; color: string }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <svg viewBox="0 0 36 36" className="size-9">
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={color}
        strokeOpacity="0.15"
        strokeWidth="3"
      />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 18 18)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="18"
        y="20"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}

function StackViz({ count, color }: { count: number; color: string }) {
  const visible = Math.min(count, 4);
  return (
    <div className="flex flex-col gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => {
        const w = 10 + i * 4;
        return (
          <span
            key={i}
            className="h-1 rounded-full transition-all"
            style={{
              width: `${w}px`,
              background: i < visible ? color : "currentColor",
              opacity: i < visible ? 0.85 : 0.12,
            }}
          />
        );
      })}
    </div>
  );
}

function BarsViz({ total, color }: { total: number; color: string }) {
  // Distribution déterministe sur 7 barres pour donner un effet "courbe" sans data réelle.
  const bars = [0.3, 0.5, 0.45, 0.7, 0.85, 0.65, total > 0 ? 1 : 0];
  return (
    <div className="flex h-9 items-end gap-0.5">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-sm"
          style={{
            height: total === 0 ? "10%" : `${Math.max(h * 100, 10)}%`,
            background: color,
            opacity: total === 0 ? 0.15 : 0.4 + h * 0.6,
          }}
        />
      ))}
    </div>
  );
}
