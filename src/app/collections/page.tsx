"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";

interface Portfolio {
  id: string;
  category: "alpine" | "subtropical" | "avian" | "all";
  monographNumber: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  timeline: string;
  stats: string;
  imageUrl: string;
  altText: string;
  badge?: string;
  colSpan: string;
  aspectHeight?: string;
  tagline: string;
}

export default function CollectionsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.collections)) {
          const colSpanMap = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-4", "lg:col-span-8"];
          const livePortfolios: Portfolio[] = data.collections.map((col: any, idx: number) => {
            const titleLower = (col.title + " " + (col.description || "")).toLowerCase();
            let cat: "alpine" | "subtropical" | "avian" | "all" = "subtropical";
            if (titleLower.includes("trans-himalaya") || titleLower.includes("dolpo") || titleLower.includes("alpine")) {
              cat = "alpine";
            } else if (titleLower.includes("canopy") || titleLower.includes("avian") || titleLower.includes("bird") || titleLower.includes("monal")) {
              cat = "avian";
            } else if (titleLower.includes("terai") || titleLower.includes("riverine") || titleLower.includes("predator")) {
              cat = "subtropical";
            }

            return {
              id: col.slug,
              category: cat,
              monographNumber: `Monograph ${String(idx + 1).padStart(2, "0")}`,
              title: col.title,
              subtitle: `${col.itemCount || 12} Fine Art Works • Curated Archive`,
              description: col.description || "A curated fine-art monograph documenting pristine ecological biomes across the Nepal Himalayas.",
              location: "Nepal Wildlife Belts",
              timeline: "Archival Series",
              stats: `${col.itemCount || 8} Works`,
              imageUrl: col.coverImageUrl || col.items?.[0]?.imageUrl || "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200&auto=format&fit=crop&q=85",
              altText: col.title,
              colSpan: colSpanMap[idx % colSpanMap.length] || "lg:col-span-6",
              tagline: col.isFeatured ? "Featured Monograph" : "Curated Edition",
            };
          });
          setPortfolios(livePortfolios);
        }
      })
      .catch((err) => console.error("Error fetching collections:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPortfolios =
    activeCategory === "all"
      ? portfolios
      : portfolios.filter((p) => p.category === activeCategory);

  return (
    <div className="w-full bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
      {/* Top Scrim Ambient Glows */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#ff2d78]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-80 right-10 w-[500px] h-[500px] bg-[#00ffcc]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Editorial Header Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-14 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-[#12301f] text-[#00ffcc]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] animate-pulse" />
                <span className="font-label text-xs uppercase tracking-[0.25em]">
                  Archival Photo Essays • 2021–2025
                </span>
              </div>
              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface tracking-tight leading-[1.08]">
                Curated Wildlife <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff2d78] to-secondary">
                  Expedition Portfolios
                </span>
              </h1>
              <p className="font-body text-base lg:text-lg text-on-surface-variant leading-relaxed font-light max-w-2xl">
                From the sal forests and misty wetlands of Chitwan (68m above sea level) to the frost-shattered ridges of Dolpo (5,400m), each photographic series documents untamed encounters across fragile bioclimatic gradients.
              </p>
            </div>

            {/* Metric Badges & Telemetry Bar */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 card-surface p-6 rounded-xl border border-outline-variant/30 self-start lg:self-auto min-w-[280px]">
              <div className="flex items-center justify-between gap-6 pb-2.5 bg-surface-container/60 px-3.5 py-2 rounded-lg border border-outline-variant/20">
                <span className="font-label text-xs tracking-wider uppercase text-on-surface-variant">Archived Frames</span>
                <span className="font-headline font-bold text-lg text-secondary">148 Fine Art</span>
              </div>
              <div className="flex items-center justify-between gap-6 pb-2.5 bg-surface-container/60 px-3.5 py-2 rounded-lg border border-outline-variant/20">
                <span className="font-label text-xs tracking-wider uppercase text-on-surface-variant">Altitudinal Range</span>
                <span className="font-headline font-bold text-lg text-tertiary">68m – 5,430m</span>
              </div>
              <div className="flex items-center justify-between gap-6 bg-surface-container/60 px-3.5 py-2 rounded-lg border border-outline-variant/20">
                <span className="font-label text-xs tracking-wider uppercase text-on-surface-variant">Field Deployments</span>
                <span className="font-headline font-bold text-lg text-primary">6 Ecosystems</span>
              </div>
            </div>
          </div>

          {/* Filter / Mode Strip */}
          <div className="mt-12 pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/30">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all ${
                  activeCategory === "all"
                    ? "bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.4)] font-semibold"
                    : "card-surface text-on-surface-variant hover:text-secondary border border-outline-variant/30"
                }`}
              >
                All Portfolios ({portfolios.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("alpine")}
                className={`px-4 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all ${
                  activeCategory === "alpine"
                    ? "bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.4)] font-semibold"
                    : "card-surface text-on-surface-variant hover:text-secondary border border-outline-variant/30"
                }`}
              >
                Alpine &amp; Sub-Alpine
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("subtropical")}
                className={`px-4 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all ${
                  activeCategory === "subtropical"
                    ? "bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.4)] font-semibold"
                    : "card-surface text-on-surface-variant hover:text-secondary border border-outline-variant/30"
                }`}
              >
                Subtropical Riverine
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("avian")}
                className={`px-4 py-2 rounded-full font-label text-xs tracking-wider uppercase transition-all ${
                  activeCategory === "avian"
                    ? "bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.4)] font-semibold"
                    : "card-surface text-on-surface-variant hover:text-secondary border border-outline-variant/30"
                }`}
              >
                Avian Raptors
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-label text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-secondary">tune</span>
              <span className="tracking-widest uppercase">Grid Spec: High Elevation Density</span>
            </div>
          </div>
        </section>

        {/* Collections Mosaic / Grid Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {filteredPortfolios.map((item) => {
              const isLargeCard = item.colSpan === "lg:col-span-12";
              return (
                <article
                  key={item.id}
                  className={`${item.colSpan} group flex ${
                    isLargeCard ? "flex-col lg:flex-row" : "flex-col"
                  } card-surface rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 border border-outline-variant/30 shadow-xl`}
                >
                  <div
                    className={`relative ${
                      isLargeCard
                        ? "w-full lg:w-3/5 h-[340px] lg:h-[400px]"
                        : "w-full h-[400px]"
                    } overflow-hidden`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.altText}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                    {/* Dynamic Watermark Engine Overlay */}
                    <WatermarkOverlay variant="card" />

                    {/* Top Badges */}
                    <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#ff2d78] font-label text-[11px] uppercase tracking-widest border border-[#ff2d78]/30">
                        {item.monographNumber}
                      </span>
                      {item.badge ? (
                        <span className="px-3 py-1 rounded-full bg-[#004d3d] text-[#c0fff4] font-label text-[11px] uppercase tracking-wider border border-[#00ffcc]/30 shadow-[0_0_8px_rgba(0,255,204,0.2)]">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-label text-[11px] uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] shadow-[0_0_6px_#ff2d78]" />
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay text on image */}
                    {!isLargeCard && (
                      <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-3 text-xs font-label tracking-wider text-[#00ffcc] drop-shadow-sm mb-1.5">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                            {item.location}
                          </span>
                          <span>•</span>
                          <span>{item.timeline}</span>
                        </div>
                        <h2 className="font-headline font-bold text-2xl lg:text-3xl text-white drop-shadow-md group-hover:text-[#ff2d78] transition-colors leading-tight">
                          {item.title}
                        </h2>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div
                    className={`${
                      isLargeCard ? "w-full lg:w-2/5 p-8 lg:p-12" : "p-6 lg:p-8"
                    } flex flex-col justify-between flex-1 gap-6 card-surface`}
                  >
                    {isLargeCard && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-label tracking-wider text-secondary">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">water_drop</span>
                            {item.location}
                          </span>
                          <span>•</span>
                          <span>{item.subtitle}</span>
                        </div>
                        <h2 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface group-hover:text-[#ff2d78] transition-colors leading-tight">
                          {item.title}
                        </h2>
                        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {!isLargeCard && (
                      <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
                      <Link
                        href={`/collections/${item.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#008769] hover:bg-[#ff2d78] text-white font-label text-xs uppercase tracking-widest transition-all font-semibold shadow-sm"
                      >
                        <span>Explore Monograph</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                      <Link
                        href={`/licensing?monograph=${item.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg card-surface hover:border-secondary text-on-surface-variant hover:text-secondary font-label text-xs uppercase tracking-wider transition-colors border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-base">folder_zip</span>
                        <span>Licensing &amp; Press Pack</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Curator's Note & Conservation Impact Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 relative z-10">
          <div className="bg-[#07190f] rounded-3xl p-8 lg:p-14 relative overflow-hidden border border-[#00ffcc]/20 shadow-2xl">
            {/* Glow highlight behind curator box */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff2d78]/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Curator Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12301f] text-[#00ffcc] text-xs font-label uppercase tracking-widest border border-[#00ffcc]/20">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Ethical Field Protocol &amp; Impact
                </div>
                <h3 className="font-headline font-bold text-3xl sm:text-4xl text-[#e8e0f0] leading-tight">
                  Curator’s Note: <br />
                  <span className="text-[#00ffcc]">Pictures That Protect Their Subjects.</span>
                </h3>
                <p className="font-body text-sm sm:text-base text-[#a098b0] leading-relaxed">
                  Every frame exhibited in these collections is acquired strictly following non-invasive IUCN guidelines: zero baiting, no thermal tracking harassment, and strictly maintained buffer perimeters. Photography should never cost the animal its energy or peace.
                </p>

                <div className="p-5 rounded-xl bg-[#0d2316] space-y-3 border border-[#00ffcc]/15">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs uppercase tracking-wider text-[#ff2d78] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ff2d78] animate-ping" />
                      The 10% Community Conservation Pledge
                    </span>
                    <span className="font-label text-xs text-[#a098b0]">Q1-Q3 2024 Audit</span>
                  </div>
                  <p className="font-body text-xs sm:text-sm text-[#a098b0]/90 leading-relaxed">
                    Exactly 10% of every licensing agreement, fine art print, and publication fee goes directly into community anti-poaching patrols (CBAPU) and habitat restoration trusts operating across Chitwan, Bardia, and Shey-Phoksundo National Parks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#12301f] flex items-center justify-center text-[#ff2d78] shadow-[0_0_10px_rgba(255,45,120,0.25)] border border-[#ff2d78]/30">
                      <span className="material-symbols-outlined text-2xl">shield</span>
                    </div>
                    <div>
                      <div className="font-headline font-bold text-base text-[#e8e0f0]">32,400+ km²</div>
                      <div className="font-label text-[11px] text-[#a098b0] uppercase">Patrolled Territory Funded</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#12301f] flex items-center justify-center text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.25)] border border-[#00ffcc]/30">
                      <span className="material-symbols-outlined text-2xl">local_police</span>
                    </div>
                    <div>
                      <div className="font-headline font-bold text-base text-[#e8e0f0]">84 Rangers</div>
                      <div className="font-label text-[11px] text-[#a098b0] uppercase">Equipped With Field Gear</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conservation Graphic / Stats Card */}
              <div className="lg:col-span-5 bg-[#0d2316] p-8 rounded-2xl flex flex-col justify-between gap-6 border border-[#00ffcc]/20 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-[#302840]/40">
                  <div className="font-label text-xs uppercase tracking-widest text-[#e8e0f0]">
                    Licensing Allocation Breakdown
                  </div>
                  <span className="text-xs font-label text-[#00ffcc] uppercase">Automated Ledger</span>
                </div>

                {/* Custom SVG Metric Visualization */}
                <div className="py-2 flex items-center justify-center">
                  <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="38" stroke="#141422" strokeWidth="8" />
                    {/* 60% Studio & Field Expedition */}
                    <circle
                      cx="50"
                      cy="50"
                      fill="none"
                      r="38"
                      stroke="#302840"
                      strokeDasharray="238.76"
                      strokeDashoffset="95.5"
                      strokeWidth="8"
                    />
                    {/* 30% Print Production & Archives */}
                    <circle
                      cx="50"
                      cy="50"
                      fill="none"
                      r="38"
                      stroke="#00ffcc"
                      strokeDasharray="238.76"
                      strokeDashoffset="167"
                      strokeWidth="8"
                    />
                    {/* 10% Community Conservation Pledge */}
                    <circle
                      className="drop-shadow-[0_0_8px_#ff2d78]"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="38"
                      stroke="#ff2d78"
                      strokeDasharray="238.76"
                      strokeDashoffset="214.88"
                      strokeWidth="8"
                    />
                  </svg>
                </div>

                <div className="space-y-3 font-label text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d78] shadow-[0_0_6px_#ff2d78]" />
                      <span className="text-[#e8e0f0]">Community Anti-Poaching Patrols</span>
                    </div>
                    <span className="font-bold text-[#ff2d78]">10% DIRECT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc]" />
                      <span className="text-[#a098b0]">Archival Lab &amp; UltraChrome Carbon Inks</span>
                    </div>
                    <span className="text-[#e8e0f0]">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5a5068]" />
                      <span className="text-[#a098b0]">Expedition Logistics &amp; Extreme Altitude Gear</span>
                    </div>
                    <span className="text-[#e8e0f0]">60%</span>
                  </div>
                </div>

                <Link
                  href="/blog"
                  className="w-full text-center py-3 rounded-lg bg-[#12301f] hover:bg-[#163d27] text-[#e8e0f0] hover:text-[#00ffcc] font-label text-xs uppercase tracking-widest transition-colors mt-2 border border-[#00ffcc]/15"
                >
                  View Verified Anti-Poaching Fund Reports
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry / Licensing Callout */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-[#e8e0f0]">
              Looking for Bespoke Expedition Licensing?
            </h3>
            <p className="font-body text-sm text-[#a098b0] leading-relaxed">
              National Geographic, BBC Studios, and private collectors frequently commission specific geographical raw footage or unreleased 16-bit TIFF archival scans.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/licensing"
                className="px-8 py-3.5 rounded-lg bg-[#ff2d78] hover:bg-[#b3004e] text-[#ffe0ec] font-label text-xs uppercase tracking-widest shadow-[0_0_16px_rgba(255,45,120,0.4)] transition-all font-semibold"
              >
                Initiate Rights Clearance Request
              </Link>
              <Link
                href="/licensing#rate-sheet"
                className="px-6 py-3.5 rounded-lg bg-[#0d2316] hover:bg-[#12301f] text-[#e8e0f0] hover:text-[#00ffcc] font-label text-xs uppercase tracking-wider transition-colors border border-[#00ffcc]/20"
              >
                Download Global Rate Sheet (PDF)
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
