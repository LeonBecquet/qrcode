"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";

type Props = {
  restaurantName: string;
  tableLabel: string;
  groupName: string | null;
  logoUrl: string | null;
  showLocaleSwitcher: boolean;
  /** Slot pour LocaleSwitcher (server-passed) */
  localeSwitcher: React.ReactNode;
  /** Slot pour CallWaiterButton */
  callWaiterButton: React.ReactNode;
};

/**
 * Header public adaptatif :
 * - Au-dessus du hero (scrollY < 100vh - 60px) : transparent, texte blanc.
 * - Au-delà : opaque (bg-background), texte normal.
 */
export function PublicHeader({
  restaurantName,
  tableLabel,
  groupName,
  logoUrl,
  showLocaleSwitcher,
  localeSwitcher,
  callWaiterButton,
}: Props) {
  const { scrollY } = useScroll();
  // 0 → 1 entre 80% et 100% du viewport (transition au passage du hero)
  const opacity = useTransform(scrollY, [0, 200, 400], [0, 0, 1]);
  const textOpacity = useTransform(scrollY, [0, 300, 500], [0, 0, 1]);

  return (
    <header className="sticky top-0 z-30 -mb-[60px]">
      {/* Background opaque qui apparaît au scroll */}
      <motion.div
        aria-hidden="true"
        className="bg-background/90 supports-[backdrop-filter]:bg-background/75 absolute inset-0 backdrop-blur-xl"
        style={{ opacity }}
      />
      {/* Filet bas (apparaît avec le bg) */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px"
        style={{
          opacity,
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 30%, transparent), transparent)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {/* Logo + nom : visible seulement quand opaque (sinon redondant avec hero) */}
        <motion.div
          className="flex min-w-0 flex-1 items-center gap-3"
          style={{ opacity: textOpacity }}
        >
          {logoUrl ? (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-black/5">
              <Image
                src={logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm leading-tight font-semibold">
              {restaurantName}
            </p>
            <p className="text-muted-foreground truncate text-[11px] leading-tight">
              Table <span className="font-mono">{tableLabel}</span>
              {groupName ? ` · ${groupName}` : ""}
            </p>
          </div>
        </motion.div>

        {/* Spacer quand transparent (pour pousser locale + call waiter à droite) */}
        <motion.div
          className="flex-1"
          style={{ opacity: useTransform(textOpacity, (v) => 1 - v) }}
          aria-hidden="true"
        />

        {/* LocaleSwitcher + CallWaiterButton — toujours visibles (style adaptatif via leur propre code) */}
        <div className="relative z-10 flex shrink-0 items-center gap-2">
          {showLocaleSwitcher ? localeSwitcher : null}
          {callWaiterButton}
        </div>
      </div>
    </header>
  );
}
