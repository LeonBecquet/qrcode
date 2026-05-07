"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type {
  PublicMenu,
} from "@/lib/server/public-resolver";
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

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

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

  /* Active section tracking via IntersectionObserver */
  const [activeCatId, setActiveCatId] = useState<string | null>(
    visibleCategories[0]?.id ?? null,
  );

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
        // top : -130px (header + pills sticky), bottom : 60% (priorité haut écran)
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
          <CoverHero coverUrl={coverUrl} name={restaurantName} prefersReduced={!!prefersReduced} />
        ) : null}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="px-4 py-16 text-center"
        >
          <p className="text-3xl">🍽️</p>
          <p className="mt-3 text-lg font-medium">
            {locale === "en" ? "Menu coming soon" : "Carte en préparation"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {locale === "en"
              ? "The chef is finalising the dishes."
              : "Le chef finalise les plats."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* === Cover hero === */}
      {coverUrl ? (
        <div className="-mx-4">
          <CoverHero
            coverUrl={coverUrl}
            name={restaurantName}
            prefersReduced={!!prefersReduced}
          />
        </div>
      ) : (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="px-2 pt-8 pb-2 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {restaurantName}
          </h1>
          {restaurantDescription ? (
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm italic">
              {restaurantDescription}
            </p>
          ) : null}
        </motion.div>
      )}

      {/* === Sticky pills nav === */}
      {hasMultipleCategories ? (
        <motion.nav
          initial={prefersReduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
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
                          ? "text-foreground font-medium"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="active-pill-bg"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "color-mix(in oklab, var(--client-primary, currentColor) 12%, transparent)",
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
          <div
            aria-hidden="true"
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 30%, transparent), transparent)",
            }}
          />
        </motion.nav>
      ) : null}

      {/* === Sections === */}
      <div className="space-y-12 py-8">
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
              {/* Section header — dashes + title with reveal */}
              <SectionHeader
                title={catName}
                description={catDesc}
                index={catIdx}
                prefersReduced={!!prefersReduced}
              />

              {/* Items list with stagger */}
              <ul className="space-y-1">
                {category.items.map((item, idx) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  const isLast = idx === category.items.length - 1;
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
                      isLast={isLast}
                      delay={idx * 0.06}
                      prefersReduced={!!prefersReduced}
                    />
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Footer note */}
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
        <p className="text-muted-foreground/60 mt-2 text-[11px]">
          {locale === "en"
            ? "Speak to a server for any specific request."
            : "Demandez à votre serveur pour toute spécificité."}
        </p>
      </motion.div>
    </>
  );
}

/* === Cover hero with parallax + scale entrance === */
function CoverHero({
  coverUrl,
  name,
  prefersReduced,
}: {
  coverUrl: string;
  name: string;
  prefersReduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax : l'image bouge moins vite que le scroll
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);

  return (
    <div
      ref={ref}
      className="relative h-44 w-full overflow-hidden sm:h-56"
    >
      {/* Image (parallax) */}
      <motion.div
        className="absolute inset-0"
        style={prefersReduced ? undefined : { y, scale }}
        initial={prefersReduced ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          unoptimized
        />
      </motion.div>

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* Title overlay (parallax up) */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-center sm:p-6"
        style={prefersReduced ? undefined : { y: titleY, opacity: titleOpacity }}
        initial={prefersReduced ? false : { opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
      >
        <h2 className="text-3xl leading-tight font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl">
          {name}
        </h2>
      </motion.div>
    </div>
  );
}

/* === Section header avec filets qui se draw === */
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
      className="mb-6 text-center"
      initial={prefersReduced ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="flex items-center justify-center gap-3">
        <motion.span
          aria-hidden="true"
          className="block h-px"
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: { width: 48, opacity: 1 },
          }}
          transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent))",
          }}
        />
        <motion.h2
          className="text-2xl font-semibold tracking-tight uppercase sm:text-3xl"
          variants={{
            hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 + index * 0.05 }}
          style={{
            color: "var(--client-primary, currentColor)",
            letterSpacing: "0.08em",
          }}
        >
          {title}
        </motion.h2>
        <motion.span
          aria-hidden="true"
          className="block h-px"
          variants={{
            hidden: { width: 0, opacity: 0 },
            visible: { width: 48, opacity: 1 },
          }}
          transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent), transparent)",
          }}
        />
      </div>
      {description ? (
        <motion.p
          className="text-muted-foreground mx-auto mt-2 max-w-md text-xs italic sm:text-sm"
          variants={{
            hidden: { opacity: 0, y: 6 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.header>
  );
}

/* === Item row avec reveal + hover === */
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
  isLast,
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
  isLast: boolean;
  delay: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.li
      initial={prefersReduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      <Link
        href={`/r/${slug}/t/${token}/items/${itemId}`}
        className={`group relative flex items-start gap-4 px-2 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--client-primary,currentColor)_4%,transparent)] ${
          !isAvailable ? "opacity-50" : ""
        }`}
      >
        {/* Photo (si dispo) */}
        {imageUrl ? (
          <motion.div
            className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md sm:size-24"
            whileHover={prefersReduced ? undefined : { scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Image
              src={imageUrl}
              alt={itemName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 80px, 96px"
              unoptimized
            />
            {!isAvailable ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                  {locale === "en" ? "Out" : "Rupture"}
                </span>
              </div>
            ) : null}
            {/* Shine effect au hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
          </motion.div>
        ) : null}

        {/* Texte */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
              {itemName}
            </h3>
            <span
              aria-hidden="true"
              className="min-w-4 flex-1 self-center opacity-30"
              style={{
                borderBottom: "2px dotted currentColor",
                marginBottom: "0.4em",
              }}
            />
            <span
              className="shrink-0 text-base font-bold tracking-tight tabular-nums sm:text-lg"
              style={{
                color: "var(--client-accent-2, var(--client-primary, currentColor))",
              }}
            >
              {priceFormatter.format(priceCents / 100)}
            </span>
          </div>

          {itemDesc ? (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm italic">
              {itemDesc}
            </p>
          ) : null}

          {(allergens.length > 0 || optionsCount > 0) ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {allergens.length > 0 ? (
                <span
                  className="text-muted-foreground/80"
                  title={allergens
                    .map(
                      (a) => ALLERGEN_FULL[a]?.[locale === "en" ? "en" : "fr"] ?? a,
                    )
                    .join(", ")}
                >
                  <span className="opacity-60">
                    {locale === "en" ? "Contains:" : "Contient :"}
                  </span>{" "}
                  <span className="font-medium">
                    {allergens.map((a) => ALLERGEN_INITIALS[a] ?? a).join(" · ")}
                  </span>
                </span>
              ) : null}
              {optionsCount > 0 ? (
                <span
                  className="font-medium"
                  style={{ color: "var(--client-primary, currentColor)" }}
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
      {!isLast ? (
        <div
          aria-hidden="true"
          className="mx-2 h-px"
          style={{
            background:
              "color-mix(in oklab, var(--client-primary, currentColor) 8%, transparent)",
          }}
        />
      ) : null}
    </motion.li>
  );
}

// Wrap default export to keep AnimatePresence available if needed later
export { AnimatePresence };
