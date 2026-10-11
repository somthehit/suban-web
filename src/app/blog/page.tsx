"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCart } from "@/context/CartContext";

export default function FieldJournalPage() {
  const { addItem } = useCart();
  const { settings } = useSiteSettings();
  const naturalistName = settings.about.naturalistName || "Suban";
  const naturalistTitle = settings.about.title || "Lead Expedition Naturalist • Field Director";
  const portraitUrl = settings.about.portraitUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCmxEoo6k9e5jnPjIakVCGLr5nl_0xxYH3eN-JyjWwP-a_nbWbH3RjrN9uY0frg5r_f5_tz-UxYPoQY6dKXlB9JhwUU5_cMz33_31Q9PW8roY16mZVhTXSQ1lbA8N3frZijtzPUQTp667_IEdXyLfeQ8Qu7_d9f8mqtt78A8l8bgP1mEygFojUz1h6xcOYWLpaCc885_SEDPFPf1grVUaaM5KQrDiurY3ONohFjdnx5";

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeChapter, setActiveChapter] = useState("section-babai-mist");
  const [showPugmarkModal, setShowPugmarkModal] = useState(false);
  const [selectedPrintTier, setSelectedPrintTier] = useState<{
    name: string;
    price: string;
  }>({
    name: "Signed Fine Art Print",
    price: "$350",
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [livePosts, setLivePosts] = useState<any[]>([]);

  const fieldChapters = [
    { id: "section-babai-mist", num: "01", title: "THE BABAI MIST AWAKENING" },
    { id: "section-acoustic-freeze", num: "02", title: "ACOUSTIC FREEZE PHENOMENON" },
    { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
    { id: "section-vector-trajectory", num: "04", title: "TIGER VECTOR TRAJECTORY" },
    { id: "section-anti-poaching", num: "05", title: "ANTI-POACHING DATA SYNC" },
  ];

  const scrollToChapter = (id: string) => {
    setActiveChapter(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const chapterIds = [
      "section-babai-mist",
      "section-optics-telemetry",
      "section-acoustic-freeze",
      "section-vector-trajectory",
      "section-anti-poaching",
    ];

    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 180;
      let current = chapterIds[0];
      for (const id of chapterIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          current = id;
        }
      }
      setActiveChapter(current);
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, []);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setLivePosts(data.posts);
        }
      })
      .catch((err) => console.error("Error loading field journal posts:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(progress, 100));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 4000);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="w-full bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] min-h-screen selection:bg-[#ff2d78] selection:text-white transition-colors duration-200">
      {/* Interactive Sticky Reading Progress Bar */}
      <div className="sticky top-0 sm:top-20 z-40 w-full h-[3px] bg-surface-container dark:bg-[#123822]">
        <div
          className="h-full bg-gradient-to-r from-[#ff2d78] via-secondary to-tertiary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ARTICLE HERO / HEADER COMPONENT */}
      <header className="w-full relative px-6 lg:px-16 pt-8 pb-14 bg-gradient-to-b from-surface-container-low/70 to-background dark:from-[#06170d] dark:to-[#04120a] overflow-hidden">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#ff2d78]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
          {/* Breadcrumb Bar */}
          <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0]">
            <Link className="hover:text-secondary transition-colors" href="/">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link className="hover:text-secondary transition-colors" href="/blog">
              Field Journal
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-[#ff2d78] font-semibold drop-shadow-[0_0_8px_rgba(255,45,120,0.3)]">
              Dispatch #114
            </span>
            <span className="opacity-40">/</span>
            <span className="truncate">Bardia Riverbank</span>
          </nav>

          {/* Category Badges & Reading Meta */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded bg-secondary/15 text-secondary text-xs font-label font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-secondary/25">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Expedition Dispatch • Apex Predators
            </span>
            <span className="px-3 py-1 rounded bg-tertiary/15 text-tertiary text-xs font-label font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-tertiary/25">
              <span className="material-symbols-outlined text-sm">schedule</span>
              14 Min Read
            </span>
            <span className="text-xs font-label text-on-surface-variant dark:text-[#a098b0]/70 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Nov 18, 2024
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface dark:text-[#e8e0f0] leading-[1.1] max-w-5xl mt-2">
            The Stare: Four Hours at the Frozen Riverbank with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface via-[#ff2d78] to-secondary dark:from-[#e8e0f0] dark:via-[#ff2d78] dark:to-[#00ffcc]">
              Panthera Tigris
            </span>
          </h1>

          {/* Standfirst */}
          <p className="font-body text-lg sm:text-xl text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-4xl font-normal">
            Along the limestone shelf of Nepal’s Babai River, morning mist settles like spun zinc over dense elephant grass. In the brittle silence before dawn, sub-zero river condensation froze our shutter mechanisms—until three vertical black stripes emerged from the silver canopy.
          </p>

          {/* Author Attribution Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#ff2d78] to-secondary shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover rounded-full"
                  alt={`${naturalistName} portrait`}
                  src={portraitUrl}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-semibold text-sm text-on-surface dark:text-[#e8e0f0]">
                  {naturalistName}
                </span>
                <span className="font-label text-xs uppercase tracking-wider text-secondary font-semibold">
                  {naturalistTitle}
                </span>
              </div>
            </div>

            {/* Social Share Pills */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded card-surface hover:bg-surface-container text-xs font-label uppercase tracking-wider text-on-surface dark:text-[#e8e0f0] transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-base text-[#ff2d78]">share</span>
                <span>{copiedShare ? "Link Copied!" : "Share Dispatch"}</span>
              </button>
              <button
                type="button"
                className="p-2 rounded card-surface hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors border border-outline-variant/30 shadow-sm"
                title="Bookmark dispatch"
              >
                <span className="material-symbols-outlined text-base">bookmark</span>
              </button>
            </div>
          </div>

          {/* High-Altitude Telemetry Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 card-surface p-4 rounded-xl shadow-sm border border-outline-variant/30">
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-secondary">explore</span> GPS Waypoint
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider">
                28°23′14″N 81°18′02″E
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-[#ff2d78]">landscape</span> Elevation
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider">
                152m AMSL (Bardia Basin)
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-tertiary">device_thermostat</span> Temperature
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider">
                9.4°C / 48.9°F (Mist Drop)
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-secondary">graphic_eq</span> Dawn Acoustics
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider">
                32 dB (Ambient Forest)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN EDITORIAL CONTENT & ASYMMETRIC SIDEBAR GRID */}
      <main className="w-full max-w-6xl mx-auto px-6 lg:px-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Primary Editorial Narrative Column (Span 8) */}
          <article className="lg:col-span-8 flex flex-col gap-8 text-[#0c1f15] dark:text-[#e8e0f0]">
            {/* Opening Editorial Paragraph with Dropcap */}
            <div
              id="section-babai-mist"
              className="scroll-mt-28 font-body text-base sm:text-lg leading-relaxed text-[#142d1f] dark:text-[#e8e0f0]/90 space-y-6"
            >
              <p className="first-letter:font-headline first-letter:text-6xl first-letter:font-extrabold first-letter:text-[#ff2d78] first-letter:float-left first-letter:mr-4 first-letter:leading-none first-letter:drop-shadow-[0_0_10px_rgba(255,45,120,0.3)] text-[#142d1f] dark:text-[#e8e0f0]">
                T<span className="lowercase">HE</span> FROST DOES NOT MELT in Bardia until the winter sun clears the Sal canopy past nine o&apos;clock. By four in the morning, our skin had stopped registering sensation where cold aluminum lenses rested against wool gloves. Downriver, where the Babai braids into shallow gravel islands, the water registered barely two degrees above freezing. There is no warmth here, only the sharp, mineral tang of wet silt and the continuous, low rumble of unseen rapids.
              </p>
              <p className="text-[#142d1f] dark:text-[#e8e0f0]/90">
                Tracking Bengal tigers in the lowland Terai differs entirely from the savanna stalk. Visibility is compressed to twenty meters by cane stalks taller than an elephant. When a four-hundred-pound apex predator decides to drink, you do not hear footfalls; you hear the sudden, terrified freeze of spotted deer alarm calls cut short, followed by an unnatural, crushing vacuum of acoustic silence.
              </p>
            </div>

            {/* Pull Quote Component */}
            <blockquote className="my-4 p-8 rounded-xl bg-secondary/10 dark:bg-[#0d2b1a] relative overflow-hidden shadow-sm border border-secondary/25">
              <div className="absolute -right-6 -bottom-8 font-headline font-black text-9xl text-secondary/10 dark:text-[#143d25]/40 pointer-events-none select-none">
                “
              </div>
              <p className="font-headline text-lg sm:text-xl font-bold tracking-tight text-secondary leading-snug">
                “We do not stage moments in the wild; we endure the freeze, the damp, and weeks of absolute stillness. When the tiger turns its ocular gaze on your glass, time ceases to exist.”
              </p>
              <cite className="block font-label text-xs uppercase tracking-widest text-[#3b5043] dark:text-[#a098b0] mt-4 not-italic font-semibold">
                — Dispatch Log Entry, 05:42 NPT • Hidden Blind Alpha
              </cite>
            </blockquote>

            {/* FEATURED HERO IMAGE BREAKOUT */}
            <figure className="w-full flex flex-col gap-3 my-2">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden card-surface shadow-2xl group border border-outline-variant/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Royal Bengal Tiger in misty Babai river"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCpf5U2dkfjFHjrm7Ar0JWd4ol2oSojuqHRw0SsROkoapkBkLZW3d-8oTSRbUtcR8eWq7mpTDECFIWf6sHyIoZ7UnVSpnaPA9FgbEWamuorPFPUeGv7rjOyMKI4kaaR6mUWA0vQBhkntUksogD9j8uXjVMgF3pU9jHdEMn7LEN96IXOs6dVA-dj0Ou5FNGIPSMZ1vgqMN_0n3ZrOBQOc4KAEYDdOSZaxRTtm0Mw2Sd"
                />
                {/* Encrypted Watermark Overlay Protection */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_currentColor] animate-pulse" />
                  <span className="font-label text-[10px] tracking-widest uppercase text-white font-semibold">
                    Suban Encrypted Archive • Frame #TK-8820
                  </span>
                </div>
              </div>
              <figcaption className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-label text-on-surface-variant dark:text-[#a098b0]/80 px-1">
                <span>FIGURE 1.1: Dominant Male Bengal Tiger ‘Sikari’ crossing gravel bar at sunrise.</span>
                <span className="text-tertiary font-semibold">Verified Non-Bait Encounter • 100% Wilderness Origin</span>
              </figcaption>
            </figure>

            {/* CAMERA & OPTICS FIELD TELEMETRY CALLOUT */}
            <div
              id="section-optics-telemetry"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex items-center justify-between pb-3 bg-surface-container/50 dark:bg-[#0d2b1a]/50 -mx-6 -mt-6 p-4 px-6 rounded-t-xl border-b border-outline-variant/30">
                <div className="flex items-center gap-2 text-[#ff2d78] font-headline text-sm font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Optics &amp; Field Telemetry
                </div>
                <span className="font-label text-xs text-on-surface-variant dark:text-[#a098b0] uppercase tracking-widest font-semibold">
                  Nikon Professional DPS
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Body Rig</span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">Nikon Z9 Flagship (Dual CFexpress)</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Primary Glass</span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">Nikkor Z 400mm f/2.8 TC VR S</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Effective Focal</span>
                  <span className="font-body text-sm font-semibold text-secondary">560mm (Internal 1.4x Active)</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Exposure Values</span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">1/1600s • f/4.0 • ISO 3200</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Shutter Profile</span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">Silent Electronic (0.0dB)</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">AF Algorithm</span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">3D Matrix Animal Eye-AF</span>
                </div>
              </div>
            </div>

            {/* Secondary Narrative Paragraphs */}
            <div className="font-body text-base sm:text-lg leading-relaxed text-[#142d1f] dark:text-[#e8e0f0]/90 space-y-6">
              <p className="text-[#142d1f] dark:text-[#e8e0f0]/90">
                At 05:48 NPT, the tiger stepped into the river bed without disturbing a single rounded pebble. The reflective surface of the slow eddy caught the bronze tint of his flank. For 240 seconds, the beast remained frozen in our viewscreen, ears swiveling to track the high canopy langur calls on the opposite bank.
              </p>
              <p className="text-[#142d1f] dark:text-[#e8e0f0]/90">
                With the internal teleconverter engaged, bringing us to an effective 560mm focal length at f/4, the moisture droplets clinging to his guard whiskers were rendered in razor-sharp microscopic detail against the soft blue blur of morning fog. Not a breath was drawn inside the camouflaged blind until he turned upstream and disappeared into the high elephant grass.
              </p>
            </div>

            {/* EMBEDDED AMBIENT SOUNDSCAPE PLAYER */}
            <div
              id="section-acoustic-freeze"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-label text-xs uppercase tracking-widest text-secondary flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_currentColor]" />
                    Binaural Field Audio
                  </span>
                  <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] mt-1">
                    Babai River Dawn Soundscape (Ambient 3D Audio)
                  </h3>
                </div>
                <span className="font-label text-xs text-on-surface-variant self-start sm:self-auto bg-surface-container px-2.5 py-1 rounded border border-outline-variant/20">
                  04:15 AM • 4m 20s
                </span>
              </div>

              {/* Audio Waveform Graphic Mockup */}
              <div className="w-full h-14 bg-surface-container-low dark:bg-[#030d07] rounded-lg px-4 flex items-center justify-between gap-1 overflow-hidden border border-outline-variant/30">
                {[3, 6, 8, 12, 7, 4, 10, 11, 6, 4, 8, 12, 9, 5, 7, 10, 4, 6, 3, 8, 11, 6, 2, 5, 9, 4, 7, 3].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-300 ${
                        i % 3 === 0
                          ? "bg-[#ff2d78]"
                          : isPlayingAudio
                          ? "bg-secondary animate-pulse"
                          : "bg-secondary/60"
                      }`}
                      style={{
                        height: isPlayingAudio ? `${Math.min(h * 3.5, 48)}px` : `${h * 2.5}px`,
                      }}
                    />
                  )
                )}
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className={`w-10 h-10 rounded-full bg-[#ff2d78] hover:bg-[#b3004e] text-white font-bold flex items-center justify-center transition-all ${
                      isPlayingAudio
                        ? "shadow-[0_0_16px_rgba(0,255,204,0.4)]"
                        : "shadow-[0_0_12px_rgba(255,45,120,0.4)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isPlayingAudio ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  <div className="text-xs font-label text-on-surface-variant flex gap-1">
                    <span className="text-secondary font-semibold">
                      {isPlayingAudio ? "02:45" : "01:14"}
                    </span>{" "}
                    / <span>04:20</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm text-secondary">volume_up</span>
                  <div className="w-20 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-secondary" />
                  </div>
                  <span className="font-label text-[11px] uppercase tracking-wider text-secondary font-semibold">
                    32-Bit Float Ambisonics
                  </span>
                </div>
              </div>
            </div>

            {/* FIELD MAP & GPS TRANSECT VISUAL SCHEMATIC */}
            <div
              id="section-vector-trajectory"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-xs">radar</span> Topographic Schematic
                  </span>
                  <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] mt-1">
                    Transect 4B: Babai River Confluence Hide
                  </h3>
                </div>
                <span className="font-label text-xs text-on-surface-variant font-medium">Scale: 1:25,000 Expedition Grid</span>
              </div>

              {/* Static Map / Schematic Component with data-location */}
              <div
                className="w-full h-64 bg-cover bg-center rounded-lg relative overflow-hidden flex flex-col justify-end p-4 shadow-inner border border-outline-variant/30"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGvlNdScL8Eaw68MmkUWl0yQirH3gbqyMWIYJr1Pmz_59DqSKiPqtC5ap4fV0MLk4eAwDqcRLG4OCT-CwpHJx7L8RTMMzNNMz18alO8AOdzn8e34LIafZhyzTZAr7ZCtAb6ITBc79MDttcg9F87EL94D1n2V8UXRJNmC9gNKqt9sP_mGZcajvsAgtz8j7Zl7b22Ub7G7y0v9oqDNdFKhNvlsR-OAcg-IGBjwlh1Pch')",
                }}
              >
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

                {/* SVG Map Overlay Over Data Location */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" fill="none" viewBox="0 0 600 240">
                  <path
                    d="M 0,60 L 600,60 M 0,120 L 600,120 M 0,180 L 600,180 M 150,0 L 150,240 M 300,0 L 300,240 M 450,0 L 450,240"
                    stroke="#ffffff"
                    opacity="0.2"
                    strokeDasharray="4 4"
                    strokeWidth="0.7"
                  />
                  {/* River Vector Flow */}
                  <path
                    d="M 20,40 Q 180,110 320,100 T 580,180"
                    opacity="0.85"
                    stroke="#00ffcc"
                    strokeWidth="2.5"
                  />
                  {/* Tiger Crossing Trajectory */}
                  <path
                    d="M 380,20 Q 360,110 320,190"
                    stroke="#ff2d78"
                    strokeDasharray="6 3"
                    strokeWidth="2"
                  />
                </svg>

                {/* Coordinate Waypoint Badges */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/85 p-3 rounded-lg backdrop-blur border border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]" />
                    <span className="font-label text-xs text-white font-medium">
                      Blind Alpha Pos: 28°23′14″N
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff2d78] shadow-[0_0_8px_#ff2d78]" />
                    <span className="font-label text-xs text-white font-medium">
                      Apex Sighting Vector: 194° SSW
                    </span>
                  </div>
                  <div className="font-label text-xs text-[#ffe04a] font-medium">Distance: 48.6m Direct</div>
                </div>
              </div>
            </div>

            {/* INLINE LUXURY PRINT ACQUISITION & LICENSING CALLOUT */}
            <section className="rounded-xl card-surface p-6 sm:p-8 shadow-md relative overflow-hidden border border-outline-variant/30">
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Print Frame Mockup Thumbnail */}
                <div className="w-full md:w-44 aspect-[4/3] rounded-lg overflow-hidden bg-black/60 shrink-0 shadow-md relative group border border-outline-variant/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover"
                    alt="Gallery framed print mockup"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkIjaJgW6V2K5nhQw4YsdxkZwtamfhDsLNdCTVS8ZA2wRSczAvDlhCqvgXSzvHHJ6_wDbGUNbMzmKjLXzqZrlVR7N4B_-kklNEZypcUxjrhpRVCvtpCrMoLDz-vF_5Gx17Y5I50xg6OqSFB2OcpME5MxluDo_FX5F0pRfNHzqE1eVIERY6hg0nxdO6wnUB4vdqxGBmcHX8a6jCDcrOXO-Kug7WIsNhCtHZCPkpRIS4"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 font-label text-[10px] text-[#ffe04a] uppercase tracking-wider font-semibold">
                    Edition 04 / 25
                  </div>
                </div>

                {/* Licensing Details & Quick Selector */}
                <div className="flex flex-col flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#ff2d78]/15 text-[#ff2d78] font-label text-[11px] font-bold uppercase tracking-wider">
                      Collector Release
                    </span>
                    <span className="text-xs font-label text-on-surface-variant">
                      Archival Museum Rag / Hahnemühle
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface dark:text-[#e8e0f0]">
                    Acquire Limited Fine Art Print or Commercial RAW License
                  </h3>
                  <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                    Hand-signed, embossed with digital cryptographic provenance. 100% archival pigment print rated for 150+ years lightfastness.
                  </p>

                  {/* Tier Selector Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPrintTier({
                          name: "Personal RAW",
                          price: "$39",
                        })
                      }
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedPrintTier.name === "Personal RAW"
                          ? "bg-secondary/15 border-secondary text-secondary shadow-sm"
                          : "card-surface border-outline-variant/30 hover:bg-surface-container"
                      }`}
                    >
                      <div className="font-label text-[10px] uppercase text-on-surface-variant">Personal RAW</div>
                      <div className="font-headline text-xs font-bold text-on-surface dark:text-[#e8e0f0]">$39 USD</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPrintTier({
                          name: "Commercial Editorial",
                          price: "$180",
                        })
                      }
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedPrintTier.name === "Commercial Editorial"
                          ? "bg-secondary/15 border-secondary text-secondary shadow-sm"
                          : "card-surface border-outline-variant/30 hover:bg-surface-container"
                      }`}
                    >
                      <div className="font-label text-[10px] uppercase text-on-surface-variant">Commercial</div>
                      <div className="font-headline text-xs font-bold text-on-surface dark:text-[#e8e0f0]">$180 USD</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedPrintTier({
                          name: "Signed Fine Art Print",
                          price: "$350",
                        })
                      }
                      className={`p-2.5 rounded-lg text-left transition-all border ${
                        selectedPrintTier.name === "Signed Fine Art Print"
                          ? "bg-secondary/15 border-secondary text-secondary shadow-sm"
                          : "card-surface border-outline-variant/30 hover:bg-surface-container"
                      }`}
                    >
                      <div className="font-label text-[10px] uppercase text-secondary font-semibold">Signed Print</div>
                      <div className="font-headline text-xs font-bold text-on-surface dark:text-[#e8e0f0]">$350 USD</div>
                    </button>
                  </div>

                  {/* CTA Checkout */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-label text-on-surface-variant">Selected:</span>
                      <span className="font-headline font-bold text-sm text-secondary">
                        {selectedPrintTier.name} ({selectedPrintTier.price} USD)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const numericPrice = parseFloat(selectedPrintTier.price.replace(/[^0-9.]/g, "")) || 350;
                        addItem(
                          {
                            id: `blog-the-stare-tiger-${selectedPrintTier.name}`,
                            slug: "the-stare-royal-bengal-tiger",
                            title: "The Stare of the Royal Bengal Tiger",
                            subtitle: selectedPrintTier.name,
                            species: "Panthera tigris tigris",
                            format: selectedPrintTier.name.includes("Print") ? "print" : "digital",
                            image:
                              "https://lh3.googleusercontent.com/aida-public/AB6AXuALSxvxkanTm5hdhOIHEVwLmLga67mLa5zKcyIwFa0uNrQWfgLiyEMQ-J6KY1tPSpnRb7VArKx-r7GKbeg7wvUy6VCKT8NX9I8ihgNTLjDlwOGLBtRaRTLJAQFErbS3e6DPK0wPFlm0J0B3daWnyVdy2FrgH5bF141BkRqk3HFb-TYSuzQ2G2xeS3nLOw4RH1_EOZDTG-9ACRj5ShW3gDsURFNnciHkrb0ZJxAYovEJ",
                            priceUsd: numericPrice,
                            priceNpr: Math.round(numericPrice * 133.33),
                          },
                          true
                        );
                      }}
                      className="px-5 py-2.5 rounded-lg bg-[#ff2d78] hover:bg-[#b3004e] text-white font-label text-xs uppercase tracking-wider font-semibold transition-all shadow-[0_0_16px_rgba(255,45,120,0.3)] text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">shopping_bag</span>
                      <span>Add to Cart • {selectedPrintTier.price}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ETHICS & CONSERVATION PROTOCOL DISCLOSURE */}
            <div
              id="section-anti-poaching"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <h4 className="font-headline font-semibold text-sm uppercase tracking-wider">
                  Ethical Wildlife Photography Protocol
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-body text-on-surface-variant">
                <div className="flex flex-col gap-1 p-3 rounded bg-surface-container/50 dark:bg-[#0a2416] border border-outline-variant/20">
                  <span className="font-label font-bold text-on-surface dark:text-[#e8e0f0] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-secondary">block</span> Zero Infiltration
                  </span>
                  <span>Strict non-invasive blinds. No acoustic playback, baiting, or tree platforms were utilized.</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded bg-surface-container/50 dark:bg-[#0a2416] border border-outline-variant/20">
                  <span className="font-label font-bold text-on-surface dark:text-[#e8e0f0] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#ff2d78]">eco</span> Non-Disruptive Drone Ban
                  </span>
                  <span>100% aerial drone exclusion applied. Compliant with Bardia National Park buffer-zone laws.</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded bg-surface-container/50 dark:bg-[#0a2416] border border-outline-variant/20">
                  <span className="font-label font-bold text-on-surface dark:text-[#e8e0f0] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-tertiary">savings</span> 10% Direct Royalty
                  </span>
                  <span>10% of all image sales from this dispatch go directly to Community Anti-Poaching Units (CBAPU).</span>
                </div>
              </div>
            </div>
          </article>

          {/* ASYMMETRIC STICKY EDITORIAL SIDEBAR (Span 4) */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            {/* Field Journal Table of Contents */}
            <div className="rounded-xl card-surface p-6 shadow-sm space-y-4 sticky top-28 border border-outline-variant/30">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <span className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface dark:text-[#e8e0f0]">
                  Field Index
                </span>
                <span className="font-label text-[10px] text-secondary font-semibold">Dispatch #114</span>
              </div>
              <ul className="space-y-1.5 font-label text-xs uppercase tracking-wider text-on-surface-variant">
                {fieldChapters.map((ch) => {
                  const isActive = activeChapter === ch.id;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => scrollToChapter(ch.id)}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg transition-all text-left cursor-pointer group ${
                          isActive
                            ? "text-secondary font-semibold bg-secondary/10 dark:bg-secondary/15"
                            : "hover:text-[#ff2d78] hover:bg-surface-container/60 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={`font-mono text-xs ${
                              isActive
                                ? "text-secondary font-bold"
                                : "opacity-40 group-hover:text-[#ff2d78]"
                            }`}
                          >
                            {ch.num}
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </span>
                        {isActive ? (
                          <span className="material-symbols-outlined text-xs text-secondary animate-pulse shrink-0">
                            play_arrow
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-xs opacity-60 group-hover:translate-x-1 group-hover:text-[#ff2d78] transition-all shrink-0">
                            arrow_forward
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Expedition Weather Gauge Minimal */}
              <div className="pt-4 space-y-3 border-t border-outline-variant/30">
                <span className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant block font-semibold">
                  Barometric Stability
                </span>
                <div className="flex items-center justify-between text-xs font-label">
                  <span className="text-on-surface dark:text-[#e8e0f0] font-bold">1018 hPa</span>
                  <span className="text-secondary font-semibold">High Density Cold Air</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-gradient-to-r from-[#ff2d78] to-secondary" />
                </div>
              </div>

              {/* Secondary Image Mini-Break in Sidebar */}
              <div className="pt-2">
                <div
                  onClick={() => setShowPugmarkModal(true)}
                  className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/80 relative group border border-outline-variant/30 cursor-pointer"
                  title="Click to inspect specimen detail"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Pugmark of Bengal tiger"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmCzzZHDROC3wAR6IEJUEDF3bdfWTuCO6O6rORLrOwr12we_20PLHLd5naBsTKd_0kKMbdbJ9AcLZduYg3TPFdL2yZbXlVLmDFOM-z4psmGJQ0t50ylFWw1XnHpdLb9KDibnuGPxGykF-d9Bao2NxdPE_dXcloGYjjLxrsbHQa8JUiZrd6kdbn6yWDUrvpDkGCOZm_IyFe2lIBQZxpGQ2p8T703NCSzwsb1wdlMeJz"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 text-secondary text-[10px] font-label uppercase tracking-widest flex items-center gap-1 border border-secondary/40 shadow-sm">
                      <span className="material-symbols-outlined text-xs">zoom_in</span> Inspect Specimen
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 font-label text-[10px] text-white uppercase font-semibold border border-white/10">
                    Pugmark: 14.8cm Width
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* RELATED FIELD DISPATCHES HUB GRID */}
      <section className="w-full bg-[#edf3ef] dark:bg-[#030d07] py-20 px-6 lg:px-16 border-t border-outline-variant/30 transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#ff2d78] shadow-[0_0_6px_#ff2d78]" /> Archive Continuum
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface dark:text-[#e8e0f0] mt-1">
                More Dispatches from the Field
              </h2>
            </div>
            <Link
              className="font-label text-xs uppercase tracking-widest text-secondary hover:text-on-surface flex items-center gap-1.5 transition-colors font-semibold"
              href="/collections"
            >
              View All 42 Field Journals <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* 3-Column Editorial Dispatch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {livePosts.length > 0 ? (
              livePosts.map((post: any, idx: number) => (
                <article
                  key={post.id || idx}
                  className="flex flex-col rounded-xl card-surface overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30 group"
                >
                  <Link href={`/blog/${post.slug}`} className="aspect-[16/10] w-full overflow-hidden bg-black/60 relative block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={post.title}
                      src={
                        post.coverImage ||
                        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85"
                      }
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur font-label text-[10px] uppercase text-secondary font-semibold">
                      {post.categoryName || "Field Record • Live DB"}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-label text-[10px] text-tertiary font-semibold">
                      {post.readingTimeMinutes || 6} Min Read
                    </div>
                  </Link>
                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-2">
                      <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Dispatch #{String(idx + 101).padStart(3, "0")} • {post.locationLabel || "Nepal"}
                      </span>
                      <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] group-hover:text-[#ff2d78] transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs font-label text-on-surface-variant">
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Recent"}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-secondary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Read Report →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              [1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl card-surface border border-outline-variant/30 animate-pulse h-80 flex flex-col justify-between p-4">
                  <div className="w-full h-40 bg-surface-container dark:bg-[#12301f] rounded-lg" />
                  <div className="space-y-2 pt-3">
                    <div className="h-4 bg-surface-container dark:bg-[#12301f] rounded w-3/4" />
                    <div className="h-3 bg-surface-container dark:bg-[#12301f] rounded w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DISPATCH NEWSLETTER & SUBSCRIBER TELEMETRY CARD */}
          <div className="rounded-2xl card-surface dark:bg-[#0a2416] p-8 lg:p-12 relative overflow-hidden shadow-xl border border-outline-variant/30">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#ff2d78]/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="max-w-2xl space-y-4 relative z-10">
              <span className="font-label text-xs uppercase tracking-widest text-secondary flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-sm">satellite_alt</span> Encrypted Field Wire
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface dark:text-[#e8e0f0]">
                Get Monthly Field Dispatches &amp; High-Res 4K Wallpapers Directly in Your Inbox
              </h3>
              <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                Early previews of limited print editions, unreleased nocturnal sensor footage, and verified expedition GPS logs. No commercial spam.
              </p>

              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <div className="relative w-full sm:flex-1">
                  <input
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full card-surface px-4 py-3 rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary shadow-inner border border-outline-variant/40"
                    placeholder="naturalist@institution.org"
                    type="email"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant text-base">
                    mail
                  </span>
                </div>
                <button
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-secondary text-[#001a1a] font-label text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-all shadow-md shrink-0"
                  type="submit"
                >
                  {newsletterSubscribed ? "Subscribed!" : "Subscribe to Dispatches"}
                </button>
              </form>

              <div className="flex items-center gap-4 text-[11px] font-label text-on-surface-variant/80 dark:text-[#a098b0]/70 pt-1">
                <span>• 1 Dispatch / Month</span>
                <span>• Direct Raw Exif Logs</span>
                <span>• One-Click Unsubscribe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pugmark Specimen Inspect Modal */}
      {showPugmarkModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowPugmarkModal(false)}
        >
          <div
            className="relative max-w-2xl w-full card-surface rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] w-full bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmCzzZHDROC3wAR6IEJUEDF3bdfWTuCO6O6rORLrOwr12we_20PLHLd5naBsTKd_0kKMbdbJ9AcLZduYg3TPFdL2yZbXlVLmDFOM-z4psmGJQ0t50ylFWw1XnHpdLb9KDibnuGPxGykF-d9Bao2NxdPE_dXcloGYjjLxrsbHQa8JUiZrd6kdbn6yWDUrvpDkGCOZm_IyFe2lIBQZxpGQ2p8T703NCSzwsb1wdlMeJz"
                alt="Pugmark specimen high resolution"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setShowPugmarkModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-black/85 text-[#00ffcc] font-label text-xs uppercase font-bold tracking-wider border border-[#00ffcc]/30">
                Pugmark: 14.8cm Width • Dominant Male Bengal Tiger
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-sm text-on-surface dark:text-[#e8e0f0]">
                  Field Specimen Telemetry #PG-114
                </span>
                <span className="font-label text-xs text-secondary font-semibold">
                  Babai River Transect 4B
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Fresh imprint measured in wet alluvial silt. Pad width of 14.8cm indicates an adult male tiger in peak physical prime, estimated weight 220–240kg. Directional stride vector points 194° SSW toward deep riverine canopy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
