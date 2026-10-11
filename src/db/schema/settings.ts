import { pgTable, uuid, varchar, text, boolean, integer, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

export const watermarkSettings = pgTable("watermark_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  logoUrl: text("logo_url"),
  text: varchar("text", { length: 255 }).default("© SUBAN Photography").notNull(),
  opacity: numeric("opacity", { precision: 3, scale: 2 }).default("0.40").notNull(), // 0.00 to 1.00
  position: varchar("position", { length: 50 }).default("bottom-right").notNull(), // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tiled'
  size: integer("size").default(25).notNull(), // percentage size relative to image
  isTiled: boolean("is_tiled").default(false).notNull(),
  margin: integer("margin").default(24).notNull(), // margin in px
  isActive: boolean("is_active").default(true).notNull(),
  rotation: integer("rotation").default(-30), // -90 to +90 degrees
  tileCount: integer("tile_count").default(9), // number of repeating watermark tiles (e.g. 4, 9, 16, 25)
  fontFamily: varchar("font_family", { length: 50 }).default("sans"),
  fontSize: integer("font_size").default(12),
  color: varchar("color", { length: 50 }).default("#ffffff"),
  blendMode: varchar("blend_mode", { length: 50 }).default("normal"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  // 'ADMIN_LOGIN' | 'PHOTO_UPLOADED' | 'PHOTO_UPDATED' | 'PHOTO_DELETED' | 'PRICE_CHANGED' | 'ORDER_REFUNDED' | 'LICENSE_CHANGED' | 'DOWNLOAD_CREATED' | 'USER_SUSPENDED'
  targetType: varchar("target_type", { length: 50 }),
  targetId: varchar("target_id", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userCollections = pgTable("user_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 50 }).primaryKey().default("default"),
  settings: jsonb("settings").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
