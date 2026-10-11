import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/suban_wildlife";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase/Neon
// Use global connection caching to prevent connection exhaustion during Next.js hot reload
const isSupabase = connectionString.includes("supabase.co") || connectionString.includes("supabase.com");

const client =
  globalForDb.conn ??
  postgres(connectionString, {
    prepare: false,
    connect_timeout: 30,
    idle_timeout: 30,
    max: 10,
    ssl: isSupabase ? "require" : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
export * from "./schema";
