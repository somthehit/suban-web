"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";


interface ChapterItem {
  id: string;
  num: string;
  title: string;
}

interface EthicsPoint {
  title: string;
  desc: string;
  icon: string;
  color: string;
}

interface PostMetadata {
  dispatchNumber: string;
  chapters: ChapterItem[];
  waypoint: string;
  elevation: string;
  temperature: string;
  acoustics: string;
  baroHpa: string;
  baroDesc: string;
  baroProgress: string;
  specimenImage: string;
  specimenBadge: string;
  specimenTitle: string;
  specimenLocation: string;
  specimenNotes: string;
  pullQuote: string;
  pullQuoteCite: string;
  bodyRig: string;
  primaryGlass: string;
  effectiveFocal: string;
  exposure: string;
  shutterProfile: string;
  afAlgorithm: string;
  audioTitle: string;
  audioTime: string;
  ethicsPoints: EthicsPoint[];
}

function getPostMetadata(post: any, naturalistName: string = "Suban"): PostMetadata {
  const text = `${post?.slug || ""} ${post?.title || ""} ${post?.categoryName || ""} ${post?.excerpt || ""} ${post?.locationLabel || ""}`.toLowerCase();

  const isAvian =
    text.includes("monal") ||
    text.includes("danphe") ||
    text.includes("bird") ||
    text.includes("avian") ||
    text.includes("lophophorus") ||
    text.includes("chromatic-crown") ||
    text.includes("feather") ||
    text.includes("rhododendron");

  const isSnowLeopard =
    text.includes("snow-leopard") ||
    text.includes("snow leopard") ||
    text.includes("phantom") ||
    text.includes("dolpo") ||
    text.includes("mustang") ||
    text.includes("uncia") ||
    text.includes("scree") ||
    text.includes("shey");

  const isMegaherbivore =
    text.includes("rhino") ||
    text.includes("rhinoceros") ||
    text.includes("unicornis") ||
    text.includes("elephant") ||
    text.includes("elephas");

  const isRedPanda =
    text.includes("red-panda") ||
    text.includes("red panda") ||
    text.includes("panda") ||
    text.includes("ailurus") ||
    text.includes("ilam");

  const isTiger =
    text.includes("tiger") ||
    text.includes("bengal") ||
    text.includes("tigris") ||
    text.includes("bardia") ||
    text.includes("babai") ||
    text.includes("sal-mist") ||
    text.includes("stare");

  if (isAvian) {
    return {
      dispatchNumber: "082",
      chapters: [
        { id: "section-babai-mist", num: "01", title: "RHODODENDRON RIDGE ASCENT" },
        { id: "section-acoustic-freeze", num: "02", title: "BIO-ACOUSTIC MATING CALLS" },
        { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
        { id: "section-vector-trajectory", num: "04", title: "IRIDESCENT FLIGHT VECTOR" },
        { id: "section-anti-poaching", num: "05", title: "HIGH-ALTITUDE HABITAT ETHICS" },
      ],
      waypoint: post?.locationLabel ? `28°12′58″N • ${post.locationLabel}` : "28°12′58″N 85°30′12″E",
      elevation: "3,850m AMSL (Langtang Alpine)",
      temperature: "-3.2°C / 26.2°F (Alpine Frost)",
      acoustics: "24 dB (Subalpine Wind)",
      baroHpa: "648 hPa",
      baroDesc: "High Altitude Subalpine Air",
      baroProgress: "48%",
      specimenImage: post?.coverImage || "https://images.unsplash.com/photo-1618886614638-80e3c15cd819?auto=format&fit=crop&w=1200&q=85",
      specimenBadge: "Plumage: Iridescent Crest",
      specimenTitle: "High-Alpine Specimen • Himalayan Monal (Lophophorus impejanus)",
      specimenLocation: post?.locationLabel || "Langtang National Park Alpine Zone",
      specimenNotes:
        "Spectral reflectance of male Monal crest feathers reveals crystalline barbule structures scattering alpenglow into nine vivid iridescent hues across emerald, copper, and sapphire gradients.",
      pullQuote:
        "“To witness the Danphe take flight across snowy seracs is to watch liquid prismatic gemstones scattered across the high Himalayas.”",
      pullQuoteCite: `— Field Log Entry • ${naturalistName} Alpine Avian Survey`,
      bodyRig: "Canon EOS R5 Flagship (Dual CFexpress)",
      primaryGlass: "Canon RF 600mm f/4L IS USM",
      effectiveFocal: "600mm (Prime Super-Telephoto)",
      exposure: "1/3200s • f/4.0 • ISO 500",
      shutterProfile: "Electronic High-Speed (20 fps)",
      afAlgorithm: "Deep Learning Bird-Eye Tracking AF",
      audioTitle: `${post?.title || "Himalayan Monal"} Subalpine Dawn Soundscape`,
      audioTime: "05:40 AM • 3m 45s",
      ethicsPoints: [
        {
          title: "Non-Intrusive Standoff",
          desc: "Maintained a strict 60m standoff from foraging subalpine slopes to avoid flushing nesting pairs.",
          icon: "nature",
          color: "secondary",
        },
        {
          title: "Alpine Flora Protection",
          desc: "Zero disruption to endangered high-altitude rhododendron and juniper nesting thickets.",
          icon: "eco",
          color: "#ff2d78",
        },
        {
          title: "10% Avian Conservation",
          desc: "10% of fine art licensing revenues directly fund Himalayan high-altitude ornithological surveys.",
          icon: "savings",
          color: "tertiary",
        },
      ],
    };
  }

  if (isSnowLeopard) {
    return {
      dispatchNumber: "126",
      chapters: [
        { id: "section-babai-mist", num: "01", title: "THE 4,500M SCREE ASCENT" },
        { id: "section-acoustic-freeze", num: "02", title: "SUB-ZERO ACOUSTIC SILENCE" },
        { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
        { id: "section-vector-trajectory", num: "04", title: "GHOST ENCOUNTER VECTOR" },
        { id: "section-anti-poaching", num: "05", title: "TRANS-HIMALAYAN CONSERVATION" },
      ],
      waypoint: post?.locationLabel ? `29°18′22″N • ${post.locationLabel}` : "29°18′22″N 82°54′10″E",
      elevation: "4,620m AMSL (Shey Gompa Scree)",
      temperature: "-18.5°C / -1.3°F (Gale Chill)",
      acoustics: "18 dB (Cryogenic Silence)",
      baroHpa: "582 hPa",
      baroDesc: "Cryogenic Hypobaric Air",
      baroProgress: "34%",
      specimenImage: post?.coverImage || "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=85",
      specimenBadge: "Pugmark: 11.2cm Scree Width",
      specimenTitle: "High-Altitude Pugmark Specimen • Panthera uncia",
      specimenLocation: post?.locationLabel || "Upper Dolpo High Pass",
      specimenNotes:
        "Fresh paw imprint documented in glacial talus powder at 4,620m. Enlarged footpads distribute body weight to navigate 45-degree scree slopes without triggering rockfalls.",
      pullQuote:
        "“Fourteen days in the cryogenic silence of Dolpo taught us that the ghost of the mountains watches you hundreds of hours before you glimpse its tail.”",
      pullQuoteCite: `— Shey Gompa Field Log • ${naturalistName} High Altitude Solitude`,
      bodyRig: "Sony A1 Flagship (Dual CFexpress Type A)",
      primaryGlass: "Sony FE 400mm f/2.8 GM OSS + 1.4x",
      effectiveFocal: "560mm (High-Resolution Crop-Ready)",
      exposure: "1/2500s • f/4.0 • ISO 640",
      shutterProfile: "Silent Electronic (Cold-Resistant Battery Pack)",
      afAlgorithm: "Real-Time Tracking Animal Eye-AF",
      audioTitle: `${post?.title || "Snow Leopard"} Shey Gompa High-Pass Audio`,
      audioTime: "04:30 AM • 5m 12s",
      ethicsPoints: [
        {
          title: "Sub-Zero Standoff",
          desc: "Long-range observation across a 200m gorge to safeguard natural predation behavior.",
          icon: "landscape",
          color: "secondary",
        },
        {
          title: "Zero Bait / Scent Exclusion",
          desc: "100% wilderness encounter without lure, live bait, or artificial call stimulation.",
          icon: "block",
          color: "#ff2d78",
        },
        {
          title: "10% Snow Leopard Trust",
          desc: "Direct royalty contribution to community livestock insurance programs protecting high-pasture herders.",
          icon: "savings",
          color: "tertiary",
        },
      ],
    };
  }

  if (isMegaherbivore) {
    return {
      dispatchNumber: "064",
      chapters: [
        { id: "section-babai-mist", num: "01", title: "RAPTI FLOODPLAIN EMERGENCE" },
        { id: "section-acoustic-freeze", num: "02", title: "LOW-FREQUENCY INFRASOUND" },
        { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
        { id: "section-vector-trajectory", num: "04", title: "ALLUVIAL GRAZING PATHWAY" },
        { id: "section-anti-poaching", num: "05", title: "HABITAT RESTORATION PROTOCOL" },
      ],
      waypoint: post?.locationLabel ? `27°30′12″N • ${post.locationLabel}` : "27°30′12″N 84°20′45″E",
      elevation: "185m AMSL (Rapti Floodplain)",
      temperature: "14.2°C / 57.5°F (Humid Mist)",
      acoustics: "38 dB (Riverine Canopy)",
      baroHpa: "1012 hPa",
      baroDesc: "Saturated Terai Floodplain",
      baroProgress: "76%",
      specimenImage: post?.coverImage || "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=85",
      specimenBadge: "Track: 28.5cm Footprint",
      specimenTitle: "Floodplain Megaherbivore Track Specimen",
      specimenLocation: post?.locationLabel || "Chitwan Riverine Grasslands",
      specimenNotes:
        "Deeply impressed cloverleaf track in river gravel and alluvial clay. Stride cadence confirms calm grazing migration toward morning elephant grass thickets.",
      pullQuote:
        "“Watching an armored titan materialize through dawn river vapors feels like a window into the ancient Pleistocene era.”",
      pullQuoteCite: `— Floodplain Log • ${naturalistName} Megafauna Survey`,
      bodyRig: "Nikon Z9 Flagship",
      primaryGlass: "Nikkor Z 400mm f/2.8 TC VR S",
      effectiveFocal: "400mm (Prime High Speed)",
      exposure: "1/1600s • f/2.8 • ISO 1250",
      shutterProfile: "Silent Electronic Shutter",
      afAlgorithm: "Subject Recognition Mammal AF",
      audioTitle: `${post?.title || "Terai Megafauna"} Rapti River Floodplain Audio`,
      audioTime: "05:10 AM • 4m 05s",
      ethicsPoints: [
        {
          title: "Downwind Standoff",
          desc: "Maintained 50m downwind distance to avoid agitating eyesight-limited megafauna.",
          icon: "air",
          color: "secondary",
        },
        {
          title: "Buffer Zone Corridor",
          desc: "Conducted along designated forest edges without disturbing breeding core zones.",
          icon: "eco",
          color: "#ff2d78",
        },
        {
          title: "10% Grassland Fund",
          desc: "10% dedicated to invasive weed clearance in Chitwan floodplain grazing meadows.",
          icon: "savings",
          color: "tertiary",
        },
      ],
    };
  }

  if (isRedPanda) {
    return {
      dispatchNumber: "095",
      chapters: [
        { id: "section-babai-mist", num: "01", title: "CLOUD FOREST CANOPY CLIMB" },
        { id: "section-acoustic-freeze", num: "02", title: "BAMBOO RUSTLE ACOUSTICS" },
        { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
        { id: "section-vector-trajectory", num: "04", title: "ARBOREAL FEEDING TRANSECT" },
        { id: "section-anti-poaching", num: "05", title: "RED PANDA NETWORK SYNC" },
      ],
      waypoint: post?.locationLabel ? `27°02′15″N • ${post.locationLabel}` : "27°02′15″N 87°55′30″E",
      elevation: "2,600m AMSL (Ilam Cloud Forest)",
      temperature: "7.8°C / 46.0°F (Moss Canopy)",
      acoustics: "26 dB (Canopy Drizzle)",
      baroHpa: "765 hPa",
      baroDesc: "High Humidity Montane Mist",
      baroProgress: "62%",
      specimenImage: post?.coverImage || "https://images.unsplash.com/photo-1544943910-4c1dc44a0701?auto=format&fit=crop&w=1200&q=85",
      specimenBadge: "Habitat: Moss-Draped Oak",
      specimenTitle: "Arboreal Foraging Micro-Site • Ailurus fulgens",
      specimenLocation: post?.locationLabel || "Eastern Himalayan Highlands",
      specimenNotes:
        "Characteristic feeding signs observed on young bamboo shoots 6 meters above the ground in virgin temperate broadleaf cloud forest.",
      pullQuote:
        "“In the moss-draped silence of Ilam, the cinnamon coat of the red panda is nature’s warmest contrast against grey monsoon mists.”",
      pullQuoteCite: `— Cloud Forest Field Diary • ${naturalistName} Arboreal Survey`,
      bodyRig: "Sony A7R V High-Resolution",
      primaryGlass: "Sony FE 200-600mm f/5.6-6.3 G OSS",
      effectiveFocal: "500mm (Super-Telephoto Reach)",
      exposure: "1/800s • f/6.3 • ISO 1600",
      shutterProfile: "Silent Electronic Shutter",
      afAlgorithm: "AI Processing Unit Animal AF",
      audioTitle: `${post?.title || "Red Panda"} Cloud Forest Canopy Rain & Rustle`,
      audioTime: "06:05 AM • 3m 50s",
      ethicsPoints: [
        {
          title: "Zero Flash / Flashlight",
          desc: "Strict natural illumination only to preserve sensitive crepuscular and nocturnal eyes.",
          icon: "flare",
          color: "secondary",
        },
        {
          title: "Canopy Non-Disturbance",
          desc: "No shaking of roosting trees or branch manipulation; telephoto lenses used from ground trails.",
          icon: "eco",
          color: "#ff2d78",
        },
        {
          title: "10% Red Panda Network",
          desc: "10% of licensing proceeds support forest guardian anti-poaching patrols in eastern Nepal.",
          icon: "savings",
          color: "tertiary",
        },
      ],
    };
  }

  if (isTiger) {
    return {
      dispatchNumber: "040",
      chapters: [
        { id: "section-babai-mist", num: "01", title: "THE BABAI MIST AWAKENING" },
        { id: "section-acoustic-freeze", num: "02", title: "CANOPY ALARM ACOUSTICS" },
        { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
        { id: "section-vector-trajectory", num: "04", title: "TIGER VECTOR TRAJECTORY" },
        { id: "section-anti-poaching", num: "05", title: "ANTI-POACHING DATA SYNC" },
      ],
      waypoint: post?.locationLabel ? `28°23′14″N • ${post.locationLabel}` : "28°23′14″N 81°18′02″E",
      elevation: "152m AMSL (Bardia Basin)",
      temperature: "9.4°C / 48.9°F (Mist Drop)",
      acoustics: "32 dB (Ambient Forest)",
      baroHpa: "1018 hPa",
      baroDesc: "High Density Cold Air",
      baroProgress: "82%",
      specimenImage:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCzzZHDROC3wAR6IEJUEDF3bdfWTuCO6O6rORLrOwr12we_20PLHLd5naBsTKd_0kKMbdbJ9AcLZduYg3TPFdL2yZbXlVLmDFOM-z4psmGJQ0t50ylFWw1XnHpdLb9KDibnuGPxGykF-d9Bao2NxdPE_dXcloGYjjLxrsbHQa8JUiZrd6kdbn6yWDUrvpDkGCOZm_IyFe2lIBQZxpGQ2p8T703NCSzwsb1wdlMeJz",
      specimenBadge: "Pugmark: 14.8cm Width",
      specimenTitle: "Adult Bengal Tiger Track • Panthera tigris tigris",
      specimenLocation: post?.locationLabel || "Bardia Riverbank Blind",
      specimenNotes:
        "Fresh imprint measured in wet alluvial silt. Pad width of 14.8cm indicates an adult apex predator in peak physical prime. Directional stride vector recorded in expedition telemetry logs.",
      pullQuote:
        "“We do not stage moments in the wild; we endure the freeze, the damp, and weeks of absolute stillness. When the predator turns its ocular gaze on your glass, time ceases to exist.”",
      pullQuoteCite: `— Dispatch Log Entry • ${naturalistName} Lead Expedition Blind`,
      bodyRig: "Nikon Z9 Flagship (Dual CFexpress)",
      primaryGlass: "Nikkor Z 400mm f/2.8 TC VR S",
      effectiveFocal: "560mm (Internal 1.4x Active)",
      exposure: "1/1600s • f/4.0 • ISO 3200",
      shutterProfile: "Silent Electronic (0.0dB)",
      afAlgorithm: "3D Matrix Animal Eye-AF",
      audioTitle: `${post?.title || "Bengal Tiger"} Riverbank Mist Soundscape`,
      audioTime: "04:15 AM • 4m 20s",
      ethicsPoints: [
        {
          title: "Zero Infiltration",
          desc: "Strict non-invasive blinds. No acoustic playback, baiting, or tree platforms were utilized.",
          icon: "block",
          color: "secondary",
        },
        {
          title: "Non-Disruptive Drone Ban",
          desc: "100% aerial drone exclusion applied. Compliant with Bardia and Terai buffer-zone laws.",
          icon: "eco",
          color: "#ff2d78",
        },
        {
          title: "10% Direct Royalty",
          desc: "10% of all image sales from this dispatch go directly to Community Anti-Poaching Units (CBAPU).",
          icon: "savings",
          color: "tertiary",
        },
      ],
    };
  }

  // Fallback for custom / any other posts
  const titleStr = post?.title || "Wildlife Dispatch";
  const numHash = Math.abs(
    titleStr.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
  );
  const dispNum = String((numHash % 400) + 101).padStart(3, "0");

  return {
    dispatchNumber: dispNum,
    chapters: [
      { id: "section-babai-mist", num: "01", title: "EXPEDITION DAWN LOG" },
      { id: "section-acoustic-freeze", num: "02", title: "BIO-ACOUSTIC FIELD RECORDING" },
      { id: "section-optics-telemetry", num: "03", title: "OPTICAL MATRIX & TELEMETRY" },
      { id: "section-vector-trajectory", num: "04", title: "HABITAT VECTOR TRANSECT" },
      { id: "section-anti-poaching", num: "05", title: "WILDLIFE CONSERVATION PROTOCOL" },
    ],
    waypoint: post?.locationLabel ? `28°14′00″N • ${post.locationLabel}` : "28°14′00″N 84°05′00″E",
    elevation: "1,450m AMSL (Himalayan Foothills)",
    temperature: "12.5°C / 54.5°F (Morning Dawn)",
    acoustics: "28 dB (Ambient Forest)",
    baroHpa: "895 hPa",
    baroDesc: "Equilibrium Montane Air",
    baroProgress: "55%",
    specimenImage: post?.coverImage || "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1200&q=85",
    specimenBadge: "Field Record: Live Verification",
    specimenTitle: `Expedition Field Record • ${titleStr}`,
    specimenLocation: post?.locationLabel || "Wilderness Field Transect",
    specimenNotes:
      "Detailed field telemetry captured during live expedition monitoring. Environmental, spatial, and behavioral data logged in real time.",
    pullQuote:
      "“We do not stage moments in the wild; we endure the freeze, the damp, and weeks of absolute stillness to document the raw truth of nature.”",
    pullQuoteCite: `— Expedition Log • ${naturalistName}`,
    bodyRig: "Nikon Z9 / Sony A1 Dual Rig",
    primaryGlass: "Super-Telephoto Prime Glass",
    effectiveFocal: "500mm (Field Optimized)",
    exposure: "1/2000s • f/4.0 • ISO 1600",
    shutterProfile: "Silent Electronic Shutter",
    afAlgorithm: "Advanced Subject Recognition AF",
    audioTitle: `${titleStr} Dawn Field Soundscape`,
    audioTime: "05:00 AM • 4m 00s",
    ethicsPoints: [
      {
        title: "Zero Infiltration",
        desc: "Strict non-invasive observation blinds. No baiting or artificial attractants utilized.",
        icon: "block",
        color: "secondary",
      },
      {
        title: "Drone Exclusion",
        desc: "100% aerial drone exclusion applied compliant with national park buffer-zone regulations.",
        icon: "eco",
        color: "#ff2d78",
      },
      {
        title: "10% Direct Royalty",
        desc: "10% of all image sales from this dispatch support local community anti-poaching units.",
        icon: "savings",
        color: "tertiary",
      },
    ],
  };
}

export default function SingleDispatchPage() {
  const { settings } = useSiteSettings();
  const naturalistName = settings.about.naturalistName || "Suban";
  const naturalistTitle = settings.about.title || "Lead Expedition Naturalist • Field Director";
  const portraitUrl =
    settings.about.portraitUrl ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCmxEoo6k9e5jnPjIakVCGLr5nl_0xxYH3eN-JyjWwP-a_nbWbH3RjrN9uY0frg5r_f5_tz-UxYPoQY6dKXlB9JhwUU5_cMz33_31Q9PW8roY16mZVhTXSQ1lbA8N3frZijtzPUQTp667_IEdXyLfeQ8Qu7_d9f8mqtt78A8l8bgP1mEygFojUz1h6xcOYWLpaCc885_SEDPFPf1grVUaaM5KQrDiurY3ONohFjdnx5";

  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [post, setPost] = useState<any>(null);
  const [recommendedPosts, setRecommendedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeChapter, setActiveChapter] = useState("section-babai-mist");
  const [showPugmarkModal, setShowPugmarkModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const postMeta = getPostMetadata(post, naturalistName);
  const fieldChapters = postMeta.chapters;

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

  // Instantly scroll to top on slug route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  // Fetch current post and recommendations
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/posts?slug=${slug}`).then((r) => r.json()),
      fetch(`/api/posts`).then((r) => r.json()),
    ])
      .then(([currentData, listData]) => {
        if (currentData.success && currentData.post) {
          setPost(currentData.post);
        } else {
          setError(currentData.error || "Dispatch not found");
        }

        if (listData.success && Array.isArray(listData.posts)) {
          const others = listData.posts.filter((p: any) => p.slug !== slug);
          setRecommendedPosts(others);
        }
      })
      .catch((err) => {
        console.error("Error loading dispatch:", err);
        setError("Failed to load dispatch from database");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Reading progress scroll listener
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] flex flex-col items-center justify-center py-20 px-4 transition-colors">
        <div className="w-10 h-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0]">
          Loading Field Journal Dispatch from Database...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] flex flex-col items-center justify-center py-20 px-4 text-center transition-colors">
        <span className="material-symbols-outlined text-4xl text-[#ff2d78] mb-3">article</span>
        <h1 className="font-headline text-2xl font-bold mb-2">Dispatch Not Found</h1>
        <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0] max-w-md mb-6">
          The requested expedition dispatch could not be retrieved from the database.
        </p>
        <Link
          href="/blog"
          className="px-5 py-2.5 rounded-xl card-surface text-secondary font-label text-xs uppercase tracking-widest border border-secondary/30 hover:bg-secondary hover:text-[#001a1a] transition-all shadow-md font-semibold"
        >
          ← Return to Field Journal
        </Link>
      </div>
    );
  }

  // Format title with gradient accent on last 2 words (matching second image)
  const titleWords = (post.title || "").split(" ");
  const mainTitlePart = titleWords.length > 2 ? titleWords.slice(0, -2).join(" ") : post.title;
  const gradientTitlePart = titleWords.length > 2 ? " " + titleWords.slice(-2).join(" ") : "";

  const paragraphs = post.content ? post.content.split("\n\n").filter(Boolean) : [post.excerpt || ""];

  return (
    <div className="w-full bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] min-h-screen selection:bg-[#ff2d78] selection:text-white transition-colors duration-200">
      {/* Interactive Sticky Reading Progress Bar */}
      <div className="sticky top-0 sm:top-20 z-40 w-full h-[3px] bg-surface-container dark:bg-[#123822]">
        <div
          className="h-full bg-gradient-to-r from-[#ff2d78] via-secondary to-tertiary transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ========================================================
          ARTICLE HERO / HEADER (Exact match with second image)
          ======================================================== */}
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
            <span className="text-[#ff2d78] font-semibold drop-shadow-[0_0_8px_rgba(255,45,120,0.3)] truncate max-w-xs sm:max-w-md uppercase">
              {post.title}
            </span>
          </nav>

          {/* Category Badges & Reading Meta */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-3 py-1 rounded bg-secondary/15 text-secondary text-xs font-label font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-secondary/25">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {post.categoryName || "Expedition Dispatch • Apex Predators"}
            </span>
            <span className="px-3 py-1 rounded bg-tertiary/15 text-tertiary text-xs font-label font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-tertiary/25">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {post.readingTimeMinutes || 14} Min Read
            </span>
            <span className="text-xs font-label text-on-surface-variant dark:text-[#a098b0]/70 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Nov 18, 2024"}
            </span>
          </div>

          {/* Main Headline with Gradient Word Accent */}
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface dark:text-[#e8e0f0] leading-[1.1] max-w-5xl mt-2">
            {mainTitlePart}
            {gradientTitlePart && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-on-surface via-[#ff2d78] to-secondary dark:from-[#e8e0f0] dark:via-[#ff2d78] dark:to-[#00ffcc]">
                {gradientTitlePart}
              </span>
            )}
          </h1>

          {/* Standfirst / Excerpt */}
          {post.excerpt && (
            <p className="font-body text-lg sm:text-xl text-on-surface-variant dark:text-[#a098b0] leading-relaxed max-w-4xl font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author Attribution Card & Social Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 pb-2">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#ff2d78] to-secondary shadow-sm shrink-0">
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

            {/* Social Share & Bookmark Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded card-surface hover:bg-surface-container text-xs font-label uppercase tracking-wider text-on-surface dark:text-[#e8e0f0] transition-all shadow-sm border border-outline-variant/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-[#ff2d78]">share</span>
                <span>{copiedShare ? "Link Copied!" : "Share Dispatch"}</span>
              </button>
              <button
                type="button"
                className="p-2 rounded card-surface hover:bg-surface-container text-on-surface-variant hover:text-secondary transition-colors border border-outline-variant/30 shadow-sm cursor-pointer"
                title="Bookmark dispatch"
              >
                <span className="material-symbols-outlined text-base">bookmark</span>
              </button>
            </div>
          </div>

          {/* High-Altitude Telemetry Ribbon (Exact match with second image) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 card-surface p-4 rounded-xl shadow-sm border border-outline-variant/30 mt-2">
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-secondary">explore</span> GPS Waypoint
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider truncate">
                {postMeta.waypoint}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-[#ff2d78]">landscape</span> Elevation
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider truncate">
                {postMeta.elevation}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-tertiary">device_thermostat</span> Temperature
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider truncate">
                {postMeta.temperature}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-2 rounded bg-surface-container/60 dark:bg-[#0a2416] border border-outline-variant/20 dark:border-white/5">
              <span className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-xs text-secondary">graphic_eq</span> Dawn Acoustics
              </span>
              <span className="font-label text-sm font-semibold text-on-surface dark:text-[#e8e0f0] tracking-wider truncate">
                {postMeta.acoustics}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN EDITORIAL CONTENT & ASYMMETRIC SIDEBAR GRID
          ======================================================== */}
      <main className="w-full max-w-6xl mx-auto px-6 lg:px-16 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Primary Editorial Narrative Column (Span 8) */}
          <article className="lg:col-span-8 flex flex-col gap-8 text-[#0c1f15] dark:text-[#e8e0f0]">
            {/* Opening Editorial Paragraph with Dropcap */}
            <div id="section-babai-mist" className="scroll-mt-28">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-outline-variant/20">
                <span className="font-mono text-xs font-bold text-secondary bg-secondary/10 dark:bg-secondary/20 px-2 py-0.5 rounded">
                  {postMeta.chapters[0].num}
                </span>
                <span className="font-label text-xs uppercase tracking-wider font-semibold text-secondary">
                  {postMeta.chapters[0].title}
                </span>
              </div>
              {post.contentHtml ? (
                <div
                  className="prose prose-lg dark:prose-invert max-w-none font-body leading-relaxed text-[#142d1f] dark:text-[#e8e0f0]/90 space-y-6"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />
              ) : (
                <div className="font-body text-base sm:text-lg leading-relaxed text-[#142d1f] dark:text-[#e8e0f0]/90 space-y-6">
                  {paragraphs.map((p: string, idx: number) => (
                    <p
                      key={idx}
                      className={
                        idx === 0
                          ? "first-letter:font-headline first-letter:text-6xl first-letter:font-extrabold first-letter:text-[#ff2d78] first-letter:float-left first-letter:mr-4 first-letter:leading-none first-letter:drop-shadow-[0_0_10px_rgba(255,45,120,0.3)] text-[#142d1f] dark:text-[#e8e0f0]"
                          : "text-[#142d1f] dark:text-[#e8e0f0]/90"
                      }
                    >
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Pull Quote Component */}
            <blockquote className="my-4 p-8 rounded-xl bg-secondary/10 dark:bg-[#0d2b1a] relative overflow-hidden shadow-sm border border-secondary/25">
              <div className="absolute -right-6 -bottom-8 font-headline font-black text-9xl text-secondary/10 dark:text-[#143d25]/40 pointer-events-none select-none">
                “
              </div>
              <p className="font-headline text-lg sm:text-xl font-bold tracking-tight text-secondary leading-snug">
                {postMeta.pullQuote}
              </p>
              <cite className="block font-label text-xs uppercase tracking-widest text-[#3b5043] dark:text-[#a098b0] mt-4 not-italic font-semibold">
                {postMeta.pullQuoteCite}
              </cite>
            </blockquote>

            {/* FEATURED HERO IMAGE BREAKOUT */}
            {post.coverImage && (
              <figure id="section-vector-trajectory" className="scroll-mt-28 w-full flex flex-col gap-3 my-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-[#ff2d78] bg-[#ff2d78]/10 px-2 py-0.5 rounded">
                    {postMeta.chapters[3].num}
                  </span>
                  <span className="font-label text-xs uppercase tracking-wider font-semibold text-[#ff2d78]">
                    {postMeta.chapters[3].title}
                  </span>
                </div>
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden card-surface shadow-2xl group border border-outline-variant/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={post.title}
                    src={post.coverImage}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85";
                    }}
                  />
                  {/* Encrypted Watermark Overlay Protection */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15">
                    <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_currentColor] animate-pulse" />
                    <span className="font-label text-[10px] tracking-widest uppercase text-white font-semibold">
                      Suban Encrypted Archive • Frame #{postMeta.dispatchNumber}-ENC
                    </span>
                  </div>
                </div>
                <figcaption className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-label text-on-surface-variant dark:text-[#a098b0]/80 px-1">
                  <span>FIGURE 1.1: {post.title} documented under prime wilderness light.</span>
                  <span className="text-tertiary font-semibold">
                    Verified Non-Bait Encounter • 100% Wilderness Origin
                  </span>
                </figcaption>
              </figure>
            )}

            {/* CAMERA & OPTICS FIELD TELEMETRY CALLOUT */}
            <div
              id="section-optics-telemetry"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex items-center justify-between pb-3 bg-surface-container/50 dark:bg-[#0d2b1a]/50 -mx-6 -mt-6 p-4 px-6 rounded-t-xl border-b border-outline-variant/30">
                <div className="flex items-center gap-2 text-[#ff2d78] font-headline text-sm font-bold uppercase tracking-wider">
                  <span className="font-mono text-xs font-bold text-[#ff2d78] bg-[#ff2d78]/15 px-2 py-0.5 rounded">
                    {postMeta.chapters[2].num}
                  </span>
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  {postMeta.chapters[2].title}
                </div>
                <span className="font-label text-xs text-on-surface-variant dark:text-[#a098b0] uppercase tracking-widest font-semibold">
                  Field Telemetry Rig
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    Body Rig
                  </span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">
                    {postMeta.bodyRig}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    Primary Glass
                  </span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">
                    {postMeta.primaryGlass}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    Effective Focal
                  </span>
                  <span className="font-body text-sm font-semibold text-secondary">
                    {postMeta.effectiveFocal}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    Exposure Values
                  </span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">
                    {postMeta.exposure}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    Shutter Profile
                  </span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">
                    {postMeta.shutterProfile}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">
                    AF Algorithm
                  </span>
                  <span className="font-body text-sm font-semibold text-on-surface dark:text-[#e8e0f0]">
                    {postMeta.afAlgorithm}
                  </span>
                </div>
              </div>
            </div>

            {/* EMBEDDED AMBIENT SOUNDSCAPE PLAYER */}
            <div
              id="section-acoustic-freeze"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded">
                      {postMeta.chapters[1].num}
                    </span>
                    <span className="font-label text-xs uppercase tracking-widest text-secondary font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_currentColor]" />
                      {postMeta.chapters[1].title}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] mt-1">
                    {postMeta.audioTitle}
                  </h3>
                </div>
                <span className="font-label text-xs text-on-surface-variant self-start sm:self-auto bg-surface-container px-2.5 py-1 rounded border border-outline-variant/20">
                  {postMeta.audioTime}
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
                    className="w-10 h-10 rounded-full bg-secondary text-[#001a1a] flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isPlayingAudio ? "pause" : "play_arrow"}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-xs font-label text-on-surface-variant">
                    <span>{isPlayingAudio ? "01:14" : "00:00"}</span>
                    <span>/</span>
                    <span>04:20</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-label text-secondary font-semibold">
                  <span className="material-symbols-outlined text-sm">volume_up</span>
                  <span>32-BIT FLOAT AMBISONICS</span>
                </div>
              </div>
            </div>

            {/* ETHICAL PROTOCOL CALLOUT BADGES */}
            <div
              id="section-anti-poaching"
              className="scroll-mt-28 rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#ff2d78] bg-[#ff2d78]/15 px-2 py-0.5 rounded">
                  {postMeta.chapters[4].num}
                </span>
                <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-sm">verified_user</span> {postMeta.chapters[4].title}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-body text-on-surface-variant">
                {postMeta.ethicsPoints.map((ep, idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-3 rounded bg-surface-container/50 dark:bg-[#0a2416] border border-outline-variant/20">
                    <span className="font-label font-bold text-on-surface dark:text-[#e8e0f0] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm" style={{ color: ep.color === "secondary" ? "var(--color-secondary, #00ffcc)" : ep.color === "tertiary" ? "var(--color-tertiary, #ffbb00)" : ep.color }}>
                        {ep.icon}
                      </span>
                      {ep.title}
                    </span>
                    <span>{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/blog"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl card-surface hover:bg-surface-container text-secondary font-label text-xs uppercase tracking-widest border border-outline-variant/30 transition-all shadow-sm font-semibold"
              >
                ← Back to Field Journal
              </Link>
              <Link
                href="/gallery"
                className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-[#ff2d78] hover:bg-[#d91d60] text-white font-label text-xs uppercase tracking-widest font-semibold transition-all shadow-md"
              >
                Explore Gallery Works →
              </Link>
            </div>
          </article>

          {/* ========================================================
              RIGHT: ASYMMETRIC STICKY EDITORIAL SIDEBAR (Span 4)
              ======================================================== */}
          <aside className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-28">
            {/* Field Journal Table of Contents / Index Widget (Exact match with screenshot) */}
            <div className="rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <span className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface dark:text-[#e8e0f0]">
                  Field Index
                </span>
                <span className="font-label text-[10px] text-secondary font-semibold">
                  Dispatch #{postMeta.dispatchNumber}
                </span>
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
                  <span className="text-on-surface dark:text-[#e8e0f0] font-bold">{postMeta.baroHpa}</span>
                  <span className="text-secondary font-semibold">{postMeta.baroDesc}</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff2d78] to-secondary transition-all duration-500"
                    style={{ width: postMeta.baroProgress }}
                  />
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
                    alt={postMeta.specimenTitle}
                    src={postMeta.specimenImage}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/80 text-secondary text-[10px] font-label uppercase tracking-widest flex items-center gap-1 border border-secondary/40 shadow-sm">
                      <span className="material-symbols-outlined text-xs">zoom_in</span> Inspect Specimen
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 font-label text-[10px] text-white uppercase font-semibold border border-white/10">
                    {postMeta.specimenBadge}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Compact Recommended Posts */}
            {recommendedPosts.length > 0 && (
              <div className="rounded-xl card-surface p-6 shadow-sm space-y-4 border border-outline-variant/30">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                  <span className="font-headline font-bold text-xs uppercase tracking-widest text-[#ff2d78] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff2d78] shadow-[0_0_6px_#ff2d78]" />
                    Recommended
                  </span>
                  <Link
                    href="/blog"
                    className="font-label text-[10px] text-secondary hover:underline uppercase font-bold"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-4">
                  {recommendedPosts.slice(0, 3).map((rec: any) => (
                    <Link
                      key={rec.id}
                      href={`/blog/${rec.slug}`}
                      className="flex items-start gap-3.5 group p-2 rounded-lg hover:bg-surface-container/60 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-black/60 shrink-0 relative border border-outline-variant/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            rec.coverImage ||
                            "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80"
                          }
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="font-label text-[10px] uppercase tracking-wider text-secondary font-semibold block truncate">
                          {rec.categoryName || "Field Record"}
                        </span>
                        <h4 className="font-headline font-bold text-xs text-on-surface dark:text-[#e8e0f0] line-clamp-2 leading-snug group-hover:text-[#ff2d78] transition-colors">
                          {rec.title}
                        </h4>
                        <span className="font-label text-[10px] text-on-surface-variant block">
                          {rec.readingTimeMinutes || 6} Min Read
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* ========================================================
          BOTTOM: ARCHIVE CONTINUUM (Recommended Dispatches Below)
          ======================================================== */}
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
              href="/blog"
            >
              View All Field Journals <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* 3-Column Editorial Dispatch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedPosts.length > 0 ? (
              recommendedPosts.slice(0, 3).map((recPost: any, idx: number) => (
                <article
                  key={recPost.id || idx}
                  className="flex flex-col rounded-xl card-surface overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30 group"
                >
                  <Link
                    href={`/blog/${recPost.slug}`}
                    className="aspect-[16/10] w-full overflow-hidden bg-black/60 relative block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={recPost.title}
                      src={
                        recPost.coverImage ||
                        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85"
                      }
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1800&q=85";
                      }}
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur font-label text-[10px] uppercase text-secondary font-semibold">
                      {recPost.categoryName || "Field Record • Live DB"}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-label text-[10px] text-tertiary font-semibold">
                      {recPost.readingTimeMinutes || 6} Min Read
                    </div>
                  </Link>

                  <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                    <div className="space-y-2">
                      <span className="font-label text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                        Dispatch #{String(idx + 101).padStart(3, "0")} • {recPost.locationLabel || "Nepal"}
                      </span>
                      <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] group-hover:text-[#ff2d78] transition-colors leading-snug">
                        <Link href={`/blog/${recPost.slug}`}>{recPost.title}</Link>
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] line-clamp-3 leading-relaxed">
                        {recPost.excerpt || recPost.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-label text-on-surface-variant">
                      <span>
                        {recPost.publishedAt
                          ? new Date(recPost.publishedAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : "Recent"}
                      </span>
                      <Link
                        href={`/blog/${recPost.slug}`}
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
                <div
                  key={n}
                  className="rounded-xl card-surface border border-outline-variant/30 animate-pulse h-80 flex flex-col justify-between p-4"
                >
                  <div className="w-full h-40 bg-surface-container dark:bg-[#12301f] rounded-lg" />
                  <div className="space-y-2 pt-3">
                    <div className="h-4 bg-surface-container dark:bg-[#12301f] rounded w-3/4" />
                    <div className="h-3 bg-surface-container dark:bg-[#12301f] rounded w-1/2" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DISPATCH NEWSLETTER & SUBSCRIBER CARD */}
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
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-secondary text-[#001a1a] font-label text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-all shadow-md shrink-0 cursor-pointer"
                  type="submit"
                >
                  {newsletterSubscribed ? "Encrypted Wire Subscribed!" : "Subscribe to Dispatches"}
                </button>
              </form>
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
                src={postMeta.specimenImage}
                alt={postMeta.specimenTitle}
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
                {postMeta.specimenBadge} • Field Specimen
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-sm text-on-surface dark:text-[#e8e0f0]">
                  {postMeta.specimenTitle}
                </span>
                <span className="font-label text-xs text-secondary font-semibold">
                  {postMeta.specimenLocation}
                </span>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {postMeta.specimenNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
