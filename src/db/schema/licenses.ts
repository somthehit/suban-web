import { pgTable, uuid, varchar, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const licenses = pgTable("licenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(), // 'Personal', 'Commercial Standard', 'Extended Commercial', 'Editorial'
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  isCommercial: boolean("is_commercial").default(false).notNull(),
  isEditorial: boolean("is_editorial").default(false).notNull(),
  isExclusive: boolean("is_exclusive").default(false).notNull(),
  maxImpressions: integer("max_impressions"),
  canResell: boolean("can_resell").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const licenseFeatures = pgTable("license_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  licenseId: uuid("license_id")
    .notNull()
    .references(() => licenses.id, { onDelete: "cascade" }),
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  featureValue: varchar("feature_value", { length: 255 }).notNull(),
  isIncluded: boolean("is_included").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});
