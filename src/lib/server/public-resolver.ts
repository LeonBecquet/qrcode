import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import {
  menuCategories,
  menuItemOptionChoices,
  menuItemOptions,
  menuItems,
  menus,
  restaurants,
  tables,
} from "@/lib/db/schema";
import type {
  Menu,
  MenuCategory,
  MenuItem,
  MenuItemOption,
  MenuItemOptionChoice,
  Restaurant,
  Table,
} from "@/lib/db/schema";

export type PublicContext = {
  restaurant: Restaurant;
  table: Table;
};

const ACTIVE_SUB_STATUSES = ["active", "trialing", "past_due"];

/**
 * Résout slug + token de table. notFound() si inconnu, désactivé,
 * resto non publié, ou abo inactif.
 */
export async function resolvePublicTable(slug: string, token: string): Promise<PublicContext> {
  const rows = await db
    .select({
      restaurant: restaurants,
      table: tables,
    })
    .from(restaurants)
    .innerJoin(tables, eq(tables.restaurantId, restaurants.id))
    .where(and(eq(restaurants.slug, slug), eq(tables.token, token)))
    .limit(1);

  const row = rows[0];
  if (!row) notFound();
  if (!row.table.isActive) notFound();
  if (
    !row.restaurant.subStatus ||
    !ACTIVE_SUB_STATUSES.includes(row.restaurant.subStatus)
  ) {
    notFound();
  }
  return row;
}

export type PublicMenuItem = MenuItem & {
  options: (MenuItemOption & { choices: MenuItemOptionChoice[] })[];
};

export type PublicMenu = {
  menu: Menu;
  categories: (MenuCategory & { items: PublicMenuItem[] })[];
};

/**
 * Charge le menu publié pour la vue client. Pour MVP : premier menu publié,
 * toutes catégories visibles + items (disponibles ou non, on affiche les ruptures
 * grisées côté UI).
 */
export async function loadPublicMenu(restaurantId: string): Promise<PublicMenu | null> {
  const [menu] = await db
    .select()
    .from(menus)
    .where(and(eq(menus.restaurantId, restaurantId), eq(menus.isPublished, true)))
    .orderBy(asc(menus.sortOrder), asc(menus.createdAt))
    .limit(1);
  if (!menu) return null;

  const categories = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.menuId, menu.id), eq(menuCategories.isVisible, true)))
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.createdAt));

  if (categories.length === 0) {
    return { menu, categories: [] };
  }

  const items = await db
    .select()
    .from(menuItems)
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .where(eq(menuCategories.menuId, menu.id))
    .orderBy(asc(menuItems.sortOrder), asc(menuItems.createdAt));

  const itemList = items.map((row) => row.menu_items);
  const itemIds = itemList.map((i) => i.id);

  const options = itemIds.length
    ? await db
        .select()
        .from(menuItemOptions)
        .innerJoin(menuItems, eq(menuItemOptions.itemId, menuItems.id))
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuCategories.menuId, menu.id))
        .orderBy(asc(menuItemOptions.sortOrder))
    : [];

  const choices = options.length
    ? await db
        .select({ choice: menuItemOptionChoices })
        .from(menuItemOptionChoices)
        .innerJoin(menuItemOptions, eq(menuItemOptionChoices.optionId, menuItemOptions.id))
        .innerJoin(menuItems, eq(menuItemOptions.itemId, menuItems.id))
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuCategories.menuId, menu.id))
        .orderBy(asc(menuItemOptionChoices.sortOrder))
    : [];

  const choicesByOption = new Map<string, MenuItemOptionChoice[]>();
  for (const row of choices) {
    const list = choicesByOption.get(row.choice.optionId) ?? [];
    list.push(row.choice);
    choicesByOption.set(row.choice.optionId, list);
  }

  const optionsByItem = new Map<string, (MenuItemOption & { choices: MenuItemOptionChoice[] })[]>();
  for (const row of options) {
    const opt = row.menu_item_options;
    const list = optionsByItem.get(opt.itemId) ?? [];
    list.push({ ...opt, choices: choicesByOption.get(opt.id) ?? [] });
    optionsByItem.set(opt.itemId, list);
  }

  const itemsByCategory = new Map<string, PublicMenuItem[]>();
  for (const item of itemList) {
    const list = itemsByCategory.get(item.categoryId) ?? [];
    list.push({ ...item, options: optionsByItem.get(item.id) ?? [] });
    itemsByCategory.set(item.categoryId, list);
  }

  return {
    menu,
    categories: categories.map((cat) => ({
      ...cat,
      items: itemsByCategory.get(cat.id) ?? [],
    })),
  };
}
