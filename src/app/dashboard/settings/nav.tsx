"use client";

import { Building2, ChevronRight, Clock, CreditCard, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    href: "/dashboard/settings",
    label: "Abonnement",
    description: "Plan, facturation",
    icon: CreditCard,
    exact: true,
  },
  {
    href: "/dashboard/settings/general",
    label: "Informations",
    description: "Coordonnées, langues",
    icon: Building2,
  },
  {
    href: "/dashboard/settings/branding",
    label: "Branding",
    description: "Logo, couleur, cover",
    icon: Palette,
  },
  {
    href: "/dashboard/settings/hours",
    label: "Horaires",
    description: "Ouverture par jour",
    icon: Clock,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile : horizontal scroll pills */}
      <nav className="-mx-4 overflow-x-auto px-4 md:hidden" aria-label="Réglages">
        <div className="flex gap-1.5">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--brand-orange)] border-[var(--brand-orange)] text-white shadow-sm"
                    : "bg-card border-input text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop : vertical sidebar */}
      <nav className="hidden flex-col gap-1 md:flex">
        <p className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
          Réglages
        </p>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-[var(--brand-orange)]/10 text-[var(--brand-orange)] font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-[var(--brand-orange)] text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10",
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate">{item.label}</p>
                <p
                  className={cn(
                    "truncate text-[10px]",
                    isActive ? "text-[var(--brand-orange)]/70" : "text-muted-foreground/70",
                  )}
                >
                  {item.description}
                </p>
              </div>
              {isActive ? <ChevronRight className="size-3.5 shrink-0" /> : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
