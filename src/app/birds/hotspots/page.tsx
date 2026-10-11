import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import { Compass, ChevronLeft, MapPin, Mountain, Trees, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Birding Hotspots & Sanctuaries of Nepal | SUBAN",
  description: "Explore premier national parks, high-altitude conservation areas, and prime birdwatching sanctuaries across Nepal.",
};

const HABITAT_ICONS: Record<string, string> = {
  wetland: "🌊 Wetland & Riverine",
  forest: "🌲 Temperate & Subtropical Forest",
  alpine: "🏔️ Alpine & Subalpine Meadow",
  grassland: "🌾 Terai Grassland",
};

export default async function BirdsHotspotsPage() {
  const hotspotsList = await db
    .select()
    .from(schema.hotspots)
    .orderBy(asc(schema.hotspots.name));

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020905] text-[#0c1f15] dark:text-slate-100 flex flex-col font-sans selection:bg-[#008769]/30 dark:selection:bg-[#00ffcc]/30 selection:text-white transition-colors duration-300">
      <main className="flex-1 pb-24">
        {/* Breadcrumb */}
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
              <Compass className="w-3.5 h-3.5 text-[#008769] dark:text-[#00ffcc]" />
              <span>Himalayan Sanctuaries</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="pt-12 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase bg-[#008769]/10 dark:bg-[#00ffcc]/10 border border-[#008769]/25 dark:border-[#00ffcc]/30 text-[#008769] dark:text-[#00ffcc] mb-4 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Conservation Corridors</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Birding Hotspots & Sanctuaries
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              From the subtropical riverine plains of Chitwan and Koshi Tappu to the craggy rhododendron heights of Langtang and Sagarmatha National Parks.
            </p>
          </div>
        </section>

        {/* Hotspots Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {hotspotsList.length === 0 ? (
            <div className="p-12 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 text-center shadow-sm">
              <Compass className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No hotspots catalogued yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Add national parks and birding sanctuaries via the Control Studio admin panel.
              </p>
              <Link
                href="/birds"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#008769] dark:bg-[#00ffcc] text-white dark:text-[#04120a] shadow-sm"
              >
                Back to Avian Monographs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotspotsList.map((h) => (
                <div
                  key={h.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 p-6 flex flex-col justify-between hover:border-[#008769]/40 dark:hover:border-[#00ffcc]/40 transition-colors shadow-sm dark:shadow-none"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#008769]/10 text-[#008769] border border-[#008769]/20 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-[#00ffcc]/30 font-semibold">
                        {h.region || "Sanctuary"}
                      </span>
                      {h.district && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {h.district}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{h.name}</h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                      {h.description || "Prime birdwatching habitat with rich avifauna biodiversity."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Mountain className="w-3.5 h-3.5 text-[#008769] dark:text-[#00ffcc]" />
                      <span>
                        {h.elevationMin && h.elevationMax
                          ? `${h.elevationMin}m - ${h.elevationMax}m`
                          : "Himalayan Corridor"}
                      </span>
                    </span>
                    <span className="text-[#008769] dark:text-[#00ffcc] font-semibold">Checklist Available</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
