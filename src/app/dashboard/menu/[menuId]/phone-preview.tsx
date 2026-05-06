import Image from "next/image";
import type { MenuCategory, MenuItem, Restaurant } from "@/lib/db/schema";

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

type Props = {
  restaurant: Pick<Restaurant, "name" | "logoUrl" | "languages" | "theme">;
  menuName: string;
  categories: (MenuCategory & { items: MenuItem[] })[];
};

/**
 * Mockup phone qui montre le menu rendu comme un client le verrait.
 * Sticky à droite du menu builder pour live preview.
 */
export function PhonePreview({ restaurant, menuName, categories }: Props) {
  const accent = restaurant.theme?.primary ?? "#EE8033";
  const visibleCategories = categories.filter((c) => c.items.length > 0);

  return (
    <div className="sticky top-24 mx-auto w-full max-w-[300px]">
      {/* Label "Aperçu client" */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Aperçu client
        </span>
        <span className="bg-[var(--brand-forest)]/10 text-[var(--brand-forest)] inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium">
          <span className="bg-[var(--brand-forest)] size-1.5 rounded-full" />
          Live
        </span>
      </div>

      {/* Phone shell */}
      <div className="border-foreground bg-foreground relative aspect-[9/19] rounded-[36px] border-[8px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]">
        {/* Notch */}
        <div className="bg-foreground absolute top-1.5 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-full" />

        <div className="bg-[var(--brand-cream)] relative h-full w-full overflow-hidden rounded-[28px]">
          {/* Header sticky resto */}
          <div className="bg-[var(--brand-cream)]/95 sticky top-0 z-10 flex items-center gap-2 border-b border-black/10 px-3 pt-9 pb-2.5 backdrop-blur">
            {restaurant.logoUrl ? (
              <div className="relative size-7 shrink-0 overflow-hidden rounded-full border border-black/10">
                <Image
                  src={restaurant.logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="28px"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="size-7 shrink-0 rounded-full"
                style={{ background: accent }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-black">{restaurant.name}</p>
              <p className="truncate text-[9px] text-black/60">Table T5</p>
            </div>
            <span
              className="rounded-full px-1.5 py-0.5 text-[8px] font-medium text-white"
              style={{ background: accent }}
            >
              FR
            </span>
          </div>

          {/* Sticky tabs catégories */}
          {visibleCategories.length > 1 ? (
            <div className="sticky top-[60px] z-[9] border-b border-black/5 bg-[var(--brand-cream)]/95 px-3 py-1.5 backdrop-blur">
              <div className="flex gap-1 overflow-x-auto text-[9px]">
                {visibleCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded px-1.5 py-0.5 whitespace-nowrap text-black/70"
                  >
                    {cat.nameFr}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Content scrollable */}
          <div className="space-y-4 p-3 pb-12">
            {visibleCategories.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center pt-16 text-center">
                <span className="text-3xl">🍽️</span>
                <p className="mt-2 text-[11px] text-black/50">
                  Le menu est vide. Ajoutez des plats pour qu&apos;ils s&apos;affichent ici.
                </p>
              </div>
            ) : (
              visibleCategories.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-black">{cat.nameFr}</h3>
                  <ul className="space-y-1.5">
                    {cat.items.slice(0, 4).map((item) => (
                      <li
                        key={item.id}
                        className="flex items-stretch gap-2 rounded-md border border-black/8 bg-white p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium text-black">
                            {item.nameFr}
                          </p>
                          {item.descriptionFr ? (
                            <p className="line-clamp-1 text-[8px] text-black/60">
                              {item.descriptionFr}
                            </p>
                          ) : null}
                          <p className="mt-1 font-mono text-[9px] font-bold text-black">
                            {formatter.format(item.priceCents / 100)}
                          </p>
                        </div>
                        {item.imageUrl ? (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div
                            className="size-12 shrink-0 rounded"
                            style={{ background: `${accent}30` }}
                          />
                        )}
                      </li>
                    ))}
                    {cat.items.length > 4 ? (
                      <li className="text-center text-[9px] text-black/40">
                        + {cat.items.length - 4} autres
                      </li>
                    ) : null}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Footer cart sticky */}
          <div className="absolute right-2 bottom-2 left-2">
            <div
              className="flex items-center justify-between rounded-full px-3 py-2 text-[10px] text-white shadow-lg"
              style={{ background: "#1A1A18" }}
            >
              <span className="font-medium">{menuName}</span>
              <span className="text-white/60">Aperçu live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-muted-foreground mt-2 text-center text-[10px]">
        Mise à jour en temps réel à chaque modification
      </p>
    </div>
  );
}
