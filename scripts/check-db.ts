import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

const conn = process.env.DATABASE_URL!;
const sql = postgres(conn);

async function main() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log("Current tables in DB:", tables.map((t: any) => t.table_name));
  await sql.end();
}

main().catch(console.error);
