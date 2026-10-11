"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCart } from "@/context/CartContext";
import { WatermarkOverlay } from "@/components/ui/WatermarkOverlay";

interface EncounterThumb {
  time: string;
  url: string;
  alt: string;
  caption: string;
}

interface PhotoProfile {
  title: string;
  series: string;
  species: string;
  scientificName: string;
  location: string;
  date: string;
  archiveRef: string;
  edition: string;
  categoryName: string;
  categoryHref: string;
  description: string;
  storyTitle: string;
  storyParagraphs: string[];
  metrics: {
    ambientTemp: string;
    habitat: string;
    elevation: string;
    subjectAge: string;
    distance: string;
    assignmentNote: string;
  };
  exif: {
    camera: string;
    sensor: string;
    lens: string;
    lensFeature: string;
    aperture: string;
    apertureNote: string;
    shutter: string;
    shutterNote: string;
    iso: string;
    isoNote: string;
    metering: string;
    meteringNote: string;
    wb: string;
    wbNote: string;
  };
  encounterSequence: EncounterThumb[];
}

function buildProfileFromProduct(product: any, rawSlug: string): PhotoProfile {
  const title = product?.title || "Fine Art Wildlife Edition";
  const species = product?.species || product?.title || "Himalayan Specimen";
  const scientificName = product?.scientificName || species;
  const location = product?.locationName ? `${product.locationName}, ${product.country || "Nepal"}` : "Nepal Wilderness";
  const elevation = product?.elevation || "4,200m AMSL";
  const ambientTemp = product?.ambientTemp || "9.4°C / 48.9°F";
  const habitat = product?.habitat || "Alpine Ecosystem";
  const camera = product?.camera || "Nikon Z9";
  const lens = product?.lens || "NIKKOR Z 400mm f/2.8 TC VR S";
  const aperture = product?.aperture || "f/2.8";
  const shutter = product?.shutterSpeed || "1/2000s";
  const iso = product?.iso ? `ISO ${product.iso}` : "ISO 800";
  const imgUrl = product?.imageUrl || product?.thumbnailUrl || "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200&auto=format&fit=crop&q=85";
  const desc = product?.description || "High-fidelity wildlife documentary plate captured in natural habitat under ethical conservation guidelines.";
  const storyTitle = product?.storyTitle || `Field Dossier: Encounter at ${location}`;
  const story = product?.story || desc;

  return {
    title,
    series: product?.isFeatured ? "Master Fine Art Archive" : "Himalayan Wildlife Archive",
    species,
    scientificName,
    location,
    date: product?.createdAt ? new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Nov 14, 2024",
    archiveRef: `#NP-${rawSlug.slice(0, 4).toUpperCase()}-092`,
    edition: "Edition 04 / 25 Available",
    categoryName: product?.habitat || "Himalayan Wilderness",
    categoryHref: "/gallery",
    description: desc,
    storyTitle,
    storyParagraphs: typeof story === "string" ? [story] : Array.isArray(story) ? story : [desc],
    metrics: {
      ambientTemp,
      habitat,
      elevation,
      subjectAge: product?.conservationStatus ? `Status: ${product.conservationStatus}` : "Adult in Native Habitat",
      distance: product?.distance || "38.2 meters",
      assignmentNote: "Documented strictly under IUCN ethical field protocols with zero artificial light, baiting, or sonic disturbance."
    },
    exif: {
      camera,
      sensor: "Stacked CMOS 45.7MP Sensor",
      lens,
      lensFeature: product?.focalLength ? `${product.focalLength} Prime Telephoto` : "Internal Fluorite High-Contrast Glass",
      aperture,
      apertureNote: "Critical Subject Separation",
      shutter,
      shutterNote: "Silent High-Speed Electronic Shutter",
      iso,
      isoNote: "Low-Noise Blue Hour Calibration",
      metering: "3D Matrix Telephoto",
      meteringNote: "Subject Weighted",
      wb: "5600K",
      wbNote: "Natural Ambient Daylight"
    },
    encounterSequence: [
      {
        time: "06:14 AM",
        url: imgUrl,
        alt: `${title} - Primary Master Frame`,
        caption: "Master Frame: Primary Composition"
      },
      {
        time: "06:22 AM",
        url: product?.thumbnailUrl || imgUrl,
        alt: `${title} - Biome & Environmental Frame`,
        caption: "Biome & Environmental Context"
      }
    ]
  };
}

