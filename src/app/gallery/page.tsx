"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";

interface GalleryItem {
  id: string;
  slug: string;
  title: string;
  species: string;
  commonName: string;
  habitat: string;
  location: string;
  camera: string;
  iso: string;
  category: "predators" | "mammals" | "birds";
  priceUSD: string;
  priceNPR: string;
  imageUrl: string;
  refCode: string;
}

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          const liveItems: GalleryItem[] = data.products.map((p: any, idx: number) => {
            const speciesLower = (p.species || p.title || "").toLowerCase();
            let cat: "predators" | "mammals" | "birds" = "mammals";
            if (
              speciesLower.includes("tiger") ||
              speciesLower.includes("leopard") ||
              speciesLower.includes("predator")
            ) {
              cat = "predators";
            } else if (
              speciesLower.includes("monal") ||
              speciesLower.includes("bird") ||
              speciesLower.includes("vulture") ||
              speciesLower.includes("lammergeier")
            ) {
              cat = "birds";
            }

            return {
              id: p.id || `live-${idx}`,
              slug: p.slug || `photo-${idx}`,
              title: p.title,
              species: p.scientificName || p.species || "Wildlife Specimen",
              commonName: p.species || p.title,
              habitat: p.habitat || "Himalayan Ecosystem",
              location: p.locationName || "Nepal Wilderness",
              camera: p.camera && p.lens ? `${p.camera} • ${p.lens}` : (p.camera || "Sony A1"),
              iso: p.iso ? `ISO ${p.iso} • ${p.shutterSpeed || "1/1600s"} • ${p.aperture || "f/2.8"}` : "ISO 800 • 1/2000s • f/2.8",
              category: cat,
              priceUSD: `$${p.priceUSD || 149}`,
              priceNPR: `रू ${(p.priceNPR || 19900).toLocaleString()}`,
              imageUrl: p.imageUrl || p.thumbnailUrl || "/placeholder.jpg",
              refCode: `#NP-${(p.slug || "ART").slice(0, 4).toUpperCase()}-${String(idx + 1).padStart(3, "0")}`,
            };
          });
          setPhotos(liveItems);
        }
      })
      .catch((err) => console.error("Error fetching live products:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPhotos =
    selectedFilter === "all"
      ? photos
      : photos.filter((p) => p.category === selectedFilter);

  return (
    <div className="w-full bg-[#04120a] text-[#e8e0f0] min-h-screen selection:bg-[#b3004e] selection:text-[#ffe0ec]">
      {/* Top Header Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#163e26]">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12301f] text-[#00ffcc] text-xs font-label uppercase tracking-widest border border-[#00ffcc]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] animate-pulse" />
              The Himalayan Photographic Archive
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl text-[#e8e0f0] tracking-tight">
              Fine Art Wildlife <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8e0f0] via-[#ff2d78] to-[#00ffcc]">
                Gallery &amp; Master Proofs
              </span>
            </h1>
            <p className="font-body text-sm sm:text-base text-[#a098b0] leading-relaxed">
              Explore high-fidelity documentary chronicles from Nepal’s wildest reaches. Click any plate to inspect sensor EXIF telemetry, field encounter angles, and acquire certified licensing tiers.
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-3 bg-[#081e12] p-2 rounded-xl border border-[#00ffcc]/20 self-start lg:self-auto shadow-md">
            <span className="text-xs font-label uppercase tracking-widest text-[#a098b0] pl-2">Currency:</span>
            <div className="flex items-center gap-1 font-label text-xs">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currency === "USD"
                    ? "text-[#00ffcc] bg-[#163d27] shadow-[0_0_8px_rgba(0,255,204,0.3)] font-semibold"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currency === "NPR"
                    ? "text-[#00ffcc] bg-[#163d27] shadow-[0_0_8px_rgba(0,255,204,0.3)] font-semibold"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                NPR (रू)
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "all", label: "All Works" },
              { key: "predators", label: "Apex Predators" },
              { key: "mammals", label: "Mammals & Mega-Fauna" },
              { key: "birds", label: "Himalayan Avian" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedFilter(tab.key)}
                className={`px-4 py-2 rounded-full font-label text-xs uppercase tracking-wider transition-all border ${
                  selectedFilter === tab.key
                    ? "bg-[#ff2d78] border-[#ff2d78] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.4)] font-semibold"
                    : "bg-[#0a2416] border-[#163e26] text-[#a098b0] hover:text-[#00ffcc] hover:bg-[#12301f]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-label text-[#a098b0] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#00ffcc]">verified</span>
            <span>C2PA Watermark Protected</span>
          </div>
        </div>
      </section>

      {/* Masonry / Grid Gallery */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#0a2416] rounded-2xl overflow-hidden border border-[#163e26] animate-pulse h-96 flex flex-col justify-between p-4">
                <div className="w-full h-56 bg-[#12301f] rounded-xl" />
                <div className="space-y-3 pt-4">
                  <div className="h-4 bg-[#12301f] rounded w-3/4" />
                  <div className="h-3 bg-[#12301f] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-20 bg-[#0a2416]/50 rounded-2xl border border-[#163e26]">
            <p className="text-sm font-label text-[#a098b0] uppercase tracking-widest">No photographic plates found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#0a2416] rounded-2xl overflow-hidden border border-[#163e26] hover:border-[#00ffcc]/40 transition-all duration-300 shadow-xl group flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Image Canvas with Protection Overlay */}
              <Link href={`/gallery/${photo.slug}`} className="relative aspect-[4/3] overflow-hidden bg-[#06170d] block cursor-pointer">
                {/* Dynamic Watermark Indicator */}
                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-label uppercase bg-[#04120a]/80 backdrop-blur-md text-[#00ffcc] border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                  {photo.refCode}
                </div>

                <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded text-[10px] font-label uppercase bg-[#04120a]/80 backdrop-blur-md text-[#a098b0] border border-white/10">
                  © SUBAN Provenance
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                />

                {/* Protective gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2416] via-transparent to-transparent opacity-60" />

                {/* Dynamic Watermark Engine Overlay */}
                <WatermarkOverlay variant="card" />
              </Link>

              {/* Photo Card Body */}
              <div className="p-6 space-y-4 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[11px] font-label text-[#00ffcc] uppercase tracking-wider">
                    {photo.commonName} • <em className="text-[#a098b0]">{photo.species}</em>
                  </span>
                  <Link href={`/gallery/${photo.slug}`}>
                    <h3 className="font-headline font-bold text-lg text-[#e8e0f0] group-hover:text-[#ff2d78] transition-colors mt-1 leading-snug">
                      {photo.title}
                    </h3>
                  </Link>
                  <p className="text-xs font-body text-[#a098b0] flex items-center gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-sm text-[#ffe04a]">location_on</span>
                    {photo.location}
                  </p>
                </div>

                {/* EXIF Data Strip */}
                <div className="p-3 rounded-lg bg-[#081e12] border border-[#163e26] text-[11px] font-label text-[#a098b0] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#a098b0]">Optics:</span>
                    <span className="text-[#e8e0f0]">{photo.camera}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a098b0]">Exposure:</span>
                    <span className="text-[#00ffcc]">{photo.iso}</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-[#163e26]">
                  <div>
                    <p className="text-[10px] uppercase font-label text-[#a098b0]">Commercial License</p>
                    <p className="font-headline font-bold text-sm text-[#e8e0f0]">
                      {currency === "USD" ? photo.priceUSD : photo.priceNPR}
                    </p>
                  </div>

                  <Link
                    href={`/gallery/${photo.slug}`}
                    className="px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-semibold bg-[#ff2d78] hover:bg-[#b3004e] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.35)] transition-all flex items-center gap-1"
                  >
                    <span>View &amp; License</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
