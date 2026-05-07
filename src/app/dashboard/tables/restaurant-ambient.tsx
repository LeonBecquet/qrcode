"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  zoneColor: string;
  isBarLike: boolean;
};

/**
 * Décor d'ambiance restaurant — vraie scène habitée.
 * Tout est positionné absolument — les tables passent au-dessus en z:1.
 *
 * Couches :
 * - Murs implicites (inset shadow)
 * - Chandeliers suspendus animés au plafond avec cônes de lumière
 * - Badge entrée animé + cuisine/bar
 * - Plantes vertes en pots
 * - Fenêtre vitrée avec reflet
 * - Tableau noir avec menu manuscrit
 * - Cadre photo / wine rack selon zone
 * - Serveur animé qui traverse périodiquement
 */
export function RestaurantAmbient({ zoneColor, isBarLike }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {/* === Murs (inset shadow) === */}
      <div
        className="absolute inset-3 rounded-[28px]"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 12px 30px -10px rgba(0,0,0,0.08)",
        }}
      />

      {/* === Chandeliers suspendus au plafond (3 luminaires alignés) === */}
      <div className="absolute inset-x-0 top-0 flex justify-around px-[18%] pt-1">
        {[0, 1, 2].map((i) => (
          <Pendant key={i} delay={i * 0.3} prefersReduced={!!prefersReduced} />
        ))}
      </div>

      {/* === Entrée (top-left) === */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5">
        <div className="bg-card/95 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur">
          <DoorIcon className="size-3.5 text-stone-600 dark:text-stone-300" />
          <span className="text-foreground">Entrée</span>
          {!prefersReduced ? (
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-[var(--brand-orange)]"
            >
              →
            </motion.span>
          ) : (
            <span className="text-[var(--brand-orange)]">→</span>
          )}
        </div>
      </div>

      {/* === Cuisine ou Bar (top-right) === */}
      <div className="absolute top-3 right-3 sm:top-5 sm:right-5">
        <div className="bg-card/95 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur">
          {isBarLike ? (
            <>
              <BarIcon className="size-3.5" style={{ color: zoneColor }} />
              <span className="text-foreground">Bar</span>
            </>
          ) : (
            <>
              <KitchenIcon className="size-3.5" style={{ color: zoneColor }} />
              <span className="text-foreground">Cuisine</span>
            </>
          )}
          {!prefersReduced ? (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="size-1.5 rounded-full"
              style={{ background: zoneColor }}
            />
          ) : (
            <span
              className="size-1.5 rounded-full"
              style={{ background: zoneColor }}
            />
          )}
        </div>
      </div>

      {/* === Plante coin bas-gauche === */}
      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
        <PlantSvg className="size-12 sm:size-14 drop-shadow-md" />
      </div>

      {/* === Plante coin bas-droite === */}
      <div className="absolute right-3 bottom-3 sm:right-5 sm:bottom-5">
        <PlantSvg className="size-10 sm:size-12 drop-shadow-md" mirror />
      </div>

      {/* === Tableau noir menu (côté gauche, milieu) === */}
      <div className="absolute top-1/2 left-1.5 hidden -translate-y-1/2 sm:block lg:left-3">
        <ChalkboardSvg className="w-[78px] sm:w-[92px] drop-shadow-md" />
      </div>

      {/* === Wine rack ou fenêtre (côté droit, milieu) === */}
      <div className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 sm:block lg:right-3">
        {isBarLike ? (
          <WineRackSvg className="w-[68px] sm:w-[78px] drop-shadow-md" />
        ) : (
          <WindowSvg
            className="size-12 sm:size-14"
            color={zoneColor}
            prefersReduced={!!prefersReduced}
          />
        )}
      </div>

      {/* === Serveur animé qui traverse === */}
      {!prefersReduced ? <Waiter /> : null}
    </div>
  );
}

