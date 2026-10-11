export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface EthicPrinciple {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface ExpeditionItem {
  id: string;
  year: string;
  region: string;
  altitude: string;
  title: string;
  desc: string;
  tag: string;
}

export interface GearItem {
  id: string;
  category: string;
  item: string;
  details: string;
}

export interface SocialCustomLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon?: string;
  enabled?: boolean;
}

export const AVAILABLE_SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook", placeholder: "https://facebook.com/subanwildlife" },
  { id: "instagram", label: "Instagram", placeholder: "https://instagram.com/subanwildlife" },
  { id: "twitter", label: "X / Twitter", placeholder: "https://x.com/subanwildlife" },
  { id: "youtube", label: "YouTube", placeholder: "https://youtube.com/@subanwildlife" },
  { id: "vimeo", label: "Vimeo", placeholder: "https://vimeo.com/subanwildlife" },
  { id: "px500", label: "500px", placeholder: "https://500px.com/suban" },
  { id: "flickr", label: "Flickr", placeholder: "https://flickr.com/photos/suban" },
  { id: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@subanwildlife" },
  { id: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/subandahit" },
  { id: "pinterest", label: "Pinterest", placeholder: "https://pinterest.com/subanwildlife" },
  { id: "threads", label: "Threads", placeholder: "https://threads.net/@subanwildlife" },
  { id: "whatsapp", label: "WhatsApp Direct", placeholder: "https://wa.me/9779800000000" },
  { id: "telegram", label: "Telegram Channel", placeholder: "https://t.me/subanwildlife" },
  { id: "discord", label: "Discord Server", placeholder: "https://discord.gg/wildlife" },
  { id: "reddit", label: "Reddit", placeholder: "https://reddit.com/user/suban" },
  { id: "patreon", label: "Patreon", placeholder: "https://patreon.com/subanwildlife" },
  { id: "behance", label: "Behance", placeholder: "https://behance.net/subandahit" },
  { id: "artstation", label: "ArtStation", placeholder: "https://artstation.com/suban" },
  { id: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/artist/..." },
  { id: "github", label: "GitHub", placeholder: "https://github.com/..." },
  { id: "website", label: "Personal Website / Blog", placeholder: "https://..." },
  { id: "email", label: "Email Contact Direct", placeholder: "mailto:suban@subanwildlife.com" },
  { id: "custom", label: "Custom Link", placeholder: "https://..." },
] as const;

export interface SiteSettings {
  brand: {
    siteName: string;
    slogan: string;
    logoUrl: string;
    watermarkText: string;
    hubsText: string;
    copyrightText: string;
  };
  navigation: {
    items: NavItem[];
    showCurrencyToggle: boolean;
    showCart: boolean;
    sticky: boolean;
  };
  footer: {
    aboutText: string;
    watermarkNotice: string;
    dispatcherTitle: string;
    dispatcherDesc: string;
    licenseTermsUrl: string;
    privacyUrl: string;
  };
  social: {
    instagram: string;
    vimeo: string;
    px500: string;
    twitter: string;
    youtube: string;
    email: string;
    customLinks?: SocialCustomLink[];
  };
  about: {
    naturalistName: string;
    title: string;
    baseStation: string;
    credentials: string;
    portraitUrl: string;
    heroHeadline: string;
    heroGradientText: string;
    bioParagraph: string;
    metrics: {
      fieldExperience: string;
      maxAltitude: string;
      masterPlates: string;
      royaltyPercent: string;
    };
    manifestoBadge: string;
    manifestoQuote: string;
    manifestoText: string;
    ethics: EthicPrinciple[];
    expeditions: ExpeditionItem[];
    gear: GearItem[];
  };
  home: {
    badgeText: string;
    heroHeadline: string;
    heroSubtitle: string;
    indexedFrames: string;
    biomesCount: string;
    archivalFormat: string;
  };
  payments: PaymentSettings;
  watermark: WatermarkSiteSettings;
}

export interface WatermarkSiteSettings {
  enabled: boolean;
  text: string;
  logoUrl?: string | null;
  opacity: number; // percentage (0 to 100)
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tiled";
  size: number; // scale percent
  isTiled: boolean;
  margin: number; // px
  rotation: number; // -90 to +90 degrees
  tileCount: number; // e.g. 4, 9, 16, 25
  fontFamily: "sans" | "mono" | "serif" | string;
  fontSize: number; // px
  color: string; // hex or rgb
  blendMode: "normal" | "overlay" | "screen" | "soft-light" | string;
}

export const defaultWatermarkSettings: WatermarkSiteSettings = {
  enabled: true,
  text: "© SUBAN WILDLIFE PHOTOGRAPHY",
  logoUrl: null,
  opacity: 45,
  position: "bottom-right",
  size: 25,
  isTiled: false,
  margin: 24,
  rotation: -30,
  tileCount: 9,
  fontFamily: "sans",
  fontSize: 12,
  color: "#ffffff",
  blendMode: "normal",
};

export interface StripeSettings {
  enabled: boolean;
  mode: "test" | "live";
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
}

export interface EsewaSettings {
  enabled: boolean;
  mode: "test" | "live";
  merchantCode: string;
  secretKey: string;
  serviceUrl: string;
}

export interface FonepaySettings {
  enabled: boolean;
  mode: "sandbox" | "live";
  merchantCode: string;
  apiSecret: string;
  merchantName: string;
  qrImageUrl: string;
  instructions: string;
}

export interface BankSettings {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  swiftCode: string;
  routingNumber: string;
  qrImageUrl: string;
  instructions: string;
}

export interface KhaltiSettings {
  enabled: boolean;
  mode: "test" | "live";
  publicKey: string;
  secretKey: string;
}

export interface PaymentSettings {
  stripe: StripeSettings;
  esewa: EsewaSettings;
  fonepay: FonepaySettings;
  bank: BankSettings;
  khalti: KhaltiSettings;
}

export const defaultPaymentSettings: PaymentSettings = {
  stripe: {
    enabled: true,
    mode: "test",
    publishableKey: "pk_test_51MockSubanWildlifeStripePublishableKey2026",
    secretKey: "sk_test_MockSubanWildlifeStripeSecretKey2026",
    webhookSecret: "whsec_mockStripeWebhookSecret2026",
    currency: "USD",
  },
  esewa: {
    enabled: true,
    mode: "test",
    merchantCode: "EPAYTEST",
    secretKey: "8gBm/Du7G2n5MtN",
    serviceUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  },
  fonepay: {
    enabled: true,
    mode: "sandbox",
    merchantCode: "FP-SUB-2026-NEPAL",
    apiSecret: "fonepay_secret_key_suban_wildlife",
    merchantName: "SUBAN Wildlife Fine Art & Conservation Archive",
    qrImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    instructions: "Scan via any Nepali Mobile Banking app (Fonepay compliant). Enter Order Number in transfer remarks.",
  },
  bank: {
    enabled: true,
    bankName: "Standard Chartered Bank Nepal",
    accountName: "SUBAN Wildlife Conservation Archive Pvt. Ltd.",
    accountNumber: "01-2948201-01",
    branchName: "Kathmandu Corporate Branch, New Road",
    swiftCode: "SCBLNPKA",
    routingNumber: "90123001",
    qrImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    instructions: "For SWIFT wire or corporate remittances. Please specify your Order Reference number as remittance narration.",
  },
  khalti: {
    enabled: true,
    mode: "test",
    publicKey: "test_public_key_dc74e0fd57cb46cd93832aee0a50774b",
    secretKey: "test_secret_key_f59e8b7d18b4499be4095f82a63e2920",
  },
};

export const defaultSiteSettings: SiteSettings = {
  brand: {
    siteName: "SUBAN",
    slogan: "Wildlife Photography",
    logoUrl:
      "https://lh3.googleusercontent.com/aida/AEtjO1WrOj1tu0ohXfBbPARzmZ8XAhikw_cZG3DOsG_8IkjiCr5PACRR_L8uw9h1YShun3tUnGGayltBTqat9F3KP7cxbUOeQ-dU3wj55iM68W2cKDwqjm57s26zmmRceDUPUMEvPUr7aRrDepGQBDY2kvaPfHuKVTQPTXLTlpogQJ8n0Ltj_527Hgrv-ToPo_J-eCRg1wmZZhkPYs2uVxzTwQX_dbEP5WVH4w5X1pWa35yPFg",
    watermarkText: "© SUBAN Photography",
    hubsText: "Kathmandu • London • New York",
    copyrightText: "SUBAN Wildlife Fine Art Photography. All Rights Reserved.",
  },
  navigation: {
    items: [
      { id: "nav-gallery", label: "Gallery & Shop", href: "/gallery" },
      { id: "nav-birds", label: "Birds", href: "/birds" },
      { id: "nav-collections", label: "Curated Collections", href: "/collections" },
      { id: "nav-blog", label: "Field Journal", href: "/blog" },
      { id: "nav-licensing", label: "Licensing", href: "/licensing" },
      { id: "nav-about", label: "About", href: "/about" },
    ],
    showCurrencyToggle: true,
    showCart: true,
    sticky: true,
  },
  footer: {
    aboutText:
      "Pristine photographic chronicles capturing Earth's untamed apex predators and endangered habitats with cinematic visual fidelity.",
    watermarkNotice:
      "All visual media registered via encrypted digital provenance. Unauthorized reproduction, AI ingestion, or commercial distribution strictly prohibited.",
    dispatcherTitle: "Field Dispatch Dispatcher",
    dispatcherDesc:
      "Receive private viewings of upcoming releases, nocturnal captures, and print reservation slots.",
    licenseTermsUrl: "/licensing",
    privacyUrl: "/about",
  },
  social: {
    instagram: "https://instagram.com",
    vimeo: "https://vimeo.com",
    px500: "https://500px.com",
    twitter: "https://x.com",
    youtube: "https://youtube.com",
    email: "suban@subanwildlife.com",
    customLinks: [],
  },
  about: {
    naturalistName: "Suban Dahit",
    title: "Expedition Naturalist & Wildlife Photojournalist",
    baseStation: "Base: Shuklaphanta & Bardia Field Station",
    credentials:
      "Official Member: International League of Conservation Photographers (Affiliate) • National Geographic Contributor",
    portraitUrl:
      "https://scontent.fdhi1-1.fna.fbcdn.net/v/t39.30808-6/832916643_4456096511309642_6246512564612285707_n.jpg?stp=dst-jpg_tt6&cstp=mx1024x1024&ctp=s1024x1024&_nc_cat=109&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHCouSIkHgn6_z8CBJErM6hIakqRavewkIhqSpFq97CQiiiI0D5D9r47L7eLiiQ1uzXSCkExyeRqdlgoEyZ8M3k&_nc_ohc=VCasTVv-bjUQ7kNvwHDyQ8c&_nc_oc=Ado5k31qcc-f8eErqF0Y6KKcHidS3R2cSOXANCzxjY2pbcXB2SbCMdfSjl6AUDXpFF2WtuFINWPHxw5RtmlUBcOZ&_nc_zt=23&_nc_ht=scontent.fdhi1-1.fna&_nc_gid=NPUmomB3BYRs_3ZOLV_1rQ&_nc_ss=7b2a8&oh=00_AQOtARc4_JGEGYrM3lg3yFKAbL4z5ZgboqgOBNXkhUkVAA&oe=6ACB2A81",
    heroHeadline: "Aim, Passion, and",
    heroGradientText: "Life in the Wild",
    bioParagraph:
      "I am Suban Dahit, a Nepali wildlife photojournalist dedicated to documenting the fragile altitudinal gradients of the Himalayas and the lowland Terai. From dense subtropical Sal riverbanks (68m) to frost-shattered Tibetan plateau passes (5,400m), my work bridges rigorous scientific observation and fine art storytelling.",
    metrics: {
      fieldExperience: "8+ Yrs",
      maxAltitude: "5,430m",
      masterPlates: "148",
      royaltyPercent: "10%",
    },
    manifestoBadge: "The Field Manifesto",
    manifestoQuote:
      "“We do not stage moments in the wild; we endure the freeze, the damp, and weeks of absolute stillness until the wild chooses to reveal itself.”",
    manifestoText:
      "Wildlife photography is not about conquest or lens specs—it is about biological empathy. When an apex predator looks into your lens, it is calculating whether your presence threatens its territory. Our strict policy is that when we pack up our hides, the animal must never have altered its feeding, mating, or resting habits because of us.",
    ethics: [
      {
        id: "ethic-1",
        icon: "nature",
        title: "Zero Baiting & Calling",
        description:
          "Every recorded frame depicts 100% natural, unmanipulated wildlife behavior. We never use carcass bait, live lures, acoustic calls, or salt licks to attract animals.",
      },
      {
        id: "ethic-2",
        icon: "videocam_off",
        title: "Non-Disruptive Drone Ban",
        description:
          "Complete 100% exclusion of aerial drones in active buffer sanctuaries. Aerial prop noise induces acute cortisol stress spikes in big cats and avian raptors.",
      },
      {
        id: "ethic-3",
        icon: "shield_lock",
        title: "GPS Coordinate Obfuscation",
        description:
          "Raw telemetry and precise nest coordinates of critically endangered species are systematically scrubbed and encrypted to prevent illegal poaching exploitation.",
      },
      {
        id: "ethic-4",
        icon: "volunteer_activism",
        title: "The 10% Community Royalty",
        description:
          "Exactly 10% of every print acquisition, publication fee, and licensing contract goes directly into community anti-poaching patrols (CBAPU) and park ranger welfare.",
      },
    ],
    expeditions: [
      {
        id: "exp-1",
        year: "2024",
        region: "Eastern Ilam / Mai Pokhari",
        altitude: "2,400m AMSL",
        title: "Monsoon Mist: Cloud Forest Red Panda Study",
        desc: "Documenting the endangered Red Panda navigating ancient moss-covered oak and rhododendron canopies in torrential mid-monsoon rainfall without artificial light.",
        tag: "Cloud Forest Biome",
      },
      {
        id: "exp-2",
        year: "2023",
        region: "Babai Valley, Bardia National Park",
        altitude: "152m AMSL",
        title: "The Stare: Royal Bengal Tiger Riverbank Watch",
        desc: "Four weeks in camouflaged drift-wood blinds along sub-zero gravel crossings, resulting in the iconic direct ocular portrait of dominant male T-14 at 48 meters.",
        tag: "Apex Carnivore",
      },
      {
        id: "exp-3",
        year: "2022",
        region: "Mustang Trans-Himalayan Corridor",
        altitude: "3,900m AMSL",
        title: "Wings Across the Himalaya: Lammergeier Dynamics",
        desc: "Tracking bearded vultures and Himalayan griffons riding gale-force mountain vortexes and thermal updrafts across sheer limestone red canyons.",
        tag: "Avian Raptor Study",
      },
      {
        id: "exp-4",
        year: "2021",
        region: "Shey-Phoksundo & High Dolpo",
        altitude: "4,850m – 5,430m AMSL",
        title: "Monarchs of the High Passes: Winter Snow Leopard",
        desc: "A grueling 38-day sub-zero winter bivouac across jagged moraines, capturing the solitary phantom traversing wind-blasted ridges during snow squalls.",
        tag: "Sub-Zero Alpine",
      },
    ],
    gear: [
      {
        id: "gear-1",
        category: "Primary Bodies",
        item: "Nikon Z9 Flagship",
        details: "Dual CFexpress Type B • 45.7MP Stacked CMOS • 0.0dB Silent Electronic Shutter",
      },
      {
        id: "gear-2",
        category: "Super Telephoto",
        item: "Nikkor Z 400mm f/2.8 TC VR S",
        details: "Built-in 1.4x internal teleconverter (effective 560mm f/4) • Fluorite elements",
      },
      {
        id: "gear-3",
        category: "High Altitude Extreme",
        item: "Nikkor Z 800mm f/6.3 VR S",
        details: "Phase Fresnel optics • Handholdable sub-zero alpine tracking glass",
      },
      {
        id: "gear-4",
        category: "Acoustic Field Sensor",
        item: "32-Bit Float Ambisonics Rig",
        details: "Binaural sound-dampened mic capsules recording unclipped natural soundscapes",
      },
      {
        id: "gear-5",
        category: "Support & Blinds",
        item: "Gitzo Carbon 5-Series • Kwik Camo",
        details: "Non-reflective matte wraps • Sub-zero fluid gimbal head rated to -40°C",
      },
      {
        id: "gear-6",
        category: "Digital Cryptography",
        item: "Hardware C2PA Provenance Key",
        details: "Cryptographic SHA-256 sensor timestamping guaranteeing authentic capture origin",
      },
    ],
  },
  home: {
    badgeText: "Cryptographically Verified Wildlife Archive",
    heroHeadline: "Apex & Habitat Vault",
    heroSubtitle:
      "Direct-sensor RAW acquisitions cataloged across Himalayan ridges, lowland sal forests, and protected river corridors.",
    indexedFrames: "1,482",
    biomesCount: "06 Terrains",
    archivalFormat: "16-bit DNG",
  },
  payments: defaultPaymentSettings,
  watermark: defaultWatermarkSettings,
};
