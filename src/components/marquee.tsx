"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /**
   * Durée d'un cycle complet (s). Plus haut = plus lent.
   */
  durationS?: number;
  /**
   * Direction du défilement.
   */
  reverse?: boolean;
  className?: string;
};

/**
 * Marquee infinie en CSS pur (pas de JS continu, performant).
 * Duplique les children pour faire un loop sans coupe.
 */
export function Marquee({ children, durationS = 30, reverse = false, className }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={`group relative flex overflow-hidden ${className ?? ""}`}>
      <div
        className="flex shrink-0 items-center gap-12 pr-12 group-hover:[animation-play-state:paused]"
        style={{
          animation: prefersReduced
            ? "none"
            : `marquee-scroll ${durationS}s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center gap-12 pr-12 group-hover:[animation-play-state:paused]"
        style={{
          animation: prefersReduced
            ? "none"
            : `marquee-scroll ${durationS}s linear infinite ${reverse ? "reverse" : ""}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
