import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { species as speciesTable, speciesMedia as speciesMediaTable } from "@/db/schema/species";
import { desc, eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const limit = Number(searchParams.get("limit")) || 40;

    if (slug) {
      const rows = await db
        .select({
          id: schema.products.id,
          title: schema.products.title,
          slug: schema.products.slug,
          description: schema.products.description,
          productType: schema.products.productType,
          status: schema.products.status,
          isFeatured: schema.products.isFeatured,
          createdAt: schema.products.createdAt,
          primaryMediaId: schema.products.primaryMediaId,
          mediaTitle: schema.media.title,
          aspectRatio: schema.media.aspectRatio,
          width: schema.media.width,
          height: schema.media.height,
          imageUrl: schema.mediaVersions.webKey,
          thumbnailUrl: schema.mediaVersions.thumbnailKey,
          largePreviewUrl: schema.mediaVersions.largePreviewKey,
          species: schema.photoMetadata.species,
          scientificName: schema.photoMetadata.scientificName,
          family: schema.photoMetadata.family,
          habitat: schema.photoMetadata.habitat,
          conservationStatus: schema.photoMetadata.conservationStatus,
          locationName: schema.photoMetadata.locationName,
          country: schema.photoMetadata.country,
          gpsLat: schema.photoMetadata.gpsLat,
          gpsLng: schema.photoMetadata.gpsLng,
          camera: schema.photoMetadata.camera,
          lens: schema.photoMetadata.lens,
          focalLength: schema.photoMetadata.focalLength,
          iso: schema.photoMetadata.iso,
          aperture: schema.photoMetadata.aperture,
          shutterSpeed: schema.photoMetadata.shutterSpeed,
          datePhotographed: schema.photoMetadata.datePhotographed,
          rawExif: schema.photoMetadata.rawExif,
          speciesId: speciesMediaTable.speciesId,
          speciesName: speciesTable.commonName,
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
        .leftJoin(speciesMediaTable, eq(schema.products.id, speciesMediaTable.productId))
        .leftJoin(speciesTable, eq(speciesMediaTable.speciesId, speciesTable.id))
        .where(eq(schema.products.slug, slug))
        .limit(1);

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }

      const p = rows[0];

      // Fetch variants and prices
      const variants = await db
        .select({
          id: schema.productVariants.id,
          name: schema.productVariants.name,
          sku: schema.productVariants.sku,
          variantType: schema.productVariants.variantType,
          dimensions: schema.productVariants.dimensions,
          isDigital: schema.productVariants.isDigital,
          licenseId: schema.productVariants.licenseId,
          currency: schema.prices.currency,
          amount: schema.prices.amount,
          compareAtAmount: schema.prices.compareAtAmount,
        })
        .from(schema.productVariants)
        .leftJoin(schema.prices, and(
          eq(schema.productVariants.id, schema.prices.variantId),
          eq(schema.prices.isActive, true)
        ))
        .where(eq(schema.productVariants.productId, p.id));

      let priceUSD = 149;
      let priceNPR = 19900;
      for (const v of variants) {
        if (v.currency === "USD" && v.amount) priceUSD = Number(v.amount);
        if (v.currency === "NPR" && v.amount) priceNPR = Number(v.amount);
      }

      const rawExif = (p.rawExif as any) || {};

      const product = {
        ...p,
        imageUrl: p.imageUrl || p.thumbnailUrl,
        priceUSD,
        priceNPR,
        elevation: rawExif.elevation || "4,200m",
        ambientTemp: rawExif.ambientTemp || "11.2°C",
        distance: rawExif.distance || "36m",
        storyTitle: rawExif.storyTitle || p.title,
        story: rawExif.story || p.description,
        variants,
      };

      return NextResponse.json({
        success: true,
        product,
      });
    }

    const rows = await db
      .select({
        id: schema.products.id,
        title: schema.products.title,
        slug: schema.products.slug,
        description: schema.products.description,
        productType: schema.products.productType,
        status: schema.products.status,
        isFeatured: schema.products.isFeatured,
        createdAt: schema.products.createdAt,
        primaryMediaId: schema.products.primaryMediaId,
        mediaTitle: schema.media.title,
        aspectRatio: schema.media.aspectRatio,
        imageUrl: schema.mediaVersions.webKey,
        thumbnailUrl: schema.mediaVersions.thumbnailKey,
        species: schema.photoMetadata.species,
        scientificName: schema.photoMetadata.scientificName,
        family: schema.photoMetadata.family,
        habitat: schema.photoMetadata.habitat,
        conservationStatus: schema.photoMetadata.conservationStatus,
        locationName: schema.photoMetadata.locationName,
        country: schema.photoMetadata.country,
        camera: schema.photoMetadata.camera,
        lens: schema.photoMetadata.lens,
        focalLength: schema.photoMetadata.focalLength,
        iso: schema.photoMetadata.iso,
        aperture: schema.photoMetadata.aperture,
        shutterSpeed: schema.photoMetadata.shutterSpeed,
        speciesId: speciesMediaTable.speciesId,
        speciesName: speciesTable.commonName,
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
      .leftJoin(speciesMediaTable, eq(schema.products.id, speciesMediaTable.productId))
      .leftJoin(speciesTable, eq(speciesMediaTable.speciesId, speciesTable.id))
      .orderBy(desc(schema.products.createdAt))
      .limit(limit);

    // Fetch actual prices if present
    const productIds = rows.map((r) => r.id);
    const pricesMap: Record<string, { usd?: number; npr?: number }> = {};
    if (productIds.length > 0) {
      try {
        const priceRows = await db
          .select({
            productId: schema.productVariants.productId,
            currency: schema.prices.currency,
            amount: schema.prices.amount,
          })
          .from(schema.productVariants)
          .innerJoin(schema.prices, eq(schema.productVariants.id, schema.prices.variantId))
          .where(eq(schema.prices.isActive, true));

        for (const pr of priceRows) {
          if (!pricesMap[pr.productId]) pricesMap[pr.productId] = {};
          if (pr.currency === "USD") pricesMap[pr.productId].usd = Number(pr.amount);
          if (pr.currency === "NPR") pricesMap[pr.productId].npr = Number(pr.amount);
        }
      } catch (e) {
        console.error("Error fetching prices:", e);
      }
    }

    const products = rows.map((p) => {
      const img = p.imageUrl || p.thumbnailUrl;
      return {
        ...p,
        imageUrl: img,
        thumbnailUrl: p.thumbnailUrl || img,
        priceUSD: pricesMap[p.id]?.usd ?? 149,
        priceNPR: pricesMap[p.id]?.npr ?? 19900,
      };
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    console.error("Products API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description = "",
      isFeatured = false,
      productType = "photograph",
      imageUrl,
      speciesId,
      species,
      scientificName,
      locationName,
      camera,
      lens,
      priceUSD = 149,
      priceNPR = 19900,
      status = "published",
      isNewSpecies = false,
      newSpeciesData,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // 0. Auto-create new bird species if requested inline
    let targetSpeciesId = speciesId;
    if (isNewSpecies && newSpeciesData?.commonName) {
      const birdCommon = newSpeciesData.commonName.trim();
      const birdSci = newSpeciesData.scientificName?.trim() || scientificName || birdCommon;
      const baseSlug =
        newSpeciesData.slug ||
        birdCommon
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      const birdSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

      try {
        const [createdSpecies] = await db
          .insert(speciesTable)
          .values({
            commonName: birdCommon,
            nepaliName: newSpeciesData.nepaliName?.trim() || null,
            scientificName: birdSci,
            slug: birdSlug,
            iucnStatus: newSpeciesData.iucnStatus || "LC",
            nepalStatus: newSpeciesData.nepalStatus || "Protected Wild Fauna",
            residency: newSpeciesData.residency || "resident",
            elevationMin: newSpeciesData.elevationMin ? Number(newSpeciesData.elevationMin) : null,
            elevationMax: newSpeciesData.elevationMax ? Number(newSpeciesData.elevationMax) : null,
            habitats: newSpeciesData.habitats
              ? (Array.isArray(newSpeciesData.habitats) ? newSpeciesData.habitats : [newSpeciesData.habitats])
              : ["Himalayan Wilderness"],
            coverImageUrl: imageUrl || undefined,
            description:
              newSpeciesData.description ||
              description ||
              `Field identification and photographic documentation of ${birdCommon} in Nepal.`,
            status: "published",
            group: "bird",
          })
          .returning();

        targetSpeciesId = createdSpecies.id;
      } catch (e) {
        console.error("Failed to inline-create species:", e);
      }
    }

    // 1. Insert product
    const [created] = await db
      .insert(schema.products)
      .values({
        title,
        slug,
        description,
        isFeatured: Boolean(isFeatured),
        productType,
        status: status || "published",
      })
      .returning();

    // 2. Insert Media if imageUrl provided
    if (imageUrl) {
      const [mediaItem] = await db
        .insert(schema.media)
        .values({
          productId: created.id,
          title,
          originalFilename: `${slug}.jpg`,
          mimeType: "image/jpeg",
          fileSize: 15400000,
          status: "READY",
        })
        .returning();

      await db.insert(schema.mediaVersions).values({
        mediaId: mediaItem.id,
        versionNumber: 1,
        originalKey: `originals/${mediaItem.id}.jpg`,
        thumbnailKey: imageUrl,
        webKey: imageUrl,
        largePreviewKey: imageUrl,
        isCurrent: true,
      });

      await db
        .update(schema.products)
        .set({ primaryMediaId: mediaItem.id })
        .where(eq(schema.products.id, created.id));

      if (species || locationName || camera) {
        await db.insert(schema.photoMetadata).values({
          mediaId: mediaItem.id,
          species: species || title,
          scientificName: scientificName || "",
          locationName: locationName || "Nepal Wilderness",
          camera: camera || "Nikon Z9",
          lens: lens || "NIKKOR Z 400mm f/2.8 TC VR S",
        });
      }
    }

    // 3. Insert default variant & prices
    const [variant] = await db
      .insert(schema.productVariants)
      .values({
        productId: created.id,
        name: "Standard Digital License",
        sku: `SKU-${slug.slice(0, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        variantType: "digital_license",
        isDigital: true,
      })
      .returning();

    await db.insert(schema.prices).values([
      {
        variantId: variant.id,
        currency: "USD",
        amount: String(priceUSD),
      },
      {
        variantId: variant.id,
        currency: "NPR",
        amount: String(priceNPR),
      },
    ]);

    // 4. Link speciesMedia if targetSpeciesId provided
    if (targetSpeciesId) {
      const spRows = await db
        .select()
        .from(speciesTable)
        .where(eq(speciesTable.id, targetSpeciesId))
        .limit(1);

      if (spRows.length > 0) {
        const sp = spRows[0];
        await db.insert(speciesMediaTable).values({
          speciesId: sp.id,
          productId: created.id,
          customImageUrl: imageUrl || undefined,
          caption: title,
          isPrimary: true,
          position: 0,
        });

        if (!sp.coverImageUrl && imageUrl) {
          await db
            .update(speciesTable)
            .set({ coverImageUrl: imageUrl, updatedAt: new Date() })
            .where(eq(speciesTable.id, sp.id));
        }
      }
    }

    // 5. Log audit event
    await db.insert(schema.auditLogs).values({
      eventType: "PHOTO_UPLOADED",
      targetType: "PRODUCT",
      targetId: created.id,
      details: { title, slug, priceUSD, speciesId },
    });

    return NextResponse.json({
      success: true,
      product: created,
    });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      title,
      slug,
      description,
      speciesId,
      species,
      scientificName,
      locationName,
      camera,
      lens,
      priceUSD,
      priceNPR,
      imageUrl,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    // 1. Update product base fields
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;

    const [updatedProduct] = await db
      .update(schema.products)
      .set(updateData)
      .where(eq(schema.products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // 2. Photo metadata updates
    if (
      species !== undefined ||
      scientificName !== undefined ||
      locationName !== undefined ||
      camera !== undefined ||
      lens !== undefined
    ) {
      if (updatedProduct.primaryMediaId) {
        const metaUpdate: any = { updatedAt: new Date() };
        if (species !== undefined) metaUpdate.species = species;
        if (scientificName !== undefined) metaUpdate.scientificName = scientificName;
        if (locationName !== undefined) metaUpdate.locationName = locationName;
        if (camera !== undefined) metaUpdate.camera = camera;
        if (lens !== undefined) metaUpdate.lens = lens;

        const existingMeta = await db
          .select()
          .from(schema.photoMetadata)
          .where(eq(schema.photoMetadata.mediaId, updatedProduct.primaryMediaId));

        if (existingMeta.length > 0) {
          await db
            .update(schema.photoMetadata)
            .set(metaUpdate)
            .where(eq(schema.photoMetadata.mediaId, updatedProduct.primaryMediaId));
        } else {
          await db.insert(schema.photoMetadata).values({
            mediaId: updatedProduct.primaryMediaId,
            species: species || title || "",
            scientificName: scientificName || "",
            locationName: locationName || "Nepal Wilderness",
            camera: camera || "Nikon Z9",
            lens: lens || "NIKKOR Z 400mm f/2.8 TC VR S",
          });
        }
      }
    }

    // 3. Update image version if provided
    if (imageUrl) {
      if (updatedProduct.primaryMediaId) {
        await db
          .update(schema.mediaVersions)
          .set({ webKey: imageUrl, thumbnailKey: imageUrl, largePreviewKey: imageUrl })
          .where(
            and(
              eq(schema.mediaVersions.mediaId, updatedProduct.primaryMediaId),
              eq(schema.mediaVersions.isCurrent, true)
            )
          );
      } else {
        const [mediaItem] = await db
          .insert(schema.media)
          .values({
            productId: updatedProduct.id,
            title: updatedProduct.title,
            originalFilename: `${updatedProduct.slug}.jpg`,
            mimeType: "image/jpeg",
            fileSize: 15400000,
            status: "READY",
          })
          .returning();

        await db.insert(schema.mediaVersions).values({
          mediaId: mediaItem.id,
          versionNumber: 1,
          originalKey: `originals/${mediaItem.id}.jpg`,
          thumbnailKey: imageUrl,
          webKey: imageUrl,
          largePreviewKey: imageUrl,
          isCurrent: true,
        });

        await db
          .update(schema.products)
          .set({ primaryMediaId: mediaItem.id })
          .where(eq(schema.products.id, updatedProduct.id));
      }
    }

    // 4. Update prices if provided
    if (priceUSD !== undefined || priceNPR !== undefined) {
      const variants = await db
        .select()
        .from(schema.productVariants)
        .where(eq(schema.productVariants.productId, id));

      if (variants.length > 0) {
        const vId = variants[0].id;
        if (priceUSD !== undefined) {
          const usdPrice = await db
            .select()
            .from(schema.prices)
            .where(and(eq(schema.prices.variantId, vId), eq(schema.prices.currency, "USD")));
          if (usdPrice.length > 0) {
            await db
              .update(schema.prices)
              .set({ amount: String(priceUSD), updatedAt: new Date() })
              .where(and(eq(schema.prices.variantId, vId), eq(schema.prices.currency, "USD")));
          } else {
            await db.insert(schema.prices).values({
              variantId: vId,
              currency: "USD",
              amount: String(priceUSD),
            });
          }
        }
        if (priceNPR !== undefined) {
          const nprPrice = await db
            .select()
            .from(schema.prices)
            .where(and(eq(schema.prices.variantId, vId), eq(schema.prices.currency, "NPR")));
          if (nprPrice.length > 0) {
            await db
              .update(schema.prices)
              .set({ amount: String(priceNPR), updatedAt: new Date() })
              .where(and(eq(schema.prices.variantId, vId), eq(schema.prices.currency, "NPR")));
          } else {
            await db.insert(schema.prices).values({
              variantId: vId,
              currency: "NPR",
              amount: String(priceNPR),
            });
          }
        }
      }
    }

    // 5. Update speciesMedia link if speciesId was passed
    if (speciesId !== undefined) {
      await db.delete(speciesMediaTable).where(eq(speciesMediaTable.productId, id));
      if (speciesId) {
        await db.insert(speciesMediaTable).values({
          speciesId,
          productId: id,
          customImageUrl: imageUrl || undefined,
          caption: title || updatedProduct.title,
          isPrimary: true,
          position: 0,
        });

        if (imageUrl) {
          const spRows = await db
            .select()
            .from(speciesTable)
            .where(eq(speciesTable.id, speciesId))
            .limit(1);
          if (spRows.length > 0 && !spRows[0].coverImageUrl) {
            await db
              .update(speciesTable)
              .set({ coverImageUrl: imageUrl, updatedAt: new Date() })
              .where(eq(speciesTable.id, speciesId));
          }
        }
      }
    }

    // 6. Audit log
    await db.insert(schema.auditLogs).values({
      eventType: status !== undefined ? "PHOTO_UPDATED" : "PHOTO_UPDATED",
      targetType: "PRODUCT",
      targetId: id,
      details: { updatedFields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    console.error("PATCH /api/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(schema.products)
      .where(eq(schema.products.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    await db.insert(schema.auditLogs).values({
      eventType: "PHOTO_DELETED",
      targetType: "PRODUCT",
      targetId: id,
      details: { title: deleted.title, slug: deleted.slug },
    });

    return NextResponse.json({ success: true, message: `Deleted ${deleted.title}` });
  } catch (err: any) {
    console.error("DELETE /api/products error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
