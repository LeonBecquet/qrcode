"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const easing = [0.21, 0.47, 0.32, 0.98] as const;

export function HeroContent() {
  const prefersReduced = useReducedMotion();
  const variants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 24 },
    visible: { opacity: 1, y: 0 },
  };
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: prefersReduced ? 0 : 0.1 } },
  };

  return (
    <motion.div
      className="space-y-6 text-center md:text-left"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.div
        variants={variants}
        transition={{ duration: 0.5, ease: easing }}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-forest)]/20 bg-[var(--brand-forest)]/5 px-3 py-1 text-xs font-medium text-[var(--brand-forest)]"
      >
        <span className="size-2 rounded-full bg-[var(--brand-forest)]" />
        Pour les restaurants français
      </motion.div>

      <motion.h1
        variants={variants}
        transition={{ duration: 0.6, ease: easing }}
        className="text-5xl font-bold tracking-tight md:text-7xl"
      >
        Vos clients{" "}
        <span className="relative inline-block">
          commandent
          <svg
            aria-hidden="true"
            className="absolute -bottom-2 left-0 h-3 w-full"
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
          >
            <path
              d="M0 8 Q 25 2, 50 6 T 100 5"
              fill="none"
              stroke="var(--brand-orange)"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-draw-underline"
            />
          </svg>
        </span>{" "}
        depuis leur table.
      </motion.h1>

      <motion.p
        variants={variants}
        transition={{ duration: 0.6, ease: easing }}
        className="text-muted-foreground max-w-lg text-lg md:text-xl"
      >
        Un QR code par table. Votre menu en ligne. Les commandes en cuisine en temps réel.{" "}
        <strong className="text-foreground">Sans application. Zéro commission.</strong>
      </motion.p>

      <motion.div
        variants={variants}
        transition={{ duration: 0.6, ease: easing }}
        className="flex flex-wrap items-center justify-center gap-3 md:justify-start"
      >
        <Link
          href="/signup"
          className={
            buttonVariants({ size: "lg" }) +
            " animate-pulse-glow bg-[var(--brand-orange)] text-white transition-transform hover:scale-105 hover:bg-[var(--brand-orange)]/90"
          }
        >
          Démarrer gratuitement →
        </Link>
        <Link
          href="#tarifs"
          className={
            buttonVariants({ size: "lg", variant: "outline" }) + " transition-transform hover:scale-105"
          }
        >
          Voir les tarifs
        </Link>
      </motion.div>

      <motion.div
        variants={variants}
        transition={{ duration: 0.6, ease: easing }}
        className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-xs md:justify-start"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[var(--brand-forest)]">✓</span> Sans engagement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[var(--brand-forest)]">✓</span> Configuration en 5 min
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[var(--brand-forest)]">✓</span> Support FR
        </span>
      </motion.div>
    </motion.div>
  );
}
