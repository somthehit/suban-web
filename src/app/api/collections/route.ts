import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const collectionRow = await db
        .select()
        .from(schema.collections)
        .where(eq(schema.collections.slug, slug))
        .limit(1);

      if (collectionRow.length === 0) {
        return NextResponse.json(
          { success: false, error: "Collection not found" },
          { status: 404 }
        );
      }

      const collection = collectionRow[0];

      // Fetch collection items & products
      const items = await db
        .select({
          itemId: schema.collectionItems.id,
          sortOrder: schema.collectionItems.sortOrder,
          productId: schema.products.id,
          title: schema.products.title,
          slug: schema.products.slug,
          description: schema.products.description,
          productType: schema.products.productType,
          isFeatured: schema.products.isFeatured,
          imageUrl: schema.mediaVersions.webKey,
          thumbnailUrl: schema.mediaVersions.thumbnailKey,
          species: schema.photoMetadata.species,
          scientificName: schema.photoMetadata.scientificName,
          habitat: schema.photoMetadata.habitat,
          locationName: schema.photoMetadata.locationName,
          camera: schema.photoMetadata.camera,
          lens: schema.photoMetadata.lens,
          iso: schema.photoMetadata.iso,
          aperture: schema.photoMetadata.aperture,
          shutterSpeed: schema.photoMetadata.shutterSpeed,
        })
        .from(schema.collectionItems)
        .innerJoin(
          schema.products,
          eq(schema.collectionItems.productId, schema.products.id)
        )
        .leftJoin(
          schema.media,
          eq(schema.products.primaryMediaId, schema.media.id)
        )
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
        .where(eq(schema.collectionItems.collectionId, collection.id))
        .orderBy(asc(schema.collectionItems.sortOrder));

      return NextResponse.json({
        success: true,
        collection: {
          ...collection,
          items,
          itemCount: items.length,
        },
      });
    }

    // List all public collections
    const collectionsList = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.isPublic, true))
      .orderBy(asc(schema.collections.sortOrder), desc(schema.collections.createdAt));

    // Fetch item counts and sample images for each collection
    const enrichedCollections = await Promise.all(
      collectionsList.map(async (col) => {
        const items = await db
          .select({
            productId: schema.products.id,
            title: schema.products.title,
            slug: schema.products.slug,
            imageUrl: schema.mediaVersions.webKey,
            thumbnailUrl: schema.mediaVersions.thumbnailKey,
            species: schema.photoMetadata.species,
            locationName: schema.photoMetadata.locationName,
          })
          .from(schema.collectionItems)
          .innerJoin(
            schema.products,
            eq(schema.collectionItems.productId, schema.products.id)
          )
          .leftJoin(
            schema.media,
            eq(schema.products.primaryMediaId, schema.media.id)
          )
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
          .where(eq(schema.collectionItems.collectionId, col.id))
          .orderBy(asc(schema.collectionItems.sortOrder))
          .limit(4);

        return {
          ...col,
          items,
          itemCount: items.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: enrichedCollections.length,
      collections: enrichedCollections,
    });
  } catch (err: any) {
    console.error("Collections API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
