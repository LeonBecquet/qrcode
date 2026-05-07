import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
};

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Tone d'accent (couleur du blob + de l'icône) */
  tone?: "orange" | "forest" | "saffron" | "tomato";
  actions?: Action[];
  /** Padding vertical, défaut 'lg' */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const TONES = {
  orange: {
    blob: "bg-[var(--brand-orange)]/15",
    iconBg: "bg-[var(--brand-orange)]/15 text-[var(--brand-orange)]",
    border: "border-[var(--brand-orange)]/30",
  },
  forest: {
    blob: "bg-[var(--brand-forest)]/12",
    iconBg: "bg-[var(--brand-forest)]/15 text-[var(--brand-forest)]",
    border: "border-[var(--brand-forest)]/25",
  },
  saffron: {
    blob: "bg-[var(--brand-saffron)]/25",
    iconBg: "bg-[var(--brand-saffron)]/30 text-[color:oklch(0.4_0.1_60)]",
    border: "border-[var(--brand-saffron)]/40",
  },
  tomato: {
    blob: "bg-[var(--brand-tomato)]/15",
    iconBg: "bg-[var(--brand-tomato)]/15 text-[var(--brand-tomato)]",
    border: "border-[var(--brand-tomato)]/25",
  },
} as const;

const SIZES = {
  sm: { padY: "py-8", iconSize: "size-12", iconInner: "size-6", title: "text-base" },
  md: { padY: "py-12", iconSize: "size-14", iconInner: "size-7", title: "text-lg" },
  lg: { padY: "py-16", iconSize: "size-16", iconInner: "size-8", title: "text-xl" },
} as const;

/**
 * Empty state unifié — utilisé partout où on a une absence de données ou de résultats.
 * Cohérent visuellement : icône colorée dans rond, titre, description, optionnel CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "orange",
  actions = [],
  size = "lg",
  className,
}: Props) {
  const t = TONES[tone];
  const s = SIZES[size];

  return (
    <div
      className={`bg-card relative overflow-hidden rounded-2xl border-2 border-dashed ${t.border} ${className ?? ""}`}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full ${t.blob} blur-3xl`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-12 -left-12 size-32 rounded-full ${t.blob} blur-3xl opacity-50`}
      />

      <div
        className={`relative flex flex-col items-center gap-3 px-4 text-center ${s.padY}`}
      >
        <div
          className={`${t.iconBg} flex ${s.iconSize} items-center justify-center rounded-2xl shadow-sm`}
        >
          <Icon className={s.iconInner} />
        </div>
        <div className="max-w-md space-y-1">
          <p className={`font-semibold ${s.title}`}>{title}</p>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {actions.map((action, i) => {
              const className =
                action.variant === "outline"
                  ? "bg-card border-input hover:bg-muted/50 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  : "bg-[var(--brand-orange)] hover:bg-[var(--brand-orange)]/90 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[var(--brand-orange)]/30 transition-all hover:-translate-y-0.5";
              if (action.href) {
                return (
                  <Link key={i} href={action.href} className={className}>
                    {action.label}
                  </Link>
                );
              }
              return (
                <button key={i} type="button" onClick={action.onClick} className={className}>
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