/* ─── Pendant lamp suspendu avec cône de lumière ─── */
function Pendant({
  delay,
  prefersReduced,
}: {
  delay: number;
  prefersReduced: boolean;
}) {
  return (
    <div className="relative">
      {/* Cordon */}
      <div
        className="mx-auto h-6 w-px sm:h-8"
        style={{ background: "rgba(0,0,0,0.35)" }}
      />
      {/* Abat-jour cuivre */}
      <div className="relative -mt-px flex justify-center">
        <div
          className="size-3 sm:size-4 rounded-b-full shadow-md"
          style={{
            background: "linear-gradient(180deg, #C9A55B, #8B6E2F)",
          }}
        />
        {/* Ampoule visible dessous */}
        <span
          className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full"
          style={{ background: "#FFE082", boxShadow: "0 0 6px #FFD27A" }}
        />
      </div>
      {/* Cône de lumière */}
      {!prefersReduced ? (
        <motion.div
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{
            duration: 3,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-full left-1/2 h-24 w-16 -translate-x-1/2 sm:h-32 sm:w-24"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,210,122,0.45), transparent 70%)",
          }}
        />
      ) : (
        <div
          className="absolute top-full left-1/2 h-24 w-16 -translate-x-1/2 sm:h-32 sm:w-24"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,210,122,0.4), transparent 70%)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Serveur animé (petit personnage qui traverse la salle) ─── */
function Waiter() {
  return (
    <motion.div
      initial={{ x: "-15%" }}
      animate={{ x: ["-15%", "115%"] }}
      transition={{
        duration: 16,
        repeat: Infinity,
        repeatDelay: 5,
        ease: "linear",
      }}
      className="absolute bottom-16 left-0 sm:bottom-20"
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <WaiterSvg className="size-12 drop-shadow-md" />
      </motion.div>
    </motion.div>
  );
}

function WaiterSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className}>
      {/* Tête */}
      <ellipse cx="30" cy="14" rx="6" ry="7" fill="#F1C8A5" />
      {/* Cheveux */}
      <path d="M24 12 Q30 4 36 12 L36 14 Q30 11 24 14 Z" fill="#3A2A1E" />
      {/* Corps (chemise blanche) */}
      <path
        d="M22 22 Q22 21 24 21 L36 21 Q38 21 38 22 L40 50 L20 50 Z"
        fill="#FFFFFF"
        stroke="#E5E5E5"
        strokeWidth="0.5"
      />
      {/* Tablier noir */}
      <path d="M22 32 L38 32 L40 50 L20 50 Z" fill="#1A1A18" />
      {/* Nœud de tablier */}
      <rect x="29" y="31" width="2" height="3" fill="#7C6B5E" />
      {/* Pantalon */}
      <rect x="22" y="50" width="7" height="20" fill="#2C2C2C" />
      <rect x="31" y="50" width="7" height="20" fill="#2C2C2C" />
      {/* Chaussures */}
      <ellipse cx="25.5" cy="72" rx="3.5" ry="1.5" fill="#1A1A18" />
      <ellipse cx="34.5" cy="72" rx="3.5" ry="1.5" fill="#1A1A18" />
      {/* Bras gauche tendu portant le plateau */}
      <path
        d="M22 24 L14 32 L14 36"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Plateau */}
      <ellipse cx="14" cy="30" rx="9" ry="2" fill="#8B5A3C" />
      <ellipse cx="14" cy="29" rx="9" ry="1.5" fill="#A87850" />
      {/* Plat sur le plateau */}
      <ellipse cx="11" cy="28" rx="2.5" ry="1" fill="#FFFFFF" />
      <ellipse cx="11" cy="28" rx="1.5" ry="0.6" fill="#E8DDD0" />
      <ellipse cx="17" cy="28.3" rx="1.8" ry="0.7" fill="#FFFFFF" />
      {/* Vapeur */}
      <g opacity="0.5">
        <path
          d="M11 26 Q10 24 11 22 Q12 20 11 18"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M17 26 Q18 24 17 22"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {/* Bras droit le long du corps */}
      <path
        d="M38 24 L42 38"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Nœud papillon */}
      <path d="M28 22 L30 21 L32 22 L30 23 Z" fill="#1A1A18" />
    </svg>
  );
}

/* ─── Tableau noir menu ─── */
function ChalkboardSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 92 110" className={className}>
      {/* Cadre bois */}
      <rect
        x="2"
        y="6"
        width="88"
        height="100"
        rx="3"
        fill="#6B4530"
        stroke="#4A2F20"
        strokeWidth="1"
      />
      {/* Tableau noir */}
      <rect x="6" y="10" width="80" height="92" rx="2" fill="#1F2A1F" />
      {/* Petit clou de fixation au-dessus */}
      <circle cx="46" cy="4" r="2" fill="#7C6B5E" />
      <line
        x1="46"
        y1="6"
        x2="46"
        y2="9"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="0.8"
      />
      {/* Titre "MENU" */}
      <text
        x="46"
        y="22"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="#F4EDE0"
        style={{ fontFamily: "Georgia, serif", letterSpacing: "1.5px" }}
      >
        MENU
      </text>
      {/* Trait sous le titre */}
      <line x1="20" y1="26" x2="72" y2="26" stroke="#F4EDE0" strokeWidth="0.6" />
      {/* Plats manuscrits */}
      <text
        x="46"
        y="38"
        textAnchor="middle"
        fontSize="6"
        fill="#E8A93C"
        style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
      >
        Soupe à l&apos;oignon
      </text>
      <text
        x="46"
        y="50"
        textAnchor="middle"
        fontSize="6"
        fill="#F4EDE0"
        style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
      >
        Steak frites
      </text>
      <text
        x="46"
        y="62"
        textAnchor="middle"
        fontSize="6"
        fill="#F4EDE0"
        style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
      >
        Magret canard
      </text>
      <text
        x="46"
        y="74"
        textAnchor="middle"
        fontSize="6"
        fill="#E8A93C"
        style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
      >
        Tarte tatin
      </text>
      {/* Étoile chef's special */}
      <text
        x="46"
        y="92"
        textAnchor="middle"
        fontSize="8"
        fill="#E8A93C"
      >
        ★
      </text>
    </svg>
  );
}

