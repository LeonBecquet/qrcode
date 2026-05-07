"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PublicMenu } from "@/lib/server/public-resolver";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

type PublicLocale = "fr" | "en";

function pickLocalizedText<T extends { nameFr: string; nameEn: string | null }>(
  item: T,
  locale: PublicLocale,
): string {
  if (locale === "en" && item.nameEn) return item.nameEn;
  return item.nameFr;
}

function pickLocalizedDescription<
  T extends { descriptionFr: string | null; descriptionEn: string | null },
>(item: T, locale: PublicLocale): string | null {
  if (locale === "en" && item.descriptionEn) return item.descriptionEn;
  return item.descriptionFr;
}

const ALLERGEN_INITIALS: Record<string, string> = {
  gluten: "G",
  crustaces: "Cr",
  oeufs: "Œ",
  poisson: "P",
  arachide: "Ar",
  soja: "So",
  lait: "L",
  "fruits-coque": "FC",
  celeri: "Cé",
  moutarde: "Mo",
  sesame: "Sé",
  sulfites: "Su",
  lupin: "Lu",
  mollusques: "Mol",
};

const ALLERGEN_FULL: Record<string, { fr: string; en: string }> = {
  gluten: { fr: "Gluten", en: "Gluten" },
  crustaces: { fr: "Crustacés", en: "Crustaceans" },
  oeufs: { fr: "Œufs", en: "Eggs" },
  poisson: { fr: "Poisson", en: "Fish" },
  arachide: { fr: "Arachide", en: "Peanuts" },
  soja: { fr: "Soja", en: "Soy" },
  lait: { fr: "Lait", en: "Milk" },
  "fruits-coque": { fr: "Fruits à coque", en: "Tree nuts" },
  celeri: { fr: "Céleri", en: "Celery" },
  moutarde: { fr: "Moutarde", en: "Mustard" },
  sesame: { fr: "Sésame", en: "Sesame" },
  sulfites: { fr: "Sulfites", en: "Sulphites" },
  lupin: { fr: "Lupin", en: "Lupin" },
  mollusques: { fr: "Mollusques", en: "Molluscs" },
};

