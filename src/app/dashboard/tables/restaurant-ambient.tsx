"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  zoneColor: string;
  isBarLike: boolean;
};

/**
 * Décor d'ambiance restaurant qui s'overlaye sur le canvas du plan de salle.
 * Tout est positionné absolument — les tables passent au-dessus en z:1.
 *
 * Éléments :
 * - Murs implicites via inner shadow + coins arrondis
 * - Porte d'entrée animée (top-left) avec flèche pulse
 * - Pass cuisine ou bar (top-right) selon zone
 * - Plantes vertes dans les coins inférieurs
 * - Petite fenêtre lumineuse (côté)
 */
export function RestaurantAmbient({ zoneColor, isBarLike }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {/* Inner walls — shadow inset pour donner sensation de pièce */}
      <div
        className="absolute inset-3 rounded-[28px]"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.06), inset 0 12px 30px -10px rgba(0,0,0,0.08)",
        }}
      />

      {/* === Entrée (top-left) === */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
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
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="bg-card/95 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur">
          {isBarLike ? (
            <>
              <BarIcon
                className="size-3.5"
                style={{ color: zoneColor }}
              />
              <span className="text-foreground">Bar</span>
            </>
          ) : (
            <>
              <KitchenIcon
                className="size-3.5"
                style={{ color: zoneColor }}
              />
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
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
        <PlantSvg className="size-12 sm:size-14 drop-shadow-md" />
      </div>

      {/* === Plante coin bas-droite === */}
      <div className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6">
        <PlantSvg className="size-10 sm:size-12 drop-shadow-md" mirror />
      </div>

      {/* === Fenêtre lumineuse au mur droit === */}
      <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 sm:block">
        <WindowSvg className="size-10" color={zoneColor} prefersReduced={!!prefersReduced} />
      </div>

      {/* === Décor mural gauche (cadre photo) === */}
      <div className="absolute top-1/3 left-2 hidden -translate-y-1/2 sm:block">
        <div
          className="bg-card/80 rounded-md border-2 p-1 shadow-sm backdrop-blur"
          style={{ borderColor: `${zoneColor}40` }}
        >
          <div
            className="size-7 rounded-sm"
            style={{
              background: `linear-gradient(135deg, ${zoneColor}30, ${zoneColor}60)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

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
      <ellipse
        cx="30"
        cy="22"
        rx="2"
        ry="12"
        fill="#6A8A66"
        opacity="0.6"
      />
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
