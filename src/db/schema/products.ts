import { pgTable, uuid, varchar, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { licenses } from "./licenses";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  productType: varchar("product_type", { length: 50 }).notNull().default("photograph"), // 'photograph' | 'lightroom_preset' | 'ebook' | 'video_clip' | 'tutorial' | 'workshop'
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft' | 'published' | 'archived'
  isFeatured: boolean("is_featured").default(false).notNull(),
  primaryMediaId: uuid("primary_media_id"), // Reference to main media item
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  licenseId: uuid("license_id").references(() => licenses.id, { onDelete: "set null" }),
  variantType: varchar("variant_type", { length: 50 }).notNull().default("digital_license"), // 'digital_license' | 'print' | 'canvas' | 'framed'
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  isDigital: boolean("is_digital").default(true).notNull(),
  shippingRequired: boolean("shipping_required").default(false).notNull(),
  dimensions: varchar("dimensions", { length: 100 }), // e.g. "24x36 inches", "A3", or "6000x4000 px"
  stockQuantity: integer("stock_quantity"), // null = unlimited (digital)
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const prices = pgTable("prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  currency: varchar("currency", { length: 10 }).notNull().default("USD"), // 'USD' | 'NPR'
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  compareAtAmount: numeric("compare_at_amount", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
