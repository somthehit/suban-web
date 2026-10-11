"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  Search,
  Filter,
  Sparkles,
  Volume2,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Feather,
  Compass,
  ArrowUpRight,
  Flame,
} from "lucide-react";

interface SpeciesItem {
  id: string;
  slug: string;
  commonName: string;
  nepaliName: string | null;
  scientificName: string;
  family: string | null;
  order: string | null;
  iucnStatus: string | null;
  nepalStatus: string | null;
  residency: string | null;
  endemic: boolean;
  elevationMin?: number | null;
  elevationMax?: number | null;
  habitats?: string[] | null;
  description: string | null;
  isBirdOfTheWeek?: boolean;
  isFeatured?: boolean;
  audioCount?: number;
  mediaCount?: number;
  featuredAudio?: any;
}

const IUCN_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CR: {
    label: "Critically Endangered",
    bg: "bg-red-50 dark:bg-red-500/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-500/40",
  },
  EN: {
    label: "Endangered",
    bg: "bg-orange-50 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-500/40",
  },
  VU: {
    label: "Vulnerable",
    bg: "bg-amber-50 dark:bg-amber-500/20",
    text: "text-amber-800 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-500/40",
  },
  NT: {
    label: "Near Threatened",
    bg: "bg-yellow-50 dark:bg-yellow-500/15",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-500/30",
  },
  LC: {
    label: "Least Concern",
    bg: "bg-emerald-50 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
};

const RESIDENCY_LABELS: Record<string, string> = {
  resident: "Resident Breeder",
  summer: "Summer Visitor",
  winter: "Winter Visitor",
  passage: "Passage Migrant",
};

// Fallback images for seed species if media is not yet uploaded
const SPECIES_PREVIEW_IMAGES: Record<string, string> = {
  "himalayan-monal": "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1200&q=80",
  "spiny-babbler": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
  "great-hornbill": "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80",
  "ibisbill": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80",
  "cheer-pheasant": "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?auto=format&fit=crop&w=1200&q=80",
};

