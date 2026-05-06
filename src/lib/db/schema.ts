import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// =====================================================
// Better Auth tables (camelCase pour matcher leur schema)
// =====================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  isPlatformAdmin: boolean("isPlatformAdmin").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// =====================================================
// Métier — snake_case côté DB, camelCase côté TS
// =====================================================

export const subTier = pgEnum("sub_tier", ["monthly", "annual", "lifetime"]);
export const subStatusEnum = pgEnum("sub_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "paused",
]);

export const restaurants = pgTable("restaurants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),

  // Coordonnées
  address: text("address"),
  postalCode: varchar("postal_code", { length: 10 }),
  city: text("city"),
  phone: varchar("phone", { length: 32 }),
  email: text("email"),

  // Branding
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  theme: jsonb("theme")
    .$type<{ primary?: string; accent?: string; font?: string }>()
    .notNull()
    .default({}),

  // Localisation
  timezone: text("timezone").notNull().default("Europe/Paris"),
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  languages: text("languages").array().notNull().default(["fr", "en"]),

  // Billing (Stripe — Phase 2)
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  tier: subTier("tier"),
  subStatus: subStatusEnum("sub_status"),
  currentPeriodEnd: timestamp("current_period_end"),
  lifetimePurchasedAt: timestamp("lifetime_purchased_at"),

  isPublished: boolean("is_published").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const restaurantHours = pgTable(
  "restaurant_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    // 0 = dimanche, 1 = lundi, ..., 6 = samedi (JS getDay() convention)
    dayOfWeek: integer("day_of_week").notNull(),
    openTime: time("open_time"),
    closeTime: time("close_time"),
    isClosed: boolean("is_closed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("hours_resto_day_uniq").on(t.restaurantId, t.dayOfWeek)],
);

export const memberRole = pgEnum("member_role", [
  "owner",
  "admin",
  "staff_kitchen",
  "staff_waiter",
]);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    role: memberRole("role").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("memberships_user_restaurant_uniq").on(t.userId, t.restaurantId)],
);

export const tables = pgTable("tables", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 32 }).notNull(),
  groupName: varchar("group_name", { length: 64 }),
  token: varchar("token", { length: 32 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// =====================================================
// Menu builder
// =====================================================

// Liste UE des 14 allergènes à déclaration obligatoire en France
export const ALLERGENS = [
  "gluten",
  "crustaces",
  "oeufs",
  "poisson",
  "arachide",
  "soja",
  "lait",
  "fruits-coque",
  "celeri",
  "moutarde",
  "sesame",
  "sulfites",
  "lupin",
  "mollusques",
] as const;
export type Allergen = (typeof ALLERGENS)[number];

export const menus = pgTable("menus", {
  id: uuid("id").primaryKey().defaultRandom(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isPublished: boolean("is_published").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  menuId: uuid("menu_id")
    .notNull()
    .references(() => menus.id, { onDelete: "cascade" }),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en"),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => menuCategories.id, { onDelete: "cascade" }),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en"),
  descriptionFr: text("description_fr"),
  descriptionEn: text("description_en"),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url"),
  allergens: text("allergens").array().notNull().default([]),
  isAvailable: boolean("is_available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const optionType = pgEnum("option_type", ["single", "multiple"]);

export const menuItemOptions = pgTable("menu_item_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en"),
  type: optionType("type").notNull().default("single"),
  isRequired: boolean("is_required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItemOptionChoices = pgTable("menu_item_option_choices", {
  id: uuid("id").primaryKey().defaultRandom(),
  optionId: uuid("option_id")
    .notNull()
    .references(() => menuItemOptions.id, { onDelete: "cascade" }),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en"),
  priceDeltaCents: integer("price_delta_cents").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

// =====================================================
// Relations
// =====================================================

export const userRelations = relations(user, ({ many }) => ({
  memberships: many(memberships),
  sessions: many(session),
  accounts: many(account),
}));

export const restaurantRelations = relations(restaurants, ({ many }) => ({
  memberships: many(memberships),
  hours: many(restaurantHours),
  menus: many(menus),
  tables: many(tables),
}));

export const tableRelations = relations(tables, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [tables.restaurantId],
    references: [restaurants.id],
  }),
}));

export const menuRelations = relations(menus, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menus.restaurantId],
    references: [restaurants.id],
  }),
  categories: many(menuCategories),
}));

export const menuCategoryRelations = relations(menuCategories, ({ one, many }) => ({
  menu: one(menus, {
    fields: [menuCategories.menuId],
    references: [menus.id],
  }),
  items: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  options: many(menuItemOptions),
}));

export const menuItemOptionRelations = relations(menuItemOptions, ({ one, many }) => ({
  item: one(menuItems, {
    fields: [menuItemOptions.itemId],
    references: [menuItems.id],
  }),
  choices: many(menuItemOptionChoices),
}));

export const menuItemOptionChoiceRelations = relations(menuItemOptionChoices, ({ one }) => ({
  option: one(menuItemOptions, {
    fields: [menuItemOptionChoices.optionId],
    references: [menuItemOptions.id],
  }),
}));

export const restaurantHoursRelations = relations(restaurantHours, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [restaurantHours.restaurantId],
    references: [restaurants.id],
  }),
}));

export const membershipRelations = relations(memberships, ({ one }) => ({
  user: one(user, {
    fields: [memberships.userId],
    references: [user.id],
  }),
  restaurant: one(restaurants, {
    fields: [memberships.restaurantId],
    references: [restaurants.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// =====================================================
// Types inférés
// =====================================================

export type User = typeof user.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type RestaurantHours = typeof restaurantHours.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type Menu = typeof menus.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type MenuItemOption = typeof menuItemOptions.$inferSelect;
export type MenuItemOptionChoice = typeof menuItemOptionChoices.$inferSelect;
export type MemberRole = (typeof memberRole.enumValues)[number];
export type SubTier = (typeof subTier.enumValues)[number];
export type SubStatus = (typeof subStatusEnum.enumValues)[number];
export type OptionType = (typeof optionType.enumValues)[number];
