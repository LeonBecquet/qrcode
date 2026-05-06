import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
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
export type MemberRole = (typeof memberRole.enumValues)[number];
export type SubTier = (typeof subTier.enumValues)[number];
export type SubStatus = (typeof subStatusEnum.enumValues)[number];
