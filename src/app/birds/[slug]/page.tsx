import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  species as speciesTable,
  speciesMedia as speciesMediaTable,
  audioRecordings as audioRecordingsTable,
  hotspots as hotspotsTable,
  speciesHotspots as speciesHotspotsTable,
} from "@/db/schema/species";
import { eq, desc, asc } from "drizzle-orm";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";
import { AudioPlayer } from "@/components/ui/AudioPlayer";
import {
  Feather,
  MapPin,
  Calendar,
  Volume2,
  ChevronLeft,
  ShieldAlert,
  Compass,
  ArrowRight,
  Maximize2,
  Share2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const IUCN_INFO: Record<string, { label: string; color: string; desc: string }> = {
  CR: {
    label: "Critically Endangered",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40",
    desc: "Facing an extremely high risk of extinction in the wild.",
  },
  EN: {
    label: "Endangered",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40",
    desc: "Considered to be facing a very high risk of extinction in the wild.",
  },
  VU: {
    label: "Vulnerable",
    color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40",
    desc: "High risk of endangerment in the wild.",
  },
  NT: {
    label: "Near Threatened",
    color: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30",
    desc: "Likely to become endangered in the near future.",
  },
  LC: {
    label: "Least Concern",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30",
    desc: "Widespread and abundant taxa evaluated at lowest risk.",
  },
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DEFAULT_IMAGES: Record<string, string> = {
  "himalayan-monal": "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1600&q=85",
  "spiny-babbler": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1600&q=85",
  "great-hornbill": "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1600&q=85",
  "ibisbill": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1600&q=85",
  "cheer-pheasant": "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?auto=format&fit=crop&w=1600&q=85",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rows = await db.select().from(speciesTable).where(eq(speciesTable.slug, slug)).limit(1);
  if (!rows || rows.length === 0) {
    return { title: "Species Not Found | SUBAN" };
  }
  const sp = rows[0];
  const title = `${sp.commonName} (${sp.scientificName}) ${sp.nepaliName ? `| ${sp.nepaliName}` : ""} — Avian Monograph`;
  const description = sp.description || `Field identification, sound recordings, and distribution of ${sp.commonName} in Nepal.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: DEFAULT_IMAGES[sp.slug] || "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1200&q=80",
          alt: sp.commonName,
        },
      ],
    },
  };
}

export default async function SpeciesDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch species
  const rows = await db.select().from(speciesTable).where(eq(speciesTable.slug, slug)).limit(1);
  if (!rows || rows.length === 0) {
    notFound();
  }
  const sp = rows[0];

  // 2. Fetch media list
  const mediaList = await db
    .select({
      id: speciesMediaTable.id,
      customImageUrl: speciesMediaTable.customImageUrl,
      caption: speciesMediaTable.caption,
      isPrimary: speciesMediaTable.isPrimary,
      productId: speciesMediaTable.productId,
      productTitle: schema.products.title,
      productSlug: schema.products.slug,
    })
    .from(speciesMediaTable)
    .leftJoin(schema.products, eq(speciesMediaTable.productId, schema.products.id))
    .where(eq(speciesMediaTable.speciesId, sp.id))
    .orderBy(desc(speciesMediaTable.isPrimary), asc(speciesMediaTable.position));

  // 3. Fetch audio recordings
  const audioRecordings = await db
    .select()
    .from(audioRecordingsTable)
    .where(eq(audioRecordingsTable.speciesId, sp.id))
    .orderBy(desc(audioRecordingsTable.recordedAt), desc(audioRecordingsTable.createdAt));

  // 4. Fetch sanctuaries / hotspots
  const hotspotsRaw = await db
    .select({
      relationId: speciesHotspotsTable.id,
      id: hotspotsTable.id,
      name: hotspotsTable.name,
      slug: hotspotsTable.slug,
      region: hotspotsTable.region,
      district: hotspotsTable.district,
      seasonality: speciesHotspotsTable.seasonality,
      abundance: speciesHotspotsTable.abundance,
    })
    .from(speciesHotspotsTable)
    .innerJoin(hotspotsTable, eq(speciesHotspotsTable.hotspotId, hotspotsTable.id))
    .where(eq(speciesHotspotsTable.speciesId, sp.id));

  // Deduplicate hotspots to avoid repeat cards for the same sanctuary
  const seenHotspotIds = new Set<string>();
  const hotspots = hotspotsRaw.filter((h) => {
    if (seenHotspotIds.has(h.id)) return false;
    seenHotspotIds.add(h.id);
    return true;
  });

  const heroImage =
    mediaList[0]?.customImageUrl ||
    DEFAULT_IMAGES[sp.slug] ||
    "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?auto=format&fit=crop&w=1600&q=85";

  const iucn = sp.iucnStatus ? IUCN_INFO[sp.iucnStatus] : null;

  // Best months set
  const bestMonthsList: number[] = Array.isArray(sp.bestMonths)
    ? (sp.bestMonths as any[]).map(Number)
    : [3, 4, 5, 10, 11];

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020905] text-[#0c1f15] dark:text-slate-100 flex flex-col font-sans selection:bg-[#008769]/30 dark:selection:bg-[#00ffcc]/30 selection:text-white transition-colors duration-300">
      <main className="flex-1 pb-24">
        {/* ── BREADCRUMB ── */}
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
              <span>Aves</span>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">{sp.order || "Galliformes"}</span>
              <span>/</span>
              <span className="text-[#008769] dark:text-[#00ffcc] font-semibold">{sp.commonName}</span>
            </div>
          </div>
        </div>

        {/* ── HEADER MONOGRAPH TITLE ── */}
        <section className="pt-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-white/10">
            <div>
              {/* Top Meta Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {sp.endemic && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-sm">
                    🇳🇵 NEPAL ENDEMIC
                  </span>
                )}
                {iucn && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${iucn.color}`}
                    title={iucn.desc}
                  >
                    IUCN: {sp.iucnStatus} ({iucn.label})
                  </span>
                )}
                {sp.nepalStatus && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                    Nepal Status: {sp.nepalStatus}
                  </span>
                )}
              </div>

              {/* Main Bilingual Title */}
              <div className="flex items-baseline gap-4 flex-wrap">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {sp.commonName}
                </h1>
                {sp.nepaliName && (
                  <span className="text-2xl sm:text-4xl font-serif text-[#008769] dark:text-[#00ffcc] font-medium tracking-wide">
                    {sp.nepaliName}
                  </span>
                )}
              </div>

              <div className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 italic font-serif mt-2">
                {sp.scientificName}{" "}
                <span className="text-sm not-italic font-mono text-slate-400 dark:text-slate-500 ml-2">
                  [Family: {sp.family || "Phasianidae"}]
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {audioRecordings.length > 0 && (
                <a
                  href="#recordings"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono bg-[#008769]/10 dark:bg-[#00ffcc]/15 text-[#008769] dark:text-[#00ffcc] border border-[#008769]/25 dark:border-[#00ffcc]/30 hover:bg-[#008769]/20 dark:hover:bg-[#00ffcc]/25 transition-colors font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{audioRecordings.length} Audio Tracks</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── EXHIBITION PLATE (WITH FULL WATERMARK OVERLAY) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-16">
          <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-[#00ffcc]/20 shadow-[0_16px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.8)] aspect-[16/10] sm:aspect-[21/10]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={`${sp.commonName} (${sp.scientificName}) photographic exhibition`}
              className="w-full h-full object-cover"
            />

            {/* Dynamic Copyright Watermark Overlay in Full Fidelity */}
            <WatermarkOverlay variant="full" />

            {/* Caption bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-4 pointer-events-none">
              <span className="text-xs sm:text-sm text-slate-200 font-mono tracking-wide drop-shadow">
                Plate 01: {sp.commonName} in natural Himalayan habitat • © SUBAN Wildlife
              </span>
              <span className="text-xs font-mono text-[#00ffcc]/80 hidden sm:inline-block">
                Original High-Resolution Negative
              </span>
            </div>
          </div>
        </section>

        {/* ── MONOGRAPH BODY (SPECS & NATURAL HISTORY) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Natural History & Seasonal Matrix */}
          <div className="lg:col-span-8 space-y-12">
            {/* Description Narrative */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Feather className="w-5 h-5 text-[#008769] dark:text-[#00ffcc]" />
                <span>Field Identification & Narrative</span>
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 text-base">
                <p>
                  {sp.description ||
                    "This species represents one of the iconic avifauna of Nepal's montane landscapes, playing an integral role in high-altitude ecosystem balance and seed dispersal across pristine old-growth forests."}
                </p>
              </div>
            </div>

            {/* 12-Month Seasonality & Observation Calendar */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 backdrop-blur-md shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#008769] dark:text-[#00ffcc]" />
                  <span>Annual Phenology & Observation Probability</span>
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Peak: Highlighted Green
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                {MONTH_NAMES.map((name, idx) => {
                  const mNum = idx + 1;
                  const isPeak = bestMonthsList.includes(mNum);
                  return (
                    <div
                      key={name}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isPeak
                          ? "bg-[#008769]/10 dark:bg-gradient-to-b dark:from-[#00ffcc]/20 dark:to-[#38ef7d]/10 border-[#008769]/30 dark:border-[#00ffcc]/50 text-slate-900 dark:text-white shadow-sm dark:shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                          : "bg-slate-50 dark:bg-black/30 border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider">{name}</span>
                      <span className={`text-xs font-bold mt-1 ${isPeak ? "text-[#008769] dark:text-[#00ffcc]" : "text-slate-400 dark:text-slate-600"}`}>
                        {isPeak ? "HIGH" : "LOW"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Field Bioacoustics Library */}
            <div id="recordings">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-[#008769] dark:text-[#00ffcc]" />
                <span>Bioacoustic Field Library</span>
              </h2>

              {audioRecordings.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-center shadow-sm dark:shadow-none">
                  <Volume2 className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Field soundscape master tapes are currently being digitized and calibrated for this species.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {audioRecordings.map((track) => (
                    <AudioPlayer key={track.id} track={track as any} />
                  ))}
                </div>
              )}
            </div>

            {/* Known Sanctuaries & Hotspots */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#008769] dark:text-[#00ffcc]" />
                <span>Documented Sanctuaries & Field Localities</span>
              </h2>

              {hotspots.length === 0 ? (
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 text-sm shadow-sm">
                  Found throughout protected montane corridors across the central and western Himalayas of Nepal.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotspots.map((h, idx) => (
                    <div
                      key={h.relationId || `${h.id}-${idx}`}
                      className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#06180e]/60 flex items-start gap-3 shadow-sm dark:shadow-none"
                    >
                      <MapPin className="w-5 h-5 text-[#008769] dark:text-[#00ffcc] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{h.name}</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {h.district || h.region || "Nepal"}
                        </div>
                        {h.seasonality && (
                          <div className="text-xs text-[#008769] dark:text-[#00ffcc] mt-1 font-semibold">
                            Season: {h.seasonality}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Key Morphological Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#00ffcc]/20 bg-white dark:bg-[#06180e]/80 backdrop-blur-md shadow-md dark:shadow-xl sticky top-36">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-white/10 flex items-center gap-2">
                <span>Field Identification Card</span>
              </h3>

              <dl className="space-y-3.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Order</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{sp.order || "Galliformes"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Family</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{sp.family || "Phasianidae"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Total Length</dt>
                  <dd className="text-[#008769] dark:text-[#00ffcc] font-semibold">{sp.sizeCm ? `${sp.sizeCm} cm` : "60 – 72 cm"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Wingspan</dt>
                  <dd className="text-[#008769] dark:text-[#00ffcc] font-semibold">{sp.wingspanCm ? `${sp.wingspanCm} cm` : "75 – 85 cm"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Weight</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{sp.weightG ? `${sp.weightG} g` : "1,800 – 2,380 g"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Altitudinal Range</dt>
                  <dd className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {sp.elevationMin && sp.elevationMax
                      ? `${sp.elevationMin}m – ${sp.elevationMax}m`
                      : "2,600m – 4,500m"}
                  </dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Diet</dt>
                  <dd className="text-slate-900 dark:text-white font-medium">{sp.diet || "Tubers, roots, insects, seeds"}</dd>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Habitat</dt>
                  <dd className="text-slate-700 dark:text-slate-300 font-medium text-right max-w-[180px] truncate">
                    {Array.isArray(sp.habitats) && (sp.habitats as string[]).length > 0
                      ? (sp.habitats as string[]).join(", ")
                      : "Subalpine Rhododendron"}
                  </dd>
                </div>
              </dl>

              {/* License / Print purchase link if product attached */}
              {mediaList[0]?.productSlug && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                  <Link
                    href={`/gallery/${mediaList[0].productSlug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#008769] to-[#059669] text-white dark:from-[#00ffcc] dark:to-[#38ef7d] dark:text-[#04120a] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span>Acquire Fine Art Print</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
