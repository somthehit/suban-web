"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface LicenseTier {
  id: string;
  name: string;
  badge?: string;
  usdPrice: number;
  nprPrice: number;
  audience: string;
  resolution: string;
  colorSpace: string;
  impressions: string;
  commercialRights: string;
  watermark: boolean;
  features: string[];
  restricted: string[];
}

export default function LicensingPage() {
  const { addItem } = useCart();
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [selectedLicense, setSelectedLicense] = useState<string>("commercial-extended");
  const [customInquirySubmitted, setCustomInquirySubmitted] = useState(false);

  const tiers: LicenseTier[] = [
    {
      id: "personal-display",
      name: "Personal / Wallpaper",
      badge: "Free Access",
      usdPrice: 0,
      nprPrice: 0,
      audience: "Personal desktop screens, private phones, educational slides",
      resolution: "1400px compressed WebP",
      colorSpace: "sRGB",
      impressions: "Single device",
      commercialRights: "None (Strict Non-Commercial)",
      watermark: true,
      features: [
        "Instant delivery via Cloudflare R2",
        "Encrypted provenance watermark",
        "Non-commercial personal screensaver use",
        "Personal school/academic presentations",
      ],
      restricted: [
        "Commercial advertising or social promotions",
        "Physical product printing or merchandising",
        "Reselling or digital file redistribution",
      ],
    },
    {
      id: "commercial-standard",
      name: "Standard Commercial",
      badge: "Single Seat",
      usdPrice: 39,
      nprPrice: 5100,
      audience: "Web articles, editorial journalism, blog dispatches, single ad campaigns",
      resolution: "4K UHD (3840 x 2560px JPEG)",
      colorSpace: "Adobe RGB (1998)",
      impressions: "Up to 50,000 views / prints",
      commercialRights: "Editorial & Digital Web Commercial",
      watermark: false,
      features: [
        "Clean unwatermarked high-resolution JPEG",
        "Digital web publication and journalism",
        "Social media campaign coverage",
        "Direct R2 download vault link (30-day token)",
        "Mandatory credit: 'Photo: Suban / Wildlife Archive'",
      ],
      restricted: [
        "Packaging, OOH billboards, or television broadcasts",
        "Print runs exceeding 50,000 copies",
        "AI model scraping, ingestion, or LoRA training",
      ],
    },
    {
      id: "commercial-extended",
      name: "Extended Commercial",
      badge: "Most Popular",
      usdPrice: 180,
      nprPrice: 24000,
      audience: "Global brand campaigns, book covers, nationwide OOH, corporate identity",
      resolution: "Master 50MP 16-bit uncompressed TIFF",
      colorSpace: "ProPhoto RGB / Wide Gamut",
      impressions: "Unlimited Global Impressions",
      commercialRights: "Worldwide Full Commercial Rights",
      watermark: false,
      features: [
        "Master uncompressed 16-bit RAW/TIFF sensor dump",
        "Unlimited worldwide digital, print, and billboard run",
        "Television broadcast & documentary film rights",
        "No mandatory attribution required",
        "Perpetual archival license with C2PA provenance key",
      ],
      restricted: [
        "Sub-licensing or reselling as standalone stock assets",
        "Trademarking visual subject as proprietary company logo",
      ],
    },
    {
      id: "fine-art-print",
      name: "Limited Fine Art Print",
      badge: "Rare Edition (25)",
      usdPrice: 350,
      nprPrice: 46000,
      audience: "Private art collectors, corporate boardroom exhibitions, galleries",
      resolution: "24 x 36\" Museum Quality Physical Print",
      colorSpace: "Archival UltraChrome HDX",
      impressions: "1 of 25 Numbered Physical Plates",
      commercialRights: "Private Display Only",
      watermark: false,
      features: [
        "Hahnemühle Photo Rag 308gsm cotton paper",
        "Hand-signed by Suban Shakya with embossed seal",
        "Physical certificate of authenticity & provenance dossier",
        "150+ year lightfastness rating under museum glass",
        "Insured DHL Express international shipping included",
      ],
      restricted: [
        "Digitization or electronic duplication for distribution",
        "Commercial advertising reproduction",
      ],
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomInquirySubmitted(true);
    setTimeout(() => setCustomInquirySubmitted(false), 5000);
  };

  return (
    <div className="w-full bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] min-h-screen selection:bg-[#ff2d78] selection:text-white transition-colors duration-200">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#ff2d78]/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-60 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-label uppercase tracking-widest border border-secondary/25 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_currentColor] animate-pulse" />
              Cryptographic Image Provenance &amp; Rights
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-on-surface dark:text-[#e8e0f0] tracking-tight leading-[1.08]">
              Licensing &amp; Fine Art <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface via-[#ff2d78] to-secondary dark:from-[#e8e0f0] dark:via-[#ff2d78] dark:to-[#00ffcc]">
                Pricing Matrix
              </span>
            </h1>
            <p className="font-body text-base lg:text-lg text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-2xl font-light">
              Clear, transparent commercial and editorial licensing tiers. Every acquired master frame includes signed Cloudflare R2 vault dispatch tokens and directly funds our 10% Bardia Tiger Corridor Anti-Poaching trust.
            </p>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-3 card-surface p-2 rounded-xl border border-outline-variant/30 self-start lg:self-auto shadow-sm">
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant pl-2 font-semibold">Currency:</span>
            <div className="flex items-center gap-1 font-label text-xs">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currency === "USD"
                    ? "text-white bg-[#008769] shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currency === "NPR"
                    ? "text-white bg-[#008769] shadow-sm font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                NPR (रू)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tier Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const isFeatured = tier.id === "commercial-extended";
            const priceDisplay =
              tier.usdPrice === 0
                ? "Free"
                : currency === "USD"
                ? `$${tier.usdPrice}`
                : `रू ${tier.nprPrice.toLocaleString()}`;

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedLicense(tier.id)}
                className={`flex flex-col justify-between rounded-2xl p-6 lg:p-7 transition-all duration-300 relative cursor-pointer border ${
                  isFeatured
                    ? "card-surface border-[#ff2d78] shadow-[0_0_24px_rgba(255,45,120,0.2)] lg:-translate-y-2 ring-1 ring-[#ff2d78]"
                    : selectedLicense === tier.id
                    ? "card-surface border-secondary shadow-[0_0_16px_rgba(0,135,105,0.2)] ring-1 ring-secondary"
                    : "card-surface border-outline-variant/30 hover:border-secondary/40 shadow-sm"
                }`}
              >
                {tier.badge && (
                  <div
                    className={`absolute -top-3 right-6 px-3 py-0.5 rounded-full font-label text-[10px] font-bold tracking-widest uppercase shadow-md ${
                      isFeatured
                        ? "bg-[#ff2d78] text-white shadow-[0_0_10px_#ff2d78]"
                        : "bg-secondary text-[#001a1a] border border-secondary/30"
                    }`}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-on-surface dark:text-[#e8e0f0]">{tier.name}</h3>
                    <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] mt-1 line-clamp-2">{tier.audience}</p>
                  </div>

                  <div className="pt-2 pb-1 border-b border-outline-variant/20">
                    <span className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface dark:text-[#e8e0f0]">
                      {priceDisplay}
                    </span>
                    {tier.usdPrice > 0 && (
                      <span className="text-xs font-label text-on-surface-variant ml-2">
                        {tier.id === "fine-art-print" ? "/ print" : "/ license"}
                      </span>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="space-y-2 py-2 text-xs font-label">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Resolution:</span>
                      <span className="text-on-surface dark:text-[#e8e0f0] font-medium">{tier.resolution}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Color Profile:</span>
                      <span className="text-secondary font-semibold">{tier.colorSpace}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Impressions:</span>
                      <span className="text-on-surface dark:text-[#e8e0f0]">{tier.impressions}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                    <div className="text-[11px] font-label uppercase tracking-wider text-secondary font-semibold">
                      Included Rights
                    </div>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-body text-on-surface dark:text-[#e8e0f0]">
                        <span className="material-symbols-outlined text-sm text-secondary shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Restrictions */}
                  <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
                    <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/80 font-semibold">
                      Restrictions
                    </div>
                    {tier.restricted.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] font-body text-on-surface-variant/70">
                        <span className="material-symbols-outlined text-xs text-[#d81159] shrink-0 mt-0.5">
                          cancel
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      addItem(
                        {
                          id: `license-${tier.id}`,
                          slug: tier.id,
                          title: tier.name,
                          subtitle: `${tier.resolution} • ${tier.commercialRights}`,
                          format: "digital",
                          image:
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuALSxvxkanTm5hdhOIHEVwLmLga67mLa5zKcyIwFa0uNrQWfgLiyEMQ-J6KY1tPSpnRb7VArKx-r7GKbeg7wvUy6VCKT8NX9I8ihgNTLjDlwOGLBtRaRTLJAQFErbS3e6DPK0wPFlm0J0B3daWnyVdy2FrgH5bF141BkRqk3HFb-TYSuzQ2G2xeS3nLOw4RH1_EOZDTG-9ACRj5ShW3gDsURFNnciHkrb0ZJxAYovEJ",
                          tier: tier.id,
                          priceUsd: tier.usdPrice,
                          priceNpr: tier.nprPrice,
                        },
                        true
                      );
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-label text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isFeatured
                        ? "bg-[#ff2d78] hover:bg-[#b3004e] text-white shadow-md hover:shadow-lg"
                        : "card-surface hover:bg-surface-container text-secondary hover:text-on-surface border border-secondary/30"
                    }`}
                  >
                    <span>{tier.usdPrice === 0 ? "Claim Free Tier" : "Add License to Cart"}</span>
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Feature Comparison Matrix Table */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="card-surface rounded-2xl p-6 lg:p-10 border border-outline-variant/30 shadow-xl overflow-x-auto">
          <div className="space-y-2 mb-6">
            <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-[#e8e0f0]">
              Detailed Rights &amp; Usage Comparison
            </h3>
            <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0]">
              Compare exact technical deliverables, print rights, and commercial allowances across all four tiers.
            </p>
          </div>

          <table className="w-full text-left font-body text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant font-label text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Feature / Usage Right</th>
                <th className="py-3 px-4">Personal Display</th>
                <th className="py-3 px-4">Standard Commercial</th>
                <th className="py-3 px-4 text-[#ff2d78]">Extended Commercial</th>
                <th className="py-3 px-4 text-[#b45309] dark:text-[#ffe04a]">Fine Art Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-on-surface dark:text-[#e8e0f0]">
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Master File Deliverable</td>
                <td className="py-3 px-4">1400px WebP</td>
                <td className="py-3 px-4">3840px Full HD JPEG</td>
                <td className="py-3 px-4 font-semibold text-secondary">50MP 16-Bit RAW TIFF</td>
                <td className="py-3 px-4">Hahnemühle 308gsm Print</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Watermark Status</td>
                <td className="py-3 px-4 text-[#b45309] dark:text-[#ffe04a]">Subtle Watermark</td>
                <td className="py-3 px-4 text-secondary">100% Clean / Unwatermarked</td>
                <td className="py-3 px-4 text-secondary">100% Clean / Unwatermarked</td>
                <td className="py-3 px-4 text-secondary">No Watermark (Signed)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Web &amp; Digital Advertising</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
                <td className="py-3 px-4 text-secondary">Up to 50k Impressions</td>
                <td className="py-3 px-4 font-semibold text-secondary">Unlimited Worldwide</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Print Publication &amp; Editorial</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
                <td className="py-3 px-4 text-secondary">Articles &amp; Magazines</td>
                <td className="py-3 px-4 font-semibold text-secondary">Global Books &amp; Covers</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Private Display Only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Television &amp; Cinema Broadcast</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
                <td className="py-3 px-4 font-semibold text-secondary">Full Broadcast Rights</td>
                <td className="py-3 px-4 text-[#d81159] dark:text-[#ff4444]">Not Permitted</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">C2PA Cryptographic Provenance</td>
                <td className="py-3 px-4 text-on-surface-variant dark:text-[#a098b0]">Basic Hash</td>
                <td className="py-3 px-4 text-secondary">Standard Seal</td>
                <td className="py-3 px-4 font-semibold text-secondary">Verified Master Key</td>
                <td className="py-3 px-4 text-[#b45309] dark:text-[#ffe04a]">Physical Dossier &amp; Seal</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-on-surface-variant dark:text-[#a098b0]">Conservation Fund Allocation</td>
                <td className="py-3 px-4 text-on-surface-variant dark:text-[#a098b0]">Community Awareness</td>
                <td className="py-3 px-4 text-secondary">10% Direct Royalty</td>
                <td className="py-3 px-4 font-semibold text-[#ff2d78]">10% Direct Royalty</td>
                <td className="py-3 px-4 text-[#b45309] dark:text-[#ffe04a]">15% Ranger Support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Enterprise & Custom Clearance Form */}
      <section id="custom-clearance" className="max-w-4xl mx-auto px-6 lg:px-12 pb-24">
        <div className="card-surface rounded-2xl p-8 lg:p-12 border border-outline-variant/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff2d78]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-label uppercase tracking-widest border border-secondary/25 font-semibold">
              <span className="material-symbols-outlined text-sm">handshake</span>
              Enterprise &amp; Broadcast
            </div>
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-[#e8e0f0]">
              Custom Rights Clearance &amp; Film Commissions
            </h3>
            <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
              Require exclusivity periods, raw uncompressed RED/Arri cinematic video footage, or private expedition assignments in the Himalayas? Our studio clears bespoke legal agreements within 24 business hours.
            </p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                  Full Name / Organization
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. BBC Studios Natural History"
                  className="w-full card-surface border border-outline-variant/40 focus:border-secondary rounded-lg px-4 py-2.5 text-xs text-on-surface dark:text-[#e8e0f0] placeholder:text-on-surface-variant/40 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                  Business Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="producer@domain.com"
                  className="w-full card-surface border border-outline-variant/40 focus:border-secondary rounded-lg px-4 py-2.5 text-xs text-on-surface dark:text-[#e8e0f0] placeholder:text-on-surface-variant/40 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                  Licensing Scope
                </label>
                <select className="w-full card-surface border border-outline-variant/40 focus:border-secondary rounded-lg px-4 py-2.5 text-xs text-on-surface dark:text-[#e8e0f0] outline-none transition-colors">
                  <option value="broadcast" className="bg-surface-container text-on-surface">Documentary &amp; Broadcast Rights</option>
                  <option value="exclusive" className="bg-surface-container text-on-surface">Full Territorial Exclusivity</option>
                  <option value="museum" className="bg-surface-container text-on-surface">Museum &amp; Public Art Exhibition</option>
                  <option value="custom" className="bg-surface-container text-on-surface">Bespoke Field Expedition Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                  Archive Reference or Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. NP-BARD-092 (Royal Bengal Tiger)"
                  className="w-full card-surface border border-outline-variant/40 focus:border-secondary rounded-lg px-4 py-2.5 text-xs text-on-surface dark:text-[#e8e0f0] placeholder:text-on-surface-variant/40 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                Project Scope &amp; Distribution Details
              </label>
              <textarea
                rows={3}
                placeholder="Describe intended print runs, broadcast regions, duration, and technical format needs..."
                className="w-full card-surface border border-outline-variant/40 focus:border-secondary rounded-lg p-4 text-xs text-on-surface dark:text-[#e8e0f0] placeholder:text-on-surface-variant/40 outline-none transition-colors resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ff2d78] hover:bg-[#b3004e] text-white font-label text-xs uppercase tracking-widest font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Submit Rights Clearance Request
              </button>

              {customInquirySubmitted && (
                <span className="text-xs font-label text-secondary flex items-center gap-1.5 animate-fadeIn font-semibold">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Inquiry logged. Studio coordinator will reply within 24 hours.
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
