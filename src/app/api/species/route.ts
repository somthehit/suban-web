import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, asc, ilike, and, or, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");
    const group = searchParams.get("group") || "bird";
    const q = searchParams.get("q")?.trim();
    const iucn = searchParams.get("iucn");
    const residency = searchParams.get("residency");
    const endemic = searchParams.get("endemic");
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 100)));

    // ── SINGLE SPECIES BY SLUG OR ID ──
    if (slug || id) {
      const condition = slug ? eq(schema.species.slug, slug) : eq(schema.species.id, id!);
      const rows = await db.select().from(schema.species).where(condition).limit(1);

      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "Species not found" }, { status: 404 });
      }

      const sp = rows[0];

      // Attach media
      const mediaList = await db
        .select({
          id: schema.speciesMedia.id,
          url: schema.speciesMedia.customImageUrl,
          customImageUrl: schema.speciesMedia.customImageUrl,
          caption: schema.speciesMedia.caption,
          isHero: schema.speciesMedia.isPrimary,
          isPrimary: schema.speciesMedia.isPrimary,
          productId: schema.speciesMedia.productId,
          productTitle: schema.products.title,
          productSlug: schema.products.slug,
        })
        .from(schema.speciesMedia)
        .leftJoin(schema.products, eq(schema.speciesMedia.productId, schema.products.id))
        .where(eq(schema.speciesMedia.speciesId, sp.id))
        .orderBy(desc(schema.speciesMedia.isPrimary), asc(schema.speciesMedia.position));

      // Attach audio recordings
      const audioList = await db
        .select()
        .from(schema.audioRecordings)
        .where(eq(schema.audioRecordings.speciesId, sp.id))
        .orderBy(desc(schema.audioRecordings.recordedAt), desc(schema.audioRecordings.createdAt));

      // Attach hotspots
      const hotspotsList = await db
        .select({
          id: schema.hotspots.id,
          name: schema.hotspots.name,
          slug: schema.hotspots.slug,
          region: schema.hotspots.region,
          district: schema.hotspots.district,
          seasonality: schema.speciesHotspots.seasonality,
          abundance: schema.speciesHotspots.abundance,
        })
        .from(schema.speciesHotspots)
        .innerJoin(schema.hotspots, eq(schema.speciesHotspots.hotspotId, schema.hotspots.id))
        .where(eq(schema.speciesHotspots.speciesId, sp.id));

      return NextResponse.json({
        success: true,
        species: {
          ...sp,
          media: mediaList,
          audioRecordings: audioList,
          hotspots: hotspotsList,
          dispatches: [],
        },
      });
    }

    // ── LIST SPECIES WITH FILTERS ──
    const conditions = [];

    if (group && group !== "all") {
      conditions.push(eq(schema.species.group, group));
    }
    if (iucn && iucn !== "all") {
      conditions.push(eq(schema.species.iucnStatus, iucn));
    }
    if (residency && residency !== "all") {
      conditions.push(eq(schema.species.residency, residency));
    }
    if (endemic === "true") {
      conditions.push(eq(schema.species.endemic, true));
    }

    if (q) {
      conditions.push(
        or(
          ilike(schema.species.commonName, `%${q}%`),
          ilike(schema.species.scientificName, `%${q}%`),
          ilike(schema.species.nepaliName, `%${q}%`),
          ilike(schema.species.family, `%${q}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(schema.species)
      .where(whereClause)
      .orderBy(asc(schema.species.commonName))
      .limit(limit);

    // Get counts and preview audio for cards
    const speciesWithCounts = await Promise.all(
      rows.map(async (item) => {
        const [audioRows, mediaRows] = await Promise.all([
          db
            .select()
            .from(schema.audioRecordings)
            .where(eq(schema.audioRecordings.speciesId, item.id))
            .limit(1),
          db
            .select({ count: sql<number>`count(*)` })
            .from(schema.speciesMedia)
            .where(eq(schema.speciesMedia.speciesId, item.id)),
        ]);

        return {
          ...item,
          audioCount: audioRows.length,
          mediaCount: Number(mediaRows[0]?.count || 0),
          featuredAudio: audioRows[0] || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      species: speciesWithCounts,
      total: speciesWithCounts.length,
    });
  } catch (error: any) {
    console.error("GET /api/species error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = (body.slug || body.commonName)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const [created] = await db
      .insert(schema.species)
      .values({
        ...body,
        slug,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, species: created });
  } catch (error: any) {
    console.error("POST /api/species error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Species ID is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(schema.species)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.species.id, id))
      .returning();

    return NextResponse.json({ success: true, species: updated });
  } catch (error: any) {
    console.error("PATCH /api/species error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Species ID is required" }, { status: 400 });
    }

    await db.delete(schema.species).where(eq(schema.species.id, id));
    return NextResponse.json({ success: true, message: "Species deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/species error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
