import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql } from "drizzle-orm";

let migrationEnsured = false;
async function ensureColumns() {
  if (migrationEnsured) return;
  try {
    await db.execute(sql`
      ALTER TABLE watermark_settings 
      ADD COLUMN IF NOT EXISTS rotation integer DEFAULT -30,
      ADD COLUMN IF NOT EXISTS tile_count integer DEFAULT 9,
      ADD COLUMN IF NOT EXISTS font_family varchar(50) DEFAULT 'sans',
      ADD COLUMN IF NOT EXISTS font_size integer DEFAULT 12,
      ADD COLUMN IF NOT EXISTS color varchar(50) DEFAULT '#ffffff',
      ADD COLUMN IF NOT EXISTS blend_mode varchar(50) DEFAULT 'normal';
    `);
    migrationEnsured = true;
  } catch (err) {
    console.warn("Watermark columns check warning (non-fatal):", err);
  }
}

export async function GET() {
  try {
    await ensureColumns();

    const existing = await db.select().from(schema.watermarkSettings).limit(1);

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(schema.watermarkSettings)
        .values({
          text: "© SUBAN WILDLIFE PHOTOGRAPHY",
          opacity: "0.45",
          position: "bottom-right",
          size: 25,
          isTiled: false,
          margin: 24,
          isActive: true,
          rotation: -30,
          tileCount: 9,
          fontFamily: "sans",
          fontSize: 12,
          color: "#ffffff",
          blendMode: "normal",
        })
        .returning();

      return NextResponse.json({
        success: true,
        watermark: {
          ...inserted,
          opacityPercent: Math.round(parseFloat(inserted.opacity) * 100),
          rotation: inserted.rotation ?? -30,
          tileCount: inserted.tileCount ?? 9,
          fontFamily: inserted.fontFamily ?? "sans",
          fontSize: inserted.fontSize ?? 12,
          color: inserted.color ?? "#ffffff",
          blendMode: inserted.blendMode ?? "normal",
        },
      });
    }

    const row = existing[0];
    return NextResponse.json({
      success: true,
      watermark: {
        ...row,
        opacityPercent: Math.round(parseFloat(row.opacity || "0.45") * 100),
        rotation: row.rotation ?? -30,
        tileCount: row.tileCount ?? 9,
        fontFamily: row.fontFamily ?? "sans",
        fontSize: row.fontSize ?? 12,
        color: row.color ?? "#ffffff",
        blendMode: row.blendMode ?? "normal",
      },
    });
  } catch (error: any) {
    console.error("Failed to load watermark settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to load watermark settings",
        fallback: {
          text: "© SUBAN WILDLIFE PHOTOGRAPHY",
          opacity: "0.45",
          opacityPercent: 45,
          position: "bottom-right",
          size: 25,
          isTiled: false,
          margin: 24,
          isActive: true,
          rotation: -30,
          tileCount: 9,
          fontFamily: "sans",
          fontSize: 12,
          color: "#ffffff",
          blendMode: "normal",
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await ensureColumns();

    const body = await request.json();

    const text = (body.text || "© SUBAN WILDLIFE PHOTOGRAPHY").trim();
    const logoUrl = body.logoUrl !== undefined ? body.logoUrl : null;
    const opacityVal = typeof body.opacity === "number" 
      ? (body.opacity / 100).toFixed(2)
      : typeof body.opacityPercent === "number"
      ? (body.opacityPercent / 100).toFixed(2)
      : parseFloat(body.opacity || "0.45").toFixed(2);
    const position = body.position || "bottom-right";
    const size = typeof body.size === "number" ? Math.max(10, Math.min(100, body.size)) : 25;
    const isTiled = Boolean(body.isTiled);
    const margin = typeof body.margin === "number" ? Math.max(0, Math.min(120, body.margin)) : 24;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
    const rotation = typeof body.rotation === "number" ? Math.max(-180, Math.min(180, body.rotation)) : -30;
    const tileCount = typeof body.tileCount === "number" ? Math.max(1, Math.min(36, body.tileCount)) : 9;
    const fontFamily = body.fontFamily || "sans";
    const fontSize = typeof body.fontSize === "number" ? Math.max(8, Math.min(36, body.fontSize)) : 12;
    const color = body.color || "#ffffff";
    const blendMode = body.blendMode || "normal";

    const existing = await db.select().from(schema.watermarkSettings).limit(1);

    let updatedRow;
    if (existing.length > 0) {
      const [res] = await db
        .update(schema.watermarkSettings)
        .set({
          text,
          logoUrl,
          opacity: opacityVal,
          position,
          size,
          isTiled,
          margin,
          isActive,
          rotation,
          tileCount,
          fontFamily,
          fontSize,
          color,
          blendMode,
          updatedAt: new Date(),
        })
        .where(eq(schema.watermarkSettings.id, existing[0].id))
        .returning();
      updatedRow = res;
    } else {
      const [res] = await db
        .insert(schema.watermarkSettings)
        .values({
          text,
          logoUrl,
          opacity: opacityVal,
          position,
          size,
          isTiled,
          margin,
          isActive,
          rotation,
          tileCount,
          fontFamily,
          fontSize,
          color,
          blendMode,
        })
        .returning();
      updatedRow = res;
    }

    // Also sync to site_settings brand watermarkText if row exists
    try {
      const siteRows = await db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.id, "default"))
        .limit(1);

      if (siteRows.length > 0 && siteRows[0].settings) {
        const curSettings = siteRows[0].settings as any;
        const newSettings = {
          ...curSettings,
          brand: {
            ...(curSettings.brand || {}),
            watermarkText: text,
          },
          watermark: {
            text,
            logoUrl,
            opacity: parseFloat(opacityVal) * 100,
            position,
            size,
            isTiled,
            margin,
            enabled: isActive,
            rotation,
            tileCount,
            fontFamily,
            fontSize,
            color,
            blendMode,
          },
        };

        await db
          .update(schema.siteSettings)
          .set({ settings: newSettings, updatedAt: new Date() })
          .where(eq(schema.siteSettings.id, "default"));
      }
    } catch (syncErr) {
      console.warn("Watermark siteSettings sync non-fatal warning:", syncErr);
    }

    return NextResponse.json({
      success: true,
      watermark: {
        ...updatedRow,
        opacityPercent: Math.round(parseFloat(updatedRow.opacity) * 100),
        rotation: updatedRow.rotation ?? rotation,
        tileCount: updatedRow.tileCount ?? tileCount,
        fontFamily: updatedRow.fontFamily ?? fontFamily,
        fontSize: updatedRow.fontSize ?? fontSize,
        color: updatedRow.color ?? color,
        blendMode: updatedRow.blendMode ?? blendMode,
      },
    });
  } catch (error: any) {
    console.error("Failed to update watermark settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update watermark settings" },
      { status: 500 }
    );
  }
}
