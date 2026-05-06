"use client";

import { motion } from "motion/react";
import { ParquetBg } from "@/components/parquet-bg";

/**
 * Plan fantôme — empty state visuel avec tables en pointillés qui pulse.
 * Donne un aperçu de ce que la page deviendra une fois remplie.
 */
export function EmptyFloor() {
  // Positions des tables fantômes (en %)
  const ghosts = [
    { x: 18, y: 30, delay: 0 },
    { x: 38, y: 30, delay: 0.3 },
    { x: 58, y: 30, delay: 0.6 },
    { x: 78, y: 30, delay: 0.9 },
    { x: 28, y: 65, delay: 0.2 },
    { x: 48, y: 65, delay: 0.5 },
    { x: 68, y: 65, delay: 0.8 },
  ];

  return (
    <div className="bg-card relative overflow-hidden rounded-3xl border shadow-sm">
      {/* Background parquet */}
      <ParquetBg className="opacity-30" />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* Header */}
      <div className="bg-card/95 relative flex items-center justify-between gap-3 border-b px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="bg-stone-200 dark:bg-stone-700 flex size-11 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm ring-1 ring-black/5">
            🪟
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Votre future salle</h2>
            <p className="text-muted-foreground text-xs">
              Aperçu — ajoutez vos tables ci-dessus
            </p>
          </div>
        </div>
      </div>

      {/* Plan avec tables fantômes */}
      <div className="relative h-[320px] overflow-hidden">
        {ghosts.map((ghost, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.5, 0.5, 0],
              scale: [0.5, 1, 1, 0.7],
            }}
            transition={{
              duration: 4,
              delay: ghost.delay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
            className="absolute"
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Table fantôme : cercle dashed */}
            <div className="relative">
              <div className="size-16 rounded-full border-2 border-dashed border-stone-400 dark:border-stone-500" />
              {/* Chaises fantômes */}
              <span className="absolute -top-2 left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-t-md border border-dashed border-stone-400 dark:border-stone-500" />
              <span className="absolute -bottom-2 left-1/2 h-2.5 w-6 -translate-x-1/2 rounded-b-md border border-dashed border-stone-400 dark:border-stone-500" />
              <span className="absolute top-1/2 -left-2 h-6 w-2.5 -translate-y-1/2 rounded-l-md border border-dashed border-stone-400 dark:border-stone-500" />
              <span className="absolute top-1/2 -right-2 h-6 w-2.5 -translate-y-1/2 rounded-r-md border border-dashed border-stone-400 dark:border-stone-500" />
            </div>
          </motion.div>
        ))}

        {/* Message centré */}
        <div className="bg-card/85 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-5 py-3 text-center shadow-md backdrop-blur">
          <p className="text-sm font-semibold">Aucune table pour le moment</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Choisissez un démarrage rapide ↑ ou ajoutez à la main
          </p>
        </div>
      </div>
    </div>
  );
}
