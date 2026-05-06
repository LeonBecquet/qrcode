"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Edit3,
  ExternalLink,
  Eye,
  FolderPlus,
  ImageIcon,
  Languages,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Menu, Restaurant } from "@/lib/db/schema";

type ItemPreview = {
  id: string;
  nameFr: string;
  priceCents: number;
  imageUrl: string | null;
};

type Props = {
  menu: Menu;
  totalItems: number;
  totalCategories: number;
  previews: ItemPreview[];
  restaurant: Pick<Restaurant, "name" | "logoUrl" | "languages" | "theme">;
  publicUrl: string | null;
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const eurFmt = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function MenuShowcase({
  menu,
  totalItems,
  totalCategories,
  previews,
  restaurant,
  publicUrl,
}: Props) {
  const accent = restaurant.theme?.primary ?? "#EE8033";
  const isEmpty = totalItems === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="bg-card relative overflow-hidden rounded-3xl border shadow-sm hover:shadow-xl transition-shadow"
    >
      {/* Top gradient accent bar */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: `linear-gradient(90deg, var(--brand-forest), ${accent}, var(--brand-saffron))`,
        }}
      />

      {/* Decorative blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full opacity-30 blur-3xl"
        style={{ background: accent }}
      />

      <div className="relative grid items-center gap-6 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
        {/* === Left : Info + actions === */}
        <div className="space-y-5">
          {/* Header avec status */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: accent }}
              >
                <UtensilsCrossed className="size-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight">{menu.name}</h2>
                <p className="text-muted-foreground text-xs">
                  Modifié le {dateFmt.format(menu.updatedAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {menu.isPublished ? (
                <span className="bg-[var(--brand-forest)]/15 text-[var(--brand-forest)] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
                  <span className="bg-[var(--brand-forest)] size-1.5 rounded-full" />
                  Publié
                </span>
              ) : (
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                  Brouillon
                </span>
              )}
            </div>
          </div>

          {/* Stats inline */}
          <div className="grid grid-cols-3 gap-2">
            <Stat
              icon={<FolderPlus className="size-4" />}
              value={String(totalCategories)}
              label={totalCategories > 1 ? "catégories" : "catégorie"}
            />
            <Stat
              icon={<UtensilsCrossed className="size-4" />}
              value={String(totalItems)}
              label={totalItems > 1 ? "plats" : "plat"}
            />
            <Stat
              icon={<Languages className="size-4" />}
              value={restaurant.languages.length === 2 ? "FR/EN" : "FR"}
              label="langues"
            />
          </div>

          {/* Preview text des items en lignes compactes ou empty state */}
          {isEmpty ? (
            <div className="border-[var(--brand-orange)]/30 bg-[var(--brand-orange)]/5 rounded-xl border-2 border-dashed p-5 text-center">
              <div className="bg-[var(--brand-orange)]/15 text-[var(--brand-orange)] mx-auto mb-2 flex size-10 items-center justify-center rounded-full">
                <UtensilsCrossed className="size-5" />
              </div>
              <p className="text-sm font-medium">Cette carte est vide</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Ajoutez vos premiers plats pour qu&apos;ils apparaissent ici et chez vos clients.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {previews.slice(0, 3).map((item) => (
                <li
                  key={item.id}
                  className="bg-muted/40 flex items-center gap-3 rounded-lg px-3 py-2"
                >
                  {item.imageUrl ? (
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="size-9 shrink-0 rounded-md"
                      style={{ background: `${accent}30` }}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {item.nameFr}
                  </span>
                  <span className="font-mono text-xs font-semibold">
                    {eurFmt.format(item.priceCents / 100)}
                  </span>
                </li>
              ))}
              {totalItems > 3 ? (
                <li className="text-muted-foreground py-1 text-center text-xs">
                  + {totalItems - 3} autres plat{totalItems - 3 > 1 ? "s" : ""}
                </li>
              ) : null}
            </ul>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/menu/${menu.id}`}
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <Edit3 className="size-4" />
              {isEmpty ? "Construire la carte" : "Modifier"}
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
            {publicUrl ? (
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border-input hover:bg-muted/50 inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <Eye className="size-4" />
                Aperçu client
                <ExternalLink className="size-3" />
              </Link>
            ) : null}
          </div>
        </div>

        {/* === Right : Phone preview === */}
        <div className="hidden lg:block">
          <PhoneMini
            restaurantName={restaurant.name}
            logoUrl={restaurant.logoUrl}
            menuName={menu.name}
            previews={previews}
            accent={accent}
          />
        </div>
      </div>
    </motion.article>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function PhoneMini({
  restaurantName,
  logoUrl,
  menuName,
  previews,
  accent,
}: {
  restaurantName: string;
  logoUrl: string | null;
  menuName: string;
  previews: ItemPreview[];
  accent: string;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      {/* "Live preview" label */}
      <div className="mb-2 flex items-center justify-center gap-1.5">
        <span className="bg-[var(--brand-forest)]/15 text-[var(--brand-forest)] inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <span className="bg-[var(--brand-forest)] size-1.5 rounded-full" />
          Aperçu client
        </span>
      </div>

      {/* Phone shell */}
      <div className="border-foreground bg-foreground relative aspect-[9/19] rounded-[28px] border-[6px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]">
        <div className="bg-foreground absolute top-1 left-1/2 z-10 h-3 w-16 -translate-x-1/2 rounded-full" />

        <div className="bg-[var(--brand-cream)] relative h-full w-full overflow-hidden rounded-[22px]">
          {/* Header */}
          <div className="bg-[var(--brand-cream)]/95 sticky top-0 z-10 flex items-center gap-1.5 border-b border-black/10 px-2.5 pt-7 pb-2 backdrop-blur">
            {logoUrl ? (
              <div className="relative size-5 shrink-0 overflow-hidden rounded-full border border-black/10">
                <Image
                  src={logoUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="20px"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className="size-5 shrink-0 rounded-full"
                style={{ background: accent }}
              />
            )}
            <p className="min-w-0 flex-1 truncate text-[10px] font-semibold text-black">
              {restaurantName}
            </p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[7px] font-medium text-white"
              style={{ background: accent }}
            >
              FR
            </span>
          </div>

          {/* Items preview */}
          <div className="space-y-1 p-2">
            {previews.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <span className="text-2xl">🍽️</span>
                <p className="mt-1 text-[9px] text-black/50">{menuName}</p>
                <p className="text-[8px] text-black/40">Carte vide</p>
              </div>
            ) : (
              previews.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-stretch gap-1.5 rounded-md border border-black/8 bg-white p-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[8px] font-medium text-black">
                      {item.nameFr}
                    </p>
                    <p className="mt-0.5 font-mono text-[7px] font-bold text-black">
                      {eurFmt.format(item.priceCents / 100)}
                    </p>
                  </div>
                  {item.imageUrl ? (
                    <div className="relative size-8 shrink-0 overflow-hidden rounded">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="size-8 shrink-0 rounded"
                      style={{ background: `${accent}30` }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cart sticky bottom */}
          <div className="absolute right-1.5 bottom-1.5 left-1.5">
            <div className="bg-foreground text-background flex items-center justify-between rounded-full px-2 py-1.5 text-[8px] shadow-md">
              <span className="flex items-center gap-1">
                <ImageIcon className="size-2.5" />
                Voir le panier
              </span>
              <span className="font-mono">—</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