export default function PhotoDetailLicensingPage() {
  const { settings } = useSiteSettings();
  const naturalistName = settings.about.naturalistName || "Suban";
  const naturalistTitle = settings.about.title || "Lead Expedition Naturalist";
  const naturalistInitials = naturalistName
    .split(" ")
    .map((w: string) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SN";

  const params = useParams();
  const rawSlug = (params?.slug as string) || "chasm-leaper-snow-leopard";

  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [selectedTier, setSelectedTier] = useState<"tier-free" | "tier-std" | "tier-ext" | "tier-print">("tier-ext");
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [liveProduct, setLiveProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?slug=${rawSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.product) {
          setLiveProduct(d.product);
        }
      })
      .catch((err) => console.error("Error loading product:", err))
      .finally(() => setLoading(false));
  }, [rawSlug]);

  const profile = buildProfileFromProduct(liveProduct, rawSlug);

  const displayTitle = liveProduct?.title || profile.title;
  const displaySpecies = liveProduct?.species || profile.species;
  const displayLocation = liveProduct?.locationName ? `${liveProduct.locationName} • ${profile.date}` : profile.location;
  const displayDescription = liveProduct?.description || profile.description;
  const displayImage = profile.encounterSequence[activeThumbIndex]?.url || liveProduct?.imageUrl || profile.encounterSequence[0].url;

  const router = useRouter();
  const { addItem } = useCart();
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = (instantCheckout: boolean = false) => {
    const tierMeta: Record<string, { label: string; priceUsd: number; priceNpr: number; format: string }> = {
      "tier-free": { label: "Free Layout Preview Tier", priceUsd: 0, priceNpr: 0, format: "digital" },
      "tier-std": { label: "Standard Editorial License", priceUsd: 39, priceNpr: 5100, format: "digital" },
      "tier-ext": { label: "Extended Commercial License", priceUsd: 180, priceNpr: 24000, format: "digital" },
      "tier-print": { label: 'Limited Fine Art Print (24x36")', priceUsd: 350, priceNpr: 46000, format: "print" },
    };
    const t = tierMeta[selectedTier] || tierMeta["tier-ext"];

    addItem(
      {
        id: `${rawSlug}-${selectedTier}`,
        slug: rawSlug,
        title: displayTitle,
        subtitle: t.label,
        species: displaySpecies,
        image: displayImage,
        tier: selectedTier,
        format: t.format,
        priceUsd: t.priceUsd,
        priceNpr: t.priceNpr,
        archiveRef: profile.archiveRef,
      },
      !instantCheckout
    );

    if (instantCheckout) {
      router.push("/checkout");
    } else {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2500);
    }
  };

  const handleFreeDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="w-full bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300">
      {/* Top Visual Accent & Breadcrumbs */}
      <div className="relative w-full overflow-hidden bg-[#edf3ef] dark:bg-[#020b06] py-4 border-b border-[#d8e5de] dark:border-outline-variant/30 transition-colors duration-300">
        <div className="absolute -right-32 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-24 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-label text-xs tracking-widest uppercase text-on-surface-variant flex-wrap">
            <Link className="hover:text-secondary transition-colors" href="/">
              Home
            </Link>
            <span className="opacity-40 text-[10px]">/</span>
            <Link className="hover:text-secondary transition-colors" href="/gallery">
              Gallery
            </Link>
            <span className="opacity-40 text-[10px]">/</span>
            <Link className="hover:text-secondary transition-colors" href={profile.categoryHref}>
              {profile.categoryName}
            </Link>
            <span className="opacity-40 text-[10px]">/</span>
            <span className="text-primary truncate max-w-xs md:max-w-md font-semibold">
              {displayTitle}
            </span>
          </nav>

          <div className="flex items-center gap-4 text-xs font-label">
            <span className="flex items-center gap-1.5 text-secondary font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_currentColor] animate-pulse" />
              ARCHIVE REF: {profile.archiveRef}
            </span>
            <span className="opacity-30">|</span>
            <span className="text-on-surface-variant tracking-wider uppercase">{profile.edition}</span>
          </div>
        </div>
      </div>

      {/* Primary Detail Section (2-Column Bento Matrix) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: The Interactive Protected Frame Stage */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div
              className={`relative bg-[#020b06] dark:bg-[#081d11] rounded-2xl overflow-hidden group shadow-2xl select-none border border-outline-variant/30 transition-all duration-300 ${
                isZoomed ? "scale-[1.02] shadow-[0_0_30px_rgba(0,135,105,0.25)]" : ""
              }`}
            >
              {/* Anti-theft transparent grid barrier */}
              <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40 mix-blend-multiply" />

              {/* Grid Pattern Over Main Visual */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:4rem_4rem]" />

              {/* Main High-Res Image Canvas */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                    isZoomed ? "scale-125 cursor-zoom-out" : "group-hover:scale-105"
                  }`}
                  alt={profile.encounterSequence[activeThumbIndex]?.alt || displayTitle}
                  src={displayImage}
                />
              </div>

              {/* Anti-Theft Watermark Stamp */}
              <div className="absolute bottom-5 left-5 z-30 pointer-events-none flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/15 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-[#ff2d78] shadow-[0_0_8px_#ff2d78]" />
                <div className="flex flex-col">
                  <span className="font-headline text-[10px] font-bold tracking-widest text-white uppercase">
                    SUBAN WILDLIFE ARCHIVE
                  </span>
                  <span className="font-label text-[9px] text-[#c0fff4] tracking-wider">
                    SHA-256: e8b94...920fc • STRICT DIGITAL RIGHTS
                  </span>
                </div>
              </div>

              {/* Magnify and Fullscreen Tool Overlay */}
              <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="w-10 h-10 rounded-lg bg-black/60 hover:bg-[#ff2d78] text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg border border-white/20"
                  title="Toggle Magnification"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isZoomed ? "zoom_out" : "zoom_in"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="w-10 h-10 rounded-lg bg-black/60 hover:bg-[#ff2d78] text-white backdrop-blur-md flex items-center justify-center transition-all shadow-lg border border-white/20"
                  title="Full Stage Preview"
                >
                  <span className="material-symbols-outlined text-lg">fullscreen</span>
                </button>
              </div>

              {/* Dynamic Watermark Engine Overlay */}
              <WatermarkOverlay variant="full" />
            </div>

            {/* Thumbnails: Alternate angles from the same encounter */}
            <div className="space-y-3 p-4 rounded-xl card-surface border border-outline-variant/30 shadow-md">
              <div className="flex items-center justify-between text-xs font-label uppercase tracking-widest text-on-surface-variant">
                <span>Encounter Sequence ({profile.date})</span>
                <span className="text-secondary text-[11px] font-semibold">{profile.encounterSequence.length} Visual Assets</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {profile.encounterSequence.map((frame, index) => {
                  const isActive = activeThumbIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveThumbIndex(index)}
                      className={`relative rounded-lg overflow-hidden aspect-[4/3] bg-black/60 group transition-all text-left ${
                        isActive
                          ? "ring-2 ring-secondary shadow-[0_0_12px_rgba(0,135,105,0.35)] scale-[1.02]"
                          : "opacity-75 hover:opacity-100 border border-outline-variant/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="w-full h-full object-cover" alt={frame.alt} src={frame.url} />
                      {isActive && <div className="absolute inset-0 bg-primary/20 pointer-events-none" />}
                      <span className="absolute bottom-1 right-1 font-label text-[9px] bg-black/85 px-1 rounded text-[#00ffcc] font-medium">
                        {frame.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conservation Pledge Callout Bar */}
            <div className="card-surface rounded-xl p-5 flex items-start gap-4 border border-outline-variant/30 shadow-md">
              <div className="p-2.5 rounded-lg bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
                <span className="material-symbols-outlined text-2xl">spa</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline font-semibold text-xs tracking-wider uppercase text-on-surface">
                  Direct Habitat Conservation Royalty
                </h4>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  15% of net proceeds from this print edition and licensing tier are remitted directly to the community anti-poaching patrol units across Thakurdwara and Babai Valley, Bardia.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Purchasing, Licensing & Cart Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="card-surface rounded-2xl p-6 lg:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden border border-outline-variant/30">
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header info */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label text-[11px] font-semibold tracking-widest uppercase border border-secondary/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {profile.series}
                </div>
                <h1 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface tracking-tight leading-snug">
                  {displayTitle}
                </h1>
                <p className="font-label text-xs tracking-wider text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {displayLocation}
                </p>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {displayDescription}
                </p>
              </div>

              {/* Currency Toggler Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-medium">
                  Select Usage License
                </span>
                <div className="flex items-center gap-1 font-label text-xs bg-surface-container/80 p-1 rounded-lg border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setCurrency("USD")}
                    className={`px-3 py-1 rounded font-medium transition-all ${
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
                    className={`px-3 py-1 rounded font-medium transition-all ${
                      currency === "NPR"
                        ? "text-white bg-[#008769] shadow-sm font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    NPR (रू)
                  </button>
                </div>
              </div>

              {/* Interactive Licensing Options Matrix */}
              <div className="flex flex-col gap-3">
                {/* Tier 1: Personal / Web Wallpaper */}
                <label
                  onClick={() => setSelectedTier("tier-free")}
                  className={`group relative flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedTier === "tier-free"
                      ? "bg-secondary/10 border-secondary shadow-sm"
                      : "card-surface border-outline-variant/40 hover:border-secondary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="license_tier"
                      checked={selectedTier === "tier-free"}
                      onChange={() => setSelectedTier("tier-free")}
                      className="mt-1 accent-[#ff2d78]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-sm text-on-surface">
                          Personal / Wallpaper
                        </span>
                        <span className="font-label text-[10px] px-1.5 py-0.5 bg-secondary/15 rounded text-secondary font-medium">
                          Personal
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                        1400px compressed WebP with small digital watermark. Non-commercial personal display.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-sm text-secondary">Free</span>
                    <span className="block font-label text-[10px] text-on-surface-variant">w/ email</span>
                  </div>
                </label>

                {/* Tier 2: Standard Commercial */}
                <label
                  onClick={() => setSelectedTier("tier-std")}
                  className={`group relative flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedTier === "tier-std"
                      ? "bg-secondary/10 border-secondary shadow-sm"
                      : "card-surface border-outline-variant/40 hover:border-secondary/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="license_tier"
                      checked={selectedTier === "tier-std"}
                      onChange={() => setSelectedTier("tier-std")}
                      className="mt-1 accent-[#ff2d78]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-sm text-on-surface">
                          Standard Commercial
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                        Editorial articles, web publication, digital campaign, social media up to 10k impressions.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-sm text-on-surface">
                      {currency === "USD" ? "$39" : "रू 5,100"}
                    </span>
                    <span className="block font-label text-[10px] text-on-surface-variant">Single Seat</span>
                  </div>
                </label>

                {/* Tier 3: Extended Commercial (Recommended) */}
                <label
                  onClick={() => setSelectedTier("tier-ext")}
                  className={`group relative flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedTier === "tier-ext"
                      ? "bg-primary/10 border-primary shadow-md"
                      : "card-surface border-outline-variant/40 hover:border-primary/40"
                  }`}
                >
                  <div className="absolute -top-2.5 right-6 px-2 py-0.5 rounded bg-[#ff2d78] text-white font-label text-[9px] font-bold tracking-widest uppercase shadow-[0_0_10px_#ff2d78]">
                    Most Popular
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="license_tier"
                      checked={selectedTier === "tier-ext"}
                      onChange={() => setSelectedTier("tier-ext")}
                      className="mt-1 accent-[#ff2d78]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-sm text-primary">
                          Extended Commercial
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                        Global print/OOH campaigns, unwatermarked master 50MP 16-bit TIFF, unlimited impressions.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-base text-primary">
                      {currency === "USD" ? "$180" : "रू 24,000"}
                    </span>
                    <span className="block font-label text-[10px] text-on-surface-variant">Global Sync</span>
                  </div>
                </label>

                {/* Tier 4: Limited Fine Art Print */}
                <label
                  onClick={() => setSelectedTier("tier-print")}
                  className={`group relative flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedTier === "tier-print"
                      ? "bg-amber-500/10 border-amber-500 shadow-md"
                      : "card-surface border-outline-variant/40 hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="license_tier"
                      checked={selectedTier === "tier-print"}
                      onChange={() => setSelectedTier("tier-print")}
                      className="mt-1 accent-[#ff2d78]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-semibold text-sm text-on-surface">
                          Limited Fine Art Print
                        </span>
                        <span className="font-label text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-[#ffe04a] font-semibold">
                          Rare (25)
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                        24x36&quot; Hahnemühle Photo Rag 308gsm, signed hologram seal &amp; physical authenticity dossier.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-sm text-amber-700 dark:text-[#ffe04a]">
                      {currency === "USD" ? "$350" : "रू 46,000"}
                    </span>
                    <span className="block font-label text-[10px] text-on-surface-variant">Insured Freight</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons Group */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="w-full py-3.5 px-6 rounded-lg bg-[#ff2d78] hover:bg-[#d81159] text-white font-label text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,45,120,0.3)] hover:shadow-[0_0_25px_rgba(255,45,120,0.45)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {addedToast ? "check_circle" : "shopping_bag"}
                  </span>
                  <span>
                    {addedToast
                      ? "Added to Collection Cart!"
                      : `Add License to Cart • ${
                          currency === "USD"
                            ? selectedTier === "tier-free"
                              ? "Free"
                              : selectedTier === "tier-std"
                              ? "$39"
                              : selectedTier === "tier-ext"
                              ? "$180"
                              : "$350"
                            : selectedTier === "tier-free"
                            ? "Free"
                            : selectedTier === "tier-std"
                            ? "रू 5,100"
                            : selectedTier === "tier-ext"
                            ? "रू 24,000"
                            : "रू 46,000"
                        }`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="w-full py-3 px-6 rounded-lg bg-[#008769] hover:bg-[#007056] text-white dark:bg-[#113420] dark:text-[#00ffcc] dark:hover:bg-[#163d27] font-label text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all border border-[#00ffcc]/30 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">bolt</span>
                  Instant Checkout via Stripe • eSewa • Khalti
                </button>

                <button
                  type="button"
                  onClick={handleFreeDownload}
                  className="w-full py-2.5 px-6 rounded-lg card-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-outline-variant/30 font-medium"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  {downloadSuccess
                    ? "Layout Preview Sent To Vault!"
                    : "Download Free Watermarked Layout Preview (1400px)"}
                </button>
              </div>

              {/* Trust Badges & Delivery Verification */}
              <div className="pt-2 flex flex-col gap-3 card-surface p-4 rounded-xl border border-outline-variant/30">
                <div className="flex items-center justify-between text-[11px] font-label text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-secondary">verified_user</span>
                    Signed Cloudflare R2 Vault Link
                  </span>
                  <span className="text-secondary font-mono font-medium">Instant Delivery</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-label font-bold text-[10px] tracking-wider text-on-surface uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/40">
                      STRIPE
                    </span>
                    <span className="font-label font-bold text-[10px] tracking-wider text-[#3d8329] dark:text-[#60bb46] bg-[#60bb46]/15 px-2 py-0.5 rounded border border-[#60bb46]/30">
                      eSewa
                    </span>
                    <span className="font-label font-bold text-[10px] tracking-wider text-[#7e22ce] dark:text-[#c084fc] bg-[#a855f7]/15 px-2 py-0.5 rounded border border-[#a855f7]/30">
                      Khalti
                    </span>
                  </div>
                  <span className="font-label text-[10px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">lock</span> 256-bit Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical EXIF Deep-Dive Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_currentColor]" />
              <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-on-surface">
                Field Capture Metadata (EXIF)
              </h2>
            </div>
            <span className="font-label text-xs uppercase tracking-widest text-secondary font-medium">
              Sensor Verified • Untouched RAW Optics
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Camera Body</span>
              <span className="font-headline font-semibold text-sm text-on-surface">{liveProduct?.camera || profile.exif.camera}</span>
              <span className="font-label text-[10px] text-secondary font-medium">{profile.exif.sensor}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Glass Optics</span>
              <span className="font-headline font-semibold text-sm text-on-surface truncate" title={liveProduct?.lens || profile.exif.lens}>
                {liveProduct?.lens || profile.exif.lens}
              </span>
              <span className="font-label text-[10px] text-secondary font-medium">{profile.exif.lensFeature}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Aperture</span>
              <span className="font-headline font-semibold text-sm text-primary">{liveProduct?.aperture || profile.exif.aperture}</span>
              <span className="font-label text-[10px] text-on-surface-variant">{profile.exif.apertureNote}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Shutter Velocity</span>
              <span className="font-headline font-semibold text-sm text-on-surface">{liveProduct?.shutterSpeed || profile.exif.shutter}</span>
              <span className="font-label text-[10px] text-on-surface-variant">{profile.exif.shutterNote}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Sensitivity</span>
              <span className="font-headline font-semibold text-sm text-amber-600 dark:text-[#ffe04a]">
                {liveProduct?.iso ? `ISO ${liveProduct.iso}` : profile.exif.iso}
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">{profile.exif.isoNote}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Metering Mode</span>
              <span className="font-headline font-semibold text-sm text-on-surface">{profile.exif.metering}</span>
              <span className="font-label text-[10px] text-on-surface-variant">{profile.exif.meteringNote}</span>
            </div>

            <div className="card-surface rounded-xl p-4 flex flex-col gap-1 transition-all border border-outline-variant/30 hover:shadow-md">
              <span className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">White Balance</span>
              <span className="font-headline font-semibold text-sm text-on-surface">{profile.exif.wb}</span>
              <span className="font-label text-[10px] text-secondary font-medium">{profile.exif.wbNote}</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Story Behind the Shot & Expedition Journal */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 card-surface rounded-2xl p-8 lg:p-12 relative overflow-hidden border border-outline-variant/30 shadow-lg">
          {/* Ambient corner glow */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Narrative Text */}
          <div className="lg:col-span-8 flex flex-col gap-6 relative z-10">
            <div className="space-y-2">
              <div className="font-label text-xs tracking-widest uppercase text-secondary font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history_edu</span>
                Expedition Dispatch • Bardia Sanctuary
              </div>
              <h2 className="font-headline font-bold text-2xl lg:text-3xl text-on-surface tracking-tight">
                {profile.storyTitle}
              </h2>
            </div>

            <div className="space-y-4 font-body text-sm text-on-surface-variant leading-relaxed">
              {profile.storyParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center font-headline font-bold text-secondary text-sm border border-secondary/30">
                  {naturalistInitials}
                </div>
                <div>
                  <div className="font-headline font-semibold text-xs text-on-surface">
                    {naturalistName}
                  </div>
                  <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                    {naturalistTitle}
                  </div>
                </div>
              </div>
              <div className="font-label text-xs text-on-surface-variant flex items-center gap-2 sm:ml-auto font-medium">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                100% Ethical Certified Encounter
              </div>
            </div>
          </div>

          {/* Expedition Mini Data & Field Stats Card */}
          <div className="lg:col-span-4 flex flex-col gap-4 bg-[#f0f6f2] dark:bg-[#081e13] rounded-xl p-6 shadow-sm justify-between border border-[#d3e2d9] dark:border-outline-variant/30 relative z-10">
            <h3 className="font-headline font-semibold text-xs tracking-widest uppercase text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary">analytics</span>
              Field Dossier Metrics
            </h3>

            {/* Interactive Altitude / Ambient Elevation Chart */}
            {(() => {
              const elevNum = parseInt(profile.metrics.elevation.replace(/[^0-9]/g, "")) || 4200;
              const normElev = Math.min(Math.max((elevNum - 100) / 5400, 0.08), 0.92);
              const peakY = Math.round(36 - normElev * 26);
              const peakX = 150;
              const chartD = `M0 36 Q 40 ${Math.round(36 - normElev * 8)}, 80 ${Math.round(36 - normElev * 16)} T ${peakX} ${peakY} T 200 ${Math.round(peakY + 4)}`;

              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-on-surface-variant">Ambient Telemetry</span>
                    <span className="text-secondary font-semibold">{profile.metrics.ambientTemp} • {elevNum.toLocaleString()}m</span>
                  </div>
                  <svg className="w-full h-12 text-secondary" fill="none" viewBox="0 0 200 40">
                    <path
                      className="drop-shadow-[0_0_6px_currentColor]"
                      d={chartD}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d={`${chartD} L 200 40 L 0 40 Z`}
                      fill="currentColor"
                      fillOpacity="0.08"
                    />
                    <circle className="animate-ping" cx={peakX} cy={peakY} fill="#ff2d78" r="3" />
                    <circle cx={peakX} cy={peakY} fill="#ff2d78" r="3" />
                  </svg>
                </div>
              );
            })()}

            <div className="space-y-3 font-label text-xs">
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Habitat Type</span>
                <span className="text-on-surface font-medium">{liveProduct?.habitat || profile.metrics.habitat}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Elevation</span>
                <span className="text-on-surface font-medium">{profile.metrics.elevation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Subject Status</span>
                <span className="text-on-surface font-medium">{liveProduct?.conservationStatus ? `${displaySpecies} (${liveProduct.conservationStatus})` : profile.metrics.subjectAge}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-on-surface-variant">Distance to Target</span>
                <span className="text-primary font-bold">{profile.metrics.distance}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/10 text-[11px] font-body text-on-surface-variant leading-tight border border-secondary/20">
              {profile.metrics.assignmentNote}
            </div>
          </div>
        </div>
      </section>

      {/* Related Photographs from Bardia Expedition */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-10 pb-24 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-semibold">
                Expedition Archive Sequence
              </span>
              <h2 className="font-headline font-bold text-xl lg:text-2xl text-on-surface">
                Related Photographs from Nepal Expeditions
              </h2>
            </div>
            <Link
              href="/gallery"
              className="text-xs font-label uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1 font-semibold"
            >
              <span>View Full Gallery</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/gallery/the-stare-royal-bengal-tiger"
              className="group flex flex-col card-surface rounded-xl overflow-hidden hover:shadow-xl transition-all border border-outline-variant/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Royal Bengal Tiger portrait in Bardia"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbkzB0KNWUihmxdwg701UklJzOFnQze1yRR4eaBpZ42SOynbZLl8y-lB6KQF13SIwVEfc_k5Fyx2WBgB8fpxgfivt1d2g9-n11eS2LEbKlR4Yg7lIHWjkdKR1Uqr3QTkLNJVgL347Tx3YrP4S6QAMCcWJqYbKitXGzOGh0AJGVvdglGV5a1_6KnPo2Wr6bq2kK51eeOT7UQ9BJYBmXUyY-SrR1bAni38IpnV7KPk5c"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-label uppercase text-[#00ffcc] border border-white/10">
                  Bardia #092
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                  The Stare of the Royal Bengal Tiger
                </h3>
                <p className="font-label text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Panthera tigris</span>
                  <span className="text-on-surface font-semibold">From $39</span>
                </p>
              </div>
            </Link>

            <Link
              href="/gallery/prehistoric-silence-karnali-gharial"
              className="group flex flex-col card-surface rounded-xl overflow-hidden hover:shadow-xl transition-all border border-outline-variant/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Gharial crocodile gliding quietly through turquoise Karnali river water"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo4MuHIAEBBiE6l9rv4boKfIiSIP_XDTMY2iVIA94vjbUm_IhD1q7XDV69JY1Db9XlcmK_J6aNp_yueN7ebwWKxTByww1IYTqEwhw6LDpniPc0mXxJWk7povd7H17TIPkM1JrANYcpRElsoyhQE1xTLsWUzxCzmFvabD3xr1JEv9CLk-VmWzY-JNEoazS6mFT0dVJ3JMW1CBBoXipKp2s7UcQqrb1xpgDslBozMyUs"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-label uppercase text-[#00ffcc] border border-white/10">
                  Bardia #104
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                  Prehistoric Silence — Karnali Gharial
                </h3>
                <p className="font-label text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Gavialis gangeticus</span>
                  <span className="text-on-surface font-semibold">From $39</span>
                </p>
              </div>
            </Link>

            <Link
              href="/gallery/patriarch-sal-canopy"
              className="group flex flex-col card-surface rounded-xl overflow-hidden hover:shadow-xl transition-all border border-outline-variant/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Wild Asian elephant bull charging softly through morning Sal forest dust beams"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7jlsP7FXNmNo-ynVWbU9hfNMFW0NBsOw9LHmpwrb7ms62RCHZBFhz9-U115fHiXcctayIsZKZHb9wRpVAN2cTBv_JchS7WOLAymmBsRrsmSf0xHdqKe918gw0Lb-rmQ0I1z6nL814PIg9i7ktu0kfjLfIOeHhxVhrDHAOS3x0LbhkKqH19exQdHTyQTRNTFjB6pBg-cW9L45n5RrJ8n_aD5l8HjdalLvdUa_VHH40"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-label uppercase text-[#00ffcc] border border-white/10">
                  Bardia #112
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                  Patriarch of the Sal Canopy
                </h3>
                <p className="font-label text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Elephas maximus</span>
                  <span className="text-on-surface font-semibold">From $39</span>
                </p>
              </div>
            </Link>

            <Link
              href="/gallery/snow-leopard-cliff-vigil"
              className="group flex flex-col card-surface rounded-xl overflow-hidden hover:shadow-xl transition-all border border-outline-variant/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/90">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Snow leopard on mountain precipice"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCvu5oUFUOTiYCjzw80uXC-G0Ecc6s64IQFwaLKXAoIDh6O5oR4X0mCe_9tcFVp_1DTFMcr4zFGuaoV9eNM8e4b_8YgZQvq6ShvvvUMMEMTcnrcb0liLAVQIl5psNTOetcPDhz3beot6fhXIEYi87qoxN7BCUMDVIh01kDW7kgL9_BwTrw8hLQ8RJsSQrr2QDw9Y6DB6Kgu67b8qs1kn-HPZFRLT9KUusx5DusjUy5"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-label uppercase text-[#ff2d78] border border-white/10">
                  Dolpo #016
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <h3 className="font-headline font-semibold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                  The Phantom Ridge Vigil
                </h3>
                <p className="font-label text-[11px] text-on-surface-variant flex items-center justify-between">
                  <span>Panthera uncia</span>
                  <span className="text-on-surface font-semibold">From $49</span>
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
