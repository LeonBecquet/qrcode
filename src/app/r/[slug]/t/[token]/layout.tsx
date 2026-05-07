import Image from "next/image";
import { CallWaiterButton } from "./call-waiter-button";
import { LocaleSwitcher } from "./locale-switcher";
import { FONT_CSS_VAR } from "@/lib/menu-presets";
import { getPublicLocale } from "@/lib/server/locale";
import { resolvePublicTable } from "@/lib/server/public-resolver";

export default async function PublicTableLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { restaurant, table } = await resolvePublicTable(slug, token);
  const locale = await getPublicLocale(restaurant.languages);
  const showLocaleSwitcher = restaurant.languages.includes("en");

  const theme = restaurant.theme ?? {};
  const primary = theme.primary;
  const accent = theme.accent ?? theme.primary;
  const fontFamily = theme.font ? FONT_CSS_VAR[theme.font] : undefined;

  const cssVars: React.CSSProperties = {};
  if (primary) (cssVars as Record<string, string>)["--client-primary"] = primary;
  if (primary) (cssVars as Record<string, string>)["--client-accent"] = primary;
  if (accent) (cssVars as Record<string, string>)["--client-accent-2"] = accent;
  if (fontFamily) (cssVars as Record<string, string>)["--client-font"] = fontFamily;

  return (
    <div
      className="bg-background min-h-svh"
      style={{
        ...cssVars,
        ...(fontFamily ? { fontFamily } : {}),
      }}
    >
      {/* Header — épuré, fond solide neutre, accent juste sur le filet du bas */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-20 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          {restaurant.logoUrl ? (
            <div className="relative size-9 shrink-0 overflow-hidden rounded-full border border-black/5">
              <Image
                src={restaurant.logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-foreground truncate text-sm font-semibold leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground truncate text-[11px] leading-tight">
              Table <span className="font-mono">{table.label}</span>
              {table.groupName ? ` · ${table.groupName}` : ""}
            </p>
          </div>
          {showLocaleSwitcher ? <LocaleSwitcher current={locale} /> : null}
          <CallWaiterButton slug={slug} token={token} />
        </div>
        {/* Filet décoratif accent en bas du header */}
        <div
          aria-hidden="true"
          className="h-px"
          style={{
            background: primary
              ? `linear-gradient(90deg, transparent, ${primary}40, transparent)`
              : "color-mix(in oklab, currentColor 10%, transparent)",
          }}
        />
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-32">{children}</main>
    </div>
  );
}
