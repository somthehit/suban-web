import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { defaultSiteSettings, SiteSettings } from "@/lib/site-settings";

const dataDir = path.join(process.cwd(), "data");
const settingsFilePath = path.join(dataDir, "site-settings.json");

// Helper to save backup to file
function saveFileBackup(settings: SiteSettings) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.warn("File backup warning:", err);
  }
}

// Helper to read backup from file
function readFileBackup(): SiteSettings | null {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const raw = fs.readFileSync(settingsFilePath, "utf-8");
      if (raw && raw.trim().length > 0) {
        try {
          return JSON.parse(raw);
        } catch {
          return defaultSiteSettings;
        }
      }
    }
  } catch (err) {
    console.warn("File read warning:", err);
  }
  return null;
}

export async function GET() {
  try {
    // 1. Try reading from PostgreSQL / Supabase
    const rows = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, "default"))
      .limit(1);

      // Query live watermark settings from watermark_settings table
      let liveWatermark = defaultSiteSettings.watermark;
      try {
        const wmRows = await db.select().from(schema.watermarkSettings).limit(1);
        if (wmRows.length > 0) {
          const wm = wmRows[0];
          liveWatermark = {
            enabled: wm.isActive ?? true,
            text: wm.text || defaultSiteSettings.watermark.text,
            logoUrl: wm.logoUrl || null,
            opacity: Math.round(parseFloat(wm.opacity || "0.45") * 100),
            position: (wm.position as any) || "bottom-right",
            size: wm.size ?? 25,
            isTiled: Boolean(wm.isTiled),
            margin: wm.margin ?? 24,
            rotation: wm.rotation ?? -30,
            tileCount: wm.tileCount ?? 9,
            fontFamily: wm.fontFamily || "sans",
            fontSize: wm.fontSize ?? 12,
            color: wm.color || "#ffffff",
            blendMode: wm.blendMode || "normal",
          };
        }
      } catch (e) {
        console.warn("Non-fatal watermark load in settings route:", e);
      }

      if (rows.length > 0 && rows[0].settings) {
        const dbSettings = rows[0].settings as SiteSettings;
        const merged: SiteSettings = {
        ...defaultSiteSettings,
        ...dbSettings,
        brand: { ...defaultSiteSettings.brand, ...dbSettings.brand },
        navigation: { ...defaultSiteSettings.navigation, ...dbSettings.navigation },
        footer: { ...defaultSiteSettings.footer, ...dbSettings.footer },
        social: {
          ...defaultSiteSettings.social,
          ...dbSettings.social,
          customLinks: Array.isArray(dbSettings.social?.customLinks)
            ? dbSettings.social.customLinks
            : [],
        },
        about: { ...defaultSiteSettings.about, ...dbSettings.about },
        home: { ...defaultSiteSettings.home, ...dbSettings.home },
        payments: {
          ...defaultSiteSettings.payments,
          ...(dbSettings.payments || {}),
          stripe: { ...defaultSiteSettings.payments?.stripe, ...(dbSettings.payments?.stripe || {}) },
          esewa: { ...defaultSiteSettings.payments?.esewa, ...(dbSettings.payments?.esewa || {}) },
          fonepay: { ...defaultSiteSettings.payments?.fonepay, ...(dbSettings.payments?.fonepay || {}) },
          bank: { ...defaultSiteSettings.payments?.bank, ...(dbSettings.payments?.bank || {}) },
          khalti: { ...defaultSiteSettings.payments?.khalti, ...(dbSettings.payments?.khalti || {}) },
        },
        watermark: {
          ...defaultSiteSettings.watermark,
          ...(dbSettings.watermark || {}),
          ...liveWatermark,
        },
      };

      if (merged.about?.naturalistName && merged.about?.bioParagraph) {
        if (/^I am [^,]+,/i.test(merged.about.bioParagraph.trim())) {
          merged.about.bioParagraph = merged.about.bioParagraph.replace(/^I am [^,]+,/i, `I am ${merged.about.naturalistName},`);
        } else if (merged.about.bioParagraph.includes("Suban Bajracharya")) {
          merged.about.bioParagraph = merged.about.bioParagraph.replaceAll("Suban Bajracharya", merged.about.naturalistName);
        }
      }

      saveFileBackup(merged);
      return NextResponse.json({ success: true, settings: merged, source: "database" });
    }

    // 2. Fallback to file backup or defaults
    const fileSettings = readFileBackup();
    const finalSettings = fileSettings ? { ...defaultSiteSettings, ...fileSettings } : defaultSiteSettings;

    // Seed the DB row for future reads
    await db
      .insert(schema.siteSettings)
      .values({
        id: "default",
        settings: finalSettings,
      })
      .onConflictDoUpdate({
        target: schema.siteSettings.id,
        set: { settings: finalSettings, updatedAt: new Date() },
      });

    saveFileBackup(finalSettings);
    return NextResponse.json({ success: true, settings: finalSettings, source: "database_initialized" });
  } catch (err: any) {
    console.error("DB settings fetch error, falling back to local file:", err);
    const fileSettings = readFileBackup() || defaultSiteSettings;
    return NextResponse.json({ success: true, settings: fileSettings, source: "fallback_file" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "reset") {
      saveFileBackup(defaultSiteSettings);
      try {
        await db
          .insert(schema.siteSettings)
          .values({
            id: "default",
            settings: defaultSiteSettings,
          })
          .onConflictDoUpdate({
            target: schema.siteSettings.id,
            set: { settings: defaultSiteSettings, updatedAt: new Date() },
          });

        // Audit log
        await db.insert(schema.auditLogs).values({
          eventType: "SETTINGS_RESET",
          targetType: "SITE_SETTINGS",
          targetId: "default",
          details: { action: "reset_to_stitch_defaults" },
        });
      } catch (dbErr) {
        console.error("DB reset error:", dbErr);
      }

      return NextResponse.json({
        success: true,
        message: "Reset to default Stitch settings",
        settings: defaultSiteSettings,
      });
    }

    // Merge updated payload
    const updated: SiteSettings = {
      ...defaultSiteSettings,
      ...body,
      brand: { ...defaultSiteSettings.brand, ...(body.brand || {}) },
      navigation: { ...defaultSiteSettings.navigation, ...(body.navigation || {}) },
      footer: { ...defaultSiteSettings.footer, ...(body.footer || {}) },
      social: {
        ...defaultSiteSettings.social,
        ...(body.social || {}),
        customLinks: Array.isArray(body.social?.customLinks)
          ? body.social.customLinks
          : [],
      },
      about: { ...defaultSiteSettings.about, ...(body.about || {}) },
      home: { ...defaultSiteSettings.home, ...(body.home || {}) },
      payments: {
        ...defaultSiteSettings.payments,
        ...(body.payments || {}),
        stripe: { ...defaultSiteSettings.payments?.stripe, ...(body.payments?.stripe || {}) },
        esewa: { ...defaultSiteSettings.payments?.esewa, ...(body.payments?.esewa || {}) },
        fonepay: { ...defaultSiteSettings.payments?.fonepay, ...(body.payments?.fonepay || {}) },
        bank: { ...defaultSiteSettings.payments?.bank, ...(body.payments?.bank || {}) },
        khalti: { ...defaultSiteSettings.payments?.khalti, ...(body.payments?.khalti || {}) },
      },
      watermark: {
        ...defaultSiteSettings.watermark,
        ...(body.watermark || {}),
      },
    };

    if (updated.about?.naturalistName && updated.about?.bioParagraph) {
      if (/^I am [^,]+,/i.test(updated.about.bioParagraph.trim())) {
        updated.about.bioParagraph = updated.about.bioParagraph.replace(/^I am [^,]+,/i, `I am ${updated.about.naturalistName},`);
      } else if (updated.about.bioParagraph.includes("Suban Bajracharya")) {
        updated.about.bioParagraph = updated.about.bioParagraph.replaceAll("Suban Bajracharya", updated.about.naturalistName);
      }
    }

    saveFileBackup(updated);

    // Persist to Supabase Database
    try {
      await db
        .insert(schema.siteSettings)
        .values({
          id: "default",
          settings: updated,
        })
        .onConflictDoUpdate({
          target: schema.siteSettings.id,
          set: { settings: updated, updatedAt: new Date() },
        });

      // Write audit log
      await db.insert(schema.auditLogs).values({
        eventType: "SETTINGS_UPDATED",
        targetType: "SITE_SETTINGS",
        targetId: "default",
        details: {
          updatedFields: Object.keys(body),
          siteName: updated.brand.siteName,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (dbErr) {
      console.error("DB persist warning:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Site settings updated and published live to database",
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
