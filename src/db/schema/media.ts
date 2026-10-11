import { pgTable, uuid, varchar, text, integer, numeric, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { products } from "./products";

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // size in bytes
  width: integer("width"),
  height: integer("height"),
  aspectRatio: varchar("aspect_ratio", { length: 20 }), // e.g. "3:2", "16:9"
  blurDataUrl: text("blur_data_url"), // Base64 low-res placeholder for progressive blur-up
  status: varchar("status", { length: 30 }).default("READY").notNull(), // 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED' | 'ARCHIVED'
  currentVersionId: uuid("current_version_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaVersions = pgTable("media_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaId: uuid("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull().default(1),
  originalKey: text("original_key").notNull(), // Private R2 storage key (never exposed publicly)
  thumbnailKey: text("thumbnail_key"), // Public CDN key (400px)
  webKey: text("web_key"), // Public CDN key (1200px)
  largePreviewKey: text("large_preview_key"), // Public CDN key (2048px)
  watermarkedKey: text("watermarked_key"), // Public CDN key (watermarked derived)
  socialKey: text("social_key"), // Public CDN OG/Twitter card (1200x630)
  isCurrent: boolean("is_current").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const photoMetadata = pgTable("photo_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  mediaId: uuid("media_id")
    .notNull()
    .unique()
    .references(() => media.id, { onDelete: "cascade" }),
  species: varchar("species", { length: 255 }), // e.g. "Bengal Tiger", "Greater One-Horned Rhino", "Himalayan Monal"
  scientificName: varchar("scientific_name", { length: 255 }), // e.g. "Panthera tigris tigris"
  family: varchar("family", { length: 255 }),
  habitat: varchar("habitat", { length: 255 }), // e.g. "Subtropical Lowland Grasslands", "Alpine Meadow"
  conservationStatus: varchar("conservation_status", { length: 50 }), // 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened' | 'Least Concern'
  
  // Safe location fields shown on public pages
  locationName: varchar("location_name", { length: 255 }), // e.g. "Chitwan National Park"
  country: varchar("country", { length: 100 }).default("Nepal"),
  locationPrecision: varchar("location_precision", { length: 50 }).default("national_park").notNull(), // 'exact' | 'region' | 'national_park' | 'country'
  
  // Private telemetry for species protection (never exposed publicly by default)
  gpsLat: numeric("gps_lat", { precision: 10, scale: 7 }),
  gpsLng: numeric("gps_lng", { precision: 10, scale: 7 }),
  gpsVisibility: varchar("gps_visibility", { length: 20 }).default("private").notNull(), // 'private' | 'approximate' | 'public'
  
  // Camera & EXIF capture metadata
  datePhotographed: timestamp("date_photographed", { withTimezone: true }),
  camera: varchar("camera", { length: 150 }), // e.g. "Sony A1", "Nikon Z9"
  lens: varchar("lens", { length: 150 }), // e.g. "Sony FE 600mm f/4 GM OSS"
  focalLength: varchar("focal_length", { length: 50 }), // e.g. "600mm"
  iso: integer("iso"), // e.g. 800
  aperture: varchar("aperture", { length: 20 }), // e.g. "f/4.0"
  shutterSpeed: varchar("shutter_speed", { length: 50 }), // e.g. "1/2000s"
  rawExif: jsonb("raw_exif"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
