"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function HeroMockup() {
  const prefersReduced = useReducedMotion();
  const easing = [0.21, 0.47, 0.32, 0.98] as const;
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  // Parallax : éléments bougent à différentes vitesses au scroll
  const phoneY = useTransform(scrollY, [0, 800], [0, -60]);
  const qrY = useTransform(scrollY, [0, 800], [0, -120]);
  const qrRotate = useTransform(scrollY, [0, 800], [-12, -22]);
  const notifY = useTransform(scrollY, [0, 800], [0, -90]);
  const notifX = useTransform(scrollY, [0, 800], [0, 30]);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[340px]">
      {/* QR code décoratif derrière (parallax + rotation au scroll) */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: easing }}
        style={prefersReduced ? undefined : { y: qrY, rotate: qrRotate }}
        className="absolute -top-8 -left-8 hidden size-32 rounded-2xl bg-[var(--brand-forest)] p-3 shadow-xl md:block"
      >
        <div className="grid h-full grid-cols-5 grid-rows-5 gap-1">
          {Array.from({ length: 25 }, (_, i) => {
            const corners = [0, 4, 20];
            const isCorner = corners.includes(i);
            const isAccent = i === 24;
            const random = [6, 8, 12, 13, 16, 18];
            const filled = isCorner || isAccent || random.includes(i);
            return (
              <div
                key={i}
                className={
                  isAccent
                    ? "rounded bg-[var(--brand-orange)]"
                    : isCorner
                      ? "rounded bg-[var(--brand-saffron)]"
                      : filled
                        ? "rounded bg-[var(--brand-cream)]"
                        : ""
                }
              />
            );
          })}
        </div>
      </motion.div>

      {/* Phone mockup avec parallax + float */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: easing }}
        style={prefersReduced ? undefined : { y: phoneY }}
        className="relative"
      >
        <div
          className={
            prefersReduced
              ? "border-foreground bg-foreground relative aspect-[9/19] rounded-[42px] border-[10px] shadow-2xl"
              : "animate-float-slow border-foreground bg-foreground relative aspect-[9/19] rounded-[42px] border-[10px] shadow-2xl"
          }
        >
          <div className="bg-background relative h-full w-full overflow-hidden rounded-[32px]">
            <div className="bg-foreground absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full" />

            <div className="flex items-center gap-2 border-b px-4 pt-10 pb-3">
              <div className="size-7 rounded-full bg-[var(--brand-tomato)]" />
              <div>
                <p className="text-xs font-semibold">Le Bistrot du Coin</p>
                <p className="text-muted-foreground text-[9px]">Table T5 · Terrasse</p>
              </div>
              <span className="ml-auto rounded-full bg-[var(--brand-saffron)]/30 px-2 py-0.5 text-[8px] font-medium text-[var(--brand-forest)]">
                FR
              </span>
            </div>

            <div className="space-y-3 p-3">
              <h3 className="text-sm font-semibold">Entrées</h3>
              <div className="space-y-2">
                <FakeMenuItem
                  title="Tartare de bœuf"
                  desc="Au couteau, câpres"
                  price="14 €"
                  color="bg-[var(--brand-tomato)]/30"
                  delay={0.6}
                />
                <FakeMenuItem
                  title="Burrata fumée"
                  desc="Tomates anciennes"
                  price="12 €"
                  color="bg-[var(--brand-orange)]/30"
                  delay={0.75}
                />
                <FakeMenuItem
                  title="Œuf parfait"
                  desc="Champignons sauvages"
                  price="11 €"
                  color="bg-[var(--brand-saffron)]/40"
                  delay={0.9}
                />
              </div>
            </div>

            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2, ease: easing }}
              className="absolute right-3 bottom-3 left-3"
            >
              <div className="bg-foreground text-background flex items-center justify-between rounded-full px-4 py-2.5 text-xs shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="bg-background text-foreground flex size-4 items-center justify-center rounded-full text-[9px] font-bold">
                    2
                  </span>
                  Voir mon panier
                </span>
                <span className="font-mono">26 €</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Notification flottante (parallax inverse) */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, x: 30, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.6, ease: easing }}
        style={prefersReduced ? undefined : { y: notifY, x: notifX }}
        className="bg-card absolute top-32 -right-4 hidden rounded-xl border p-3 shadow-lg md:block"
      >
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[var(--brand-forest)] flex size-7 items-center justify-center rounded-full text-white">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.9, type: "spring", stiffness: 300 }}
            >
              ✓
            </motion.span>
          </div>
          <div>
            <p className="font-semibold">Commande envoyée</p>
            <p className="text-muted-foreground text-[10px]">En cuisine — Table T5</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FakeMenuItem({
  title,
  desc,
  price,
  color,
  delay,
}: {
  title: string;
  desc: string;
  price: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex items-center gap-2"
    >
      <div className={`size-10 shrink-0 rounded-md ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{title}</p>
        <p className="text-muted-foreground truncate text-[10px]">{desc}</p>
      </div>
      <span className="font-mono text-xs font-semibold">{price}</span>
    </motion.div>
  );
}