type Props = {
  slug: string;
  token: string;
  locale: PublicLocale;
  restaurantName: string;
  restaurantDescription: string | null;
  coverUrl: string | null;
  publicMenu: PublicMenu | null;
};

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function MenuClient({
  slug,
  token,
  locale,
  restaurantName,
  restaurantDescription,
  coverUrl,
  publicMenu,
}: Props) {
  const prefersReduced = useReducedMotion();
  const visibleCategories =
    publicMenu?.categories.filter((cat) => cat.items.length > 0) ?? [];
  const hasMultipleCategories = visibleCategories.length > 1;

  const [activeCatId, setActiveCatId] = useState<string | null>(
    visibleCategories[0]?.id ?? null,
  );

  /* Scroll progress bar globale en haut */
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (visibleCategories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-cat-id");
          if (id) setActiveCatId(id);
        }
      },
      {
        rootMargin: "-130px 0px -60% 0px",
        threshold: [0, 0.1, 0.25],
      },
    );
    for (const cat of visibleCategories) {
      const el = document.querySelector(`[data-cat-id="${cat.id}"]`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicMenu?.menu.id]);

  if (!publicMenu || publicMenu.categories.length === 0) {
    return (
      <div className="-mx-4">
        {coverUrl ? (
          <CoverHero
            coverUrl={coverUrl}
            name={restaurantName}
            description={restaurantDescription}
            prefersReduced={!!prefersReduced}
          />
        ) : null}
        <div className="px-4 py-16 text-center">
          <p className="text-3xl">🍽️</p>
          <p className="mt-3 text-lg font-medium">
            {locale === "en" ? "Menu coming soon" : "Carte en préparation"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {locale === "en"
              ? "The chef is finalising the dishes."
              : "Le chef finalise les plats."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll progress bar fixée en haut de l'écran */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0.5 origin-left"
        style={{
          scaleX: scrollProgress,
          background:
            "linear-gradient(90deg, var(--client-primary, currentColor), var(--client-accent-2, currentColor))",
        }}
      />

      {/* === Cover hero cinématique === */}
      {coverUrl ? (
        <div className="-mx-4">
          <CoverHero
            coverUrl={coverUrl}
            name={restaurantName}
            description={restaurantDescription}
            prefersReduced={!!prefersReduced}
          />
        </div>
      ) : (
        <NoCoverHero
          name={restaurantName}
          description={restaurantDescription}
          prefersReduced={!!prefersReduced}
        />
      )}

      {/* === Sticky pills nav === */}
      {hasMultipleCategories ? (
        <motion.nav
          initial={prefersReduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
          className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-[60px] z-10 -mx-4 mt-4 backdrop-blur"
          aria-label={locale === "en" ? "Categories" : "Catégories"}
        >
          <div className="overflow-x-auto">
            <ul className="flex gap-1 px-4 py-3 whitespace-nowrap">
              {visibleCategories.map((cat) => {
                const isActive = activeCatId === cat.id;
                return (
                  <li key={cat.id} className="relative">
                    <a
                      href={`#cat-${cat.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById(`cat-${cat.id}`);
                        if (target) {
                          target.scrollIntoView({
                            behavior: prefersReduced ? "auto" : "smooth",
                            block: "start",
                          });
                        }
                      }}
                      className={`relative inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="active-pill-bg"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "color-mix(in oklab, var(--client-primary, currentColor) 14%, transparent)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      ) : null}
                      <span className="relative">
                        {pickLocalizedText(cat, locale)}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.nav>
      ) : null}

      {/* === Sections === */}
      <div className="space-y-20 py-10">
        {visibleCategories.map((category, catIdx) => {
          const catName = pickLocalizedText(category, locale);
          const catDesc = pickLocalizedDescription(category, locale);
          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              data-cat-id={category.id}
              className="scroll-mt-32"
            >
              <SectionHeader
                title={catName}
                description={catDesc}
                index={catIdx}
                prefersReduced={!!prefersReduced}
              />

              <ul className="space-y-6">
                {category.items.map((item, idx) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  return (
                    <ItemRow
                      key={item.id}
                      slug={slug}
                      token={token}
                      locale={locale}
                      itemId={item.id}
                      itemName={itemName}
                      itemDesc={itemDesc}
                      imageUrl={item.imageUrl}
                      priceCents={item.priceCents}
                      isAvailable={item.isAvailable}
                      allergens={item.allergens ?? []}
                      optionsCount={item.options.length}
                      delay={idx * 0.08}
                      prefersReduced={!!prefersReduced}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <motion.div
        initial={prefersReduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="border-t pt-6 pb-2 text-center"
      >
        <p className="text-muted-foreground/70 text-[10px] tracking-wide uppercase">
          {locale === "en" ? "Allergens code" : "Codes allergènes"}
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          {Object.entries(ALLERGEN_FULL)
            .map(
              ([key, val]) =>
                `${ALLERGEN_INITIALS[key]} · ${locale === "en" ? val.en : val.fr}`,
            )
            .slice(0, 7)
            .join("   ")}
        </p>
      </motion.div>
    </>
  );
}

/* ─── Cover hero CINÉMATIQUE ─── */
function CoverHero({
  coverUrl,
  name,
  description,
  prefersReduced,
}: {
  coverUrl: string;
  name: string;
  description: string | null;
  prefersReduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  // Letter-by-letter animation
  const letters = name.split("");

  return (
    <div
      ref={ref}
      className="relative h-[78vh] min-h-[480px] w-full overflow-hidden sm:h-[88vh]"
    >
      {/* === Background image with parallax === */}
      <motion.div
        className="absolute inset-0"
        style={prefersReduced ? undefined : { y: imgY, scale: imgScale }}
        initial={prefersReduced ? false : { scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
      </motion.div>

      {/* === Vignette + dark overlay === */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ opacity: overlayOpacity }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </motion.div>

      {/* === Floating particles (steam-like) === */}
      {!prefersReduced ? <FloatingParticles /> : null}

      {/* === Decorative SVG corners === */}
      <CornerOrnaments />

      {/* === Title content === */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={prefersReduced ? undefined : { y: titleY, opacity: titleOpacity }}
      >
        {/* Tagline en haut */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
          className="mb-4 text-[10px] font-semibold tracking-[0.5em] text-white/70 uppercase sm:text-xs"
        >
          {locale_text({ fr: "Bienvenue à la table de", en: "Welcome to" })}
        </motion.p>

        {/* Nom du resto - lettres animées */}
        <h1
          className="text-5xl leading-none font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              initial={prefersReduced ? false : { opacity: 0, y: 80, filter: "blur(20px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.9,
                ease: EASE,
                delay: 0.8 + i * 0.05,
              }}
              className="inline-block"
            >
              {char === " " ? " " : char}
            </motion.span>
          ))}
        </h1>

        {/* Filet décoratif animé */}
        <motion.div
          aria-hidden="true"
          initial={prefersReduced ? false : { width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 1.2 + letters.length * 0.05 }}
          className="my-6 h-px bg-white/60"
        />

        {/* Description */}
        {description ? (
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: EASE,
              delay: 1.4 + letters.length * 0.05,
            }}
            className="max-w-md text-sm text-white/85 italic sm:text-base"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
          >
            {description}
          </motion.p>
        ) : null}

        {/* Scroll indicator */}
        {!prefersReduced ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 + letters.length * 0.05 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1.5 text-white/60"
            >
              <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">
                Scroll
              </span>
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="14"
                  height="18"
                  rx="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <motion.circle
                  cx="8"
                  cy="6"
                  r="1.5"
                  fill="currentColor"
                  animate={{ cy: [6, 12, 6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </motion.div>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}

/* ─── No-cover hero (fallback minimaliste mais classe) ─── */
function NoCoverHero({
  name,
  description,
  prefersReduced,
}: {
  name: string;
  description: string | null;
  prefersReduced: boolean;
}) {
  const letters = name.split("");
  return (
    <div className="relative -mx-4 flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* Background gradient mesh */}
      {!prefersReduced ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in oklab, var(--client-primary, currentColor) 12%, transparent), transparent), radial-gradient(ellipse 40% 30% at 80% 70%, color-mix(in oklab, var(--client-accent-2, currentColor) 10%, transparent), transparent)",
          }}
        />
      ) : null}

      {!prefersReduced ? <FloatingDots /> : null}

      <motion.p
        initial={prefersReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-[0.5em] uppercase sm:text-xs"
      >
        Bienvenue
      </motion.p>

      <h1
        className="text-5xl leading-none font-bold tracking-tight sm:text-7xl"
        style={{ color: "var(--client-primary, currentColor)" }}
      >
        {letters.map((char, i) => (
          <motion.span
            key={i}
            initial={prefersReduced ? false : { opacity: 0, y: 60, filter: "blur(15px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 + i * 0.05 }}
            className="inline-block"
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </h1>

      <motion.div
        initial={prefersReduced ? false : { width: 0 }}
        animate={{ width: 80 }}
        transition={{ duration: 1, ease: EASE, delay: 1 + letters.length * 0.05 }}
        className="my-6 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent), transparent)",
        }}
      />

      {description ? (
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 1.2 + letters.length * 0.05 }}
          className="text-muted-foreground max-w-md text-sm italic sm:text-base"
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}

/* ─── Particules flottantes (style fumée/poussière de lumière) ─── */
function FloatingParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, () => ({
      size: 1 + Math.random() * 3,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      xOffset: Math.random() * 60 - 30,
    })),
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/40"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: ["0vh", "-90vh"],
            opacity: [0, 0.6, 0.6, 0],
            x: [0, p.xOffset],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Petits dots flottants pour le no-cover hero ─── */
function FloatingDots() {
  const [dots] = useState(() =>
    Array.from({ length: 12 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 4,
    })),
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute size-1 rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            background:
              "color-mix(in oklab, var(--client-primary, currentColor) 30%, transparent)",
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ornements coins (SVG décoratifs) ─── */
function CornerOrnaments() {
  return (
    <>
      {/* Coin haut-gauche : couverts croisés */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ opacity: 0.3, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
        className="absolute top-6 left-6"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M8 4v18M14 4v18M11 22v14M30 4c-2 0-4 2-4 4v12h8v-12c0-2-2-4-4-4Zm0 16v16"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Coin haut-droit : étoile */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.8 }}
        className="absolute top-6 right-6"
      >
        <motion.svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M16 4l2.5 8.5L27 15l-8.5 2.5L16 26l-2.5-8.5L5 15l8.5-2.5L16 4Z"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </>
  );
}

/* ─── Section header avec typographie monumentale ─── */
function SectionHeader({
  title,
  description,
  index,
  prefersReduced,
}: {
  title: string;
  description: string | null;
  index: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.header
      className="relative mb-10 text-center"
      initial={prefersReduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Numéro géant en background */}
      <motion.div
        aria-hidden="true"
        variants={{
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 1, ease: EASE }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
      >
        <span
          className="text-[8rem] leading-none font-black tracking-tighter opacity-[0.05] sm:text-[12rem]"
          style={{ color: "var(--client-primary, currentColor)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </motion.div>

      <div className="relative">
        {/* Pre-title petit caps */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-muted-foreground/70 mb-3 text-[10px] font-semibold tracking-[0.4em] uppercase"
        >
          Chapitre {String(index + 1).padStart(2, "0")}
        </motion.p>

        {/* Filets + titre */}
        <div className="flex items-center justify-center gap-4">
          <motion.span
            aria-hidden="true"
            className="block h-px"
            variants={{
              hidden: { width: 0, opacity: 0 },
              visible: { width: 64, opacity: 1 },
            }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 70%, transparent))",
            }}
          />
          <motion.h2
            className="text-3xl leading-none font-bold tracking-tight uppercase sm:text-5xl"
            variants={{
              hidden: { opacity: 0, y: 24, filter: "blur(20px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            style={{
              color: "var(--client-primary, currentColor)",
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </motion.h2>
          <motion.span
            aria-hidden="true"
            className="block h-px"
            variants={{
              hidden: { width: 0, opacity: 0 },
              visible: { width: 64, opacity: 1 },
            }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            style={{
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--client-primary, currentColor) 70%, transparent), transparent)",
            }}
          />
        </div>

        {description ? (
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            className="text-muted-foreground mx-auto mt-4 max-w-md text-sm italic sm:text-base"
          >
            {description}
          </motion.p>
        ) : null}
      </div>
    </motion.header>
  );
}

/* ─── Item row avec tilt 3D + reveal mask sur photo ─── */
function ItemRow({
  slug,
  token,
  locale,
  itemId,
  itemName,
  itemDesc,
  imageUrl,
  priceCents,
  isAvailable,
  allergens,
  optionsCount,
  delay,
  prefersReduced,
}: {
  slug: string;
  token: string;
  locale: PublicLocale;
  itemId: string;
  itemName: string;
  itemDesc: string | null;
  imageUrl: string | null;
  priceCents: number;
  isAvailable: boolean;
  allergens: string[];
  optionsCount: number;
  delay: number;
  prefersReduced: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-100, 100], [6, -6]), {
    stiffness: 300,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mx, [-100, 100], [-6, 6]), {
    stiffness: 300,
    damping: 25,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - rect.left - rect.width / 2);
    my.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.li
      initial={prefersReduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={prefersReduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <Link
          ref={cardRef}
          href={`/r/${slug}/t/${token}/items/${itemId}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`group relative flex items-stretch gap-4 overflow-hidden rounded-2xl border bg-[color-mix(in_oklab,var(--client-primary,currentColor)_2%,var(--background))] p-3 shadow-sm transition-all hover:shadow-2xl sm:p-4 ${
            !isAvailable ? "opacity-50" : ""
          }`}
          style={{
            borderColor:
              "color-mix(in oklab, var(--client-primary, currentColor) 12%, transparent)",
          }}
        >
          {/* Photo (gauche) avec mask reveal */}
          {imageUrl ? (
            <motion.div
              className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl sm:w-32"
              initial={prefersReduced ? false : { clipPath: "inset(0 100% 0 0)" }}
              whileInView={{ clipPath: "inset(0 0% 0 0)" }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, ease: EASE, delay: delay + 0.3 }}
            >
              <motion.div
                className="absolute inset-0"
                whileHover={prefersReduced ? undefined : { scale: 1.12 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Image
                  src={imageUrl}
                  alt={itemName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 128px"
                  unoptimized
                />
              </motion.div>
              {/* Shine effect au hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              {!isAvailable ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                  <span className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold tracking-wider uppercase shadow-md">
                    {locale === "en" ? "Out" : "Rupture"}
                  </span>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl sm:w-32"
              initial={prefersReduced ? false : { opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: EASE, delay: delay + 0.3 }}
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--client-primary, currentColor) 14%, transparent), color-mix(in oklab, var(--client-accent-2, currentColor) 8%, transparent))",
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-60">
                🍴
              </span>
              {/* Animated shimmer */}
              {!prefersReduced ? (
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  }}
                />
              ) : null}
            </motion.div>
          )}

          {/* Texte (droite) */}
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                  {itemName}
                </h3>
                <motion.span
                  className="shrink-0 text-lg font-bold tracking-tight tabular-nums sm:text-xl"
                  style={{
                    color: "var(--client-accent-2, var(--client-primary, currentColor))",
                  }}
                  whileHover={prefersReduced ? undefined : { scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {priceFormatter.format(priceCents / 100)}
                </motion.span>
              </div>

              {itemDesc ? (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm italic">
                  {itemDesc}
                </p>
              ) : null}
            </div>

            <div className="flex items-end justify-between gap-2">
              {allergens.length > 0 ? (
                <span
                  className="text-muted-foreground/80 text-[11px]"
                  title={allergens
                    .map((a) => ALLERGEN_FULL[a]?.[locale === "en" ? "en" : "fr"] ?? a)
                    .join(", ")}
                >
                  <span className="opacity-60">
                    {locale === "en" ? "Contains:" : "Contient :"}
                  </span>{" "}
                  <span className="font-medium">
                    {allergens.map((a) => ALLERGEN_INITIALS[a] ?? a).join(" · ")}
                  </span>
                </span>
              ) : (
                <span />
              )}
              {optionsCount > 0 ? (
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    background:
                      "color-mix(in oklab, var(--client-primary, currentColor) 12%, transparent)",
                    color: "var(--client-primary, currentColor)",
                  }}
                >
                  + {optionsCount}{" "}
                  {locale === "en"
                    ? optionsCount > 1
                      ? "options"
                      : "option"
                    : optionsCount > 1
                      ? "choix"
                      : "choix"}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.li>
  );
}

/* Helper hack pour faire passer les locale strings */
function locale_text(s: { fr: string; en: string }): string {
  // au runtime client, on est en FR par défaut. Le système d'i18n est gérée
  // côté layout, ici on retourne FR — le texte est court et générique.
  return s.fr;
}
