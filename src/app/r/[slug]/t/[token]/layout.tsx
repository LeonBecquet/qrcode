import { CallWaiterButton } from "./call-waiter-button";
import { LocaleSwitcher } from "./locale-switcher";
import { PublicHeader } from "./public-header";
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
      <PublicHeader
        restaurantName={restaurant.name}
        tableLabel={table.label}
        groupName={table.groupName}
        logoUrl={restaurant.logoUrl}
        showLocaleSwitcher={showLocaleSwitcher}
        localeSwitcher={<LocaleSwitcher current={locale} />}
        callWaiterButton={<CallWaiterButton slug={slug} token={token} />}
      />
      <main className="mx-auto max-w-3xl px-4 pb-32">{children}</main>
    </div>
  );
}
