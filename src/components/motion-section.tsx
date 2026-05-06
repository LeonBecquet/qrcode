"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /**
   * Distance en px depuis laquelle le contenu monte. Default 24.
   */
  y?: number;
  /**
   * "section" rend une <section>, "div" un div. Default "div".
   */
  as?: "section" | "div" | "article";
  id?: string;
};

/**
 * Wrapper qui anime ses children en fade-up quand ils entrent dans le viewport.
 * Respecte prefers-reduced-motion.
 */
export function MotionSection({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
  id,
}: Props) {
  const prefersReduced = useReducedMotion();
  const Component = as === "section" ? motion.section : as === "article" ? motion.article : motion.div;

  if (prefersReduced) {
    return (
      <Component className={className} id={id}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      id={id}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </Component>
  );
}

/**
 * Stagger les enfants à l'apparition : chacun est animé avec un délai croissant.
 * Use for grids of cards.
 */
export function MotionStagger({
  children,
  className,
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionStaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
