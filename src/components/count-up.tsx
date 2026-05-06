"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type Props = {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
};

/**
 * Count-up animé via DOM ref (pas de setState, lint-clean).
 * Démarre quand visible, respecte prefers-reduced-motion.
 */
export function CountUp({ to, suffix = "", prefix = "", duration = 1.2, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (prefersReduced) {
      ref.current.textContent = `${prefix}${to}${suffix}`;
      return;
    }
    const node = ref.current;
    const controls = animate(0, to, {
      duration,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (latest) => {
        node.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, duration, prefix, suffix, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
