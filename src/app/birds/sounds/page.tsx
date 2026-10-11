import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import { Volume2, ChevronLeft, Mic, Sparkles, Feather } from "lucide-react";

export const metadata: Metadata = {
  title: "Avian Bioacoustic Library | Himalayan Soundscapes | SUBAN",
  description: "Listen to high-fidelity master soundscape recordings, territorial dawn songs, and flight calls of Himalayan avifauna.",
};

export default async function BirdsSoundsPage() {
  const recordingsWithSpecies = await db
    .select({
      id: schema.audioRecordings.id,
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
      isFree: schema.audioRecordings.isFree,
      speciesSlug: schema.species.slug,
      speciesCommon: schema.species.commonName,
      speciesScientific: schema.species.scientificName,
    })
    .from(schema.audioRecordings)
    .innerJoin(schema.species, eq(schema.audioRecordings.speciesId, schema.species.id))
    .orderBy(desc(schema.audioRecordings.recordedAt), desc(schema.audioRecordings.createdAt));

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020905] text-[#0c1f15] dark:text-slate-100 flex flex-col font-sans selection:bg-[#008769]/30 dark:selection:bg-[#00ffcc]/30 selection:text-white transition-colors duration-300">
      <main className="flex-1 pb-24">
        {/* Header Breadcrumb */}
        <div className="border-b border-slate-200 dark:border-[#00ffcc]/15 bg-white/90 dark:bg-[#04140b]/80 backdrop-blur-md sticky top-20 z-30 shadow-sm dark:shadow-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between">
            <Link
              href="/birds"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-[#008769] dark:hover:text-[#00ffcc] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Birds Hub</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <Mic className="w-3.5 h-3.5 text-[#008769] dark:text-[#00ffcc]" />
              <span>Master Sound Archives</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="pt-12 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-[#008769]/10 dark:bg-[#00ffcc]/10 border border-[#008769]/25 dark:border-[#00ffcc]/30 text-[#008769] dark:text-[#00ffcc] mb-4 shadow-sm">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Bioacoustic Archives</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Himalayan Soundscapes & Field Recordings
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Uncompressed and calibrated field acoustic recordings of rare Himalayan birds. Captured using parabolic reflectors and ultralow-noise shotgun microphones across pristine high-altitude ecosystems.
            </p>
          </div>
        </section>

        {/* Recordings List */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {recordingsWithSpecies.length === 0 ? (
            <div className="p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 text-center shadow-sm">
              <Volume2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No audio tracks uploaded yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Master recordings can be uploaded and managed in the Control Studio Wildlife & Bioacoustics tab.
              </p>
              <Link
                href="/birds"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#008769] dark:bg-[#00ffcc] text-white dark:text-[#04120a] shadow-sm"
              >
                Explore Species Monographs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recordingsWithSpecies.map((track) => (
                <div
                  key={track.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 p-5 flex flex-col justify-between shadow-sm dark:shadow-none"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Link
                        href={`/birds/${track.speciesSlug}`}
                        className="text-xs font-mono text-[#008769] dark:text-[#00ffcc] hover:underline flex items-center gap-1.5 font-semibold"
                      >
                        <Feather className="w-3 h-3" />
                        <span>{track.speciesCommon}</span>
                      </Link>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 italic">
                        {track.speciesScientific}
                      </span>
                    </div>
                  </div>

                  <AudioPlayer track={track as any} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
