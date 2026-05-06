type Props = {
  values: number[];
  height?: number;
  color?: string;
  fillOpacity?: number;
  className?: string;
};

/**
 * Mini-graph SVG en area + ligne. Pas de dépendance, pas d'animation lourde.
 */
export function Sparkline({
  values,
  height = 40,
  color = "var(--brand-orange)",
  fillOpacity = 0.18,
  className,
}: Props) {
  if (values.length === 0) {
    return (
      <div
        className={className}
        style={{ height }}
        aria-label="Pas de données"
      />
    );
  }

  const width = 100;
  const max = Math.max(1, ...values);
  const stepX = values.length > 1 ? width / (values.length - 1) : width;
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - (v / max) * height;
    return { x, y };
  });

  // Smooth path via quadratic curves
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      const prev = points[i - 1]!;
      const midX = (prev.x + p.x) / 2;
      return `Q${prev.x.toFixed(2)},${prev.y.toFixed(2)} ${midX.toFixed(2)},${((prev.y + p.y) / 2).toFixed(2)} T${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");

  const areaPath = `${linePath} L${(points[points.length - 1]!.x).toFixed(2)},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ height, width: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark-grad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1]!.x}
        cy={points[points.length - 1]!.y}
        r="2"
        fill={color}
      />
    </svg>
  );
}
