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
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          {locale === "en"
            ? "The menu is not available yet."
            : "Le menu n'est pas encore disponible."}
        </p>
      </div>
    );
  }

  const { categories } = publicMenu;
  const visibleCategories = categories.filter((cat) => cat.items.length > 0);

  return (
    <>
      {visibleCategories.length > 1 ? (
        <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-[60px] z-10 -mx-4 mb-4 overflow-x-auto border-b backdrop-blur">
          <ul className="flex gap-1 px-4 py-2 text-sm whitespace-nowrap">
            {visibleCategories.map((cat) => (
              <li key={cat.id}>
                <a
                  href={`#cat-${cat.id}`}
                  className="hover:bg-muted block rounded px-3 py-1.5"
                >
                  {pickLocalizedText(cat, locale)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="space-y-8 py-4">
        {visibleCategories.map((category) => {
          const catName = pickLocalizedText(category, locale);
          const catDesc = pickLocalizedDescription(category, locale);
          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-32 space-y-3"
            >
              <header>
                <h2 className="text-2xl font-semibold tracking-tight">{catName}</h2>
                {catDesc ? (
                  <p className="text-muted-foreground text-sm">{catDesc}</p>
                ) : null}
              </header>

              <ul className="divide-y rounded-lg border">
                {category.items.map((item) => {
                  const itemName = pickLocalizedText(item, locale);
                  const itemDesc = pickLocalizedDescription(item, locale);
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/r/${slug}/t/${token}/items/${item.id}`}
                        className="hover:bg-muted/40 flex items-stretch gap-3 p-3 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{itemName}</h3>
                            {!item.isAvailable ? (
                              <span className="text-destructive bg-destructive/10 rounded px-1.5 py-0.5 text-xs">
                                {locale === "en" ? "Unavailable" : "Indisponible"}
                              </span>
                            ) : null}
                          </div>
                          {itemDesc ? (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                              {itemDesc}
                            </p>
                          ) : null}
                          <p className="mt-2 font-mono text-sm font-semibold">
                            {priceFormatter.format(item.priceCents / 100)}
                          </p>
                        </div>
                        {item.imageUrl ? (
                          <div className="bg-muted relative size-24 shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={item.imageUrl}
                              alt={itemName}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized
                            />
                          </div>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <CartButton slug={slug} token={token} />
    </>
  );
}
