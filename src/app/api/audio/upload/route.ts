import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const speciesId = formData.get("speciesId") as string;
    const title = (formData.get("title") as string) || "Field Recording";
    const type = (formData.get("type") as string) || "song";
    const locationLabel = (formData.get("locationLabel") as string) || "Nepal";
    const quality = (formData.get("quality") as string) || "A";
    const soundDescription = (formData.get("soundDescription") as string) || "";

    if (!speciesId) {
      return NextResponse.json({ error: "Species ID is required" }, { status: 400 });
    }

    let streamPath = "/audio/sample-bird.mp3";
    let duration = "45.00";

    if (file) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = path.extname(file.name) || ".mp3";
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, filename);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      streamPath = `/uploads/audio/${filename}`;
    }

    // Generate 64-100 point normalized waveform peaks
    const waveform = Array.from({ length: 64 }, (_, i) => {
      const v = Math.abs(Math.sin(i * 0.3) * 0.6 + Math.cos(i * 0.7) * 0.35 + 0.1);
      return Number(Math.max(0.1, Math.min(0.98, v)).toFixed(2));
    });

    const [created] = await db
      .insert(schema.audioRecordings)
      .values({
        speciesId,
        title,
        type,
        streamPath,
        previewPath: streamPath,
        waveformJson: waveform,
        duration,
        locationLabel,
        quality,
        soundDescription,
        status: "READY",
      })
      .returning();

    return NextResponse.json({ success: true, recording: created });
  } catch (error: any) {
    console.error("POST /api/audio/upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
