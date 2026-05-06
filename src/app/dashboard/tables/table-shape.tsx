"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Table } from "@/lib/db/schema";

type Props = {
  table: Table;
  color: string;
  index: number;
  onClick: () => void;
};

/**
 * Table en vue isométrique 2.5D, full SVG :
 * - Ombre portée elliptique nette
 * - 4 chaises (ellipses + dossiers) disposées autour
 * - Plateau de table avec gradient + reflet
 * - Label centré gravé sur le plateau
 */
export function TableShape({ table, color, index, onClick }: Props) {
  const prefersReduced = useReducedMotion();
  const inactive = !table.isActive;

  // Float delay pour rythme individuel
  const seed = (index * 2654435761) >>> 0;
  const floatDelay = (seed % 1000) / 1000;
  const jitterX = ((seed % 11) - 5) * 1.2;
  const jitterY = (((seed >> 8) % 11) - 5) * 1.2;

  // Couleur foncée pour l'ombre du plateau (mix avec noir)
  const labelText =
    table.label.length > 3 ? table.label.slice(0, 3) : table.label;
  const subLabel = table.label.length > 3 ? table.label : null;

  // ID unique pour les gradients SVG (pour pas qu'ils se mélangent entre tables)
  const gid = `tbl-${table.id.slice(0, 8)}`;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.6, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      style={{ transform: `translate(${jitterX}px, ${jitterY}px)` }}
      className="relative flex flex-col items-center"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Table ${table.label}`}
        className={`group cursor-pointer focus:outline-none ${
          inactive ? "opacity-40 grayscale" : ""
        }`}
      >
        <motion.div
          style={{
            animation: prefersReduced
              ? undefined
              : `float-slow 5s ease-in-out ${floatDelay}s infinite`,
          }}
          whileHover={prefersReduced ? undefined : { scale: 1.08, y: -4 }}
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <svg
            viewBox="0 0 140 140"
            className="size-[120px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:drop-shadow-[0_16px_32px_rgba(0,0,0,0.28)]"
          >
            <defs>
              <radialGradient id={`${gid}-top`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="60%" stopColor={color} stopOpacity="0.95" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.25" />
              </radialGradient>
              <linearGradient id={`${gid}-side`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id={`${gid}-shine`} cx="35%" cy="25%" r="40%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${gid}-chair`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8DDD0" />
                <stop offset="100%" stopColor="#B8A99A" />
              </linearGradient>
              <linearGradient id={`${gid}-chair-dark`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A8978A" />
                <stop offset="100%" stopColor="#7C6D5F" />
              </linearGradient>
            </defs>

            {/* Ombre portée au sol (elliptique floue) */}
            <ellipse
              cx="70"
              cy="118"
              rx="48"
              ry="9"
              fill="rgba(0,0,0,0.18)"
              filter="blur(2px)"
              className="transition-all duration-300 group-hover:opacity-60"
            />

            {/* Chaise top (derrière) */}
            <g className="transition-transform duration-300 group-hover:-translate-y-0.5">
              <ellipse cx="70" cy="32" rx="14" ry="6" fill={`url(#${gid}-chair-dark)`} />
              <ellipse cx="70" cy="30" rx="14" ry="6" fill={`url(#${gid}-chair)`} />
              <rect
                x="62"
                y="22"
                width="16"
                height="3"
                rx="1.5"
                fill={`url(#${gid}-chair-dark)`}
              />
            </g>

            {/* Chaise gauche */}
            <g className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <ellipse cx="28" cy="73" rx="10" ry="9" fill={`url(#${gid}-chair-dark)`} />
              <ellipse cx="28" cy="72" rx="10" ry="9" fill={`url(#${gid}-chair)`} />
            </g>

            {/* Chaise droite */}
            <g className="transition-transform duration-300 group-hover:translate-x-0.5">
              <ellipse cx="112" cy="73" rx="10" ry="9" fill={`url(#${gid}-chair-dark)`} />
              <ellipse cx="112" cy="72" rx="10" ry="9" fill={`url(#${gid}-chair)`} />
            </g>

            {/* Pied table (côté foncé) */}
            <ellipse cx="70" cy="80" rx="38" ry="11" fill={`url(#${gid}-side)`} />
            <rect x="32" y="73" width="76" height="8" fill={`url(#${gid}-side)`} />

            {/* Plateau table (haut) */}
            <ellipse
              cx="70"
              cy="73"
              rx="38"
              ry="11"
              fill={`url(#${gid}-top)`}
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="0.5"
            />

            {/* Reflet sur le plateau */}
            <ellipse
              cx="58"
              cy="69"
              rx="22"
              ry="6"
              fill={`url(#${gid}-shine)`}
              className="transition-opacity duration-300 group-hover:opacity-100"
              opacity="0.7"
            />

            {/* Shimmer effect au hover */}
            <ellipse
              cx="70"
              cy="73"
              rx="38"
              ry="11"
              fill="url(#shimmer-grad)"
              className="opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            >
              <animate
                attributeName="cx"
                from="30"
                to="110"
                dur="0.8s"
                repeatCount="0"
              />
            </ellipse>

            {/* Label central gravé */}
            <text
              x="70"
              y="76"
              textAnchor="middle"
              className="font-bold"
              style={{
                fontSize: 11,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fill: "white",
                paintOrder: "stroke fill",
                stroke: "rgba(0,0,0,0.25)",
                strokeWidth: 0.5,
              }}
            >
              {labelText}
            </text>

            {/* Chaise bas (devant - dessinée en dernier pour overlay) */}
            <g className="transition-transform duration-300 group-hover:translate-y-0.5">
              <ellipse cx="70" cy="113" rx="14" ry="6" fill={`url(#${gid}-chair-dark)`} />
              <ellipse cx="70" cy="112" rx="14" ry="6" fill={`url(#${gid}-chair)`} />
            </g>
          </svg>

          {/* Glow ring au hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[35%] left-1/2 size-24 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
            style={{ background: color }}
          />
        </motion.div>

        {/* Status badge en dessous (au lieu de sur la table) */}
        <div className="mt-1 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-foreground text-xs font-bold tracking-tight">
              {subLabel ?? table.label}
            </span>
            {table.isActive ? (
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative size-1.5 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="size-1.5 rounded-full bg-stone-400" />
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
