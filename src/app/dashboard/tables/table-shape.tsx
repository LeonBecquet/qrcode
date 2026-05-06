"use client";

import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { Table } from "@/lib/db/schema";

type Props = {
  table: Table;
  color: string;
  index: number;
  onClick: () => void;
};

/**
 * Table 3D : surface bois avec reflets, 4 chaises, dot status, ombre au sol.
 * Animations : float continu individuel + 3D tilt mouse-tracked au hover + shimmer.
 */
export function TableShape({ table, color, index, onClick }: Props) {
  const prefersReduced = useReducedMotion();
  const inactive = !table.isActive;

  // Mouse tracking pour 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  // Jitter + float delay déterministes
  const seed = (index * 2654435761) >>> 0;
  const jitterX = ((seed % 11) - 5) * 1.2;
  const jitterY = (((seed >> 8) % 11) - 5) * 1.2;
  const floatDelay = (seed % 1000) / 1000;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      style={{ transform: `translate(${jitterX}px, ${jitterY}px)` }}
      className="relative flex flex-col items-center justify-center"
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Table ${table.label}`}
        className={`group cursor-pointer focus:outline-none ${
          inactive ? "opacity-40 grayscale" : ""
        }`}
        style={{ perspective: 800 }}
      >
        <motion.div
          style={{
            rotateX: prefersReduced ? 0 : rotateX,
            rotateY: prefersReduced ? 0 : rotateY,
            transformStyle: "preserve-3d",
            animation: prefersReduced
              ? undefined
              : `float-slow 4s ease-in-out ${floatDelay}s infinite`,
          }}
          whileHover={prefersReduced ? undefined : { scale: 1.08 }}
          whileTap={prefersReduced ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          {/* Chairs avec gradient + transition au hover */}
          <span
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 h-3 w-7 -translate-x-1/2 rounded-t-md bg-gradient-to-b from-stone-300 to-stone-400 shadow-md transition-transform duration-300 group-hover:-translate-y-0.5 dark:from-stone-500 dark:to-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-2.5 left-1/2 h-3 w-7 -translate-x-1/2 rounded-b-md bg-gradient-to-t from-stone-300 to-stone-400 shadow-md transition-transform duration-300 group-hover:translate-y-0.5 dark:from-stone-500 dark:to-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-2.5 h-7 w-3 -translate-y-1/2 rounded-l-md bg-gradient-to-r from-stone-300 to-stone-400 shadow-md transition-transform duration-300 group-hover:-translate-x-0.5 dark:from-stone-500 dark:to-stone-600"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-2.5 h-7 w-3 -translate-y-1/2 rounded-r-md bg-gradient-to-l from-stone-300 to-stone-400 shadow-md transition-transform duration-300 group-hover:translate-x-0.5 dark:from-stone-500 dark:to-stone-600"
          />

          {/* Surface table 3D */}
          <div
            className="relative flex size-20 items-center justify-center overflow-hidden rounded-full shadow-[0_10px_24px_-4px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(0,0,0,0.15)] transition-shadow duration-300 group-hover:shadow-[0_20px_40px_-4px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(0,0,0,0.15)]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${color}66, ${color}aa 50%, ${color} 100%)`,
            }}
          >
            {/* Reflet */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1.5 left-2 h-3 w-7 rounded-full bg-white/40 blur-sm"
            />

            {/* Shimmer au hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100"
            />

            {/* Label */}
            <span className="relative z-10 text-base font-bold tracking-tight text-white drop-shadow-md">
              {table.label.length > 4 ? table.label.slice(0, 3) : table.label}
            </span>

            {/* Status dot pulsing */}
            {table.isActive ? (
              <span className="absolute -top-0.5 -right-0.5 flex size-3">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative size-3 rounded-full bg-emerald-400 shadow-md ring-2 ring-white" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-stone-400 ring-2 ring-white"
              />
            )}
          </div>

          {/* Glow ring au hover */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -m-3 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60"
            style={{ background: color }}
          />

          {/* Reflection sur le sol */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2 left-1/2 h-2 w-16 -translate-x-1/2 scale-y-[0.4] rounded-full opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-50"
            style={{ background: color }}
          />
        </motion.div>

        {table.label.length > 4 ? (
          <span className="text-muted-foreground mt-2 block max-w-[90px] truncate text-center text-[10px]">
            {table.label}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
