"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Table } from "@/lib/db/schema";

type Props = {
  table: Table;
  /** Couleur principale (hex ou var) */
  color: string;
  /** Index pour léger random offset déterministe */
  index: number;
  onClick: () => void;
};

/**
 * Représente une table comme un cercle 3D avec ombre, label centré,
 * dot status, et 4 chairs autour. Click pour ouvrir le détail.
 */
export function TableShape({ table, color, index, onClick }: Props) {
  const prefersReduced = useReducedMotion();
  const inactive = !table.isActive;

  // Petit jitter déterministe pour que les tables aient l'air "naturelles"
  const seed = (index * 2654435761) >>> 0;
  const jitterX = ((seed % 11) - 5) * 1.2; // -6 à +6
  const jitterY = (((seed >> 8) % 11) - 5) * 1.2;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={prefersReduced ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover={prefersReduced ? undefined : { scale: 1.05, y: -4 }}
      whileTap={prefersReduced ? undefined : { scale: 0.97 }}
      style={{ transform: `translate(${jitterX}px, ${jitterY}px)` }}
      className={`group relative flex flex-col items-center justify-center ${
        inactive ? "opacity-40 grayscale" : ""
      }`}
      aria-label={`Table ${table.label}`}
    >
      {/* Chairs (4 petits rectangles autour) */}
      <span
        aria-hidden="true"
        className="absolute -top-2.5 left-1/2 h-3 w-7 -translate-x-1/2 rounded-t-md bg-stone-300 shadow-sm dark:bg-stone-600"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-2.5 left-1/2 h-3 w-7 -translate-x-1/2 rounded-b-md bg-stone-300 shadow-sm dark:bg-stone-600"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -left-2.5 h-7 w-3 -translate-y-1/2 rounded-l-md bg-stone-300 shadow-sm dark:bg-stone-600"
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-2.5 h-7 w-3 -translate-y-1/2 rounded-r-md bg-stone-300 shadow-sm dark:bg-stone-600"
      />

      {/* Table circulaire — surface bois */}
      <div
        className="relative flex size-20 items-center justify-center rounded-full shadow-[0_8px_20px_-4px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.4)] transition-shadow group-hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.35)]"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color}55, ${color}90 60%, ${color} 100%)`,
        }}
      >
        {/* Reflet circulaire */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 left-2 h-3 w-6 rounded-full bg-white/30 blur-sm"
        />

        {/* Label */}
        <span className="relative z-10 text-base font-bold tracking-tight text-white drop-shadow-sm">
          {table.label.length > 4 ? table.label.slice(0, 3) : table.label}
        </span>

        {/* Status dot top-right */}
        {table.isActive ? (
          <span className="absolute -top-0.5 -right-0.5 flex size-3">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-stone-400 ring-2 ring-white"
          />
        )}
      </div>

      {/* Sous-label : group si défini, plus petit */}
      {table.label.length > 4 ? (
        <span className="text-muted-foreground mt-1 max-w-[90px] truncate text-[10px]">
          {table.label}
        </span>
      ) : null}
    </motion.button>
  );
}
