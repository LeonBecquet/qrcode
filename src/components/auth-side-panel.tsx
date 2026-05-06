"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/logo";

type Props = {
  tagline: string;
};

const FOOD_CHIPS = [
  { emoji: "🍕", label: "Pizzeria", x: "8%", y: "12%", delay: 0 },
  { emoji: "🍷", label: "Bistrot", x: "78%", y: "8%", delay: 0.4 },
  { emoji: "🍣", label: "Sushi", x: "5%", y: "82%", delay: 0.8 },
  { emoji: "🥗", label: "Brasserie", x: "82%", y: "78%", delay: 1.2 },
  { emoji: "🍔", label: "Burger", x: "85%", y: "45%", delay: 1.6 },
  { emoji: "🥐", label: "Café", x: "3%", y: "48%", delay: 2 },
  { emoji: "🍝", label: "Trattoria", x: "70%", y: "92%", delay: 0.6 },
  { emoji: "🌮", label: "Tacos", x: "12%", y: "30%", delay: 1.4 },
];

export function AuthSidePanel({ tagline }: Props) {
  const prefersReduced = useReducedMotion();
  const easing = [0.21, 0.47, 0.32, 0.98] as const;

  return (
    <aside className="text-[var(--brand-cream)] relative hidden flex-col overflow-hidden bg-[var(--brand-forest)] md:flex">
      {/* Background mesh gradient (multi-radial) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(238, 128, 51, 0.4), transparent 50%),radial-gradient(circle at 80% 70%, rgba(245, 195, 66, 0.3), transparent 50%),radial-gradient(circle at 60% 20%, rgba(208, 74, 51, 0.18), transparent 60%)",
        }}
      />

      {/* Pattern grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-cream) 1px, transparent 1px), linear-gradient(90deg, var(--brand-cream) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Chips de cuisine flottants en background */}
      {FOOD_CHIPS.map((chip) => (
        <motion.div
          key={chip.label}
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{ left: chip.x, top: chip.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            prefersReduced
              ? { opacity: 0.5, scale: 1 }
              : {
                  opacity: [0, 0.55, 0.55, 0],
                  scale: [0.5, 1, 1, 0.85],
                  y: [0, -20, -40, -60],
                }
          }
          transition={{
            duration: 9,
            delay: chip.delay,
            repeat: prefersReduced ? 0 : Infinity,
            ease: "linear",
          }}
        >
          <div className="bg-[var(--brand-cream)]/10 text-[var(--brand-cream)]/85 inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-cream)]/15 px-2.5 py-1 text-xs font-medium whitespace-nowrap backdrop-blur-sm">
            <span>{chip.emoji}</span>
            <span>{chip.label}</span>
          </div>
        </motion.div>
      ))}

      {/* Logo + Tagline en haut */}
      <div className="relative z-10 p-10 lg:p-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo size={32} />
          <span className="text-base font-semibold tracking-tight">QR Restaurant</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easing }}
          className="mt-10 max-w-md space-y-3"
        >
          <div className="bg-[var(--brand-orange)] inline-block size-2 rounded-full" />
          <h2 className="text-3xl leading-tight font-bold tracking-tight lg:text-[2.25rem]">
            {tagline}
          </h2>
        </motion.div>
      </div>

      {/* Phone mockup central + notifications floating */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-10">
        <div className="relative">
          {/* QR décoratif derrière */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: -16 }}
            transition={{ duration: 0.8, delay: 0.5, ease: easing }}
            className="animate-float-rotate absolute -top-12 -left-12 size-28 rounded-2xl bg-[var(--brand-cream)]/15 p-3 shadow-xl backdrop-blur-sm"
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

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easing }}
            className={
              prefersReduced
                ? "relative w-[260px]"
                : "animate-float-slow relative w-[260px]"
            }
          >
            <div className="border-foreground bg-foreground relative aspect-[9/19] rounded-[36px] border-[8px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]">
              <div className="bg-background relative h-full w-full overflow-hidden rounded-[28px]">
                <div className="bg-foreground absolute top-1.5 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-full" />

                <div className="flex items-center gap-2 border-b px-3 pt-9 pb-3">
                  <div className="size-7 rounded-full bg-[var(--brand-tomato)]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">Le Bistrot du Coin</p>
                    <p className="text-muted-foreground text-[9px]">Table T5</p>
                  </div>
                  <span className="ml-auto rounded-full bg-[var(--brand-saffron)]/30 px-1.5 py-0.5 text-[8px] font-medium text-[var(--brand-forest)]">
                    FR
                  </span>
                </div>

                <div className="space-y-2 p-3">
                  <h3 className="text-xs font-semibold">Entrées</h3>
                  <PhoneItem
                    title="Tartare"
                    desc="Au couteau"
                    price="14 €"
                    color="bg-[var(--brand-tomato)]/30"
                    delay={0.8}
                  />
                  <PhoneItem
                    title="Burrata"
                    desc="Tomates"
                    price="12 €"
                    color="bg-[var(--brand-orange)]/30"
                    delay={0.95}
                  />
                  <PhoneItem
                    title="Œuf parfait"
                    desc="Champignons"
                    price="11 €"
                    color="bg-[var(--brand-saffron)]/40"
                    delay={1.1}
                  />
                </div>

                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.4, ease: easing }}
                  className="absolute right-2 bottom-2 left-2"
                >
                  <div className="bg-foreground text-background flex items-center justify-between rounded-full px-3 py-2 text-[10px] shadow-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="bg-background text-foreground flex size-3.5 items-center justify-center rounded-full text-[8px] font-bold">
                        2
                      </span>
                      Mon panier
                    </span>
                    <span className="font-mono">26 €</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Notifications floating autour */}
          <FloatingNotif
            position="-top-6 -right-24"
            initial={{ x: 30, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            delay={1.2}
            floatDelay={0}
          >
            <div className="bg-[var(--brand-orange)] flex size-8 shrink-0 items-center justify-center rounded-full text-base text-white shadow-md">
              ✓
            </div>
            <div className="text-[var(--brand-forest)]">
              <p className="text-xs font-semibold">Commande reçue</p>
              <p className="text-[10px] opacity-70">Table T5 · 26 €</p>
            </div>
          </FloatingNotif>

          <FloatingNotif
            position="top-32 -left-32"
            initial={{ x: -30, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            delay={1.6}
            floatDelay={1.5}
          >
            <div className="bg-[var(--brand-saffron)] flex size-8 shrink-0 items-center justify-center rounded-full text-base text-[var(--brand-forest)] shadow-md">
              🔔
            </div>
            <div className="text-[var(--brand-forest)]">
              <p className="text-xs font-semibold">Appel serveur</p>
              <p className="text-[10px] opacity-70">Terrasse 3</p>
            </div>
          </FloatingNotif>

          <FloatingNotif
            position="-bottom-4 -right-20"
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            delay={2}
            floatDelay={3}
          >
            <div className="bg-[var(--brand-forest)] flex size-8 shrink-0 items-center justify-center rounded-full text-base text-white shadow-md">
              🍽️
            </div>
            <div className="text-[var(--brand-forest)]">
              <p className="text-xs font-semibold">Plat prêt</p>
              <p className="text-[10px] opacity-70">Table T8 · 3 plats</p>
            </div>
          </FloatingNotif>

          <FloatingNotif
            position="bottom-24 -left-20"
            initial={{ x: -20, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            delay={2.4}
            floatDelay={2}
          >
            <div className="bg-[var(--brand-tomato)] flex size-8 shrink-0 items-center justify-center rounded-full text-base text-white shadow-md">
              💸
            </div>
            <div className="text-[var(--brand-forest)]">
              <p className="text-xs font-semibold">+47 €</p>
              <p className="text-[10px] opacity-70">Ticket moyen</p>
            </div>
          </FloatingNotif>
        </div>
      </div>

      {/* Stats en bas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: easing }}
        className="relative z-10 grid grid-cols-3 gap-3 border-t border-[var(--brand-cream)]/15 p-10 lg:p-14"
      >
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">
            Commission
          </div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">0%</div>
        </div>
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">Setup</div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">5 min</div>
        </div>
        <div>
          <div className="text-[var(--brand-saffron)] text-xs tracking-wide uppercase">Langues</div>
          <div className="text-[var(--brand-cream)] text-2xl font-bold lg:text-3xl">FR/EN</div>
        </div>
      </motion.div>
    </aside>
  );
}

function PhoneItem({
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
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-card flex items-center gap-2 rounded-md border p-1.5"
    >
      <div className={`size-8 shrink-0 rounded ${color}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium">{title}</p>
        <p className="text-muted-foreground truncate text-[8px]">{desc}</p>
      </div>
      <span className="font-mono text-[10px] font-semibold">{price}</span>
    </motion.div>
  );
}

function FloatingNotif({
  children,
  position,
  initial,
  animate,
  delay,
  floatDelay = 0,
}: {
  children: React.ReactNode;
  position: string;
  initial: { x?: number; y?: number; opacity: number; scale?: number };
  animate: { x?: number; y?: number; opacity: number; scale?: number };
  delay: number;
  floatDelay?: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`absolute ${position} hidden lg:block`}
      style={
        prefersReduced
          ? undefined
          : { animation: `float-slow 6s ease-in-out ${floatDelay}s infinite` }
      }
    >
      <div className="bg-[var(--brand-cream)] flex items-center gap-2.5 rounded-xl border p-2.5 pr-3.5 shadow-xl">
        {children}
      </div>
    </motion.div>
  );
}
