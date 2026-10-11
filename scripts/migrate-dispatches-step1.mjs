import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = postgres(connectionString);

async function runMigration() {
  console.log("Applying Step 1 Dispatches Migration...");

  try {
    // 1. Allow standalone media without mandatory product_id
    console.log("1. Modifying media.product_id nullability...");
    await sql.unsafe(`ALTER TABLE "media" ALTER COLUMN "product_id" DROP NOT NULL;`);

    // 2. Add new columns to posts table
    console.log("2. Extending posts table...");
    await sql.unsafe(`
      ALTER TABLE "posts"
        ADD COLUMN IF NOT EXISTS "content_json" jsonb,
        ADD COLUMN IF NOT EXISTS "content_html" text,
        ADD COLUMN IF NOT EXISTS "cover_media_id" uuid REFERENCES "media"("id") ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS "cover_focal_x" integer DEFAULT 50 NOT NULL,
        ADD COLUMN IF NOT EXISTS "cover_focal_y" integer DEFAULT 50 NOT NULL,
        ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone,
        ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS "views" integer DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS "og_image_id" uuid REFERENCES "media"("id") ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS "location_label" varchar(255),
        ADD COLUMN IF NOT EXISTS "location_precision" varchar(50) DEFAULT 'national_park';
    `);

    // Set default content to empty string if null
    await sql.unsafe(`UPDATE "posts" SET "content" = '' WHERE "content" IS NULL;`);
    await sql.unsafe(`ALTER TABLE "posts" ALTER COLUMN "content" SET DEFAULT '';`);

    // 3. Create post_media tracking table
    console.log("3. Creating post_media table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "post_media" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "media_id" uuid NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
        "caption" text,
        "alt_text" text,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 4. Create post_revisions table
    console.log("4. Creating post_revisions table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "post_revisions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "title" varchar(255) NOT NULL,
        "content_json" jsonb,
        "content_html" text,
        "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "revision_note" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 5. Create post_related_products table
    console.log("5. Creating post_related_products table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "post_related_products" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "sort_order" integer DEFAULT 0 NOT NULL
      );
    `);

    console.log("✓ Migration executed successfully!");
    
    // Verify columns on posts
    const cols = await sql.unsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      ORDER BY ordinal_position;
    `);
    console.log("Current posts columns:", cols.map(c => c.column_name).join(", "));

    // Verify created tables
    const tables = await sql.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('posts', 'post_media', 'post_revisions', 'post_related_products');
    `);
    console.log("Verified tables:", tables.map(t => t.table_name).join(", "));

    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
