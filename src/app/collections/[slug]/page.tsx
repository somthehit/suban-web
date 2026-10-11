"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/collections?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.collection) {
          setCollection(data.collection);
        } else {
          setError(data.error || "Collection not found");
        }
      })
      .catch((err) => {
        console.error("Error fetching collection detail:", err);
        setError("Failed to load collection archive");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04120a] text-[#e8e0f0] flex flex-col items-center justify-center py-20 px-4">
        <div className="w-10 h-10 border-2 border-[#00ffcc] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-label text-xs uppercase tracking-widest text-[#a098b0]">
          Retrieving Monograph Archive from Database...
        </p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-[#04120a] text-[#e8e0f0] flex flex-col items-center justify-center py-20 px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-[#ff2d78] mb-3">folder_off</span>
        <h1 className="font-headline text-2xl font-bold mb-2">Collection Not Found</h1>
        <p className="font-body text-sm text-[#a098b0] max-w-md mb-6">
          The requested monograph archive could not be located in the database.
        </p>
        <Link
          href="/collections"
          className="px-5 py-2.5 rounded-xl bg-[#12301f] text-[#00ffcc] font-label text-xs uppercase tracking-widest border border-[#00ffcc]/30 hover:bg-[#00ffcc] hover:text-[#04120a] transition-all"
        >
          ← Return to All Collections
        </Link>
      </div>
    );
  }

  const items = collection.items || [];

  return (
    <div className="min-h-screen bg-[#04120a] text-[#e8e0f0] selection:bg-[#ff2d78] selection:text-white">
      {/* Header Banner */}
      <section className="relative w-full py-16 lg:py-24 px-6 lg:px-16 overflow-hidden border-b border-[#163e26]">
        {/* Ambient Blur */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00ffcc]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#ff2d78]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-[#a098b0]">
            <Link className="hover:text-[#00ffcc] transition-colors" href="/">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link className="hover:text-[#00ffcc] transition-colors" href="/collections">
              Curated Collections
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-[#00ffcc] font-semibold truncate max-w-xs sm:max-w-md">
              {collection.title}
            </span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12301f] text-[#00ffcc] text-xs font-label uppercase tracking-widest border border-[#00ffcc]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                Curated Photographic Monograph
              </div>
              <h1 className="font-headline font-extrabold text-3xl sm:text-5xl tracking-tight text-white">
                {collection.title}
              </h1>
              <p className="font-body text-sm sm:text-base text-[#a098b0] leading-relaxed">
                {collection.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#081e12] p-4 rounded-2xl border border-[#163e26]">
              <div className="text-left">
                <div className="font-label text-[10px] uppercase tracking-widest text-[#a098b0]">
                  Archive Inventory
                </div>
                <div className="font-headline text-xl font-bold text-[#00ffcc]">
                  {items.length} Curated Plates
                </div>
              </div>
              <div className="h-8 w-px bg-[#163e26] hidden sm:block" />
              <Link
                href="/gallery"
                className="px-4 py-2 rounded-xl bg-[#ff2d78] hover:bg-[#d91d60] text-white font-label text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
              >
                All Works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Collection Plates */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {items.length === 0 ? (
          <div className="text-center py-16 bg-[#0a2416] rounded-2xl border border-[#163e26]">
            <p className="text-sm font-label text-[#a098b0] uppercase tracking-widest">
              No photographic plates currently mapped to this collection in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item: any, idx: number) => (
              <div
                key={item.productId || idx}
                className="bg-[#0a2416] rounded-2xl overflow-hidden border border-[#163e26] hover:border-[#00ffcc]/40 transition-all duration-300 shadow-xl group flex flex-col justify-between hover:-translate-y-1"
              >
                {/* Image */}
                <Link
                  href={`/gallery/${item.slug}`}
                  className="relative aspect-[4/3] overflow-hidden bg-[#06170d] block cursor-pointer"
                >
                  <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-label uppercase bg-[#04120a]/80 backdrop-blur-md text-[#00ffcc] border border-white/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                    Plate #{String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || item.thumbnailUrl || "/placeholder.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  {/* Dynamic Watermark Engine Overlay */}
                  <WatermarkOverlay variant="card" />
                </Link>

                {/* Details */}
                <div className="p-5 flex flex-col gap-3 flex-1 justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-label text-[#00ffcc] font-medium">
                      <span>{item.species || "Wildlife Specimen"}</span>
                      <span className="text-[#a098b0]">{item.locationName || "Nepal"}</span>
                    </div>
                    <h3 className="font-headline font-bold text-base text-white group-hover:text-[#ff2d78] transition-colors leading-snug">
                      <Link href={`/gallery/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="font-body text-xs text-[#a098b0] line-clamp-2 leading-relaxed">
                      {item.description || "High-fidelity wildlife documentary plate."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#163e26] flex items-center justify-between">
                    <div className="font-mono text-[11px] text-[#a098b0]">
                      {item.camera ? `${item.camera} • ${item.lens || ""}` : "Pro Optics"}
                    </div>
                    <Link
                      href={`/gallery/${item.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-[#12301f] hover:bg-[#00ffcc] text-[#00ffcc] hover:text-[#04120a] font-label text-[11px] font-bold uppercase tracking-wider transition-all"
                    >
                      Inspect Plate →
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