/* ─── Wine rack ─── */
function WineRackSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 78 110" className={className}>
      {/* Cadre bois */}
      <rect
        x="2"
        y="2"
        width="74"
        height="106"
        rx="3"
        fill="#6B4530"
        stroke="#4A2F20"
        strokeWidth="1"
      />
      {/* Étagères */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          {/* Niveau */}
          <line
            x1="6"
            y1={28 + row * 28}
            x2="72"
            y2={28 + row * 28}
            stroke="#4A2F20"
            strokeWidth="1"
          />
          {/* 3 bouteilles par étagère */}
          {[0, 1, 2].map((col) => (
            <g key={col} transform={`translate(${10 + col * 22}, ${10 + row * 28})`}>
              {/* Goulot */}
              <rect x="3" y="0" width="2" height="4" fill="#1A1A18" />
              {/* Capsule */}
              <rect x="2.5" y="-1" width="3" height="2" fill="#C9A55B" />
              {/* Corps bouteille */}
              <rect
                x="1"
                y="4"
                width="6"
                height="14"
                rx="1"
                fill={col === 0 ? "#3D2818" : col === 1 ? "#4A1F1F" : "#1F2A1F"}
              />
              {/* Étiquette */}
              <rect x="1" y="9" width="6" height="4" fill="#F4EDE0" opacity="0.85" />
            </g>
          ))}
        </g>
      ))}
      {/* Verre suspendu en bas */}
      <g transform="translate(28, 92)">
        <path
          d="M0 0 L20 0 L17 8 L3 8 Z"
          fill="rgba(255,255,255,0.15)"
          stroke="#F4EDE0"
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />
        <line x1="10" y1="8" x2="10" y2="14" stroke="#F4EDE0" strokeOpacity="0.6" strokeWidth="0.5" />
        <ellipse cx="10" cy="14" rx="3" ry="0.6" fill="#F4EDE0" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ─── Icônes simples ─── */

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect
        x="5"
        y="3"
        width="14"
        height="18"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function KitchenIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M6 14h12M7 14v5h10v-5M9 7c0-2 1.5-3 3-3s3 1 3 3M5 14c0-2 1.5-3.5 3-3.5h8c1.5 0 3 1.5 3 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BarIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M5 4h14l-5 8v6m-2 0h4M9 18h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlantSvg({ className, mirror }: { className?: string; mirror?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Pot */}
      <path
        d="M22 42 L38 42 L36 56 L24 56 Z"
        fill="#8B5A3C"
        stroke="#6B4530"
        strokeWidth="1"
      />
      <ellipse cx="30" cy="42" rx="8" ry="2" fill="#6B4530" />
      {/* Feuilles */}
      <ellipse
        cx="22"
        cy="32"
        rx="7"
        ry="14"
        fill="#5C7C5A"
        transform="rotate(-25 22 32)"
      />
      <ellipse
        cx="38"
        cy="32"
        rx="7"
        ry="14"
        fill="#3D5C44"
        transform="rotate(25 38 32)"
      />
      <ellipse cx="30" cy="22" rx="6" ry="16" fill="#4F6B4A" />
      <ellipse cx="30" cy="22" rx="2" ry="12" fill="#6A8A66" opacity="0.6" />
    </svg>
  );
}

function WindowSvg({
  className,
  color,
  prefersReduced,
}: {
  className?: string;
  color: string;
  prefersReduced: boolean;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* Cadre */}
      <div
        className="absolute inset-0 rounded-md border-4"
        style={{ borderColor: "#8B5A3C" }}
      />
      {/* Vitre */}
      <div
        className="absolute inset-1 rounded-sm"
        style={{
          background: `linear-gradient(135deg, ${color}40 0%, #FFE7BD 60%, ${color}30 100%)`,
        }}
      />
      {/* Croisillon */}
      <div
        className="absolute inset-1 rounded-sm"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 49%, #8B5A3C 49%, #8B5A3C 51%, transparent 51%), linear-gradient(90deg, transparent 49%, #8B5A3C 49%, #8B5A3C 51%, transparent 51%)",
        }}
      />
      {/* Reflet animé */}
      {!prefersReduced ? (
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-1 rounded-sm"
          style={{
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)",
          }}
        />
      ) : null}
    </div>
  );
}
