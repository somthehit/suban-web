"use client";

import React from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export default function AboutPage() {
  const { settings } = useSiteSettings();
  const about = settings.about;

  const naturalistName = about.naturalistName || "Suban";

  // Ensure bio paragraph dynamically matches the configured naturalist name
  const dynamicBio = React.useMemo(() => {
    if (!about.bioParagraph) {
      return `I am ${naturalistName}, a Nepali wildlife photojournalist dedicated to documenting the fragile altitudinal gradients of the Himalayas and the lowland Terai. From dense subtropical Sal riverbanks (68m) to frost-shattered Tibetan plateau passes (5,400m), my work bridges rigorous scientific observation and fine art storytelling.`;
    }
    let bio = about.bioParagraph;
    if (/^I am [^,]+,/i.test(bio.trim())) {
      bio = bio.replace(/^I am [^,]+,/i, `I am ${naturalistName},`);
    } else if (bio.includes("Suban Bajracharya")) {
      bio = bio.replaceAll("Suban Bajracharya", naturalistName);
    }
    return bio;
  }, [about.bioParagraph, naturalistName]);

  const expeditions = about.expeditions || [];
  const ethicsPrinciples = about.ethics || [];
  const gearKit = about.gear || [];

  return (
    <div className="w-full bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] min-h-screen selection:bg-[#ff2d78] selection:text-white transition-colors duration-200">
      {/* ── HERO SECTION: THE NATURALIST ── */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#ff2d78]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-60 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-label uppercase tracking-widest border border-secondary/25">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_currentColor] animate-pulse" />
              {about.title}
            </div>

            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface dark:text-[#e8e0f0] tracking-tight leading-[1.08]">
              {about.heroHeadline} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface via-[#ff2d78] to-secondary dark:from-[#e8e0f0] dark:via-[#ff2d78] dark:to-[#00ffcc]">
                {about.heroGradientText}
              </span>
            </h1>

            <p className="font-body text-base lg:text-lg text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-2xl font-light">
              {dynamicBio}
            </p>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="card-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="font-headline font-bold text-2xl text-secondary">
                  {about.metrics?.fieldExperience || "8+ Yrs"}
                </div>
                <div className="font-label text-[10px] uppercase text-on-surface-variant dark:text-[#a098b0] tracking-wider mt-0.5">
                  Field Expeditions
                </div>
              </div>
              <div className="card-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="font-headline font-bold text-2xl text-tertiary">
                  {about.metrics?.maxAltitude || "5,430m"}
                </div>
                <div className="font-label text-[10px] uppercase text-on-surface-variant dark:text-[#a098b0] tracking-wider mt-0.5">
                  Max Working Altitude
                </div>
              </div>
              <div className="card-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="font-headline font-bold text-2xl text-[#ff2d78]">
                  {about.metrics?.masterPlates || "148"}
                </div>
                <div className="font-label text-[10px] uppercase text-on-surface-variant dark:text-[#a098b0] tracking-wider mt-0.5">
                  Master Proof Plates
                </div>
              </div>
              <div className="card-surface p-4 rounded-xl border border-outline-variant/30 shadow-sm">
                <div className="font-headline font-bold text-2xl text-secondary">
                  {about.metrics?.royaltyPercent || "10%"}
                </div>
                <div className="font-label text-[10px] uppercase text-on-surface-variant dark:text-[#a098b0] tracking-wider mt-0.5">
                  Anti-Poaching Trust
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/gallery"
                className="px-6 py-3.5 rounded-lg bg-[#ff2d78] hover:bg-[#b3004e] text-white font-label text-xs uppercase tracking-widest font-semibold shadow-[0_0_16px_rgba(255,45,120,0.3)] transition-all flex items-center gap-2"
              >
                <span>Explore Fine Art Gallery</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <Link
                href="/licensing"
                className="px-6 py-3.5 rounded-lg card-surface hover:bg-surface-container text-secondary font-label text-xs uppercase tracking-wider transition-colors border border-secondary/30 shadow-sm"
              >
                Rights &amp; Licensing Sheet
              </Link>
            </div>
          </div>

          {/* Right Portrait Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden card-surface border border-outline-variant/30 shadow-2xl group">
              <div className="relative aspect-[4/5] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={`${about.naturalistName} portrait`}
                  src={about.portraitUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              </div>

              {/* Float info on portrait */}
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <div className="flex items-center gap-2 text-[#00ffcc] text-xs font-label uppercase tracking-widest drop-shadow-sm font-semibold">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {about.baseStation}
                </div>
                <div
                  className="font-headline font-bold text-xl text-white drop-shadow-md"
                  style={{ color: "#ffffff" }}
                >
                  {naturalistName}
                </div>
                <p
                  className="font-body text-xs text-white/80 drop-shadow-sm"
                  style={{ color: "rgba(255, 255, 255, 0.85)" }}
                >
                  {about.credentials}
                </p>
              </div>
            </div>

            {/* Glowing Accent Badge */}
            <div className="absolute -bottom-4 -right-4 card-surface p-4 rounded-xl border border-secondary/30 shadow-xl hidden sm:flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-tertiary">verified</span>
              <div>
                <div className="font-headline font-bold text-xs text-on-surface">100% Ethical Certified</div>
                <div className="font-label text-[10px] text-on-surface-variant">IUCN Non-Harassment Protocol</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FIELD PHILOSOPHY & MANIFESTO ── */}
      <section className="w-full bg-[#edf3ef] dark:bg-[#030d07] py-20 px-6 lg:px-12 border-y border-outline-variant/30 transition-colors">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] flex items-center justify-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#ff2d78] shadow-[0_0_8px_#ff2d78]" />
            {about.manifestoBadge || "The Field Manifesto"}
          </span>

          <blockquote className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-on-surface dark:text-[#e8e0f0] leading-tight">
            &ldquo;{about.manifestoQuote}&rdquo;
          </blockquote>

          <p className="font-body text-sm sm:text-base text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-2xl mx-auto">
            {about.manifestoText}
          </p>

          <div className="pt-4 flex items-center justify-center gap-4">
            {/* Signature Monogram */}
            <svg
              className="h-12 w-36 text-[#ff2d78]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 120 40"
            >
              <path
                d="M10 28 C 25 10, 35 35, 45 15 C 55 5, 60 25, 75 18 C 90 10, 85 30, 110 20"
                strokeLinecap="round"
              />
              <path d="M35 15 Q 50 8, 65 30" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── ETHICAL WILDLIFE PHOTOGRAPHY PRINCIPLES ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="space-y-4 mb-12 text-center max-w-2xl mx-auto">
          <span className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
            Non-Intervention Code
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface dark:text-[#e8e0f0]">
            The 4 Biological Directives
          </h2>
          <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0]">
            Our conservation code of ethics adheres to the strict standards set by the IUCN and International League of Conservation Photographers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ethicsPrinciples.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl card-surface border border-outline-variant/30 hover:border-secondary/50 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 dark:bg-[#0a2416] border border-secondary/25 flex items-center justify-center text-secondary group-hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface dark:text-[#e8e0f0] group-hover:text-secondary transition-colors">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-label text-secondary uppercase tracking-widest font-semibold">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Enforced In Field</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPEDITION ARCHIVE TIMELINE ── */}
      <section className="w-full bg-[#edf3ef] dark:bg-[#030d07] py-20 px-6 lg:px-12 border-t border-outline-variant/30 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-4 mb-16 text-center max-w-2xl mx-auto">
            <span className="font-label text-xs uppercase tracking-widest text-tertiary font-semibold">
              Field Annals
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface dark:text-[#e8e0f0]">
              Milestone Himalayan Expeditions
            </h2>
            <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0]">
              Chronicles from remote habitats documented through sub-zero alpine passes and equatorial buffer riverbeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {expeditions.map((exp) => (
              <div
                key={exp.id || exp.year}
                className="p-8 rounded-2xl card-surface border border-outline-variant/30 hover:border-tertiary/40 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 relative overflow-hidden group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary text-xs font-label font-bold">
                    {exp.year}
                  </span>
                  <span className="text-xs font-label text-secondary uppercase tracking-wider font-semibold">
                    {exp.altitude}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
                    {exp.region}
                  </div>
                  <h3 className="font-headline font-bold text-xl text-on-surface dark:text-[#e8e0f0] group-hover:text-tertiary transition-colors">
                    {exp.title}
                  </h3>
                </div>

                <p className="font-body text-xs sm:text-sm text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                  {exp.desc}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-outline-variant/30">
                  <span className="text-[11px] font-label text-[#ff2d78] uppercase tracking-widest font-semibold">
                    {exp.tag}
                  </span>
                  <Link
                    href="/blog"
                    className="text-xs font-label text-secondary hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Read Dispatch</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RIG & TELEMETRY EQUIPMENT ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="space-y-4 mb-12 text-center max-w-2xl mx-auto">
          <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] font-semibold">
            Hardware &amp; Cryptography
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface dark:text-[#e8e0f0]">
            The Extreme Field Kit
          </h2>
          <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0]">
            High-altitude cold-weather sealed optics, silent mirrorless shutters, and C2PA cryptographic hardware provenance tags.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gearKit.map((gear) => (
            <div
              key={gear.id || gear.item}
              className="p-6 rounded-2xl card-surface border border-outline-variant/30 hover:border-[#ff2d78]/40 shadow-sm hover:shadow-md transition-all duration-300 space-y-3"
            >
              <span className="font-label text-[10px] uppercase text-[#ff2d78] tracking-widest block font-semibold">
                {gear.category}
              </span>
              <h4 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0]">
                {gear.item}
              </h4>
              <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                {gear.details}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONSERVATION PLEDGE & INQUIRIES ── */}
      <section className="w-full bg-gradient-to-b from-surface-container-low/70 to-background dark:from-[#030d07] dark:to-[#04120a] py-20 px-6 lg:px-12 border-t border-outline-variant/30 transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-label uppercase tracking-widest border border-secondary/25">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_currentColor]" />
            Community Anti-Poaching Partnership
          </div>

          <h2 className="font-headline text-3xl sm:text-5xl font-extrabold text-on-surface dark:text-[#e8e0f0] tracking-tight">
            Preserving Nepal’s Apex Terrains for Tomorrow
          </h2>

          <p className="font-body text-base text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-2xl mx-auto">
            Every photographic plate licensed or print purchased directly sustains community anti-poaching units (CBAPU) and wildlife corridors across Bardia, Chitwan, and the trans-Himalayan wilderness.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/gallery"
              className="px-8 py-4 rounded-xl bg-secondary hover:bg-secondary/90 text-[#001a1a] font-label text-xs uppercase tracking-widest font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>Acquire Archival Prints</span>
              <span className="material-symbols-outlined text-sm">collections</span>
            </Link>
            <Link
              href="/licensing"
              className="px-8 py-4 rounded-xl card-surface hover:bg-surface-container text-on-surface font-label text-xs uppercase tracking-widest font-semibold border border-outline-variant/40 shadow-sm transition-all flex items-center gap-2"
            >
              <span>License Commercial Stock</span>
              <span className="material-symbols-outlined text-sm">key</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
