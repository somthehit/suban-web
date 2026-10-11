import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(schema.hotspots).orderBy(asc(schema.hotspots.name));
    return NextResponse.json({ success: true, hotspots: list });
  } catch (error: any) {
    console.error("GET /api/hotspots error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const [created] = await db
      .insert(schema.hotspots)
      .values({
        ...body,
        slug,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, hotspot: created });
  } catch (error: any) {
    console.error("POST /api/hotspots error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
