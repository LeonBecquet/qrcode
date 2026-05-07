import { CartButton } from "./cart-button";
import { MenuClient } from "./menu-client";
import { getPublicLocale } from "@/lib/server/locale";
import { loadPublicMenu, resolvePublicTable } from "@/lib/server/public-resolver";

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  const { restaurant } = await resolvePublicTable(slug, token);
  const locale = await getPublicLocale(restaurant.languages);
  const publicMenu = await loadPublicMenu(restaurant.id);

  return (
    <>
      <MenuClient
        slug={slug}
        token={token}
        locale={locale}
        restaurantName={restaurant.name}
        restaurantDescription={restaurant.description}
        coverUrl={restaurant.coverUrl}
        logoUrl={restaurant.logoUrl}
        publicMenu={publicMenu}
      />
      <CartButton slug={slug} token={token} />
    </>
  );
}
