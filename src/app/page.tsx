"use client";

import { useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";

interface ShowcaseItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: "pink" | "cyan" | "yellow";
  licenseType: string;
  edition: string;
  location: string;
  description: string;
  priceUsd: number;
  priceNpr: number;
  actionText: string;
  actionHref: string;
  actionColor: "pink" | "dark";
  imageUrl: string;
  cameraInfo: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "snow-leopard-chasm",
    title: "Chasm Leaper (Snow Leopard)",
    badge: "Fine Art Print",
    badgeColor: "pink",
    licenseType: "FINE ART PRINT",
    edition: "ED. 12/25",
    location: "Manang Valley • 4,200m",
    description: "Archival pigment on Hahnemühle Photo Rag 308g.",
    priceUsd: 35,
    priceNpr: 4600,
    actionText: "Buy",
    actionHref: "/shop",
    actionColor: "pink",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCvu5oUFUOTiYCjzw80uXC-G0Ecc6s64IQFwaLKXAoIDh6O5oR4X0mCe_9tcFVp_1DTFMcr4zFGuaoV9eNM8e4b_8YgZQvq6ShvvvUMMEMTcnrcb0liLAVQIl5psNTOetcPDhz3beot6fhXIEYi87qoxN7BCUMDVIh01kDW7kgL9_BwTrw8hLQ8RJsSQrr2QDw9Y6DB6Kgu67b8qs1kn-HPZFRLT9KUusx5DusjUy5",
    cameraInfo: "Sony Alpha 1 • FE 400mm f/2.8 GM • f/3.2 • 1/2000s • ISO 1600",
  },
  {
    id: "lammergeier-flight",
    title: "The Bone Breaker (Lammergeier)",
    badge: "Digital License",
    badgeColor: "cyan",
    licenseType: "DIGITAL LICENSE",
    edition: "COMMERCIAL",
    location: "Annapurna Range • 5,100m",
    description: "Full 61MP uncompressed TIFF + Editorial Rights.",
    priceUsd: 120,
    priceNpr: 15800,
    actionText: "License",
    actionHref: "/licensing",
    actionColor: "dark",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMqPW1y4YdZ43hHwJqPzfI0V_fobEppgk5gTclFuc_Y4veDgajLY_U2bUCVmSc2j4GSEinw15zSMoR51RVIu3jQRrFJcjaRRTlquQa81li6jAHsI6BU17Wsdx65GJwdSuXvvt_Z_KO7CAAVOYHBacVqW1hqvtQ-inahm_HHxutaR7vu7dONwEQhWStIi28lV4oV2EaWo-cGR3QObra_3eVXyATCVpFDVoLngQt88wx",
    cameraInfo: "Nikon Z9 • NIKKOR Z 600mm f/4 TC VR S • f/4 • 1/3200s • ISO 800",
  },
  {
    id: "bengal-tiger-pool",
    title: "Midnight Drink (Royal Bengal)",
    badge: "Fine Art Print",
    badgeColor: "pink",
    licenseType: "FINE ART PRINT",
    edition: "ED. 5/10",
    location: "Bardia Reserve • 150m",
    description: "Canson Infinity Platine Fibre Rag museum grade.",
    priceUsd: 35,
    priceNpr: 4600,
    actionText: "Buy",
    actionHref: "/shop",
    actionColor: "pink",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbcs4ojftRp7_N-VMN9aE0otZQPbfq6qfTEEi3xf6Wpi3QLrQPQRjpsjwP8hdVBTKYgDTeormH1g42OI6qnKvmlJOhX3cokmX6tfgtfJItqFfZvfLGCP2JbhwLQ9tiYXx166mY5DjVkuc5yQQeT0X8ryIOhFQk_mPR_X8EFbJQtKa_510m3Z9B5aJsHt7-iL73ukOV8Fl1WLeH3UZe69V61O_U2fTQnCJY2yRlg1Qy",
    cameraInfo: "Canon EOS R5 • RF 70-200mm f/2.8L IS USM • f/2.8 • 1/250s • ISO 6400",
  },
  {
    id: "twin-red-pandas",
    title: "Canopy Slumber (Twin Ailurus)",
    badge: "Digital Starter",
    badgeColor: "yellow",
    licenseType: "DIGITAL STARTER",
    edition: "PERSONAL",
    location: "Kanchenjunga Sector • 3,100m",
    description: "High-res 5K wallpaper package + digital storybook.",
    priceUsd: 12,
    priceNpr: 1550,
    actionText: "Download",
    actionHref: "/gallery",
    actionColor: "dark",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCrmme0ki-iDmVqLYqS9FM7JEuLR6R-rqK6ejoo4jEyxHrrgFXUYFxR84bIb2ykhxSrCThZMPeNNeVQewWFS6b8QJMdhw1AfzOZQ8E8WBOGPpzLH37epVVM4yqQx8tk9ki4to1BS6PdEN7CNTCs_I3OqQKRX2vpYLKXJlv2DyHUJEUg64upnmyr8eBTRxnKJH2w9k83chtfN1ZLjQfJy4arVJuEhINwT7TxMHCvMjLB",
    cameraInfo: "Sony Alpha 1 • FE 200-600mm f/5.6-6.3 G OSS • f/6.3 • 1/400s • ISO 3200",
  },
];

