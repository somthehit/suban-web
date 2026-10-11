import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ALLOWED_BUCKETS = ["gallery", "profiles", "watermarks", "site", "raw-vault"] as const;
type BucketType = (typeof ALLOWED_BUCKETS)[number];

const BUCKET_LIMITS: Record<BucketType, { maxSize: number; allowedMimes?: string[] }> = {
  gallery: {
    maxSize: 52428800, // 50MB
    allowedMimes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/tiff",
      "image/x-adobe-dng",
      "image/svg+xml",
    ],
  },
  profiles: {
    maxSize: 10485760, // 10MB
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  watermarks: {
    maxSize: 10485760, // 10MB
    allowedMimes: ["image/png", "image/svg+xml", "image/webp"],
  },
  site: {
    maxSize: 20971520, // 20MB
    allowedMimes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/avif"],
  },
  "raw-vault": {
    maxSize: 209715200, // 200MB
  },
};

function ensureUploadDir(bucket: string) {
  const dir = path.join(process.cwd(), "public", "uploads", bucket);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// GET /api/upload - List files in buckets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket") as BucketType | null;

    if (bucket && !ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { success: false, error: `Invalid bucket '${bucket}'. Allowed: ${ALLOWED_BUCKETS.join(", ")}` },
        { status: 400 }
      );
    }

    const targetBuckets = bucket ? [bucket] : ALLOWED_BUCKETS;
    const results: Record<
      string,
      Array<{
        name: string;
        url: string;
        size: number;
        createdAt: string;
        mimeType: string;
        bucket: string;
      }>
    > = {};

    for (const b of targetBuckets) {
      const dir = ensureUploadDir(b);
      const files = fs.readdirSync(dir);
      results[b] = files
        .filter((file) => !file.startsWith("."))
        .map((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          const mimeType =
            ext === ".png"
              ? "image/png"
              : ext === ".webp"
              ? "image/webp"
              : ext === ".svg"
              ? "image/svg+xml"
              : ext === ".avif"
              ? "image/avif"
              : "image/jpeg";

          return {
            name: file,
            url: `/uploads/${b}/${file}`,
            size: stat.size,
            createdAt: stat.birthtime.toISOString(),
            mimeType,
            bucket: b,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Also get Supabase bucket info from DB if available
    let dbBuckets: any[] = [];
    try {
      const rows = await db.execute(sql`SELECT id, name, public, file_size_limit FROM storage.buckets;`);
      dbBuckets = rows as any[];
    } catch (e) {
      // ignore if DB query fails
    }

    return NextResponse.json({
      success: true,
      buckets: ALLOWED_BUCKETS,
      dbBuckets,
      files: bucket ? results[bucket] : results,
    });
  } catch (error: any) {
    console.error("GET /api/upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/upload - Upload file to bucket
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as BucketType) || "gallery";
    const customFilename = formData.get("filename") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided in form data" }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { success: false, error: `Invalid bucket '${bucket}'. Allowed: ${ALLOWED_BUCKETS.join(", ")}` },
        { status: 400 }
      );
    }

    const limits = BUCKET_LIMITS[bucket];
    if (file.size > limits.maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds bucket limit of ${(
            limits.maxSize /
            1024 /
            1024
          ).toFixed(0)}MB`,
        },
        { status: 400 }
      );
    }

    if (limits.allowedMimes && limits.allowedMimes.length > 0 && !limits.allowedMimes.includes(file.type)) {
      // allow typical jpeg aliases
      const isJpeg =
        (file.type === "image/jpeg" || file.type === "image/jpg") &&
        limits.allowedMimes.includes("image/jpeg");
      if (!isJpeg) {
        return NextResponse.json(
          {
            success: false,
            error: `File type '${file.type}' not permitted for bucket '${bucket}'. Allowed: ${limits.allowedMimes.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
    }

    const uploadDir = ensureUploadDir(bucket);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe clean filename
    const originalExt = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 40);

    const timestamp = Date.now();
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const filename = customFilename
      ? customFilename.replace(/[^a-zA-Z0-9_.-]/g, "_")
      : `${baseName || "photo"}-${timestamp}-${uniqueSuffix}${originalExt}`;

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${bucket}/${filename}`;

    // Also register object in Supabase storage.objects for database sync
    try {
      await db.execute(sql`
        INSERT INTO storage.objects (id, bucket_id, name, metadata)
        VALUES (
          gen_random_uuid(),
          ${bucket},
          ${filename},
          ${JSON.stringify({
            size: file.size,
            mimetype: file.type,
            cacheControl: "max-age=3600",
            lastModified: new Date().toISOString(),
          })}::jsonb
        )
        ON CONFLICT DO NOTHING;
      `);
    } catch (dbErr) {
      console.warn("Could not insert into storage.objects:", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      bucket,
      filename,
      size: file.size,
      mimeType: file.type,
      message: `File uploaded successfully to bucket '${bucket}'`,
    });
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Upload failed" }, { status: 500 });
  }
}

// DELETE /api/upload - Delete file from bucket
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket") as BucketType | null;
    const filename = searchParams.get("filename");

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket) || !filename) {
      return NextResponse.json({ success: false, error: "Bucket and filename are required" }, { status: 400 });
    }

    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", bucket, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from storage.objects
    try {
      await db.execute(sql`
        DELETE FROM storage.objects 
        WHERE bucket_id = ${bucket} AND name = ${safeFilename};
      `);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `File '${safeFilename}' deleted from bucket '${bucket}'`,
    });
  } catch (error: any) {
    console.error("DELETE /api/upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
