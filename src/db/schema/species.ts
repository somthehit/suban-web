import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";
import { posts } from "./content";

// ── 1. CORE SPECIES HUB ──
export const species = pgTable("species", {
  id: uuid("id").primaryKey().defaultRandom(),
  group: varchar("group", { length: 50 }).default("bird").notNull(), // 'bird' | 'mammal' | 'reptile' | 'amphibian'
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  commonName: varchar("common_name", { length: 255 }).notNull(),
  nepaliName: varchar("nepali_name", { length: 255 }), // e.g. "डाँफे", "काँडे भ्याकुर"
  scientificName: varchar("scientific_name", { length: 255 }).notNull(),
  family: varchar("family", { length: 150 }), // e.g. "Phasianidae", "Timaliidae"
  order: varchar("order", { length: 150 }), // e.g. "Galliformes", "Passeriformes"
  iucnStatus: varchar("iucn_status", { length: 10 }).default("LC").notNull(), // 'CR' | 'EN' | 'VU' | 'NT' | 'LC'
  nepalStatus: varchar("nepal_status", { length: 100 }), // e.g. "National Bird of Nepal • Protected Schedule I"
  residency: varchar("residency", { length: 50 }).default("resident").notNull(), // 'resident' | 'summer' | 'winter' | 'passage'
  endemic: boolean("endemic").default(false).notNull(), // true for Spiny Babbler (Turdoides nipalensis)
  elevationMin: integer("elevation_min"), // in meters (e.g. 2400)
  elevationMax: integer("elevation_max"), // in meters (e.g. 4500)
  sizeCm: numeric("size_cm", { precision: 6, scale: 2 }),
  wingspanCm: numeric("wingspan_cm", { precision: 6, scale: 2 }),
  weightG: numeric("weight_g", { precision: 8, scale: 2 }),
  diet: text("diet"),
  habitats: jsonb("habitats").default([]).notNull(), // string array of habitat names
  bestMonths: jsonb("best_months").default([]).notNull(), // active months [1-12]
  coverMediaId: uuid("cover_media_id"),
  coverImageUrl: text("cover_image_url"),
  description: text("description"), // Editorial introductory narrative
  fieldNotes: text("field_notes"), // Naturalist behavioral observations
  status: varchar("status", { length: 20 }).default("published").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isBirdOfTheWeek: boolean("is_bird_of_the_week").default(false).notNull(),
  isSensitive: boolean("is_sensitive").default(false).notNull(), // If true, obfuscate exact nesting GPS
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 2. SPECIES MEDIA (ATTACHED PRODUCT PHOTOS & GALLERY PLATES) ──
export const speciesMedia = pgTable("species_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }), // link to Photographic Product
  mediaId: uuid("media_id"),
  customImageUrl: text("custom_image_url"),
  caption: varchar("caption", { length: 255 }),
  position: integer("position").default(0).notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 3. AUDIO RECORDINGS (FIELD SOUNDSCAPES & CALLS) ──
export const audioRecordings = pgTable("audio_recordings", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("song").notNull(), // 'song' | 'call' | 'alarm_call' | 'flight_call' | 'drumming' | 'dawn_chorus'
  originalPath: text("original_path"), // Secure private master vault (WAV / FLAC / uncompressed)
  streamPath: text("stream_path"), // Loudness-normalized streamable file (Opus/AAC/MP3)
  previewPath: text("preview_path"), // 30s preview with watermark voice tag
  waveformJson: jsonb("waveform_json").default([]), // 100-point normalized peaks array [0.0 - 1.0]
  spectrogramPath: text("spectrogram_path"), // Spectrogram visual spectrogram image
  duration: numeric("duration", { precision: 8, scale: 2 }).default("0.00").notNull(), // in seconds
  recordedAt: timestamp("recorded_at", { withTimezone: true }),
  locationLabel: varchar("location_label", { length: 255 }), // e.g. "Langtang National Park, Upper Kyanjin"
  locationPrecision: varchar("location_precision", { length: 50 }).default("national_park").notNull(), // 'exact' | 'national_park' | 'region' | 'country'
  gpsLat: numeric("gps_lat", { precision: 10, scale: 7 }), // Private telemetry
  gpsLng: numeric("gps_lng", { precision: 10, scale: 7 }), // Private telemetry
  gpsVisibility: varchar("gps_visibility", { length: 20 }).default("private").notNull(), // 'private' | 'approximate' | 'public'
  recorder: varchar("recorder", { length: 150 }), // e.g. "Sound Devices MixPre-6 II"
  microphone: varchar("microphone", { length: 150 }), // e.g. "Sennheiser MKH 8060 + Telinga Parabola"
  quality: varchar("quality", { length: 10 }).default("A").notNull(), // 'A' | 'B' | 'C' | 'D' | 'E'
  backgroundSpecies: jsonb("background_species").default([]), // Array of other species heard in background
  sexAge: varchar("sex_age", { length: 50 }), // e.g. "Adult Male", "Duet", "Juvenile"
  soundDescription: text("sound_description"), // Narrative phonetics / description of acoustic nuances
  notes: text("notes"),
  license: varchar("license", { length: 100 }).default("Standard Field Audio License").notNull(),
  isFree: boolean("is_free").default(true).notNull(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  priceNpr: numeric("price_npr", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: varchar("status", { length: 30 }).default("READY").notNull(), // 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED'
  processingError: text("processing_error"),
  fileSize: integer("file_size"), // File size in bytes
  mimeType: varchar("mime_type", { length: 50 }).default("audio/mpeg"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 4. AUDIO DOWNLOAD AUDIT LOGS ──
export const audioDownloads = pgTable("audio_downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  audioId: uuid("audio_id")
    .notNull()
    .references(() => audioRecordings.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  downloadType: varchar("download_type", { length: 50 }).default("free_watermarked").notNull(), // 'free_watermarked' | 'paid_original' | 'preview'
  ipAddress: varchar("ip_address", { length: 100 }),
  userAgent: text("user_agent"),
  licenseKey: varchar("license_key", { length: 255 }),
  downloadedAt: timestamp("downloaded_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 5. HOTSPOTS (BIRDWATCHING SANCTUARIES) ──
export const hotspots = pgTable("hotspots", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  region: varchar("region", { length: 150 }), // e.g. "Eastern Terai", "Kathmandu Valley Rim", "Trans-Himalaya"
  district: varchar("district", { length: 100 }), // e.g. "Sunsari / Saptari", "Lalitpur", "Mustang"
  elevationMin: integer("elevation_min"), // in meters
  elevationMax: integer("elevation_max"), // in meters
  habitats: jsonb("habitats").default([]).notNull(), // string array: e.g. ["Ramsar Wetlands", "Alluvial Grasslands", "Riverine Marshes"]
  bestSeasons: jsonb("best_seasons").default([]).notNull(), // string array: e.g. ["Winter Migration (Nov-Feb)", "Spring Passage (Mar-Apr)"]
  speciesCount: integer("species_count").default(0).notNull(), // Cached recorded species count
  description: text("description"),
  coordinatesSafe: jsonb("coordinates_safe"), // Public approximate centroid { lat: 26.6, lng: 87.0 }
  coverImageUrl: text("cover_image_url"),
  isProtectedArea: boolean("is_protected_area").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 6. SPECIES AT HOTSPOTS (MANY-TO-MANY WITH ABUNDANCE) ──
export const speciesHotspots = pgTable("species_hotspots", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  hotspotId: uuid("hotspot_id")
    .notNull()
    .references(() => hotspots.id, { onDelete: "cascade" }),
  seasonality: varchar("seasonality", { length: 50 }).default("resident").notNull(), // 'resident' | 'winter' | 'summer' | 'passage'
  abundance: varchar("abundance", { length: 50 }).default("common").notNull(), // 'abundant' | 'common' | 'uncommon' | 'rare' | 'vagrant'
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 7. POSTS <-> SPECIES BRIDGE ──
export const postSpecies = pgTable("post_species", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ── 8. SIGHTINGS (LIFE LIST & LOGS) ──
export const sightings = pgTable("sightings", {
  id: uuid("id").primaryKey().defaultRandom(),
  speciesId: uuid("species_id")
    .notNull()
    .references(() => species.id, { onDelete: "cascade" }),
  hotspotId: uuid("hotspot_id").references(() => hotspots.id, { onDelete: "set null" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  count: integer("count").default(1).notNull(),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  audioUrl: text("audio_url"),
  locationLabel: varchar("location_label", { length: 255 }),
  elevationMeters: integer("elevation_meters"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
