import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");

    if (!trackId) {
      return NextResponse.json({ error: "Track ID is required" }, { status: 400 });
    }

    const rows = await db
      .select()
      .from(schema.audioRecordings)
      .where(eq(schema.audioRecordings.id, trackId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    const track = rows[0];

    // Log download in audit table
    try {
      const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "unknown";
      await db.insert(schema.audioDownloads).values({
        audioId: track.id,
        downloadType: "free_watermarked",
        ipAddress: ip,
        userAgent,
      });
    } catch (logErr) {
      console.warn("Failed to log audio download:", logErr);
    }

    // Determine target file
    const targetPath = track.streamPath || track.previewPath;
    if (!targetPath) {
      return NextResponse.json({ error: "No audio file available" }, { status: 404 });
    }

    // If it's a URL, redirect
    if (targetPath.startsWith("http://") || targetPath.startsWith("https://")) {
      return NextResponse.redirect(targetPath);
    }

    // If it's a local public file
    const localFilePath = path.join(process.cwd(), "public", targetPath.replace(/^\//, ""));
    if (fs.existsSync(localFilePath)) {
      const fileBuffer = fs.readFileSync(localFilePath);
      const filename = path.basename(localFilePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default redirect to path
    return NextResponse.redirect(new URL(targetPath, request.url));
  } catch (error: any) {
    console.error("GET /api/audio/download error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
