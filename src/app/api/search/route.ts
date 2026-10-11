import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { species as speciesTable, speciesMedia as speciesMediaTable } from "@/db/schema/species";
import { or, ilike, eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 1) {
      return NextResponse.json({
        success: true,
        results: {
          species: [],
          products: [],
          collections: [],
          audio: [],
        },
      });
    }

    const pattern = `%${q}%`;

    // 1. Search Species (Avian & Wildlife)
    const speciesMatches = await db
      .select({
        id: schema.species.id,
        slug: schema.species.slug,
        commonName: schema.species.commonName,
        scientificName: schema.species.scientificName,
        nepaliName: schema.species.nepaliName,
        family: schema.species.family,
        iucnStatus: schema.species.iucnStatus,
        group: schema.species.group,
        heroImageUrl: schema.species.coverImageUrl,
      })
      .from(schema.species)
      .where(
        or(
          ilike(schema.species.commonName, pattern),
          ilike(schema.species.scientificName, pattern),
          ilike(schema.species.nepaliName, pattern),
          ilike(schema.species.family, pattern),
          ilike(schema.species.order, pattern),
          ilike(schema.species.description, pattern)
        )
      )
      .limit(8);

    // 2. Search Fine Art Plates & Prints
    const productMatches = await db
      .select({
        id: schema.products.id,
        title: schema.products.title,
        slug: schema.products.slug,
        description: schema.products.description,
        productType: schema.products.productType,
        imageUrl: schema.mediaVersions.webKey,
        thumbnailUrl: schema.mediaVersions.thumbnailKey,
        species: schema.photoMetadata.species,
        scientificName: schema.photoMetadata.scientificName,
        locationName: schema.photoMetadata.locationName,
        camera: schema.photoMetadata.camera,
      })
      .from(schema.products)
      .leftJoin(schema.media, eq(schema.products.primaryMediaId, schema.media.id))
      .leftJoin(
        schema.mediaVersions,
        and(
          eq(schema.media.id, schema.mediaVersions.mediaId),
          eq(schema.mediaVersions.isCurrent, true)
        )
      )
      .leftJoin(
        schema.photoMetadata,
        eq(schema.media.id, schema.photoMetadata.mediaId)
      )
      .where(
        or(
          ilike(schema.products.title, pattern),
          ilike(schema.products.description, pattern),
          ilike(schema.photoMetadata.species, pattern),
          ilike(schema.photoMetadata.scientificName, pattern),
          ilike(schema.photoMetadata.locationName, pattern),
          ilike(schema.photoMetadata.camera, pattern)
        )
      )
      .limit(8);

    // 3. Search Collections
    const collectionMatches = await db
      .select({
        id: schema.collections.id,
        title: schema.collections.title,
        slug: schema.collections.slug,
        description: schema.collections.description,
      })
      .from(schema.collections)
      .where(
        or(
          ilike(schema.collections.title, pattern),
          ilike(schema.collections.description, pattern)
        )
      )
      .limit(4);

    // 4. Search Audio Recordings
    const audioMatches = await db
      .select({
        id: schema.audioRecordings.id,
        title: schema.audioRecordings.title,
        type: schema.audioRecordings.type,
        locationLabel: schema.audioRecordings.locationLabel,
        speciesCommon: schema.species.commonName,
        speciesScientific: schema.species.scientificName,
        speciesSlug: schema.species.slug,
      })
      .from(schema.audioRecordings)
      .leftJoin(schema.species, eq(schema.audioRecordings.speciesId, schema.species.id))
      .where(
        or(
          ilike(schema.audioRecordings.title, pattern),
          ilike(schema.audioRecordings.locationLabel, pattern),
          ilike(schema.audioRecordings.soundDescription, pattern),
          ilike(schema.species.commonName, pattern),
          ilike(schema.species.scientificName, pattern)
        )
      )
      .limit(4);

    return NextResponse.json({
      success: true,
      query: q,
      totalCount: speciesMatches.length + productMatches.length + collectionMatches.length + audioMatches.length,
      results: {
        species: speciesMatches,
        products: productMatches,
        collections: collectionMatches,
        audio: audioMatches,
      },
    });
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search" },
      { status: 500 }
    );
  }
}