export default function BirdsHubPage() {
  const [speciesList, setSpeciesList] = useState<SpeciesItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIucn, setSelectedIucn] = useState<string>("all");
  const [selectedResidency, setSelectedResidency] = useState<string>("all");
  const [endemicOnly, setEndemicOnly] = useState<boolean>(false);

  useEffect(() => {
    async function loadSpecies() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/species?group=bird");
        const data = await res.json();
        if (data.success && Array.isArray(data.species)) {
          setSpeciesList(data.species);
        }
      } catch (err) {
        console.error("Failed to load species:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSpecies();
  }, []);

  // Filter species in memory
  const filteredSpecies = speciesList.filter((sp) => {
    if (selectedIucn !== "all" && sp.iucnStatus !== selectedIucn) return false;
    if (selectedResidency !== "all" && sp.residency !== selectedResidency) return false;
    if (endemicOnly && !sp.endemic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCommon = sp.commonName.toLowerCase().includes(q);
      const matchScientific = sp.scientificName.toLowerCase().includes(q);
      const matchNepali = sp.nepaliName?.toLowerCase().includes(q);
      const matchFamily = sp.family?.toLowerCase().includes(q);
      return matchCommon || matchScientific || matchNepali || matchFamily;
    }
    return true;
  });

  // Highlight featured or Bird of the Week
  const birdOfTheWeek =
    speciesList.find((s) => s.isBirdOfTheWeek) ||
    speciesList.find((s) => s.slug === "himalayan-monal") ||
    speciesList[0];

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020905] text-[#0c1f15] dark:text-slate-100 flex flex-col font-sans selection:bg-[#008769]/30 dark:selection:bg-[#00ffcc]/30 selection:text-white transition-colors duration-300">
      <main className="flex-1 pb-24">
        {/* ── HERO BANNER ── */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#0c8a68]/15 dark:border-[#00ffcc]/15 bg-gradient-to-b from-[#eaf4ee] via-[#f1f8f3] to-[#f6f9f7] dark:from-[#06180e] dark:via-[#030d07] dark:to-[#020905]">
          {/* Subtle ambient light glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#008769]/10 dark:bg-[#00ffcc]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#10b981]/10 dark:bg-[#38ef7d]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase bg-[#008769]/10 dark:bg-[#00ffcc]/10 border border-[#008769]/25 dark:border-[#00ffcc]/30 text-[#008769] dark:text-[#00ffcc] mb-6 shadow-sm">
                <Feather className="w-3.5 h-3.5" />
                <span>Nepal Avian Biodiversity Monograph & Soundscapes</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                Himalayan Birds <br />
                <span className="bg-gradient-to-r from-[#008769] via-[#059669] to-[#047857] dark:from-[#00ffcc] dark:via-[#38ef7d] dark:to-[#11998e] bg-clip-text text-transparent">
                  & Bioacoustic Hub
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
                An authoritative field archive of Nepal’s 886+ avian species. Featuring ultra-high-resolution photographic plates, field soundscape recordings, elevation profiles, and conservation status.
              </p>

              {/* Quick Hub Nav Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/birds/sounds"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/15 hover:border-[#008769]/40 dark:hover:border-[#00ffcc]/40 transition-all shadow-sm"
                >
                  <Volume2 className="w-4 h-4 text-[#008769] dark:text-[#00ffcc]" />
                  <span>Acoustic Library</span>
                </Link>
                <Link
                  href="/birds/hotspots"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/15 hover:border-[#008769]/40 dark:hover:border-[#00ffcc]/40 transition-all shadow-sm"
                >
                  <Compass className="w-4 h-4 text-[#008769] dark:text-[#00ffcc]" />
                  <span>Birding Sanctuaries</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── BIRD OF THE WEEK SPOTLIGHT ── */}
        {birdOfTheWeek && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 -mt-8 relative z-20 mb-16">
            <div className="rounded-3xl border border-[#008769]/20 dark:border-[#00ffcc]/30 bg-white dark:bg-[#06180e]/95 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.7)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo Showcase with Watermark */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SPECIES_PREVIEW_IMAGES[birdOfTheWeek.slug] || "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1200&q=80"}
                  alt={birdOfTheWeek.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <WatermarkOverlay variant="card" />

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-lg">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>National Bird / Monograph Spotlight</span>
                </div>
              </div>

              {/* Monograph Details & Bioacoustics */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {birdOfTheWeek.nepaliName && (
                      <span className="text-xl sm:text-2xl font-bold text-[#008769] dark:text-[#00ffcc] font-serif">
                        {birdOfTheWeek.nepaliName}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase">
                      [{birdOfTheWeek.scientificName}]
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                    {birdOfTheWeek.commonName}
                  </h2>

                  <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                    {birdOfTheWeek.description ||
                      "The Himalayan Monal is renowned for its iridescent plumage reflecting nine vivid metallic hues, residing in high-altitude subalpine oak-rhododendron forests across the Himalayas."}
                  </p>

                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 mb-6 text-xs font-mono">
                    {birdOfTheWeek.iucnStatus && (
                      <span
                        className={`px-3 py-1 rounded-full border ${
                          IUCN_COLORS[birdOfTheWeek.iucnStatus]?.bg || "bg-emerald-50 dark:bg-emerald-500/15"
                        } ${IUCN_COLORS[birdOfTheWeek.iucnStatus]?.text || "text-emerald-700 dark:text-emerald-400"} ${
                          IUCN_COLORS[birdOfTheWeek.iucnStatus]?.border || "border-emerald-200 dark:border-emerald-500/30"
                        }`}
                      >
                        IUCN: {birdOfTheWeek.iucnStatus}
                      </span>
                    )}
                    {birdOfTheWeek.residency && (
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {RESIDENCY_LABELS[birdOfTheWeek.residency] || birdOfTheWeek.residency}
                      </span>
                    )}
                    {birdOfTheWeek.elevationMin && birdOfTheWeek.elevationMax && (
                      <span className="px-3 py-1 rounded-full bg-[#008769]/10 dark:bg-[#00ffcc]/10 border border-[#008769]/20 dark:border-[#00ffcc]/20 text-[#008769] dark:text-[#00ffcc]">
                        {birdOfTheWeek.elevationMin}m – {birdOfTheWeek.elevationMax}m Elevation
                      </span>
                    )}
                  </div>
                </div>

                {/* Embedded Sound Player & CTA */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="text-[#008769] dark:text-[#00ffcc] font-semibold">Habitat:</span>{" "}
                    {Array.isArray(birdOfTheWeek.habitats) && birdOfTheWeek.habitats.length > 0
                      ? birdOfTheWeek.habitats.join(", ")
                      : "Subalpine Rhododendron & Alpine Meadows"}
                  </div>

                  <Link
                    href={`/birds/${birdOfTheWeek.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm bg-gradient-to-r from-[#008769] to-[#059669] dark:from-[#00ffcc] dark:to-[#38ef7d] text-white dark:text-[#04120a] hover:shadow-[0_0_24px_rgba(0,135,105,0.3)] dark:hover:shadow-[0_0_24px_rgba(0,255,204,0.4)] transition-all font-semibold"
                  >
                    <span>Full Monograph</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── FILTER & SEARCH TOOLBAR ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-10">
          <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 backdrop-blur-md shadow-sm dark:shadow-none flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by common, Nepali (उदा. डाँफे), or scientific name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#008769] dark:focus:border-[#00ffcc]/60 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* IUCN Filter */}
              <select
                value={selectedIucn}
                onChange={(e) => setSelectedIucn(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-[#008769] dark:focus:border-[#00ffcc]/60"
              >
                <option value="all">All IUCN Statuses</option>
                <option value="CR">Critically Endangered (CR)</option>
                <option value="EN">Endangered (EN)</option>
                <option value="VU">Vulnerable (VU)</option>
                <option value="NT">Near Threatened (NT)</option>
                <option value="LC">Least Concern (LC)</option>
              </select>

              {/* Residency Filter */}
              <select
                value={selectedResidency}
                onChange={(e) => setSelectedResidency(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-mono focus:outline-none focus:border-[#008769] dark:focus:border-[#00ffcc]/60"
              >
                <option value="all">All Movements</option>
                <option value="resident">Resident Breeder</option>
                <option value="summer">Summer Visitor</option>
                <option value="winter">Winter Visitor</option>
                <option value="passage">Passage Migrant</option>
              </select>

              {/* Endemic Toggle */}
              <button
                type="button"
                onClick={() => setEndemicOnly(!endemicOnly)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-mono border transition-all ${
                  endemicOnly
                    ? "bg-[#008769]/15 border-[#008769] text-[#008769] dark:bg-[#00ffcc]/20 dark:border-[#00ffcc] dark:text-[#00ffcc] font-semibold"
                    : "bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                🇳🇵 Nepal Endemic
              </button>
            </div>
          </div>
        </section>

        {/* ── SPECIES MONOGRAPH GRID ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Catalogue Monographs ({filteredSpecies.length})
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Showing filtered species
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 h-80 animate-pulse"
                />
              ))}
            </div>
          ) : filteredSpecies.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 shadow-sm">
              <Feather className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No species match this criteria</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Try loosening your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIucn("all");
                  setSelectedResidency("all");
                  setEndemicOnly(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#008769]/15 border border-[#008769]/40 text-[#008769] dark:bg-[#00ffcc]/20 dark:border-[#00ffcc]/40 dark:text-[#00ffcc]"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredSpecies.map((sp) => {
                const iucn = sp.iucnStatus ? IUCN_COLORS[sp.iucnStatus] : null;
                const photoSrc =
                  SPECIES_PREVIEW_IMAGES[sp.slug] ||
                  "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1200&q=80";

                return (
                  <Link
                    key={sp.id}
                    href={`/birds/${sp.slug}`}
                    className="group rounded-2xl border border-slate-200 dark:border-[#00ffcc]/15 bg-white dark:bg-[#06180e]/70 hover:bg-slate-50/50 dark:hover:bg-[#06180e] backdrop-blur-md overflow-hidden hover:border-[#008769]/50 dark:hover:border-[#00ffcc]/50 transition-all duration-300 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(0,135,105,0.12)] dark:hover:shadow-[0_16px_40px_rgba(0,255,204,0.15)] hover:-translate-y-1"
                  >
                    {/* Thumbnail Image Container with Watermark Protection */}
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-black overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoSrc}
                        alt={sp.commonName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      {/* Live Watermark Overlay (Card variant) */}
                      <WatermarkOverlay variant="card" />

                      {/* Top Badges */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                        {sp.endemic && (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-emerald-600 text-white shadow-md">
                            🇳🇵 NEPAL ENDEMIC
                          </span>
                        )}
                        {iucn && (
                          <span
                            className={`ml-auto px-2 py-0.5 rounded text-[10px] font-mono font-bold ${iucn.bg} ${iucn.text} border ${iucn.border} backdrop-blur-md`}
                          >
                            {sp.iucnStatus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Bilingual Header */}
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#008769] dark:group-hover:text-[#00ffcc] transition-colors truncate">
                            {sp.commonName}
                          </h4>
                          {sp.nepaliName && (
                            <span className="text-sm font-semibold text-[#008769] dark:text-[#00ffcc] font-serif shrink-0">
                              {sp.nepaliName}
                            </span>
                          )}
                        </div>

                        {/* Scientific Name */}
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-3 font-serif">
                          {sp.scientificName}
                        </div>

                        {/* Description snippet */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                          {sp.description ||
                            "Detailed field observations, altitudinal migration ranges, and bioacoustics recordings recorded in Nepal."}
                        </p>
                      </div>

                      {/* Card Footer Meta */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="truncate">
                          {sp.residency ? RESIDENCY_LABELS[sp.residency] || sp.residency : "Resident"}
                        </span>
                        <div className="flex items-center gap-1 text-[#008769] dark:text-[#00ffcc] group-hover:translate-x-1 transition-transform font-semibold">
                          <span>View plate</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
