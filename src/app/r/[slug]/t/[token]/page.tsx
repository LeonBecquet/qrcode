import Image from "next/image";
import Link from "next/link";
import { CartButton } from "./cart-button";
import {
  getPublicLocale,
  pickLocalizedDescription,
  pickLocalizedText,
} from "@/lib/server/locale";
import { loadPublicMenu, resolvePublicTable } from "@/lib/server/public-resolver";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const ALLERGEN_LABEL: Record<string, { emoji: string; label: string; labelEn: string }> = {
  gluten: { emoji: "🌾", label: "Gluten", labelEn: "Gluten" },
  crustaces: { emoji: "🦐", label: "Crustacés", labelEn: "Crustaceans" },
  oeufs: { emoji: "🥚", label: "Œufs", labelEn: "Eggs" },
  poisson: { emoji: "🐟", label: "Poisson", labelEn: "Fish" },
  arachide: { emoji: "🥜", label: "Arachide", labelEn: "Peanuts" },
  soja: { emoji: "🫘", label: "Soja", labelEn: "Soy" },
  lait: { emoji: "🥛", label: "Lait", labelEn: "Milk" },
  "fruits-coque": { emoji: "🌰", label: "Fruits à coque", labelEn: "Tree nuts" },
  celeri: { emoji: "🌿", label: "Céleri", labelEn: "Celery" },
  moutarde: { emoji: "🟡", label: "Moutarde", labelEn: "Mustard" },
  sesame: { emoji: "🫛", label: "Sésame", labelEn: "Sesame" },
  sulfites: { emoji: "🍷", label: "Sulfites", labelEn: "Sulphites" },
  lupin: { emoji: "🌱", label: "Lupin", labelEn: "Lupin" },
  mollusques: { emoji: "🦪", label: "Mollusques", labelEn: "Molluscs" },
};

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { restaurant } = await resolvePublicTable(slug, token);
  const locale = await getPublicLocale(restaurant.languages);
  const publicMenu = await loadPublicMenu(restaurant.id);

  const hasCover = !!restaurant.coverUrl;
  const description = restaurant.description;

  if (!publicMenu || publicMenu.categories.length === 0) {
    return (
      <div className="-mx-4">
        {hasCover ? <CoverHero coverUrl={restaurant.coverUrl!} name={restaurant.name} description={description} /> : null}
        <div className="mt-8 px-4 py-16">
          <div
            className="bg-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center"
            style={{
              borderColor: "color-mix(in oklab, var(--client-primary, #ccc) 30%, transparent)",
            }}
          >
            <span className="text-5xl">🍽️</span>
            <p className="text-lg font-semibold">
              {locale === "en" ? "Menu coming soon" : "Carte en préparation"}
            </p>
            <p className="text-muted-foreground text-sm">
              {locale === "en"
                ? "The menu is not yet published."
                : "Le restaurant n'a pas encore publié sa carte."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { categories } = publicMenu;
  const visibleCategories = categories.filter((cat) => cat.items.length > 0);
  const hasMultipleCategories = visibleCategories.length > 1;

  return (
    <>
      {/* === Cover hero (full bleed) === */}
      {hasCover ? (
        <div className="-mx-4">
          <CoverHero
            coverUrl={restaurant.coverUrl!}
            name={restaurant.name}
            description={description}
          />
        </div>
      ) : null}

      {/* === Sticky category pills === */}
      {hasMultipleCategories ? (
        <nav
          className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-[60px] z-10 -mx-4 border-b backdrop-blur"
          style={{
            borderColor: "color-mix(in oklab, var(--client-primary, #ccc) 15%, transparent)",
          }}
          aria-label={locale === "en" ? "Categories" : "Catégories"}
        >
          <div className="overflow-x-auto">
            <ul className="flex gap-1.5 px-4 py-2.5 whitespace-nowrap">
              {visibleCategories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#cat-${cat.id}`}
                    className="text-foreground hover:bg-muted/60 group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--client-primary, #ccc) 20%, transparent)",
                    }}
                  >
                    {pickLocalizedText(cat, locale)}
                    <span
                      className="text-muted-foreground text-[10px] tabular-nums"
                    >
                      {cat.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}

      {/* === Categories sections === */}
      <div className="space-y-10 py-6">
        {visibleCategories.map((category, catIdx) => {
          const catName = pickLocalizedText(category, locale);
          const catDesc = pickLocalizedDescription(category, locale);
          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-32 space-y-4"
            >
              {/* Section header — gros titre + filet décoratif */}
              <header className="space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-xs font-semibold tracking-[0.2em] uppercase opacity-60"
                    style={{ color: "var(--client-primary, currentColor)" }}
                  >
                    {String(catIdx + 1).padStart(2, "0")}
                  </span>
                  <h2
                    className="text-2xl leading-tight font-bold tracking-tight sm:text-3xl"
                    style={{ color: "var(--client-primary, currentColor)" }}
                  >
                    {catName}
                  </h2>
                </div>
                {catDesc ? (
                  <p className="text-muted-foreground max-w-xl text-sm italic">
                    {catDesc}
                  </p>
                ) : null}
                <div
                  aria-hidden="true"
                  className="mt-2 h-0.5 w-12 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--client-primary, currentColor), color-mix(in oklab, var(--client-primary, currentColor) 30%, transparent))",
                  }}
                />
              </header>

              {/* Items grid — full-width sur mobile, 2 cols si beaucoup d'items et photos */}
              <ul className="grid gap-3">
                {category.items.map((item) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  const hasOptions = item.options.length > 0;
                  const allergenList = (item.allergens ?? []).slice(0, 4);
                  const moreAllergens = (item.allergens ?? []).length - allergenList.length;

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/r/${slug}/t/${token}/items/${item.id}`}
                        className={`group bg-card relative flex items-stretch gap-3 overflow-hidden rounded-xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-4 ${
                          !item.isAvailable ? "opacity-60" : ""
                        }`}
                        style={{
                          borderColor:
                            "color-mix(in oklab, var(--client-primary, #ccc) 12%, transparent)",
                        }}
                      >
                        {/* Image (left) */}
                        {item.imageUrl ? (
                          <div className="relative aspect-square w-28 shrink-0 sm:w-32">
                            <Image
                              src={item.imageUrl}
                              alt={itemName}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="(max-width: 640px) 112px, 128px"
                              unoptimized
                            />
                            {!item.isAvailable ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                                <span className="bg-destructive rounded px-2 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md">
                                  {locale === "en" ? "Out" : "Rupture"}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <div
                            className="relative aspect-square w-28 shrink-0 overflow-hidden sm:w-32"
                            style={{
                              background:
                                "linear-gradient(135deg, color-mix(in oklab, var(--client-primary, #ccc) 18%, transparent), color-mix(in oklab, var(--client-primary, #ccc) 5%, transparent))",
                            }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-40">
                              🍴
                            </span>
                          </div>
                        )}

                        {/* Content (right) */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-3 pr-3 sm:py-4 sm:pr-4">
                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-semibold tracking-tight sm:text-base">
                                {itemName}
                              </h3>
                            </div>
                            {itemDesc ? (
                              <p className="text-muted-foreground line-clamp-2 text-xs italic sm:text-sm">
                                {itemDesc}
                              </p>
                            ) : null}
                            {/* Allergens row */}
                            {allergenList.length > 0 ? (
                              <div
                                className="mt-1.5 flex flex-wrap items-center gap-1"
                                title={
                                  locale === "en" ? "Allergens" : "Allergènes"
                                }
                              >
                                {allergenList.map((a) => {
                                  const info = ALLERGEN_LABEL[a];
                                  if (!info) return null;
                                  return (
                                    <span
                                      key={a}
                                      className="bg-muted/60 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                                      title={
                                        locale === "en" ? info.labelEn : info.label
                                      }
                                    >
                                      <span aria-hidden>{info.emoji}</span>
                                      <span className="text-muted-foreground">
                                        {locale === "en" ? info.labelEn : info.label}
                                      </span>
                                    </span>
                                  );
                                })}
                                {moreAllergens > 0 ? (
                                  <span className="text-muted-foreground text-[10px]">
                                    +{moreAllergens}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          {/* Footer : prix + options indicator */}
                          <div className="flex items-end justify-between gap-2 pt-1">
                            <p
                              className="text-base font-bold tracking-tight tabular-nums sm:text-lg"
                              style={{
                                color:
                                  "var(--client-accent-2, var(--client-primary, currentColor))",
                              }}
                            >
                              {priceFormatter.format(item.priceCents / 100)}
                            </p>
                            {hasOptions ? (
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  background:
                                    "color-mix(in oklab, var(--client-primary, currentColor) 10%, transparent)",
                                  color: "var(--client-primary, currentColor)",
                                }}
                              >
                                <span>+</span>
                                {item.options.length}{" "}
                                {locale === "en"
                                  ? item.options.length > 1
                                    ? "options"
                                    : "option"
                                  : item.options.length > 1
                                    ? "choix"
                                    : "choix"}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* === Bottom note === */}
      <div className="text-muted-foreground border-t pt-6 pb-4 text-center text-[11px]">
        <p>
          {locale === "en"
            ? "Allergens are indicated next to each dish. Speak to a server for any specific request."
            : "Les allergènes sont indiqués sous chaque plat. Demandez à votre serveur pour toute spécificité."}
        </p>
      </div>

      <CartButton slug={slug} token={token} />
    </>
  );
}

/* ---- Cover hero block ---- */
function CoverHero({
  coverUrl,
  name,
  description,
}: {
  coverUrl: string;
  name: string;
  description: string | null;
}) {
  return (
    <div className="relative h-44 w-full overflow-hidden sm:h-56">
      <Image
        src={coverUrl}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        unoptimized
      />
      {/* Gradient overlay : sombre en bas pour lisibilité du texte */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 35%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Brand color hint */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-1"
        style={{
          background:
            "linear-gradient(90deg, var(--client-primary, transparent), var(--client-accent-2, transparent), var(--client-primary, transparent))",
        }}
      />
      {/* Title overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <h2 className="text-2xl leading-tight font-bold tracking-tight text-white drop-shadow-md sm:text-3xl">
          {name}
        </h2>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-white/90 italic drop-shadow-sm sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
