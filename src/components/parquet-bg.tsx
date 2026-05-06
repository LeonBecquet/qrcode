/**
 * Pattern SVG de parquet pour les backgrounds de plan de salle.
 * Lattes en chevron / herringbone, esprit bistrot français chic.
 */
export function ParquetBg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern
          id="parquet-pattern"
          width="80"
          height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(0)"
        >
          {/* Latte 1 — claire */}
          <rect
            width="38"
            height="18"
            x="1"
            y="1"
            rx="1"
            fill="oklch(0.85 0.025 75)"
            stroke="oklch(0.78 0.03 75)"
            strokeWidth="0.5"
          />
          <line
            x1="10"
            y1="3"
            x2="35"
            y2="3"
            stroke="oklch(0.92 0.02 75)"
            strokeWidth="0.3"
            opacity="0.5"
          />

          {/* Latte 2 — foncée */}
          <rect
            width="38"
            height="18"
            x="41"
            y="1"
            rx="1"
            fill="oklch(0.78 0.035 70)"
            stroke="oklch(0.7 0.04 70)"
            strokeWidth="0.5"
          />

          {/* Décalées row 2 */}
          <rect
            width="38"
            height="18"
            x="-19"
            y="21"
            rx="1"
            fill="oklch(0.78 0.035 70)"
            stroke="oklch(0.7 0.04 70)"
            strokeWidth="0.5"
          />
          <rect
            width="38"
            height="18"
            x="21"
            y="21"
            rx="1"
            fill="oklch(0.85 0.025 75)"
            stroke="oklch(0.78 0.03 75)"
            strokeWidth="0.5"
          />
          <rect
            width="38"
            height="18"
            x="61"
            y="21"
            rx="1"
            fill="oklch(0.78 0.035 70)"
            stroke="oklch(0.7 0.04 70)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#parquet-pattern)" opacity="0.5" />
    </svg>
  );
}

/**
 * Pattern subtil de carreaux (alternative pour zones bar).
 */
export function TilesBg({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <pattern
          id="tiles-pattern"
          width="44"
          height="44"
          patternUnits="userSpaceOnUse"
        >
          <rect
            width="40"
            height="40"
            x="2"
            y="2"
            rx="2"
            fill="oklch(0.94 0.012 75)"
            stroke="oklch(0.86 0.02 75)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tiles-pattern)" opacity="0.6" />
    </svg>
  );
}
