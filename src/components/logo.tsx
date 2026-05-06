import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
  /**
   * "mark" : juste le carré logo (favicon, header compact)
   * "full" : logo + nom de marque côte à côte
   */
  variant?: "mark" | "full";
};

/**
 * Logo QR Restaurant : carré noir arrondi avec un mini-QR pattern
 * et un dot terracotta signature dans le coin bas-droit.
 *
 * Le dot remplace le 4ème "locator" classique d'un QR — c'est notre touche.
 */
export function Logo({ className, size = 32, variant = "mark" }: Props) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="QR Restaurant"
      className="shrink-0"
    >
      {/* Carré vert forêt */}
      <rect width="100" height="100" rx="22" fill="#1F4F1F" />

      {/* Locators QR — coin haut-gauche (crème) */}
      <rect x="14" y="14" width="22" height="22" rx="3" fill="#FFF6E0" />
      <rect x="20" y="20" width="10" height="10" rx="1.5" fill="#1F4F1F" />

      {/* Locator coin haut-droit (safran pour pep) */}
      <rect x="64" y="14" width="22" height="22" rx="3" fill="#F5C342" />
      <rect x="70" y="20" width="10" height="10" rx="1.5" fill="#1F4F1F" />

      {/* Locator coin bas-gauche (crème) */}
      <rect x="14" y="64" width="22" height="22" rx="3" fill="#FFF6E0" />
      <rect x="20" y="70" width="10" height="10" rx="1.5" fill="#1F4F1F" />

      {/* Notre signature : dot orange brûlé à la place du 4ème locator */}
      <circle cx="75" cy="75" r="11" fill="#EE8033" />

      {/* Data cells au centre — petit clin d'œil, comme une assiette stylisée */}
      <rect x="46" y="46" width="8" height="8" rx="1.5" fill="#FFF6E0" />
      <rect x="58" y="54" width="8" height="8" rx="1.5" fill="#D04A33" />
      <rect x="46" y="58" width="6" height="6" rx="1.5" fill="#F5C342" />
    </svg>
  );

  if (variant === "mark") {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      {mark}
      <span className="text-base font-semibold tracking-tight">QR Restaurant</span>
    </span>
  );
}
