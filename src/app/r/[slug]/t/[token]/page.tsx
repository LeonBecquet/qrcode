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

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { restaurant } = await resolvePublicTable(slug, token);
  const locale = await getPublicLocale(restaurant.languages);
  const publicMenu = await loadPublicMenu(restaurant.id);

  if (!publicMenu || publicMenu.categories.length === 0) {
    return (
      <div className="-mx-4">
        {restaurant.coverUrl ? (
          <CoverHero coverUrl={restaurant.coverUrl} name={restaurant.name} />
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

  const { categories } = publicMenu;
  const visibleCategories = categories.filter((cat) => cat.items.length > 0);
  const hasMultipleCategories = visibleCategories.length > 1;

  return (
    <>
      {/* === Cover hero === */}
      {restaurant.coverUrl ? (
        <div className="-mx-4">
          <CoverHero coverUrl={restaurant.coverUrl} name={restaurant.name} />
        </div>
      ) : (
        // Si pas de cover, juste un titre éditorial centré
        <div className="px-2 pt-8 pb-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {restaurant.name}
          </h1>
          {restaurant.description ? (
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm italic">
              {restaurant.description}
            </p>
          ) : null}
        </div>
      )}

      {/* === Sticky pills nav === */}
      {hasMultipleCategories ? (
        <nav
          className="bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-[60px] z-10 -mx-4 mt-4 backdrop-blur"
          aria-label={locale === "en" ? "Categories" : "Catégories"}
        >
          <div className="overflow-x-auto">
            <ul className="flex gap-1 px-4 py-3 whitespace-nowrap">
              {visibleCategories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#cat-${cat.id}`}
                    className="text-foreground/80 hover:text-foreground hover:bg-muted/40 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors"
                  >
                    <span>{pickLocalizedText(cat, locale)}</span>
                  </a>
                </li>
              ))}
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
        </nav>
      ) : null}

      {/* === Catégories : style menu imprimé === */}
      <div className="space-y-12 py-8">
        {visibleCategories.map((category) => {
          const catName = pickLocalizedText(category, locale);
          const catDesc = pickLocalizedDescription(category, locale);

          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-32"
            >
              {/* Section header — typographique, ornement filets */}
              <header className="mb-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-12"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent))",
                    }}
                  />
                  <h2
                    className="text-2xl font-semibold tracking-tight uppercase sm:text-3xl"
                    style={{
                      color: "var(--client-primary, currentColor)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {catName}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="h-px w-12"
                    style={{
                      background:
                        "linear-gradient(90deg, color-mix(in oklab, var(--client-primary, currentColor) 60%, transparent), transparent)",
                    }}
                  />
                </div>
                {catDesc ? (
                  <p className="text-muted-foreground mx-auto mt-2 max-w-md text-xs italic sm:text-sm">
                    {catDesc}
                  </p>
                ) : null}
              </header>

              {/* Items list — typographique */}
              <ul className="space-y-1">
                {category.items.map((item, idx) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  const hasOptions = item.options.length > 0;
                  const allergens = item.allergens ?? [];
                  const isLast = idx === category.items.length - 1;

                  return (
                    <li key={item.id}>
                      <Link
                        href={`/r/${slug}/t/${token}/items/${item.id}`}
                        className={`group relative flex items-start gap-4 px-2 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--client-primary,currentColor)_4%,transparent)] ${
                          !item.isAvailable ? "opacity-50" : ""
                        }`}
                      >
                        {/* Photo (si dispo) — petite, pas un placeholder vide */}
                        {item.imageUrl ? (
                          <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-md sm:size-24">
                            <Image
                              src={item.imageUrl}
                              alt={itemName}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="(max-width: 640px) 80px, 96px"
                              unoptimized
                            />
                            {!item.isAvailable ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <span className="rounded bg-white/95 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                                  {locale === "en" ? "Out" : "Rupture"}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {/* Texte */}
                        <div className="min-w-0 flex-1">
                          {/* Header row : nom · filet · prix */}
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                              {itemName}
                            </h3>
                            <span
                              aria-hidden="true"
                              className="dot-leader min-w-4 flex-1 self-center opacity-30"
                              style={{
                                borderBottom: "2px dotted currentColor",
                                marginBottom: "0.4em",
                              }}
                            />
                            <span
                              className="shrink-0 text-base font-bold tracking-tight tabular-nums sm:text-lg"
                              style={{
                                color:
                                  "var(--client-accent-2, var(--client-primary, currentColor))",
                              }}
                            >
                              {priceFormatter.format(item.priceCents / 100)}
                            </span>
                          </div>

                          {/* Description italic */}
                          {itemDesc ? (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm italic">
                              {itemDesc}
                            </p>
                          ) : null}

                          {/* Footer row : allergens + options indicator */}
                          {(allergens.length > 0 || hasOptions) ? (
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                              {allergens.length > 0 ? (
                                <span
                                  className="text-muted-foreground/80"
                                  title={allergens
                                    .map(
                                      (a) =>
                                        ALLERGEN_FULL[a]?.[locale === "en" ? "en" : "fr"] ?? a,
                                    )
                                    .join(", ")}
                                >
                                  <span className="opacity-60">
                                    {locale === "en" ? "Contains:" : "Contient :"}
                                  </span>{" "}
                                  <span className="font-medium">
                                    {allergens
                                      .map((a) => ALLERGEN_INITIALS[a] ?? a)
                                      .join(" · ")}
                                  </span>
                                </span>
                              ) : null}
                              {hasOptions ? (
                                <span
                                  className="font-medium"
                                  style={{
                                    color: "var(--client-primary, currentColor)",
                                  }}
                                >
                                  + {item.options.length}{" "}
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
                          ) : null}
                        </div>
                      </Link>
                      {/* Filet entre items */}
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
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* === Note allergens === */}
      <div className="border-t pt-6 pb-2 text-center">
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
      </div>

      <CartButton slug={slug} token={token} />
    </>
  );
}

/* ---- Cover hero — épuré, sans fioritures ---- */
function CoverHero({ coverUrl, name }: { coverUrl: string; name: string }) {
  return (
    <div className="relative h-40 w-full overflow-hidden sm:h-52">
      <Image
        src={coverUrl}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        unoptimized
      />
      {/* Vignette sombre douce pour texte lisible */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
      {/* Nom du resto en bas */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-center sm:p-6">
        <h2 className="text-3xl leading-tight font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl">
          {name}
        </h2>
      </div>
    </div>
  );
}
