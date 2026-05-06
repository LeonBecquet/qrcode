"use client";

import { motion } from "motion/react";

const easing = [0.21, 0.47, 0.32, 0.98] as const;

const HERO_WORDS = ["Bon", "retour"];

export function SignInIntro() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {HERO_WORDS.map((word, i) => (
          <motion.span
            key={word}
            className="inline-block"
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: 0.05 + i * 0.08, ease: easing }}
          >
            {word}
            {i < HERO_WORDS.length - 1 ? " " : ""}
          </motion.span>
        ))}
        <motion.span
          className="ml-2 inline-block"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
        >
          👋
        </motion.span>
      </h1>
      <motion.p
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: easing }}
      >
        Connectez-vous à votre tableau de bord.
      </motion.p>
    </div>
  );
}
