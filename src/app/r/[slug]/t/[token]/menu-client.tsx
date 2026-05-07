"use client";

import {
  motion,
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

const ALLERGEN_LABEL: Record<string, { fr: string; en: string }> = {
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
  logoUrl: string | null;
  publicMenu: PublicMenu | null;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MenuClient({
  slug,
  token,
  locale,
  restaurantName,
  restaurantDescription,
  coverUrl,
  logoUrl,
  publicMenu,
}: Props) {
  const prefersReduced = useReducedMotion();
  const visibleCategories =
    publicMenu?.categories.filter((cat) => cat.items.length > 0) ?? [];
  const hasMultipleCategories = visibleCategories.length > 1;

  const [activeCatId, setActiveCatId] = useState<string | null>(
    visibleCategories[0]?.id ?? null,
  );

  /* ─── Hero parallax & opacity ─── */
  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 200]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const heroOpacity = useTransform(scrollY, [0, 400, 600], [1, 0.5, 0]);
  const heroTextY = useTransform(scrollY, [0, 400], [0, -80]);

  /* Top progress bar */
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /* IntersectionObserver pour la pastille active */
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
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.1, 0.3] },
    );
    for (const cat of visibleCategories) {
      const el = document.querySelector(`[data-cat-id="${cat.id}"]`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicMenu?.menu.id]);

  /* Empty state */
  if (!publicMenu || publicMenu.categories.length === 0) {
    return (
      <div className="-mx-4">
        {coverUrl ? (
          <Hero
            coverUrl={coverUrl}
            logoUrl={logoUrl}
            name={restaurantName}
            description={restaurantDescription}
            locale={locale}
            heroY={heroY}
            heroScale={heroScale}
            heroOpacity={heroOpacity}
            heroTextY={heroTextY}
            prefersReduced={!!prefersReduced}
          />
        ) : (
          <NoCoverHero name={restaurantName} description={restaurantDescription} />
        )}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="px-4 py-20 text-center"
        >
          <p className="text-3xl">🍽️</p>
          <p className="mt-3 text-lg font-medium">
            {locale === "en" ? "Menu coming soon" : "Carte en préparation"}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] origin-left"
        style={{
          scaleX: progress,
          background:
            "linear-gradient(90deg, var(--client-primary, currentColor), var(--client-accent-2, var(--client-primary, currentColor)))",
        }}
      />

      {/* === HERO CINEMATIC === */}
      <div className="-mx-4">
        {coverUrl ? (
          <Hero
            coverUrl={coverUrl}
            logoUrl={logoUrl}
            name={restaurantName}
            description={restaurantDescription}
            locale={locale}
            heroY={heroY}
            heroScale={heroScale}
            heroOpacity={heroOpacity}
            heroTextY={heroTextY}
            prefersReduced={!!prefersReduced}
          />
        ) : (
          <NoCoverHero name={restaurantName} description={restaurantDescription} />
        )}
      </div>

      {/* === LIQUID STICKY NAV === */}
      {hasMultipleCategories ? (
        <motion.nav
          initial={prefersReduced ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          className="bg-background/70 supports-[backdrop-filter]:bg-background/55 sticky top-0 z-30 -mx-4 border-b border-black/5 backdrop-blur-2xl"
          aria-label={locale === "en" ? "Categories" : "Catégories"}
        >
          <div className="no-scrollbar overflow-x-auto">
            <ul className="flex gap-7 px-6 py-4 whitespace-nowrap">
              {visibleCategories.map((cat) => {
                const isActive = activeCatId === cat.id;
                return (
                  <li key={cat.id} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const target = document.getElementById(`cat-${cat.id}`);
                        if (target) {
                          target.scrollIntoView({
                            behavior: prefersReduced ? "auto" : "smooth",
                            block: "start",
                          });
                        }
                      }}
                      className={`relative text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-300 ${
                        isActive ? "text-foreground" : "text-foreground/40"
                      }`}
                    >
                      {pickLocalizedText(cat, locale)}
                      {isActive ? (
                        <motion.span
                          layoutId="active-cat-pill"
                          aria-hidden="true"
                          className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full"
                          style={{ background: "var(--client-primary, currentColor)" }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.nav>
      ) : null}

      {/* === MENU EDITORIAL === */}
      <main className="space-y-24 px-2 py-16 sm:px-6">
        {visibleCategories.map((category, catIdx) => {
          const catName = pickLocalizedText(category, locale);
          const catDesc = pickLocalizedDescription(category, locale);
          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              data-cat-id={category.id}
              className="scroll-mt-24 space-y-12"
            >
              {/* Section title — éditorial, ancré à gauche */}
              <motion.header
                initial={prefersReduced ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, ease: EASE }}
                className="px-2"
              >
                <p className="text-foreground/50 text-[10px] font-bold tracking-[0.4em] uppercase">
                  {locale === "en" ? "Chapter" : "Chapitre"}{" "}
                  {String(catIdx + 1).padStart(2, "0")}
                </p>
                <h2
                  className="mt-2 text-4xl leading-[0.95] font-bold tracking-tighter sm:text-5xl"
                  style={{ color: "var(--client-primary, currentColor)" }}
                >
                  {catName}
                </h2>
                {catDesc ? (
                  <p className="text-foreground/60 mt-3 max-w-md text-sm italic">
                    {catDesc}
                  </p>
                ) : null}
                <div
                  aria-hidden="true"
                  className="mt-5 h-px w-12"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--client-primary, currentColor), transparent)",
                  }}
                />
              </motion.header>

              {/* Items — alternance gauche/droite */}
              <ul className="space-y-16">
                {category.items.map((item, idx) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  return (
                    <ItemCard
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
                      isEven={idx % 2 === 0}
                      prefersReduced={!!prefersReduced}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>

      {/* === SIGNATURE FOOTER === */}
      <motion.footer
        initial={prefersReduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: EASE }}
        className="border-t border-black/5 px-6 py-16 text-center"
      >
        {logoUrl ? (
          <div className="relative mx-auto mb-4 size-12 overflow-hidden rounded-full opacity-60">
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
        ) : null}
        <p
          className="text-2xl leading-tight font-semibold tracking-tight"
          style={{ color: "var(--client-primary, currentColor)" }}
        >
          {restaurantName}
        </p>
        <p className="text-foreground/50 mt-2 text-xs tracking-wider uppercase">
          {locale === "en"
            ? "Bon appétit — A taste of the house"
            : "Bon appétit — la signature de la maison"}
        </p>
        <div
          aria-hidden="true"
          className="mx-auto mt-6 h-px w-12"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent), transparent)",
          }}
        />
        <p className="text-foreground/35 mt-4 text-[10px] tracking-wider uppercase">
          {locale === "en"
            ? "Allergens indicated below each dish · ask the server for any need"
            : "Allergènes sous chaque plat · serveur disponible sur demande"}
        </p>
      </motion.footer>
    </>
  );
}

/* ─── HERO CINEMATIC FULL-BLEED ─── */
function Hero({
  coverUrl,
  logoUrl,
  name,
  description,
  locale,
  heroY,
  heroScale,
  heroOpacity,
  heroTextY,
  prefersReduced,
}: {
  coverUrl: string;
  logoUrl: string | null;
  name: string;
  description: string | null;
  locale: PublicLocale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroY: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroScale: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroOpacity: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroTextY: any;
  prefersReduced: boolean;
}) {
  return (
    <motion.section
      className="relative flex h-[100dvh] min-h-[560px] w-full items-end overflow-hidden px-6 pb-14 sm:pb-16"
      style={prefersReduced ? undefined : { opacity: heroOpacity }}
    >
      {/* Image (parallax) */}
      <motion.div
        className="absolute inset-0 z-0"
        style={prefersReduced ? undefined : { y: heroY, scale: heroScale }}
        initial={prefersReduced ? false : { scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
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
        {/* Triple gradient pour profondeur cinématique */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </motion.div>

      {/* Content (parallax up + fade) */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        style={prefersReduced ? undefined : { y: heroTextY }}
      >
        {/* Logo */}
        {logoUrl ? (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="relative mb-7 size-14 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
          >
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
              unoptimized
            />
          </motion.div>
        ) : null}

        {/* Pre-tagline */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          className="mb-3 text-[10px] font-bold tracking-[0.5em] text-white/70 uppercase sm:text-[11px]"
        >
          {locale === "en" ? "Welcome to" : "Bienvenue à la table de"}
        </motion.p>

        {/* Restaurant name */}
        <h1
          className="text-5xl leading-[0.92] font-bold tracking-tight text-white sm:text-7xl"
          style={{ textShadow: "0 8px 40px rgba(0,0,0,0.45)" }}
        >
          {name.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block overflow-hidden align-baseline">
              <motion.span
                initial={prefersReduced ? false : { y: "100%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.1,
                  ease: EASE,
                  delay: 0.5 + wi * 0.08,
                }}
                className="inline-block"
              >
                {word}
                {wi < name.split(" ").length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Filet décoratif */}
        <motion.div
          aria-hidden="true"
          initial={prefersReduced ? false : { width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 1 }}
          transition={{
            duration: 1,
            ease: EASE,
            delay: 0.7 + name.split(" ").length * 0.08,
          }}
          className="my-6 h-px bg-white/70"
        />

        {/* Description */}
        {description ? (
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: EASE,
              delay: 0.9 + name.split(" ").length * 0.08,
            }}
            className="max-w-md text-base font-light text-white/85 italic sm:text-lg"
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {description}
          </motion.p>
        ) : null}
      </motion.div>

      {/* Scroll indicator */}
      {!prefersReduced ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 1.5 + name.split(" ").length * 0.08,
          }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-semibold tracking-[0.4em] text-white/60 uppercase">
              {locale === "en" ? "Scroll" : "Découvrir"}
            </span>
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
              <rect
                x="1"
                y="1"
                width="14"
                height="20"
                rx="7"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
              />
              <motion.circle
                cx="8"
                cy="7"
                r="1.5"
                fill="rgba(255,255,255,0.85)"
                animate={{ cy: [7, 14, 7] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>
      ) : null}
    </motion.section>
  );
}

/* ─── NO-COVER HERO ─── */
function NoCoverHero({
  name,
  description,
}: {
  name: string;
  description: string | null;
}) {
  return (
    <section className="relative -mx-4 flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
      {/* Background gradient mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in oklab, var(--client-primary, currentColor) 12%, transparent), transparent), radial-gradient(ellipse 40% 30% at 80% 70%, color-mix(in oklab, var(--client-accent-2, currentColor) 8%, transparent), transparent)",
        }}
      />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="text-foreground/50 mb-3 text-[11px] font-bold tracking-[0.5em] uppercase"
      >
        Bienvenue
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 24, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
        className="text-5xl leading-tight font-bold tracking-tight sm:text-7xl"
        style={{ color: "var(--client-primary, currentColor)" }}
      >
        {name}
      </motion.h1>
      {description ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
          className="text-foreground/60 mt-6 max-w-md text-base italic sm:text-lg"
        >
          {description}
        </motion.p>
      ) : null}
    </section>
  );
}

/* ─── ITEM CARD EDITORIAL ─── */
function ItemCard({
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
  isEven,
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
  isEven: boolean;
  prefersReduced: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <motion.li
      initial={prefersReduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.9, ease: EASE },
        },
      }}
      className={`flex w-full flex-col ${isEven ? "items-start" : "items-end"}`}
    >
      <Link
        ref={ref}
        href={`/r/${slug}/t/${token}/items/${itemId}`}
        className={`group block w-full ${!isAvailable ? "pointer-events-none opacity-50" : ""}`}
        aria-label={itemName}
      >
        {/* Image full-width 85% avec mask reveal */}
        <div
          className={`relative aspect-[4/5] w-[88%] overflow-hidden rounded-sm bg-stone-100 sm:aspect-[5/4] ${
            isEven ? "ml-0" : "ml-auto"
          }`}
        >
          {imageUrl ? (
            <motion.div
              variants={{
                hidden: { clipPath: "inset(100% 0 0 0)" },
                visible: {
                  clipPath: "inset(0% 0 0 0)",
                  transition: { duration: 1.2, ease: EASE, delay: 0.1 },
                },
              }}
              className="absolute inset-0"
            >
              <motion.div
                className="absolute inset-0"
                variants={{
                  hidden: { scale: 1.25, filter: "blur(12px)" },
                  visible: {
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 1.5, ease: EASE },
                  },
                }}
              >
                <motion.div
                  className="size-full"
                  whileHover={prefersReduced ? undefined : { scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                >
                  <Image
                    src={imageUrl}
                    alt={itemName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 88vw, 600px"
                    unoptimized
                    loading="lazy"
                  />
                </motion.div>
              </motion.div>

              {/* Shine au hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
              />
            </motion.div>
          ) : (
            // Placeholder élégant si pas de photo
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE } },
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--client-primary, currentColor) 14%, #FAF8F2), color-mix(in oklab, var(--client-accent-2, currentColor) 6%, #F5F1E8))",
              }}
            >
              <span className="text-5xl opacity-40">🍽️</span>
            </motion.div>
          )}

          {/* Magnetic Price Tag */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 16, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.7, ease: EASE, delay: 0.5 },
              },
            }}
            className={`absolute bottom-4 ${isEven ? "right-4" : "left-4"} z-10`}
          >
            <div
              className="rounded-full bg-white/95 px-4 py-2 text-base font-bold shadow-xl backdrop-blur-md ring-1 ring-black/5 sm:text-lg"
              style={{ color: "var(--client-accent-2, var(--client-primary, #1A1A18))" }}
            >
              {priceFormatter.format(priceCents / 100)}
            </div>
          </motion.div>

          {/* Out of stock overlay */}
          {!isAvailable ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px]">
              <span className="rounded bg-white/95 px-3 py-1 text-xs font-bold tracking-[0.2em] uppercase shadow-lg">
                {locale === "en" ? "Sold Out" : "Rupture"}
              </span>
            </div>
          ) : null}
        </div>

        {/* Texte éditorial sous l'image */}
        <div
          className={`mt-6 max-w-md ${isEven ? "pr-3 text-left" : "ml-auto pl-3 text-right"}`}
        >
          <h3 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            {itemName}
          </h3>
          {itemDesc ? (
            <p className="text-foreground/55 mt-3 text-sm leading-relaxed italic sm:text-base">
              {itemDesc}
            </p>
          ) : null}

          {/* Métadonnées : allergènes + options */}
          {(allergens.length > 0 || optionsCount > 0) ? (
            <div
              className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 ${
                isEven ? "justify-start" : "justify-end"
              }`}
            >
              {allergens.slice(0, 6).map((a) => {
                const label = ALLERGEN_LABEL[a];
                if (!label) return null;
                return (
                  <span
                    key={a}
                    className="text-foreground/40 border border-black/10 px-2 py-1 text-[9px] tracking-[0.2em] uppercase"
                  >
                    {label[locale === "en" ? "en" : "fr"]}
                  </span>
                );
              })}
              {optionsCount > 0 ? (
                <span
                  className="border px-2 py-1 text-[9px] font-semibold tracking-[0.2em] uppercase"
                  style={{
                    borderColor:
                      "color-mix(in oklab, var(--client-primary, currentColor) 30%, transparent)",
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
          ) : null}
        </div>
      </Link>
    </motion.li>
  );
}
