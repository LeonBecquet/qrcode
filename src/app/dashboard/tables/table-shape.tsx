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
 * Table en vue isométrique 2.5D, full SVG.
 *
 * Mobilier :
 * - Plateau en bois de chêne (gradient + lignes de grain)
 * - 4 chaises bistrot avec assise bois + coussin couleur de zone
 * - Pied central type pedestal
 * - Sous-verre couleur de zone au centre avec le label
 *
 * Dressage :
 * - 2 sets en lin, 2 assiettes liserées, couverts (fourchette/couteau),
 *   2 verres à vin (rouge), bougie centrale avec flamme animée
 *
 * Couleur de zone = utilisée seulement pour cushions + sous-verre + accent
 * (le bois reste cohérent entre toutes les zones, c'est le mobilier resto).
 */
export function TableShape({ table, color, index, onClick }: Props) {
  const prefersReduced = useReducedMotion();
  const inactive = !table.isActive;

  // Float delay pour rythme individuel
  const seed = (index * 2654435761) >>> 0;
  const floatDelay = (seed % 1000) / 1000;
  const jitterX = ((seed % 11) - 5) * 1.2;
  const jitterY = (((seed >> 8) % 11) - 5) * 1.2;

  const labelText =
    table.label.length > 3 ? table.label.slice(0, 3) : table.label;
  const subLabel = table.label.length > 3 ? table.label : null;

  // ID unique pour les gradients SVG
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
            className="size-[130px] drop-shadow-[0_10px_20px_rgba(60,40,20,0.22)] transition-all duration-300 group-hover:drop-shadow-[0_18px_36px_rgba(60,40,20,0.32)]"
          >
            <defs>
              {/* Plateau bois chêne — gradient radial chaud */}
              <radialGradient id={`${gid}-top`} cx="40%" cy="32%" r="70%">
                <stop offset="0%" stopColor="#D4B080" />
                <stop offset="50%" stopColor="#B89875" />
                <stop offset="100%" stopColor="#7C5A3F" />
              </radialGradient>

              {/* Côté bois — plus foncé (noyer) */}
              <linearGradient id={`${gid}-side`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5A3C" />
                <stop offset="100%" stopColor="#3A2418" />
              </linearGradient>

              {/* Reflet sur le plateau */}
              <radialGradient id={`${gid}-shine`} cx="32%" cy="22%" r="40%">
                <stop offset="0%" stopColor="#FFF4E0" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFF4E0" stopOpacity="0" />
              </radialGradient>

              {/* Bois assise chaise */}
              <radialGradient id={`${gid}-seat`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#C9A77B" />
                <stop offset="100%" stopColor="#7C5A3F" />
              </radialGradient>

              {/* Bois assise foncé (côté) */}
              <linearGradient id={`${gid}-seat-side`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5A3C" />
                <stop offset="100%" stopColor="#4A2F20" />
              </linearGradient>

              {/* Coussin couleur de zone */}
              <radialGradient id={`${gid}-cushion`} cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="60%" stopColor={color} stopOpacity="0.92" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </radialGradient>

              {/* Sous-verre central */}
              <radialGradient id={`${gid}-coaster`} cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor={color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={color} stopOpacity="0.7" />
              </radialGradient>

              {/* Pattern grain de bois (lignes horizontales très fines) */}
              <pattern
                id={`${gid}-grain`}
                x="0"
                y="0"
                width="6"
                height="3"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="6"
                  y2="0.6"
                  stroke="#5C3D1F"
                  strokeWidth="0.2"
                  opacity="0.25"
                />
                <line
                  x1="0"
                  y1="1.8"
                  x2="6"
                  y2="2.2"
                  stroke="#3A2418"
                  strokeWidth="0.15"
                  opacity="0.18"
                />
              </pattern>
            </defs>

            {/* === Ombre portée diffuse au sol === */}
            <ellipse
              cx="70"
              cy="120"
              rx="50"
              ry="10"
              fill="rgba(40,25,15,0.28)"
              filter="blur(2.5px)"
              className="transition-all duration-300 group-hover:opacity-70"
            />
            <ellipse
              cx="70"
              cy="120"
              rx="44"
              ry="7"
              fill="rgba(40,25,15,0.22)"
              filter="blur(1px)"
            />

            {/* === Chaise top (derrière) === */}
            <g className="transition-transform duration-300 group-hover:-translate-y-0.5">
              {/* Dossier visible au-dessus de l'assise */}
              <rect
                x="60"
                y="20"
                width="20"
                height="2.5"
                rx="1"
                fill={`url(#${gid}-seat-side)`}
              />
              <rect x="61" y="22" width="18" height="6" rx="1" fill={`url(#${gid}-seat)`} />
              {/* Pieds visibles sous le dossier */}
              <line
                x1="63"
                y1="29"
                x2="63"
                y2="34"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="77"
                y1="29"
                x2="77"
                y2="34"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Assise bois (ombre puis dessus) */}
              <ellipse cx="70" cy="34" rx="14" ry="5.5" fill={`url(#${gid}-seat-side)`} />
              <ellipse cx="70" cy="32" rx="14" ry="5.5" fill={`url(#${gid}-seat)`} />
              {/* Coussin couleur de zone */}
              <ellipse cx="70" cy="31.5" rx="11" ry="4" fill={`url(#${gid}-cushion)`} />
              {/* Reflet doux sur coussin */}
              <ellipse
                cx="67"
                cy="30.5"
                rx="6"
                ry="1.6"
                fill="#FFFFFF"
                opacity="0.18"
              />
            </g>

            {/* === Chaise gauche === */}
            <g className="transition-transform duration-300 group-hover:-translate-x-0.5">
              {/* Dossier (côté gauche) */}
              <rect
                x="17"
                y="68"
                width="3"
                height="11"
                rx="1"
                fill={`url(#${gid}-seat-side)`}
              />
              {/* Pieds */}
              <line
                x1="22"
                y1="80"
                x2="22"
                y2="85"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="34"
                y1="80"
                x2="34"
                y2="85"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Assise */}
              <ellipse cx="28" cy="76" rx="10" ry="9" fill={`url(#${gid}-seat-side)`} />
              <ellipse cx="28" cy="74" rx="10" ry="9" fill={`url(#${gid}-seat)`} />
              {/* Coussin */}
              <ellipse cx="28" cy="73.5" rx="7.8" ry="6.5" fill={`url(#${gid}-cushion)`} />
              <ellipse cx="26" cy="71.5" rx="4" ry="2" fill="#FFFFFF" opacity="0.18" />
            </g>

            {/* === Chaise droite === */}
            <g className="transition-transform duration-300 group-hover:translate-x-0.5">
              {/* Dossier (côté droit) */}
              <rect
                x="120"
                y="68"
                width="3"
                height="11"
                rx="1"
                fill={`url(#${gid}-seat-side)`}
              />
              {/* Pieds */}
              <line
                x1="106"
                y1="80"
                x2="106"
                y2="85"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="118"
                y1="80"
                x2="118"
                y2="85"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Assise */}
              <ellipse cx="112" cy="76" rx="10" ry="9" fill={`url(#${gid}-seat-side)`} />
              <ellipse cx="112" cy="74" rx="10" ry="9" fill={`url(#${gid}-seat)`} />
              {/* Coussin */}
              <ellipse cx="112" cy="73.5" rx="7.8" ry="6.5" fill={`url(#${gid}-cushion)`} />
              <ellipse cx="110" cy="71.5" rx="4" ry="2" fill="#FFFFFF" opacity="0.18" />
            </g>

            {/* === Pied central de la table (pedestal) === */}
            <rect
              x="64"
              y="83"
              width="12"
              height="20"
              fill={`url(#${gid}-side)`}
            />
            {/* Base pedestal — soucoupe au sol */}
            <ellipse
              cx="70"
              cy="105"
              rx="14"
              ry="3"
              fill={`url(#${gid}-side)`}
            />
            <ellipse
              cx="70"
              cy="103.5"
              rx="14"
              ry="3"
              fill="#5C3D1F"
            />

            {/* === Côté table (épaisseur du plateau) === */}
            <ellipse cx="70" cy="79" rx="38" ry="11" fill={`url(#${gid}-side)`} />
            <rect x="32" y="73" width="76" height="6.5" fill={`url(#${gid}-side)`} />

            {/* === Plateau table (haut) === */}
            <ellipse
              cx="70"
              cy="73"
              rx="38"
              ry="11"
              fill={`url(#${gid}-top)`}
              stroke="#5C3D1F"
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />

            {/* Grain de bois — texture overlay */}
            <ellipse
              cx="70"
              cy="73"
              rx="38"
              ry="11"
              fill={`url(#${gid}-grain)`}
              opacity="0.6"
            />

            {/* Cernes du bois (lignes courbes) */}
            <g opacity="0.15" stroke="#3A2418" strokeWidth="0.3" fill="none">
              <path d="M 35 73 Q 50 68, 65 73 T 95 73 T 105 73" />
              <path d="M 35 75 Q 55 71, 70 76 T 105 73" />
              <path d="M 38 70 Q 60 75, 80 70 T 102 72" />
            </g>

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

            {/* === Dressage : sets en lin === */}
            <ellipse cx="56" cy="73" rx="9" ry="3.5" fill="#FFFFFF" opacity="0.45" />
            <ellipse cx="86" cy="73" rx="8" ry="3" fill="#FFFFFF" opacity="0.4" />

            {/* Couverts à gauche */}
            <g stroke="#9A8A6E" strokeWidth="0.55" strokeLinecap="round">
              {/* Fourchette */}
              <line x1="48" y1="71.5" x2="50" y2="76" />
              <line x1="48.5" y1="71.5" x2="50.3" y2="76" opacity="0.6" />
              {/* Couteau */}
              <line x1="62.5" y1="71.5" x2="64" y2="76" />
            </g>
            {/* Couverts à droite */}
            <g stroke="#9A8A6E" strokeWidth="0.5" strokeLinecap="round" opacity="0.85">
              <line x1="79.5" y1="71.5" x2="81" y2="75.5" />
              <line x1="91.5" y1="71.5" x2="92.8" y2="75.5" />
            </g>

            {/* Assiette gauche */}
            <ellipse cx="56" cy="73" rx="4.8" ry="2" fill="#FFFFFF" />
            <ellipse cx="56" cy="73" rx="3.5" ry="1.4" fill="#F4EDE0" />
            <ellipse cx="55" cy="72.5" rx="0.8" ry="0.3" fill="#FFFFFF" opacity="0.6" />
            {/* Serviette pliée sur l'assiette gauche */}
            <path
              d="M54 73 L58 73 L57 71.5 L55 71.5 Z"
              fill={color}
              opacity="0.85"
            />

            {/* Assiette droite */}
            <ellipse cx="86" cy="73" rx="4" ry="1.6" fill="#FFFFFF" />
            <ellipse cx="86" cy="73" rx="2.8" ry="1.05" fill="#F4EDE0" />

            {/* Verre à vin gauche */}
            <g>
              <ellipse cx="60" cy="68.5" rx="1.6" ry="0.6" fill="#7E2F2A" opacity="0.9" />
              <path
                d="M58.5 68.5 Q60 70.4 60 71.5 L60 72.5"
                stroke="#5C3D1F"
                strokeWidth="0.45"
                fill="none"
                strokeLinecap="round"
              />
              {/* Reflet sur le verre */}
              <line
                x1="59.2"
                y1="68"
                x2="59.4"
                y2="68.8"
                stroke="#FFE7BD"
                strokeWidth="0.3"
                opacity="0.7"
                strokeLinecap="round"
              />
            </g>

            {/* Verre à vin droite */}
            <g opacity="0.9">
              <ellipse cx="89" cy="68.8" rx="1.3" ry="0.5" fill="#7E2F2A" />
              <path
                d="M88 68.8 Q89 70.2 89 71.2 L89 72"
                stroke="#5C3D1F"
                strokeWidth="0.4"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* === Sous-verre central avec label === */}
            <ellipse
              cx="70"
              cy="74"
              rx="6.5"
              ry="2.4"
              fill={`url(#${gid}-coaster)`}
              stroke="#5C3D1F"
              strokeOpacity="0.3"
              strokeWidth="0.4"
            />
            {/* Reflet sous-verre */}
            <ellipse
              cx="68.5"
              cy="73.4"
              rx="3"
              ry="0.7"
              fill="#FFFFFF"
              opacity="0.25"
            />
            {/* Label sur le sous-verre */}
            <text
              x="70"
              y="76"
              textAnchor="middle"
              style={{
                fontSize: 8,
                fontFamily: "system-ui, -apple-system, sans-serif",
                fill: "#FFFFFF",
                paintOrder: "stroke fill",
                stroke: "rgba(0,0,0,0.35)",
                strokeWidth: 0.4,
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              {labelText}
            </text>

            {/* === Bougie centrale (au-dessus du sous-verre) === */}
            <g>
              {/* Soucoupe sous bougie */}
              <ellipse cx="71" cy="68.5" rx="1.8" ry="0.65" fill="#5C3D1F" />
              {/* Cire bougie */}
              <rect x="70.3" y="65.5" width="1.4" height="3.5" fill="#F4EDE0" />
              <rect
                x="70.3"
                y="65.5"
                width="1.4"
                height="0.4"
                fill="#E8DDD0"
              />
              {/* Mèche */}
              <line
                x1="71"
                y1="64.8"
                x2="71"
                y2="65.5"
                stroke="#3A2418"
                strokeWidth="0.3"
              />
              {/* Halo de la flamme */}
              {!prefersReduced ? (
                <circle cx="71" cy="64" r="2.2" fill="#FFB347" opacity="0.25">
                  <animate
                    attributeName="r"
                    values="2;2.5;2"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.2;0.35;0.2"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              ) : (
                <circle cx="71" cy="64" r="2.2" fill="#FFB347" opacity="0.25" />
              )}
              {/* Flamme */}
              <ellipse cx="71" cy="64" rx="0.55" ry="1.1" fill="#FFB347" opacity="0.95">
                {!prefersReduced ? (
                  <animate
                    attributeName="ry"
                    values="0.9;1.2;0.9"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </ellipse>
              <ellipse cx="71" cy="63.7" rx="0.3" ry="0.7" fill="#FFE082" opacity="0.95" />
            </g>

            {/* === Chaise bas (devant) === */}
            <g className="transition-transform duration-300 group-hover:translate-y-0.5">
              {/* Pieds visibles devant */}
              <line
                x1="63"
                y1="116"
                x2="63"
                y2="121"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <line
                x1="77"
                y1="116"
                x2="77"
                y2="121"
                stroke="#3A2418"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Assise */}
              <ellipse cx="70" cy="115" rx="14" ry="5.5" fill={`url(#${gid}-seat-side)`} />
              <ellipse cx="70" cy="113" rx="14" ry="5.5" fill={`url(#${gid}-seat)`} />
              {/* Coussin */}
              <ellipse cx="70" cy="112.5" rx="11" ry="4" fill={`url(#${gid}-cushion)`} />
              <ellipse cx="67" cy="111.5" rx="6" ry="1.6" fill="#FFFFFF" opacity="0.2" />
            </g>
          </svg>

          {/* Glow ring au hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-[35%] left-1/2 size-24 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
            style={{ background: color }}
          />
        </motion.div>

        {/* Status badge en dessous */}
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
