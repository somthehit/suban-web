import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const speciesId = searchParams.get("speciesId");

    const query = db
      .select({
        id: schema.audioRecordings.id,
        speciesId: schema.audioRecordings.speciesId,
        title: schema.audioRecordings.title,
        type: schema.audioRecordings.type,
        streamPath: schema.audioRecordings.streamPath,
        previewPath: schema.audioRecordings.previewPath,
        originalPath: schema.audioRecordings.originalPath,
        waveformJson: schema.audioRecordings.waveformJson,
        spectrogramPath: schema.audioRecordings.spectrogramPath,
        duration: schema.audioRecordings.duration,
        recordedAt: schema.audioRecordings.recordedAt,
        locationLabel: schema.audioRecordings.locationLabel,
        recorder: schema.audioRecordings.recorder,
        microphone: schema.audioRecordings.microphone,
        quality: schema.audioRecordings.quality,
        soundDescription: schema.audioRecordings.soundDescription,
        status: schema.audioRecordings.status,
        createdAt: schema.audioRecordings.createdAt,
        speciesCommon: schema.species.commonName,
        speciesScientific: schema.species.scientificName,
        speciesSlug: schema.species.slug,
      })
      .from(schema.audioRecordings)
      .innerJoin(schema.species, eq(schema.audioRecordings.speciesId, schema.species.id))
      .orderBy(desc(schema.audioRecordings.createdAt));

    if (speciesId) {
      const rows = await query.where(eq(schema.audioRecordings.speciesId, speciesId));
      return NextResponse.json({ success: true, recordings: rows });
    }

    const rows = await query;
    return NextResponse.json({ success: true, recordings: rows });
  } catch (error: any) {
    console.error("GET /api/audio/recordings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
