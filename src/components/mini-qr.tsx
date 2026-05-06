type Props = {
  /** Token de la table — utilisé comme seed pour les cells */
  token: string;
  /** Taille en px */
  size?: number;
  /** Couleur primaire (cells) */
  color?: string;
  /** Couleur de l'accent (dot signature) */
  accent?: string;
  /** Couleur de fond */
  bg?: string;
  className?: string;
};

/**
 * Mini-QR décoratif (pas un vrai QR scannable, juste un visuel reconnaissable).
 * Genre 7x7 cells avec 3 locator squares + pattern déterministe par token.
 * Utile pour donner un visuel à chaque table sans appel réseau.
 */
export function MiniQr({
  token,
  size = 48,
  color = "var(--brand-forest)",
  accent = "var(--brand-orange)",
  bg = "var(--brand-cream)",
  className,
}: Props) {
  // Hash simple du token pour seed les cells
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
  }

  const GRID = 7;
  const total = GRID * GRID;

  // Locators : top-left, top-right, bottom-left (3x3 chacun)
  const isLocator = (i: number) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    return (
      (row < 3 && col < 3) ||
      (row < 3 && col >= GRID - 3) ||
      (row >= GRID - 3 && col < 3)
    );
  };
  const isLocatorOuter = (i: number) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    if (row < 3 && col < 3) return row === 0 || row === 2 || col === 0 || col === 2;
    if (row < 3 && col >= GRID - 3)
      return row === 0 || row === 2 || col === GRID - 3 || col === GRID - 1;
    if (row >= GRID - 3 && col < 3)
      return row === GRID - 3 || row === GRID - 1 || col === 0 || col === 2;
    return false;
  };
  const isLocatorInner = (i: number) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    return (
      (row === 1 && col === 1) ||
      (row === 1 && col === GRID - 2) ||
      (row === GRID - 2 && col === 1)
    );
  };

  // Bottom-right corner remplacé par dot accent
  const isAccentCorner = (i: number) => {
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    return row === GRID - 2 && col === GRID - 2;
  };

  // Pseudo-random pour les autres cells (déterministe par token)
  const isRandom = (i: number) => {
    const v = (hash * (i + 1) * 2654435761) >>> 0;
    return (v & 1) === 1;
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="100" height="100" rx="14" fill={bg} />
      {Array.from({ length: total }, (_, i) => {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        const cellSize = 88 / GRID;
        const x = 6 + col * cellSize;
        const y = 6 + row * cellSize;

        if (isAccentCorner(i)) {
          return (
            <circle
              key={i}
              cx={x + cellSize / 2}
              cy={y + cellSize / 2}
              r={cellSize / 2.2}
              fill={accent}
            />
          );
        }
        if (isLocatorOuter(i) || isLocatorInner(i)) {
          return (
            <rect
              key={i}
              x={x + 0.5}
              y={y + 0.5}
              width={cellSize - 1}
              height={cellSize - 1}
              rx={1}
              fill={color}
            />
          );
        }
        if (isLocator(i)) {
          // Inner empty space of locator
          return null;
        }
        if (isRandom(i)) {
          return (
            <rect
              key={i}
              x={x + 1}
              y={y + 1}
              width={cellSize - 2}
              height={cellSize - 2}
              rx={1}
              fill={color}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}