export default function HomePage() {
  const { settings } = useSiteSettings();
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [inspectedItem, setInspectedItem] = useState<ShowcaseItem | null>(null);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container antialiased transition-colors duration-300">
      {/* ── MAIN CONTENT ── */}
      <main className="w-full min-h-screen bg-background transition-colors duration-300">

        <div className="flex flex-col w-full">
          {/* ── HERO SECTION ── */}
          <section className="relative w-full min-h-[90vh] flex items-end overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
              id="hero-bg"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAkFDeDo4H7SmqD345BrmmhXQvrI3Mbheoa1zKJpghyFu_xpV_GMB5IUZtRQbVFVZbmjlBC4lCPER_emLh_q9Xg5kF-_L7_oPMdPThwZbL6zRxhbXM_k0ntk611slEPu8ojdF5GDg7XqebDbbEPGhUYp1wG9ULt_xi07m81dMcaW2R3X0Lb1OuiXYz-cKTWc7iWw3q5S_PBBbTarmOY6m1v7c4AVIOM-VXBLuzVsqER')",
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(4, 18, 10) 0%, rgba(4, 18, 10, 0.6) 50%, transparent 100%)",
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r via-transparent to-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(4, 18, 10, 0.9) 0%, rgba(4, 18, 10, 0.4) 50%, transparent 100%)",
              }}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-16 flex flex-col justify-end">
              {/* Badge row */}
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container/80 backdrop-blur-md text-[11px] font-label font-medium uppercase tracking-widest text-secondary shadow-[0_0_12px_rgba(0,255,204,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  Expedition Dispatch • Solukhumbu 4,800m
                </span>
                <span className="hidden sm:inline-block text-xs font-label text-on-surface-variant/60 tracking-widest">
                  #SL-2024-NOV
                </span>
              </div>

              {/* Title & Description */}
              <div className="max-w-3xl space-y-4">
                <h1 className="font-headline font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-on-surface">
                  Aim, Passion, and <br />
                  <span className="text-primary">Life in the </span>
                  <span className="text-secondary">Wild.</span>
                </h1>
                <p className="font-body text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                  High-fidelity chronicles from Earth’s untouched altitudinal margins.
                  Capturing the tension, pulse, and ephemeral spirits of the eastern
                  Himalaya and subtropical terai.
                </p>
              </div>

              {/* Action Cluster & Slider Controls */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    className="px-6 py-3.5 rounded-lg bg-white text-[#008769] hover:bg-[#008769] hover:text-white font-label text-xs tracking-wider uppercase font-bold transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex items-center gap-2 group cursor-pointer text-green-btn"
                    href="/gallery"
                    style={{ color: "#008769" }}
                  >
                    <span className="font-bold text-[#008769] group-hover:text-white transition-colors" style={{ color: "inherit" }}>
                      Explore Gallery
                    </span>
                    <span
                      className="material-symbols-outlined text-sm text-[#008769] group-hover:text-white group-hover:translate-x-1 transition-transform"
                      style={{ color: "inherit" }}
                    >
                      arrow_forward
                    </span>
                  </Link>
                  <Link
                    data-hero-btn
                    className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-white border border-white/20 backdrop-blur-md font-label text-xs tracking-wider uppercase transition-all duration-300"
                    href="/collections"
                    style={{ color: "#ffffff" }}
                  >
                    Curated Collections
                  </Link>
                  <Link
                    className="px-6 py-3.5 rounded-lg bg-black/40 hover:bg-black/60 text-[#00ffcc] hover:text-white border border-[#00ffcc]/30 backdrop-blur-md font-label text-xs tracking-wider uppercase transition-all"
                    href="/licensing"
                  >
                    License Work
                  </Link>
                </div>

                {/* Slider metadata badge */}
                <div className="hero-slider-badge flex items-center gap-4 px-5 py-3 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md bg-black/80 border border-white/20">
                  <div className="space-y-0.5 text-right">
                    <div
                      className="slider-title font-headline text-xs sm:text-sm font-bold text-white tracking-wide"
                      style={{ color: "#ffffff" }}
                    >
                      Himalayan Snow Leopard at Dusk
                    </div>
                    <div
                      className="slider-specs font-label text-[10px] uppercase tracking-wider text-[#00ffcc] font-semibold"
                      style={{ color: "#00ffcc" }}
                    >
                      Aperture f/4 • 1/640s • ISO 3200
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 pl-3 border-l border-white/20">
                    <button
                      aria-label="Previous shot"
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-[#ff2d78] text-white flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ color: "#ffffff" }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base" style={{ color: "#ffffff" }}>
                        chevron_left
                      </span>
                    </button>
                    <button
                      aria-label="Next shot"
                      className="w-8 h-8 rounded-full bg-white/15 hover:bg-[#ff2d78] text-white flex items-center justify-center transition-all duration-200 border border-white/20 hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ color: "#ffffff" }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base" style={{ color: "#ffffff" }}>
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── FLOATING STATS BANNER ── */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-6 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-6 rounded-xl shadow-xl card-surface border border-outline-variant/30">
              <div className="flex items-center gap-4 px-4 py-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-secondary shadow-[0_0_14px_rgba(0,255,204,0.2)] bg-surface-container border border-outline-variant/30">
                  <span className="material-symbols-outlined text-2xl">
                    verified_user
                  </span>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-on-surface">
                    48+
                  </div>
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    Protected Expeditions
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-secondary shadow-[0_0_14px_rgba(0,255,204,0.2)] bg-surface-container border border-outline-variant/30">
                  <span className="material-symbols-outlined text-2xl">
                    auto_stories
                  </span>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-on-surface">
                    120+
                  </div>
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    Global Publications
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-2">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center text-tertiary shadow-[0_0_14px_rgba(255,224,74,0.2)] bg-surface-container border border-outline-variant/30">
                  <span className="material-symbols-outlined text-2xl">
                    pin_drop
                  </span>
                </div>
                <div>
                  <div className="font-headline text-2xl font-bold text-on-surface">
                    Nepal &amp; Beyond
                  </div>
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    High Altitudes &amp; Lowlands
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 1: FIELD STORY SPOTLIGHT (RED PANDA) ── */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#ff2d78]" />
                <span className="font-label text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Field Story Spotlight
                </span>
              </div>
              <span className="font-label text-xs text-on-surface-variant uppercase tracking-widest hidden sm:inline-block">
                Archive entry • #089
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-2xl card-surface border border-outline-variant/30">
              {/* Media preview */}
              <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[520px] overflow-hidden group">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXRUClMNkvKs5EHmp70ANYPHBc06YCZunpsGRoGGb3A56qVcGKoQhFqT7p8sVs2NKRnqkx2yYuz-Rth5Hw08PnFlHOWEe0XwPviApFM3pnIRepXyepZ3vEJOSIcQTj2_M-lYB63nwAXgggnIxCRpBBithFZzdnJ3SfrVqUsda1DJcIMhH4rxjjiaqEt7t-cf5xi3AD9b4PAQQf8F_FpqZk8hDueXWcvyHG4MDvB7-q')",
                  }}
                />
                <WatermarkOverlay variant="full" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent lg:hidden" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label text-[10px] tracking-widest uppercase text-secondary">
                    Endangered Species
                  </span>
                  <span className="px-3 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md font-label text-[10px] tracking-widest uppercase text-tertiary">
                    Location: Ilam, 2,800m
                  </span>
                </div>
              </div>

              {/* Story details */}
              <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="font-label text-xs uppercase tracking-widest text-secondary font-medium">
                    Eastern Himalayan Canopy
                  </div>
                  <h2 className="font-headline text-2xl lg:text-3xl font-bold text-on-surface leading-tight">
                    The Elusive Red Panda of Eastern Himalayas
                  </h2>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    &ldquo;Fourteen rain-soaked dawns under the mossy rhododendron
                    giants of Sandakphu corridor before a solitary rust-furred spirit crept
                    out along the lichen mantle...&rdquo;
                  </p>
                  <div
                    className="p-4 rounded-lg space-y-2 card-surface"
                  >
                    <div className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        photo_camera
                      </span>
                      Camera Gear &amp; Exposure
                    </div>
                    <div className="font-label text-xs font-semibold text-on-surface">
                      Sony Alpha 1 • FE 600mm f/4 GM OSS
                    </div>
                    <div className="text-[11px] font-label text-on-surface-variant/80">
                      f/4.0 • 1/500s • ISO 2500 • Monopod Stabilized
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <Link
                      className="flex-1 py-3 px-4 rounded-lg bg-surface-bright hover:bg-primary hover:text-on-primary font-label text-xs font-semibold tracking-wider uppercase text-center transition-all shadow-[0_0_12px_rgba(255,45,120,0.15)]"
                      href="/blog"
                    >
                      Read Field Journal
                    </Link>
                    <Link
                      className="flex-1 py-3 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary font-label text-xs font-semibold tracking-wider uppercase text-center transition-all"
                      href="/licensing"
                    >
                      Acquire License
                    </Link>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-label text-on-surface-variant/60">
                    <span>Verified Raw Provenance • C2PA Cryptographic Sign</span>
                    <span className="text-secondary font-medium">Edition of 15</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 2: CURATED COLLECTIONS ── */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#00ffcc]" />
                  <span className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
                    Anthology Archives
                  </span>
                </div>
                <h2 className="font-headline text-3xl sm:text-4xl font-bold text-on-surface">
                  Curated Collections
                </h2>
              </div>
              <p className="font-body text-sm text-on-surface-variant max-w-md">
                Structured field studies spanning high-altitude predators, cloud forests, and
                low-river basin ecosystems.
              </p>
            </div>

            {/* 4 Cards Bento / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Collection 1 */}
              <Link
                className="group relative rounded-xl overflow-hidden p-5 flex flex-col justify-between min-h-[380px] shadow-lg hover:shadow-[0_0_24px_rgba(255,45,120,0.35)] transition-all duration-500 border border-white/10 photo-card-dark"
                href="/collections"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc68oAeVudhdWJqwsTnOskmfxbzPTaacCiKue9jLTlCVdU_hlFt3wiv3CkL3wdmC6CALLp8MxlzJkOHf-jne4Tz1aWRMScHQgtWebJXvri085LnDuU5xUBOztULTV_ngqiZ1ScO7flpXNoTpzbPgeMNmezramogoihnFyh2SU3edSdYUlqY9dv7-y-BKYvE1v3t2m5DfNlCBhBsBDHVgzVIlJPwzXrbgcgvA-tKQpA')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-label font-bold text-primary tracking-widest uppercase border border-white/10">
                    34 Works
                  </span>
                  <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors text-lg">
                    north_east
                  </span>
                </div>
                <div className="relative z-10 space-y-1">
                  <div className="font-label text-[10px] uppercase tracking-widest text-white/70 font-medium">
                    Predator Archive
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-secondary transition-colors drop-shadow-sm">
                    Big Cats &amp; Predators
                  </h3>
                  <p className="font-body text-xs text-white/80 line-clamp-2">
                    Apex hunters of the sub-Himalayan valleys and snowbound passes.
                  </p>
                </div>
              </Link>

              {/* Collection 2 */}
              <Link
                className="group relative rounded-xl overflow-hidden p-5 flex flex-col justify-between min-h-[380px] shadow-lg hover:shadow-[0_0_24px_rgba(0,255,204,0.35)] transition-all duration-500 border border-white/10 photo-card-dark"
                href="/collections"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGB2P5DYWGjTs8SGR8sY4YHed6Ua1PKCSLRCMrHgyfscW7zioR-UoCBk-OFWEGGNNqu7Nu-uQU_hm8-c4chvkVOoxMf7MNQV4acz6XZkLrxlU-xp_j79u2mJ1ZYX-4RFIpTHl2i_GzqzOmZFFjDJPk8Hn2-4YWWDnohM70de8aZ78aaQThonTpD5LXiaOldEIYEeQTFwGivMhnrSLkJ92iSvEdZMyiwX5k5NOz8i-A')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-label font-bold text-secondary tracking-widest uppercase border border-white/10">
                    52 Works
                  </span>
                  <span className="material-symbols-outlined text-white group-hover:text-secondary transition-colors text-lg">
                    north_east
                  </span>
                </div>
                <div className="relative z-10 space-y-1">
                  <div className="font-label text-[10px] uppercase tracking-widest text-white/70 font-medium">
                    Alpine Wings
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-secondary transition-colors drop-shadow-sm">
                    High Altitude Avian Archive
                  </h3>
                  <p className="font-body text-xs text-white/80 line-clamp-2">
                    The vibrant iridescent masters of thin mountain atmospheres.
                  </p>
                </div>
              </Link>

              {/* Collection 3 */}
              <Link
                className="group relative rounded-xl overflow-hidden p-5 flex flex-col justify-between min-h-[380px] shadow-lg hover:shadow-[0_0_24px_rgba(255,224,74,0.35)] transition-all duration-500 border border-white/10 photo-card-dark"
                href="/collections"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDHfyvIJ872HggQkMGVaxA_vV7-z5Fq22Y_heoAATk2zHJCojoGZ1yXz3z4_OjbZrEwxlfLCY8ecZKxZFkb5EXqRfX_e8GMU3e5Tot7SvlEx76xl9upLYWXkme9L8SJKC25_EADnQAGEnC4biJkmg-jxL-2bE9PybrnLd0Gz9j5wljqpgqWZ7czcgJwdwAXQtjkplcXVK8oftQfX4W_JTh8R8Fupu802ITxWHOcfSCf')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-label font-bold text-tertiary tracking-widest uppercase border border-white/10">
                    28 Works
                  </span>
                  <span className="material-symbols-outlined text-white group-hover:text-tertiary transition-colors text-lg">
                    north_east
                  </span>
                </div>
                <div className="relative z-10 space-y-1">
                  <div className="font-label text-[10px] uppercase tracking-widest text-white/70 font-medium">
                    Atmospheric Studies
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-tertiary transition-colors drop-shadow-sm">
                    Mist &amp; Monsoon
                  </h3>
                  <p className="font-body text-xs text-white/80 line-clamp-2">
                    Torrential rains, cloud envelopes, and drenched riverine woods.
                  </p>
                </div>
              </Link>

              {/* Collection 4 */}
              <Link
                className="group relative rounded-xl overflow-hidden p-5 flex flex-col justify-between min-h-[380px] shadow-lg hover:shadow-[0_0_24px_rgba(255,45,120,0.35)] transition-all duration-500 border border-white/10 photo-card-dark"
                href="/gallery/greater-one-horned-rhino-nepal"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJZnq50Mnfvm14cRHmfuoGLgqNQYQc1UvK7NTP5bbn-RbYTPAa1n8UdMpeBTohujFwYwZAh7sXE2sgpc2ZKakY1Pa_jD3MQeQ5Qj7_q865PXmnEYdmM-NIimlTEaoZ_2IncH98Roi4T9PYpurlVe-PNaVkQQBRhkIqLd3H3UpEQykzAKMhcJT0nDfot5DQc3t3QjJFdR8n6qumukQaTSuELtc2I3KZ8ToYTERqfAQ7')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] font-label font-bold text-primary tracking-widest uppercase border border-white/10">
                    41 Works
                  </span>
                  <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors text-lg">
                    north_east
                  </span>
                </div>
                <div className="relative z-10 space-y-1">
                  <div className="font-label text-[10px] uppercase tracking-widest text-white/70 font-medium">
                    Lowland Sanctuaries
                  </div>
                  <h3 className="font-headline text-xl font-bold text-white group-hover:text-primary transition-colors drop-shadow-sm">
                    Shadows of Chitwan
                  </h3>
                  <p className="font-body text-xs text-white/80 line-clamp-2">
                    Prehistoric herbivores and nocturnal river basin predators.
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* ── SECTION 3: BEST-SELLING PRINTS & LICENSES ── */}
          <section
            className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20 rounded-2xl my-8 section-surface"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#ff2d78]" />
                  <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">
                    Collector&apos;s Showcase
                  </span>
                </div>
                <h2 className="font-headline text-3xl font-bold text-on-surface">
                  Best-Selling Prints &amp; Licenses
                </h2>
              </div>
              <div className="flex items-center gap-2 font-label text-xs">
                <span className="text-on-surface-variant">Showing currency:</span>
                <button
                  type="button"
                  onClick={() => setCurrency((prev) => (prev === "USD" ? "NPR" : "USD"))}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-secondary font-semibold hover:opacity-80 transition-all cursor-pointer border border-outline-variant/30"
                >
                  {currency === "USD" ? "USD / NPR" : "NPR / USD"}
                </button>
              </div>
            </div>

            {/* 4-Item Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SHOWCASE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all card-surface"
                >
                  {/* Photo with Watermark */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${item.imageUrl}')` }}
                    />
                    {/* Dynamic Watermark Engine Overlay */}
                    <WatermarkOverlay variant="card" />
                    {/* Status tag */}
                    <div className="absolute top-3 left-3">
                      {item.badgeColor === "pink" && (
                        <span className="px-2.5 py-0.5 rounded bg-primary text-on-primary font-label text-[10px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(255,45,120,0.5)]">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeColor === "cyan" && (
                        <span className="px-2.5 py-0.5 rounded bg-secondary text-[#001a1a] font-label text-[10px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(0,255,204,0.4)]">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeColor === "yellow" && (
                        <span className="px-2.5 py-0.5 rounded bg-tertiary text-[#1a1000] font-label text-[10px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(255,224,74,0.4)]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {/* Provenance code */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-surface-dim/80 backdrop-blur-sm font-label text-[9px] text-on-surface-variant">
                      {item.edition}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-label text-[10px] uppercase tracking-wider text-secondary">
                        {item.location}
                      </div>
                      <h3 className="font-headline text-base font-bold title-neon-green mt-1 transition-all duration-300">
                        {item.title}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant mt-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                      <div>
                        <div className="font-headline text-lg font-bold text-on-surface">
                          {currency === "USD" ? (
                            <>
                              ${item.priceUsd}{" "}
                              <span className="text-xs font-normal text-on-surface-variant">
                                USD
                              </span>
                            </>
                          ) : (
                            <>
                              Rs. {item.priceNpr.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-on-surface-variant">
                                NPR
                              </span>
                            </>
                          )}
                        </div>
                        <div className="font-label text-[11px] text-secondary font-medium">
                          {currency === "USD"
                            ? `Rs. ${item.priceNpr.toLocaleString()} NPR`
                            : `$${item.priceUsd} USD`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          aria-label={`Inspect ${item.title}`}
                          className="w-8 h-8 rounded bg-surface-bright hover:bg-surface-variant text-on-surface flex items-center justify-center transition-colors"
                          title="Inspect Shot"
                          type="button"
                          onClick={() => setInspectedItem(item)}
                        >
                          <span className="material-symbols-outlined text-base">
                            zoom_in
                          </span>
                        </button>
                        {item.actionColor === "pink" ? (
                          <Link
                            className="px-3 py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary font-label text-xs uppercase tracking-wider font-semibold transition-all shadow-[0_0_10px_rgba(255,45,120,0.3)]"
                            href={item.actionHref}
                          >
                            {item.actionText}
                          </Link>
                        ) : (
                          <Link
                            className="px-3 py-1.5 rounded bg-surface-bright hover:bg-primary hover:text-on-primary text-on-surface font-label text-xs uppercase tracking-wider font-semibold transition-all"
                            href={item.actionHref}
                          >
                            {item.actionText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 4: STATEMENT & FIELD JOURNAL PREVIEW ── */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* High-Contrast Quote Block & Ethics Statement */}
              <div className="lg:col-span-6 space-y-8">
                <div
                  className="p-8 sm:p-10 rounded-2xl relative overflow-hidden shadow-xl card-surface"
                >
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
                  <span className="material-symbols-outlined text-primary text-5xl opacity-40">
                    format_quote
                  </span>
                  <blockquote
                    className="font-headline text-xl sm:text-2xl font-semibold leading-snug mt-2 text-on-surface"
                  >
                    &ldquo;We do not stage moments in the wild; we endure the freeze,
                    the damp, and weeks of absolute stillness until the wild chooses to
                    reveal itself.&rdquo;
                  </blockquote>

                  <div className="mt-8 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div className="font-headline font-bold text-sm tracking-wider uppercase text-on-surface">
                        {settings.about.naturalistName || "Suban"}
                      </div>
                      <div className="font-label text-xs text-secondary tracking-widest uppercase">
                        {settings.about.title || "Expedition Photographer • Kathmandu"}
                      </div>
                    </div>

                    {/* Styled SVG Monogram / Signature */}
                    <svg
                      className="h-10 w-28 text-primary"
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

                {/* Ethics 2-Card Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="p-5 rounded-xl space-y-2 card-surface"
                  >
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      nature
                    </span>
                    <div className="font-headline text-sm font-bold text-on-surface">
                      Zero Baiting Ethics
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      100% wild behavior recorded. Strictly no flash disturbance, calls,
                      or drone pursuit in active sanctuaries.
                    </p>
                  </div>

                  <div
                    className="p-5 rounded-xl space-y-2 card-surface"
                  >
                    <span className="material-symbols-outlined text-tertiary text-2xl">
                      shield_lock
                    </span>
                    <div className="font-headline text-sm font-bold text-on-surface">
                      Provenance Cryptography
                    </div>
                    <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                      Every master archive RAW carries immutable location &amp; sensor
                      timestamp metadata.
                    </p>
                  </div>
                </div>
              </div>

              {/* Field Journal Preview List */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                  <div>
                    <span className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
                      Field Dispatches
                    </span>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">
                      Recent Journal Entries
                    </h3>
                  </div>
                  <Link
                    className="font-label text-xs text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                    href="/blog"
                  >
                    <span>All Articles</span>
                    <span className="material-symbols-outlined text-xs">
                      arrow_forward
                    </span>
                  </Link>
                </div>

                {/* Post 1 */}
                <Link
                  className="block p-5 rounded-xl transition-all group card-surface hover:-translate-y-0.5"
                  href="/blog"
                >
                  <div className="flex items-center gap-3 text-[11px] font-label text-on-surface-variant mb-2">
                    <span className="text-primary font-semibold">Expedition</span>
                    <span>•</span>
                    <span>October 24, 2024</span>
                    <span>•</span>
                    <span>12 Min Read</span>
                  </div>
                  <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                    Tracking the Royal Bengal Tiger in the Floodplains of Bardia
                  </h4>
                  <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2">
                    Navigating 14 kilometers of dense elephant grass where visibility
                    narrows to three feet. Documenting the elusive apex solitary hunters
                    through the wet post-monsoon chill.
                  </p>
                </Link>

                {/* Post 2 */}
                <Link
                  className="block p-5 rounded-xl transition-all group card-surface hover:-translate-y-0.5"
                  href="/blog"
                >
                  <div className="flex items-center gap-3 text-[11px] font-label text-on-surface-variant mb-2">
                    <span className="text-secondary font-semibold">Field Craft</span>
                    <span>•</span>
                    <span>September 12, 2024</span>
                    <span>•</span>
                    <span>8 Min Read</span>
                  </div>
                  <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    Ethical Wildlife Photography in Sub-Zero High Altitudes
                  </h4>
                  <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2">
                    Managing Lithium-ion performance below -25°C, managing human scent
                    corridors, and preserving animal comfort at 5,000 meters above sea
                    level.
                  </p>
                </Link>

                {/* Post 3 */}
                <Link
                  className="block p-5 rounded-xl transition-all group card-surface hover:-translate-y-0.5"
                  href="/blog"
                >
                  <div className="flex items-center gap-3 text-[11px] font-label text-on-surface-variant mb-2">
                    <span className="text-tertiary font-semibold">Conservation</span>
                    <span>•</span>
                    <span>August 03, 2024</span>
                    <span>•</span>
                    <span>15 Min Read</span>
                  </div>
                  <h4 className="font-headline text-lg font-bold text-on-surface group-hover:text-tertiary transition-colors">
                    The Vanishing Glacial Ponds of the Sacred Himalayan Corridor
                  </h4>
                  <p className="font-body text-xs text-on-surface-variant mt-2 line-clamp-2">
                    Photographic evidence documenting shifting snowline feeding routes
                    for high-altitude ungulates and the carnivores reliant on their
                    survival.
                  </p>
                </Link>
              </div>
            </div>
          </section>

          {/* ── SECTION 5: NEWSLETTER BANNER ── */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20">
            <div
              className="relative rounded-2xl overflow-hidden p-8 sm:p-14 shadow-2xl newsletter-banner"
            >
              {/* Ambient glows */}
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-label uppercase tracking-widest font-semibold">
                    <span className="material-symbols-outlined text-sm">download</span>
                    Immediate Collector Dispatch
                  </div>
                  <h2 className="font-headline text-3xl sm:text-4xl font-extrabold text-on-surface leading-tight">
                    Get Monthly 4K Watermarked Wildlife Backgrounds + Expedition Notes
                  </h2>
                  <p className="font-body text-sm sm:text-base text-on-surface-variant max-w-xl leading-relaxed">
                    Delivered on the full moon of each month. Includes ultra-res wallpapers,
                    private RAW metadata teardowns, and priority print reservation windows.
                  </p>
                </div>

                <div className="lg:col-span-5">
                  {!newsletterSubscribed ? (
                    <form
                      className="space-y-3 backdrop-blur-md p-6 rounded-xl newsletter-form"
                      onSubmit={handleNewsletterSubmit}
                    >
                      <div>
                        <label
                          className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1"
                          htmlFor="collector-email"
                        >
                          Collector Email
                        </label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary transition-all newsletter-input"
                            id="collector-email"
                            placeholder="art-patron@domain.com"
                            required
                            type="email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                          />
                          <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant/60">
                            mark_email_read
                          </span>
                        </div>
                      </div>
                      <button
                        className="w-full py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label text-xs uppercase font-bold tracking-widest transition-all duration-300 shadow-[0_0_16px_rgba(255,45,120,0.4)] flex items-center justify-center gap-2"
                        type="submit"
                      >
                        <span>Subscribe &amp; Get 4K Pack</span>
                        <span className="material-symbols-outlined text-sm">bolt</span>
                      </button>
                      <p className="text-[10px] font-label text-on-surface-variant/60 text-center tracking-wider uppercase">
                        No spam. One dispatch per moon cycle. Instant download token.
                      </p>
                    </form>
                  ) : (
                    <div
                      className="p-6 rounded-xl text-center space-y-3 shadow-lg card-surface"
                    >
                      <span className="material-symbols-outlined text-secondary text-4xl">
                        check_circle
                      </span>
                      <div className="font-headline font-bold text-base text-on-surface">
                        Dispatch Dispatched!
                      </div>
                      <p className="font-body text-xs text-on-surface-variant">
                        Check your inbox for the encrypted November 4K Himalayan pack token.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>



      {/* ── CINEMATIC LIGHTBOX MODAL ── */}
      {inspectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setInspectedItem(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl border border-secondary/30"
            style={{ backgroundColor: "rgb(8, 28, 16)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface-dim/80 hover:bg-primary text-on-surface hover:text-on-primary flex items-center justify-center transition-all"
              type="button"
              onClick={() => setInspectedItem(null)}
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Modal Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={inspectedItem.title}
                className="w-full h-full object-contain"
                src={inspectedItem.imageUrl}
              />
              <WatermarkOverlay variant="full" />
            </div>

            {/* Modal Details */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-secondary font-label text-xs uppercase tracking-wider">
                    {inspectedItem.location}
                  </span>
                  <h3 className="font-headline text-2xl font-bold text-on-surface mt-1">
                    {inspectedItem.title}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-headline text-2xl font-bold text-on-surface">
                    {currency === "USD"
                      ? `$${inspectedItem.priceUsd} USD`
                      : `Rs. ${inspectedItem.priceNpr.toLocaleString()} NPR`}
                  </div>
                  <div className="font-label text-xs text-secondary">
                    {inspectedItem.edition}
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg font-label text-xs space-y-1"
                style={{
                  backgroundColor: "rgb(12, 43, 26)",
                  border: "1px solid rgb(26, 68, 42)",
                }}
              >
                <div className="text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    photo_camera
                  </span>
                  Hardware &amp; Exposure Telemetry:
                </div>
                <div className="font-semibold text-on-surface">
                  {inspectedItem.cameraInfo}
                </div>
                <div className="text-[11px] text-on-surface-variant/70">
                  C2PA Cryptographic Signature:{" "}
                  <span className="text-secondary font-mono">
                    SHA256:0x7e3f89a2...9d1
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label text-xs uppercase tracking-wider hover:bg-surface-bright transition-all"
                  type="button"
                  onClick={() => setInspectedItem(null)}
                >
                  Dismiss
                </button>
                <Link
                  className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label text-xs uppercase tracking-wider font-bold transition-all shadow-[0_0_12px_rgba(255,45,120,0.4)]"
                  href={inspectedItem.actionHref}
                >
                  Proceed with {inspectedItem.actionText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
