"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Download,
  Heart,
  KeyRound,
  LogOut,
  Camera,
  Award,
  CheckCircle2,
  Clock,
  User,
  PenSquare,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Plus,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Truck,
  FileCheck,
  Receipt,
  Copy,
  Check,
  Printer,
  QrCode,
  ArrowUpRight,
  Shield,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  FileCode,
  ChevronDown,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import dynamic from "next/dynamic";

const TipTapEditor = dynamic(
  () => import("@/components/admin/dispatch-editor/TipTapEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-2xl border border-slate-200 dark:border-[#163e26] bg-slate-50 dark:bg-[#030e06] animate-pulse flex flex-col items-center justify-center gap-2.5 text-xs font-mono text-slate-400">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Expedition Story Editor...</span>
      </div>
    ),
  }
);

type TabType = "orders" | "downloads" | "wishlist" | "stories" | "profile" | "password";

interface OrderItem {
  id: string;
  title: string;
  date: string;
  edition: string;
  format: string;
  status: string;
  progressStep?: number;
  total: string;
  thumbnailUrl: string;
  downloadUrl?: string;
  customerName?: string;
  customerEmail?: string;
  creatorName?: string;
  creatorTitle?: string;
  rightsReservedNotice?: string;
  deliveryType?: string;
  provenanceHash: string;
  fullHash: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  lastCheckpoint?: string;
  invoiceNumber: string;
  paymentMethod: string;
  hasDigitalMaster: boolean;
  digitalDownloadId?: string;
}

const ORDER_STEPS = [
  { step: 1, label: "Ordered", desc: "Commission Placed" },
  { step: 2, label: "Printing", desc: "Fine Art Giclée" },
  { step: 3, label: "Framing", desc: "Museum Mount & Inspection" },
  { step: 4, label: "Shipped", desc: "Armored Art Courier" },
  { step: 5, label: "Delivered", desc: "Archival Vault Arrival" },
];

interface VaultGranularFile {
  label: string;
  ext: string;
  size: string;
  desc: string;
}

interface VaultAsset {
  id: string;
  title: string;
  type: "photo" | "audio";
  thumbnailUrl?: string;
  resolution: string;
  format: string;
  license: string;
  size: string;
  dateAdded: string;
  sha256: string;
  audioDuration?: string;
  audioDurationSeconds?: number;
  files: VaultGranularFile[];
  licenseTerms: {
    licenseName: string;
    grantee: string;
    permitted: string[];
    restrictions: string[];
    territory: string;
    validity: string;
    deedHash: string;
  };
}

interface CustomerStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  readingTimeMinutes: number;
  locationLabel: string | null;
  createdAt: string;
  categoryName?: string;
}

export default function AccountDashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("orders");

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Stories / Blog Submissions State
  const [stories, setStories] = useState<CustomerStory[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [isStoryModalExpanded, setIsStoryModalExpanded] = useState(false);
  const [storyEditorMode, setStoryEditorMode] = useState<"rich" | "raw">("rich");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyCategory, setStoryCategory] = useState("");
  const [storyLocation, setStoryLocation] = useState("");
  const [storyCover, setStoryCover] = useState("");
  const [storyExcerpt, setStoryExcerpt] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [storySubmitting, setStorySubmitting] = useState(false);
  const [storyMessage, setStoryMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize profile with session data or API
  useEffect(() => {
    if (session?.user) {
      setProfileName(session.user.name || "");
      setProfileAvatar(session.user.image || "");
    }

    fetch("/api/customer/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          if (data.user.name) setProfileName(data.user.name);
          if (data.user.phone) setProfilePhone(data.user.phone);
          if (data.user.image) setProfileAvatar(data.user.image);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("user-profile-updated", {
                detail: { name: data.user.name, image: data.user.image },
              })
            );
          }
        }
      })
      .catch(() => {});
  }, [session]);

  // Fetch stories when navigating to stories tab
  useEffect(() => {
    if (activeTab === "stories") {
      fetchStories();
    }
  }, [activeTab]);

  const fetchStories = async () => {
    setStoriesLoading(true);
    try {
      const res = await fetch("/api/customer/posts");
      const data = await res.json();
      if (data.posts) setStories(data.posts);
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories[0]?.id && !storyCategory) {
          setStoryCategory(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setStoriesLoading(false);
    }
  };

  // Profile Update Handler
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          image: profileAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile." });
      } else {
        setProfileMessage({ type: "success", text: "Profile details saved successfully!" });
        if (updateSession) {
          updateSession({ name: profileName, image: profileAvatar });
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("user-profile-updated", {
              detail: { name: profileName, image: profileAvatar },
            })
          );
        }
      }
    } catch {
      setProfileMessage({ type: "error", text: "Network error while saving profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  // Avatar Upload / Image Handler
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileMessage({ type: "error", text: "Avatar image must be under 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Password Update Handler
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error || "Failed to update password." });
      } else {
        setPasswordMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Network error while updating password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Story Submission Handler
  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStorySubmitting(true);
    setStoryMessage(null);

    try {
      const res = await fetch("/api/customer/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyTitle,
          categoryId: storyCategory,
          locationLabel: storyLocation,
          coverImage: storyCover || undefined,
          excerpt: storyExcerpt || undefined,
          content: storyContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStoryMessage({ type: "error", text: data.error || "Failed to submit story." });
      } else {
        setStoryMessage({
          type: "success",
          text: "Story submitted successfully! It has been dispatched to Suban for review and will be published upon approval.",
        });
        setShowStoryModal(false);
        setStoryTitle("");
        setStoryLocation("");
        setStoryCover("");
        setStoryExcerpt("");
        setStoryContent("");
        fetchStories();
      }
    } catch {
      setStoryMessage({ type: "error", text: "Network error while submitting story." });
    } finally {
      setStorySubmitting(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // Orders Interactive UI States
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "in_progress" | "delivered">("all");
  const [selectedCertificateOrder, setSelectedCertificateOrder] = useState<OrderItem | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderItem | null>(null);
  const [selectedProvenanceOrder, setSelectedProvenanceOrder] = useState<OrderItem | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadOriginalPhoto = async (order: OrderItem) => {
    const url = order.downloadUrl || order.thumbnailUrl;
    if (!url) return;
    try {
      const sanitizedName = order.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const filename = `${sanitizedName}-unwatermarked-original.jpg`;
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Direct anchor fallback
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `${order.title}-original.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Live Orders, Vault, & Wishlist State from DB API
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [downloads, setDownloads] = useState<VaultAsset[]>([]);
  const [wishlist, setWishlist] = useState<
    {
      id: string;
      title: string;
      category: string;
      price: string;
      slug: string;
      image: string;
    }[]
  >([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  const WISHLIST_DEFAULT_KEY = "suban_curated_wishlist";
  const VAULT_DEFAULT_KEY = "suban_digital_vault";

  const getWishlistStorageKey = useCallback(() => {
    if (session?.user?.email) {
      return `suban_curated_wishlist_${session.user.email}`;
    }
    return WISHLIST_DEFAULT_KEY;
  }, [session?.user?.email]);

  const getVaultStorageKey = useCallback(() => {
    if (session?.user?.email) {
      return `suban_digital_vault_${session.user.email}`;
    }
    return VAULT_DEFAULT_KEY;
  }, [session?.user?.email]);

  const loadDefaultWishlistFromApi = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        const items = data.products.slice(0, 4).map((p: any) => ({
          id: `wl-${p.id}`,
          title: p.title,
          category: p.category || "Fine Art Edition",
          price: p.variants?.[0]?.price ? `$${Number(p.variants[0].price).toLocaleString()}` : "$950",
          slug: p.slug,
          image: p.media?.[0]?.url || "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&auto=format&fit=crop&q=80",
        }));
        setWishlist(items);
        const storageKey = getWishlistStorageKey();
        try {
          localStorage.setItem(storageKey, JSON.stringify(items));
          localStorage.setItem(WISHLIST_DEFAULT_KEY, JSON.stringify(items));
        } catch (e) {
          console.error("Failed to cache wishlist to localStorage", e);
        }
        return items;
      }
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
    }
    return [];
  }, [getWishlistStorageKey]);

  useEffect(() => {
    setOrdersLoading(true);
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.orders)) setOrders(data.orders);
          if (Array.isArray(data.downloads)) {
            const vaultKey = getVaultStorageKey();
            const savedVault =
              typeof window !== "undefined"
                ? localStorage.getItem(vaultKey) ?? localStorage.getItem(VAULT_DEFAULT_KEY)
                : null;

            if (savedVault !== null) {
              try {
                const parsed = JSON.parse(savedVault);
                if (Array.isArray(parsed)) {
                  setDownloads(parsed);
                  return;
                }
              } catch (e) {
                console.error("Failed to parse vault from localStorage", e);
              }
            }

            setDownloads(data.downloads);
            try {
              localStorage.setItem(vaultKey, JSON.stringify(data.downloads));
              localStorage.setItem(VAULT_DEFAULT_KEY, JSON.stringify(data.downloads));
            } catch (e) {
              console.error("Failed to cache vault to localStorage", e);
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching customer orders:", err))
      .finally(() => setOrdersLoading(false));

    // Load wishlist from localStorage or initialize with curated products
    setWishlistLoading(true);
    try {
      const storageKey = getWishlistStorageKey();
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(storageKey) ?? localStorage.getItem(WISHLIST_DEFAULT_KEY)
          : null;

      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlist(parsed);
          setWishlistLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse wishlist from localStorage", e);
    }

    loadDefaultWishlistFromApi().finally(() => setWishlistLoading(false));
  }, [getWishlistStorageKey, getVaultStorageKey, loadDefaultWishlistFromApi]);

  const filteredOrders = orders.filter((order) => {
    const q = orderSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.title.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.edition.toLowerCase().includes(q) ||
      order.format.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (orderStatusFilter === "in_progress") {
      return (order.progressStep ?? 5) < 5;
    }
    if (orderStatusFilter === "delivered") {
      return (order.progressStep ?? 5) === 5;
    }
    return true;
  });

  // Digital Vault Interactive States
  const [vaultSearchQuery, setVaultSearchQuery] = useState("");
  const [vaultTypeFilter, setVaultTypeFilter] = useState<"all" | "photo" | "audio">("all");
  const [selectedLicenseAsset, setSelectedLicenseAsset] = useState<VaultAsset | null>(null);
  const [openDownloadDropdownId, setOpenDownloadDropdownId] = useState<string | null>(null);
  const [downloadingFileKey, setDownloadingFileKey] = useState<string | null>(null);

  // Inline Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(42);
  const audioDuration = 215; // 03:35
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioCurrentTime((prev) => {
          if (prev >= audioDuration) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio, audioDuration]);

  const handleTogglePlayAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  const handleDownloadFile = (asset: VaultAsset, file?: VaultGranularFile) => {
    const fileLabel = file ? file.label : "Full Master Archive";
    const fileExt = file ? file.ext : ".zip";
    const fileKey = `${asset.id}-${fileExt}`;
    setDownloadingFileKey(fileKey);

    const content = `SUBAN WILDLIFE FINE-ART & COMMERCIAL VAULT
=====================================================
Asset: ${asset.title}
Asset ID: ${asset.id}
File Component: ${fileLabel} (${fileExt})
File Size: ${file ? file.size : asset.size}
Registered Grantee: Som Prakash Chaudhary
License: ${asset.license}
Deed Verification Hash: ${asset.licenseTerms.deedHash}
SHA-256 Checksum: ${asset.sha256}
Security Timestamp: ${new Date().toISOString()}
=====================================================
Cryptographically signed by Suban Photography Ltd.`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTitle = asset.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    link.download = `${sanitizedTitle}_${file ? file.ext.replace(".", "") : "master_archive"}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingFileKey(null);
    }, 1800);
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredDownloads = downloads.filter((item) => {
    const q = vaultSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.format.toLowerCase().includes(q) ||
      item.license.toLowerCase().includes(q) ||
      item.resolution.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (vaultTypeFilter === "photo") {
      return item.type === "photo";
    }
    if (vaultTypeFilter === "audio") {
      return item.type === "audio";
    }
    return true;
  });

  const handleRemoveWishlist = (id: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        const storageKey = getWishlistStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem(WISHLIST_DEFAULT_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist wishlist removal to localStorage", e);
      }
      return updated;
    });
  };

  const handleRestoreDefaultWishlist = async () => {
    setWishlistLoading(true);
    await loadDefaultWishlistFromApi();
    setWishlistLoading(false);
  };

  const handleRemoveVault = (id: string) => {
    setDownloads((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        const vaultKey = getVaultStorageKey();
        localStorage.setItem(vaultKey, JSON.stringify(updated));
        localStorage.setItem(VAULT_DEFAULT_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist vault removal to localStorage", e);
      }
      return updated;
    });
  };

  const handleRestoreDefaultVault = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/customer/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.downloads)) {
        setDownloads(data.downloads);
        const vaultKey = getVaultStorageKey();
        try {
          localStorage.setItem(vaultKey, JSON.stringify(data.downloads));
          localStorage.setItem(VAULT_DEFAULT_KEY, JSON.stringify(data.downloads));
        } catch {}
      }
    } catch (err) {
      console.error("Failed to restore default vault:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Navigation Items
  const navItems = [
    { id: "orders", label: "Purchased Photos", icon: Camera, count: orders.length },
    { id: "downloads", label: "Digital Vault & Licenses", icon: Download, count: downloads.length },
    { id: "wishlist", label: "Curated Wishlist", icon: Heart, count: wishlist.length },
    { id: "stories", label: "Field Stories & Blogs", icon: FileText, count: stories.length || undefined },
    { id: "profile", label: "Profile & Identity", icon: User },
    { id: "password", label: "Password & Security", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#f6f9f7] dark:bg-[#020d06] text-slate-900 dark:text-slate-100 pt-6 sm:pt-8 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Background ambient lighting glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================
              LEFT SIDEBAR: Unified Collector Panel & Navigation
              ======================================================== */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-5 backdrop-blur-xl shadow-xl dark:shadow-2xl transition-colors space-y-5">
              
              {/* Compact Collector Identity Section */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-[#163e26]/80 relative">
                <div className="relative inline-block mx-auto mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#0a2617] border-2 border-emerald-300 dark:border-emerald-500/40 overflow-hidden flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    {profileAvatar ? (
                      <Image
                        src={profileAvatar}
                        alt={profileName || "Collector"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#06180e] rounded-full shadow-sm" title="Active Member" />
                </div>

                <h2 className="font-headline font-bold text-base text-slate-900 dark:text-white truncate">
                  {profileName || session?.user?.name || "Fine Art Collector"}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono truncate max-w-[210px] mx-auto mt-0.5">
                  {session?.user?.email || "collector@domain.com"}
                </p>

                <div className="mt-2.5 flex justify-center">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono uppercase tracking-wider font-bold">
                    <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified Collector</span>
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                <div className="px-2 pb-1.5 text-[10px] font-label font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
                  Portal Menu
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-neutral-950 shadow-md font-bold"
                          : "text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#0d2a1b] hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white dark:text-neutral-950" : "text-emerald-600 dark:text-emerald-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.count !== undefined && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-white/25 text-white dark:bg-black/25 dark:text-black font-bold"
                                : "bg-slate-100 dark:bg-[#0d2617] text-slate-600 dark:text-neutral-400"
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "opacity-100" : "opacity-35"}`} />
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Action Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#163e26]/80 space-y-1">
                <Link
                  href="/gallery"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-[#0d2a1b] hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Browse Fine Art Gallery</span>
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </aside>

          {/* ========================================================
              RIGHT MAIN CONTENT: Selected Tab View
              ======================================================== */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Flash Messages */}
            {storyMessage && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all shadow-sm ${
                  storyMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {storyMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                  <span>{storyMessage.text}</span>
                </div>
                <button type="button" onClick={() => setStoryMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 1: PRINT ORDERS
                ---------------------------------------------------- */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#163e26]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Digital Art Vault & Ownership
                    </span>
                    <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Purchased Photos & Digital Contracts
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                      Download full-resolution original photos without watermark. No physical delivery needed. Legal Digital Ownership Contract Paper included.
                    </p>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        placeholder="Search artworks, ID..."
                        className="pl-8 pr-7 py-1.5 rounded-xl text-xs bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-sans w-full sm:w-48"
                      />
                      {orderSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOrderSearchQuery("")}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#06180e] border border-slate-200/80 dark:border-[#163e26] text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{orders.length} {orders.length === 1 ? "Purchased Photo" : "Purchased Photos"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-2xl bg-white/60 dark:bg-[#06180e]/60 border border-slate-200 dark:border-[#163e26] p-6 animate-pulse space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="h-5 w-32 bg-slate-200 dark:bg-emerald-950/60 rounded-lg" />
                            <div className="h-5 w-24 bg-slate-200 dark:bg-emerald-950/60 rounded-lg" />
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-emerald-950/60" />
                            <div className="space-y-2 flex-1">
                              <div className="h-4 w-48 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                              <div className="h-3 w-32 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-xl space-y-5 transition-all hover:border-slate-300 dark:hover:border-emerald-500/40"
                    >
                      {/* Top Bar: Order ID, Date, Status Badge & Total */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#163e26]/60">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-500/30">
                            {order.id}
                          </span>
                          <span className="text-slate-300 dark:text-neutral-600">•</span>
                          <span className="text-xs text-slate-500 dark:text-neutral-400 font-mono">{order.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Paid • Digital Master Ready</span>
                          </span>

                          <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                            {order.total}
                          </span>
                        </div>
                      </div>

                      {/* Main Artwork Showcase: Thumbnail + Info */}
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        {/* Artwork Thumbnail */}
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/20 dark:border-[#18482d] shrink-0 shadow-md group">
                          <Image
                            src={order.thumbnailUrl}
                            alt={order.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 112px, 128px"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                            <span className="text-[10px] font-mono text-emerald-300 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Original Photo
                            </span>
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 space-y-2.5 min-w-0">
                          <div>
                            <h3 className="font-headline font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                              {order.title}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-600 dark:text-neutral-400">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-400">Format:</span>
                                <span className="font-medium text-slate-800 dark:text-neutral-200">Full-Resolution Original (No Watermark)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-400">Delivery:</span>
                                <span className="font-medium text-emerald-700 dark:text-emerald-400">Instant Download (No Physical Shipping)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-400">Ownership:</span>
                                <span className="font-medium text-slate-800 dark:text-neutral-200">Digital Owner Granted</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-slate-400">Creator Rights:</span>
                                <span className="font-medium text-amber-700 dark:text-amber-400">Reserved to Suban Dahit</span>
                              </div>
                            </div>
                          </div>

                          {/* Digital Contract & Provenance Ledger Hash */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-bold">
                              Digital Contract Hash:
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedCertificateOrder(order)}
                              title="Click to view digital contract deed"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-[#072414] dark:hover:bg-[#0c331d] text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/30 text-xs font-mono font-semibold transition-all group/hash cursor-pointer shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Deed {order.provenanceHash}</span>
                              <ExternalLink className="w-3 h-3 text-emerald-500 group-hover/hash:translate-x-0.5 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clean Digital Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#163e26]/70">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* PRIMARY CTA: Download Original Photo without watermark */}
                          <button
                            type="button"
                            onClick={() => handleDownloadOriginalPhoto(order)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold font-mono tracking-wide shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Original Photo (No Watermark)</span>
                          </button>

                          {/* Digital Contract Paper */}
                          <button
                            type="button"
                            onClick={() => setSelectedCertificateOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-[#163e26] text-xs font-semibold transition-all cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Digital Contract Paper</span>
                          </button>

                          {/* View Receipt */}
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-slate-800 dark:text-neutral-200 border border-slate-200 dark:border-[#163e26] text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                            <span>View Receipt</span>
                          </button>
                        </div>

                        {/* Digital Vault Link */}
                        <button
                          type="button"
                          onClick={() => setActiveTab("downloads")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-mono font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <span>Full RAW Files in Vault</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                      ))}

                      {filteredOrders.length === 0 && (
                        <div className="p-10 rounded-2xl bg-white/90 dark:bg-[#06180e]/90 border border-slate-200 dark:border-[#163e26] text-center space-y-3 shadow-sm">
                          <Search className="w-8 h-8 text-slate-400 mx-auto" />
                          <h3 className="font-headline font-semibold text-base text-slate-800 dark:text-white">
                            No acquisitions match your filter
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                            Try searching for a different artwork name or reset the status filter to view all collector editions.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setOrderSearchQuery("");
                              setOrderStatusFilter("all");
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                          >
                            Reset Filter
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 2: DIGITAL VAULT & LICENSES
                ---------------------------------------------------- */}
            {activeTab === "downloads" && (
              <div className="space-y-6">
                {/* Header & Description */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#163e26]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Digital Vault & Commercial RAW Licenses
                    </span>
                    <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Master Files & Commercial Licenses
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                      High-bitrate camera sensor captures, lossless binaural ambisonics, and cryptographically verified intellectual property deeds.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-semibold">
                      {downloads.length} Licensed Assets
                    </span>
                  </div>
                </div>

                {/* Search & Filter Toolbar (Req 5) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/90 dark:bg-[#06180e]/90 border border-slate-200 dark:border-[#163e26] shadow-sm">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                      placeholder="Search by artwork title, format, license type, or ID..."
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-[#05140b] focus:outline-none focus:border-emerald-500 font-sans"
                    />
                    {vaultSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setVaultSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Type Tabs (Req 5) */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#030e06] border border-slate-200/80 dark:border-[#163e26] self-start sm:self-auto overflow-x-auto max-w-full">
                    <button
                      type="button"
                      onClick={() => setVaultTypeFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        vaultTypeFilter === "all"
                          ? "bg-white dark:bg-[#0e2a1b] text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      All Assets ({downloads.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultTypeFilter("photo")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        vaultTypeFilter === "photo"
                          ? "bg-white dark:bg-[#0e2a1b] text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Photography RAW ({downloads.filter((d) => d.type === "photo").length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultTypeFilter("audio")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        vaultTypeFilter === "audio"
                          ? "bg-white dark:bg-[#0e2a1b] text-emerald-700 dark:text-emerald-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>Field Audio ({downloads.filter((d) => d.type === "audio").length})</span>
                    </button>
                  </div>
                </div>

                {/* Asset Cards List */}
                <div className="space-y-5">
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-2xl bg-white/60 dark:bg-[#06180e]/60 border border-slate-200 dark:border-[#163e26] p-6 animate-pulse space-y-4">
                          <div className="flex gap-4 items-center">
                            <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-emerald-950/60" />
                            <div className="space-y-2 flex-1">
                              <div className="h-5 w-52 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                              <div className="h-3.5 w-36 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {filteredDownloads.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-xl space-y-5 transition-all hover:border-emerald-500/40 relative"
                    >
                      {/* Top Row: Thumbnail + Details + Granular Download Action */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="flex items-start gap-4 sm:gap-5">
                          {/* Thumbnail / Visual Reference (Req 1) */}
                          <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-[#163e26] bg-slate-100 dark:bg-[#0a2617] group shadow-inner">
                            {item.type === "photo" && item.thumbnailUrl ? (
                              <Image
                                src={item.thumbnailUrl}
                                alt={item.title}
                                width={112}
                                height={112}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                              />
                            ) : (
                              /* Audio Waveform Cover Artwork (Req 1) */
                              <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-[#0a2617] to-neutral-950 flex flex-col items-center justify-center p-2 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
                                <Music className="w-7 h-7 text-emerald-400 mb-1 relative z-10" />
                                <span className="text-[9px] font-mono font-bold text-emerald-300/90 tracking-wider relative z-10 uppercase">
                                  Binaural 3D
                                </span>
                                {/* Mini animated wave equalizer bars in thumbnail */}
                                <div className="flex items-end gap-1 h-3 mt-1 relative z-10">
                                  <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "h-3 animate-pulse" : "h-1.5"}`} />
                                  <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "h-2.5 animate-bounce" : "h-2"}`} />
                                  <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "h-3 animate-pulse" : "h-1"}`} />
                                  <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "h-2 animate-bounce" : "h-2.5"}`} />
                                  <span className={`w-0.5 bg-emerald-400 rounded-full ${isPlayingAudio ? "h-3.5 animate-pulse" : "h-1.5"}`} />
                                </div>
                              </div>
                            )}

                            {/* Corner Format Badge */}
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-mono font-bold text-emerald-300 border border-white/10 uppercase">
                              {item.type === "photo" ? "RAW MASTER" : "24-BIT FLAC"}
                            </span>

                            {/* Remove from Vault Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveVault(item.id)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-900/80 text-white hover:text-red-300 backdrop-blur-md transition-colors cursor-pointer z-10"
                              title="Remove from Digital Vault"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Titles, License, and File Chips */}
                          <div className="space-y-2 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/30">
                                {item.id}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-mono">
                                Added {item.dateAdded}
                              </span>
                            </div>

                            <h3 className="font-headline font-semibold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h3>

                            {/* Clickable License Link (Req 4) */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedLicenseAsset(item)}
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline decoration-emerald-500/60 cursor-pointer group text-left"
                              >
                                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                                <span>{item.license}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shrink-0">
                                  View Legal Scope ↗
                                </span>
                              </button>
                            </div>

                            {/* Quick File Chips for direct download (Req 2) */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {item.files.map((file) => (
                                <button
                                  key={file.ext}
                                  type="button"
                                  onClick={() => handleDownloadFile(item, file)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-[11px] font-mono text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-[#163e26] transition-colors cursor-pointer"
                                  title={`Download ${file.label} (${file.size})`}
                                >
                                  <Download className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{file.ext}</span>
                                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">{file.size}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Granular Download Dropdown Button & Remove Action */}
                        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 mt-2 lg:mt-0">
                          <div className="relative">
                            <div className="inline-flex rounded-xl shadow-sm border border-emerald-600 dark:border-emerald-500/60 overflow-visible bg-emerald-600 dark:bg-emerald-500 text-white dark:text-neutral-950">
                              {/* Main Button (Downloads Full Archive) */}
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(item)}
                                disabled={downloadingFileKey === `${item.id}-.zip`}
                                className="px-4 py-2.5 text-xs font-bold tracking-wide hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors flex items-center gap-2 cursor-pointer rounded-l-xl"
                              >
                                <Download className="w-4 h-4" />
                                <span>
                                  {downloadingFileKey === `${item.id}-.zip`
                                    ? "Packaging Archive..."
                                    : `Download Archive (${item.size.split(" ")[0]} MB)`}
                                </span>
                              </button>

                              {/* Dropdown Toggle Arrow */}
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenDownloadDropdownId(
                                    openDownloadDropdownId === item.id ? null : item.id
                                  )
                                }
                                className="px-2.5 py-2.5 border-l border-emerald-700 dark:border-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-colors cursor-pointer rounded-r-xl"
                                title="Choose individual file format"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    openDownloadDropdownId === item.id ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Granular Download Menu Popover (Req 2) */}
                            {openDownloadDropdownId === item.id && (
                              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] p-3 shadow-2xl z-30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-2 py-1 border-b border-slate-100 dark:border-[#163e26]/80 flex items-center justify-between">
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-bold">
                                    Granular File Formats
                                  </span>
                                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                    {item.files.length} Available
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  {item.files.map((file) => (
                                    <button
                                      key={file.ext}
                                      type="button"
                                      onClick={() => {
                                        handleDownloadFile(item, file);
                                        setOpenDownloadDropdownId(null);
                                      }}
                                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#0c2b18] border border-transparent hover:border-slate-200 dark:hover:border-[#163e26] transition-all flex items-center justify-between gap-3 group cursor-pointer"
                                    >
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                            {file.label}
                                          </span>
                                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#0a2617] text-slate-700 dark:text-neutral-300">
                                            {file.ext}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                                          {file.desc}
                                        </p>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="text-xs font-mono font-semibold text-slate-800 dark:text-neutral-200 block">
                                          {file.size}
                                        </span>
                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 group-hover:underline inline-flex items-center gap-0.5">
                                          Download <Download className="w-2.5 h-2.5 ml-0.5" />
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>

                                <div className="pt-1.5 border-t border-slate-100 dark:border-[#163e26]/80 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(item)}
                                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
                                  >
                                    Download Complete ZIP Archive ({item.size})
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Remove Action Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveVault(item.id)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#163e26] bg-slate-100 hover:bg-red-50 dark:bg-[#0a2617] dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove from Digital Vault"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* INLINE AUDIO PLAYER (Req 3) - Only for audio item */}
                      {item.type === "audio" && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#062012]/60 to-[#031107] border border-emerald-500/30 shadow-inner space-y-3.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-headline">
                                Field Acoustic Master Stream (Ambisonic)
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                                24-bit / 96kHz Lossless
                              </span>
                            </div>
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
                            </span>
                          </div>

                          {/* Player Controls + Waveform */}
                          <div className="flex items-center gap-4">
                            {/* Play / Pause Button */}
                            <button
                              type="button"
                              onClick={handleTogglePlayAudio}
                              className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-900/30 cursor-pointer shrink-0 active:scale-95"
                              title={isPlayingAudio ? "Pause Recording" : "Play Wilderness Recording"}
                            >
                              {isPlayingAudio ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </button>

                            {/* Waveform Visualizer + Scrubber (Req 3) */}
                            <div className="flex-1 space-y-1.5">
                              {/* Dynamic Waveform Bars */}
                              <div
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const clickX = e.clientX - rect.left;
                                  const pct = Math.max(0, Math.min(1, clickX / rect.width));
                                  setAudioCurrentTime(Math.round(pct * audioDuration));
                                }}
                                className="h-10 flex items-end gap-1 cursor-pointer group py-1"
                                title="Click to seek playback position"
                              >
                                {[
                                  18, 28, 42, 60, 35, 75, 90, 48, 62, 85, 100, 70, 55, 82, 95, 60, 40, 78,
                                  92, 65, 88, 50, 72, 85, 45, 68, 52, 38, 25, 42, 58, 30,
                                ].map((heightPercent, idx) => {
                                  const barProgress = idx / 32;
                                  const currentProgress = audioCurrentTime / audioDuration;
                                  const isPlayed = barProgress <= currentProgress;

                                  return (
                                    <div
                                      key={idx}
                                      style={{ height: `${heightPercent}%` }}
                                      className={`flex-1 rounded-full transition-all duration-150 ${
                                        isPlayed
                                          ? "bg-emerald-500"
                                          : "bg-slate-300 dark:bg-[#163e26] group-hover:bg-slate-400 dark:group-hover:bg-[#1f5636]"
                                      } ${
                                        isPlayingAudio && isPlayed
                                          ? "opacity-100"
                                          : isPlayed
                                          ? "opacity-80"
                                          : "opacity-40"
                                      }`}
                                    />
                                  );
                                })}
                              </div>

                              {/* Interactive Progress Bar */}
                              <div className="relative w-full h-1.5 bg-slate-200 dark:bg-[#0c2b18] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                                  style={{ width: `${(audioCurrentTime / audioDuration) * 100}%` }}
                                />
                              </div>
                            </div>

                            {/* Mute / Unmute Toggle */}
                            <button
                              type="button"
                              onClick={() => setAudioMuted(!audioMuted)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0c2b18] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                              title={audioMuted ? "Unmute" : "Mute"}
                            >
                              {audioMuted ? (
                                <VolumeX className="w-4 h-4 text-red-400" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Technical Specs & Cryptographic Checksum Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-[#163e26]/60 text-xs">
                        <div>
                          <span className="block text-slate-500 dark:text-neutral-400 font-mono text-[10px] uppercase font-semibold">
                            {item.type === "photo" ? "Sensor Resolution" : "Acoustic Sample Rate"}
                          </span>
                          <span className="text-slate-800 dark:text-neutral-200 font-medium">
                            {item.resolution}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500 dark:text-neutral-400 font-mono text-[10px] uppercase font-semibold">
                            Master Format
                          </span>
                          <span className="text-slate-800 dark:text-neutral-200 font-medium">
                            {item.format}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500 dark:text-neutral-400 font-mono text-[10px] uppercase font-semibold">
                            License Protocol
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedLicenseAsset(item)}
                            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Commercial</span>
                          </button>
                        </div>
                        <div>
                          <span className="block text-slate-500 dark:text-neutral-400 font-mono text-[10px] uppercase font-semibold">
                            SHA-256 Checksum
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyHash(item.sha256)}
                            className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Click to copy SHA-256 checksum"
                          >
                            <span>{item.sha256.slice(0, 10)}...{item.sha256.slice(-4)}</span>
                            <Copy className="w-3 h-3 text-slate-400 hover:text-emerald-500 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                      ))}

                      {downloads.length === 0 ? (
                        <div className="p-12 rounded-2xl bg-white/90 dark:bg-[#06180e]/90 border border-slate-200 dark:border-[#163e26] text-center space-y-4 shadow-sm">
                          <Download className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto" />
                          <h3 className="font-headline font-semibold text-base text-slate-800 dark:text-white">
                            Your Digital Vault is Empty
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                            No active RAW sensor captures or audio files stored in your vault. Acquired master licenses from the gallery will appear here.
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <Link
                              href="/gallery"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Browse Master Gallery</span>
                            </Link>
                            <button
                              type="button"
                              onClick={handleRestoreDefaultVault}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#163e26] hover:bg-slate-100 dark:hover:bg-[#0d2617] text-slate-700 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Default Vault Licenses</span>
                            </button>
                          </div>
                        </div>
                      ) : filteredDownloads.length === 0 ? (
                        <div className="p-10 rounded-2xl bg-white/90 dark:bg-[#06180e]/90 border border-slate-200 dark:border-[#163e26] text-center space-y-3 shadow-sm">
                          <Search className="w-8 h-8 text-slate-400 mx-auto" />
                          <h3 className="font-headline font-semibold text-base text-slate-800 dark:text-white">
                            No digital assets match your filter
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                            Try clearing your search query or switching your asset category filter to view all digital licenses.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setVaultSearchQuery("");
                              setVaultTypeFilter("all");
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                          >
                            Reset Vault Filter
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 3: CURATED WISHLIST
                ---------------------------------------------------- */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-[#163e26]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Saved Artworks
                    </span>
                    <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Curated Collector Wishlist
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                      Reserved fine-art frames and anticipated print releases from Suban.
                    </p>
                  </div>
                </div>

                {wishlistLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-2xl bg-white/60 dark:bg-[#06180e]/60 border border-slate-200 dark:border-[#163e26] overflow-hidden animate-pulse">
                        <div className="aspect-[16/10] bg-slate-200 dark:bg-emerald-950/60" />
                        <div className="p-5 space-y-3">
                          <div className="h-5 w-3/4 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                          <div className="h-4 w-1/3 bg-slate-200 dark:bg-emerald-950/60 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white/90 dark:bg-[#06180e]/90 border border-slate-200 dark:border-[#163e26] text-center space-y-4 shadow-sm">
                    <Heart className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto" />
                    <h3 className="font-headline font-semibold text-base text-slate-800 dark:text-white">
                      Your Curated Wishlist is Empty
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-sm mx-auto">
                      Explore the live fine art gallery and reserve master editions to save them here in your collector portfolio.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Browse Master Gallery</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleRestoreDefaultWishlist}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#163e26] hover:bg-slate-100 dark:hover:bg-[#0d2617] text-slate-700 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Curated Picks</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] overflow-hidden backdrop-blur-xl shadow-md dark:shadow-xl transition-all hover:border-emerald-500/40 group relative"
                      >
                        <div className="aspect-[16/10] relative overflow-hidden bg-slate-900">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-semibold">
                            {item.category}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="absolute top-3 left-3 p-1.5 rounded-full bg-black/50 hover:bg-red-900/80 text-white hover:text-red-300 backdrop-blur-md transition-colors cursor-pointer"
                            title="Remove from wishlist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="font-headline font-semibold text-base text-slate-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1">
                              Starting from {item.price}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Link
                              href={`/gallery/${item.slug}`}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d2617] dark:hover:bg-[#123821] text-slate-800 dark:text-white text-xs font-semibold text-center transition-colors"
                            >
                              View Print Details
                            </Link>
                            <Link
                              href="/checkout"
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 text-xs font-bold text-center transition-colors"
                            >
                              Acquire Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 4: FIELD STORIES & BLOG SUBMISSIONS
                ---------------------------------------------------- */}
            {activeTab === "stories" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-[#163e26]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                      Community Journal
                    </span>
                    <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                      <span>Field Stories & Dispatches</span>
                    </h1>
                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                      Share your expedition encounters, wildlife sightings, and gear fieldcraft. Submissions are reviewed by Suban before publishing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowStoryModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write Field Story</span>
                  </button>
                </div>

                {storiesLoading ? (
                  <div className="text-center py-12 text-xs text-slate-500 dark:text-neutral-500">
                    Loading your field stories...
                  </div>
                ) : stories.length === 0 ? (
                  <div className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-dashed border-slate-300 dark:border-[#163e26] p-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#0a2617] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <PenSquare className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-headline font-semibold text-base text-slate-900 dark:text-white">
                        No Stories Submitted Yet
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm mx-auto">
                        Have you tracked wildlife in the Himalaya or Terai? Write a dispatch to share your experience with the collector community.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowStoryModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Your First Story</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stories.map((story) => (
                      <div
                        key={story.id}
                        className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-6 backdrop-blur-xl shadow-md dark:shadow-xl space-y-4 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                              {story.status === "published" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Published & Live</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Pending Admin Review</span>
                                </span>
                              )}

                              {story.locationLabel && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-neutral-400">
                                  <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>{story.locationLabel}</span>
                                </span>
                              )}
                            </div>

                            <h3 className="font-headline font-semibold text-lg text-slate-900 dark:text-white pt-1">
                              {story.title}
                            </h3>

                            {story.excerpt && (
                              <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-2">
                                {story.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {story.status === "published" ? (
                              <Link
                                href={`/blog/${story.slug}`}
                                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0d2617] dark:hover:bg-[#123821] text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <span>Read Live</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            ) : (
                              <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-medium">
                                In Curation Queue
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-[#163e26]/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                          <span>Submitted: {new Date(story.createdAt).toLocaleDateString()}</span>
                          <span>{story.readingTimeMinutes} min read</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 5: PROFILE & IDENTITY (EDIT / AVATAR)
                ---------------------------------------------------- */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-slate-200 dark:border-[#163e26]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Collector Account
                  </span>
                  <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Profile & Identity Settings
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Update your personal profile, contact information, and public collector avatar.
                  </p>
                </div>

                {profileMessage && (
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs shadow-sm ${
                      profileMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-300"
                    }`}
                  >
                    {profileMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-7 backdrop-blur-xl shadow-md dark:shadow-xl space-y-6 transition-colors">
                  
                  {/* Avatar Upload Section */}
                  <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-[#163e26]/80">
                    <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                      Collector Avatar Photo
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative group shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-[#0a2617] border-2 border-emerald-300 dark:border-emerald-500/40 overflow-hidden flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
                          {profileAvatar ? (
                            <Image
                              src={profileAvatar}
                              alt={profileName || "Avatar"}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <User className="w-10 h-10" />
                          )}
                        </div>
                        <label
                          htmlFor="avatar-input"
                          className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                        >
                          <Camera className="w-5 h-5 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase">Change</span>
                        </label>
                        <input
                          id="avatar-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="avatar-input"
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0e2a1b] dark:hover:bg-[#143e27] text-slate-800 dark:text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-2 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Upload New Photo</span>
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                          Recommended format: JPEG, PNG, or WebP. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Som Prakash Chaudhary"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="+977 980-0000000"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                      Registered Email Address
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="email"
                        disabled
                        value={session?.user?.email || "collector@domain.com"}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-[#020b05] border border-slate-200 dark:border-[#163e26] text-slate-600 dark:text-neutral-400 cursor-not-allowed font-sans"
                      />
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1.5">
                      Your primary email address is tied to your certificate provenance and cannot be changed directly.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{profileLoading ? "Saving..." : "Save Profile Details"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------------------------------------------
                TAB 6: PASSWORD & SECURITY (RESET / CHANGE)
                ---------------------------------------------------- */}
            {activeTab === "password" && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-slate-200 dark:border-[#163e26]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Security Credentials
                  </span>
                  <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                    Password & Vault Credentials
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Update your account password or establish a direct password if registered via Google OAuth.
                  </p>
                </div>

                {passwordMessage && (
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs shadow-sm ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-300"
                    }`}
                  >
                    {passwordMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSave} className="rounded-2xl bg-white/95 dark:bg-[#06180e]/95 border border-slate-200/90 dark:border-[#163e26] p-7 backdrop-blur-xl shadow-md dark:shadow-xl space-y-6 transition-colors">
                  
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                      Current Password (if previously set)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-3 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1.5">
                      If you registered using Google Sign In and have not set a password yet, leave this blank.
                    </p>
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-3 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 cursor-pointer"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-2 font-bold">
                        Confirm New Password
                      </label>
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{passwordLoading ? "Updating..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ========================================================
          MODAL: Submit Field Story / Dispatch
          ======================================================== */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
          <div
            className={`bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] rounded-2xl w-full ${
              isStoryModalExpanded
                ? "max-w-6xl h-[95vh]"
                : "max-w-4xl max-h-[92vh]"
            } overflow-hidden flex flex-col shadow-2xl transition-all duration-300`}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-[#163e26]/80 flex items-center justify-between gap-4 bg-slate-50/60 dark:bg-[#04120a]/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#0a2617] border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <PenSquare className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white truncate">
                      Submit Field Story
                    </h3>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      Expedition Studio
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                    Craft your wildlife field encounter with rich typography and expedition blocks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Fullscreen / Expand Studio Toggle */}
                <button
                  type="button"
                  onClick={() => setIsStoryModalExpanded(!isStoryModalExpanded)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a2617] border border-slate-200 dark:border-[#163e26] text-slate-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center cursor-pointer transition-colors"
                  title={isStoryModalExpanded ? "Compact View" : "Expand to Full Studio"}
                >
                  {isStoryModalExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#0a2617] border border-slate-200 dark:border-[#163e26] text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleStorySubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Top metadata grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Title */}
                <div className="md:col-span-12 space-y-1.5">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g. Dawn at Bardia: Following the Pugmarks of the Royal Tigress"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans font-medium"
                  />
                </div>

                {/* Category */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Category *
                  </label>
                  <select
                    value={storyCategory}
                    onChange={(e) => setStoryCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="expedition">Expedition Diary</option>
                        <option value="field-notes">Field Encounters</option>
                        <option value="conservation">Conservation Notes</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Location Tag
                  </label>
                  <input
                    type="text"
                    value={storyLocation}
                    onChange={(e) => setStoryLocation(e.target.value)}
                    placeholder="e.g. Shey Phoksundo National Park, Dolpo"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                  />
                </div>

                {/* Cover Photo */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Cover Photo Image URL (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={storyCover}
                      onChange={(e) => setStoryCover(e.target.value)}
                      placeholder="https://images.unsplash.com/... or uploaded photo link"
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Short Excerpt */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Short Excerpt / Synopsis
                  </label>
                  <input
                    type="text"
                    value={storyExcerpt}
                    onChange={(e) => setStoryExcerpt(e.target.value)}
                    placeholder="A two-sentence summary of the encounter..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Cover Preview (if entered) */}
              {storyCover && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] flex items-center gap-4">
                  <div className="relative w-28 h-18 rounded-xl overflow-hidden bg-black/40 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={storyCover}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cover Banner Ready
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-md">
                      {storyCover}
                    </div>
                  </div>
                </div>
              )}

              {/* Story Content Area with TipTap Editor */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-label uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold">
                    Story Content * (Field Notes & Narrative)
                  </label>

                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#030e06] border border-slate-200/80 dark:border-[#163e26] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setStoryEditorMode("rich")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        storyEditorMode === "rich"
                          ? "bg-white dark:bg-[#0e2a1b] text-emerald-700 dark:text-[#00ffcc] shadow-xs font-bold"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rich Studio Editor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoryEditorMode("raw")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        storyEditorMode === "raw"
                          ? "bg-white dark:bg-[#0e2a1b] text-emerald-700 dark:text-[#00ffcc] shadow-xs font-bold"
                          : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Plain Notes</span>
                    </button>
                  </div>
                </div>

                {storyEditorMode === "rich" ? (
                  <TipTapEditor
                    initialContent={storyContent}
                    onChange={(json, html, plainText) => {
                      setStoryContent(html || plainText);
                    }}
                    isFocusMode={isStoryModalExpanded}
                    onToggleFocusMode={() => setIsStoryModalExpanded(!isStoryModalExpanded)}
                  />
                ) : (
                  <textarea
                    required
                    rows={8}
                    value={storyContent}
                    onChange={(e) => setStoryContent(e.target.value)}
                    placeholder="Describe the altitude, light conditions, animal behaviors, gear choices, and moment of capture..."
                    className="w-full px-4 py-3 rounded-2xl text-sm bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 transition-all font-sans"
                  />
                )}
              </div>

              {/* Curation Protocol Notice */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Curation Guarantee:</strong> All field submissions undergo verification by our editorial team to preserve wildlife conservation ethics and storytelling quality. Once approved, your story will be published on the main SUBAN Journal with author credit.
                </span>
              </div>

              {/* Sticky / Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#163e26]/80">
                <div className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                  {storyContent ? `${storyContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length} words ready` : "Draft empty"}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowStoryModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#163e26] text-slate-700 dark:text-neutral-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#0e2a1b] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={storySubmitting || !storyTitle.trim() || !storyContent.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-neutral-950 font-label font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{storySubmitting ? "Submitting to Admin..." : "Submit for Approval"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* ========================================================
          MODAL: DIGITAL CONTRACT PAPER & OWNERSHIP DEED
          ======================================================== */}
      {selectedCertificateOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#05160d] border-2 border-emerald-400/50 dark:border-emerald-500/50 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-8 print:text-black">
            {/* Deed Header Banner */}
            <div className="text-center space-y-2 pb-5 border-b border-emerald-500/20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono tracking-widest uppercase font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>OFFICIAL DIGITAL CONTRACT • JURISDICTION OF NEPAL</span>
              </div>
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-wide">
                Digital Ownership Contract Paper
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400 font-mono">
                Deed Serial: DOC-{selectedCertificateOrder.id}-DIGITAL • Executed: {selectedCertificateOrder.date}
              </p>
            </div>

            {/* Legal Parties Accord */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Grantor (Creator) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041209] border border-slate-200 dark:border-[#163e26] space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                  Original Creator & Rights Holder (Grantor)
                </span>
                <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                  Suban Dahit
                </p>
                <p className="text-slate-600 dark:text-neutral-400 text-[11px]">
                  Wildlife Photographer & Naturalist, Nepal
                </p>
                <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold pt-1">
                  • Master Copyright & Moral Rights Reserved
                </p>
              </div>

              {/* Grantee (Buyer) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#041209] border border-slate-200 dark:border-[#163e26] space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold block">
                  Purchaser & Digital Owner (Grantee)
                </span>
                <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                  {selectedCertificateOrder.customerName || session?.user?.name || "Som Prakash Chaudhary"}
                </p>
                <p className="text-slate-600 dark:text-neutral-400 text-[11px]">
                  {selectedCertificateOrder.customerEmail || session?.user?.email || "somthehit@hotmail.com"}
                </p>
                <p className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                  • Lawful Digital Owner of this Photo Edition
                </p>
              </div>
            </div>

            {/* Artwork Particulars */}
            <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-[#031107] border border-emerald-200/80 dark:border-[#163e26] space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold">
                    Acquired Artwork
                  </span>
                  <h4 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    {selectedCertificateOrder.title}
                  </h4>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold w-fit">
                  Paid Full: {selectedCertificateOrder.total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/40 dark:border-[#163e26]/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold">
                    Asset Format
                  </span>
                  <p className="text-slate-800 dark:text-neutral-200 font-medium">
                    Original Full-Resolution Photo (No Watermark)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold">
                    Delivery Nature
                  </span>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                    100% Digital Download • No Physical Delivery
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/40 dark:border-[#163e26]/60">
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold block mb-1">
                  Cryptographic Contract Hash (SHA-256)
                </span>
                <div className="p-2 rounded-lg bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] font-mono text-[11px] text-emerald-700 dark:text-emerald-400 break-all flex items-center justify-between gap-2">
                  <span>{selectedCertificateOrder.fullHash}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(selectedCertificateOrder.fullHash)}
                    className="p-1 hover:text-emerald-500 shrink-0 cursor-pointer"
                    title="Copy full hash"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Legal Clauses */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-[#041209] border border-slate-200 dark:border-[#163e26] text-xs">
              <h4 className="font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 text-[11px] tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Legally Binding Terms & Ownership Contract</span>
              </h4>

              <div className="space-y-2 text-[11px] text-slate-700 dark:text-neutral-300 leading-relaxed">
                <p>
                  <strong>1. Digital Ownership Conferred:</strong> Having fulfilled payment in full, the Grantee is legally recognized as the digital owner of this authentic photographic work. The Grantee is entitled to download, store, display, and privately enjoy the original full-resolution format free of any watermarks.
                </p>
                <p className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-medium">
                  <strong>2. Creator Rights Reserved (Final Right):</strong> ALL ORIGINAL MASTER COPYRIGHTS, MORAL RIGHTS, AUTHORSHIP ATTRIBUTION, AND INTELLECTUAL PROPERTY RIGHTS REMAIN PERPETUALLY RESERVED TO THE ORIGINAL CREATOR, SUBAN DAHIT. This contract does not assign primary copyright; the Grantee cannot claim original authorship nor resell the raw image file to third parties or stock agencies.
                </p>
                <p>
                  <strong>3. Purely Digital Deliverable:</strong> This deed certifies an exclusively digital asset. There is no physical print, framing, or physical mail delivery associated with this acquisition.
                </p>
              </div>
            </div>

            {/* Official Signatures & Seal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/30 dark:bg-[#071d11] border border-emerald-300/40 dark:border-[#163e26]">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                  Certified by Original Creator
                </span>
                <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                  Suban Dahit
                </p>
                <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                  Naturalist & Photographic Artist • Nepal Wildlife Archives
                </p>
              </div>

              <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-500/60 flex flex-col items-center justify-center p-2 text-center bg-emerald-500/10 shrink-0">
                <Award className="w-6 h-6 text-emerald-500" />
                <span className="text-[7.5px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase mt-1 leading-tight text-center">
                  DIGITAL CONTRACT SEAL
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#163e26]/80">
              <button
                type="button"
                onClick={() => handleDownloadOriginalPhoto(selectedCertificateOrder)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Photo (No Watermark)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-slate-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Contract</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertificateOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: INVOICE / RECEIPT MODAL (Req 3)
          ======================================================== */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Receipt Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#163e26]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                  SUBAN DAHIT WILDLIFE STUDIO
                </span>
                <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
                  Acquisition Tax Invoice
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
                PAID IN FULL
              </span>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                  Invoice Number
                </span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {selectedReceiptOrder.invoiceNumber}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block mt-2">
                  Order Date
                </span>
                <span className="text-slate-700 dark:text-neutral-300">
                  {selectedReceiptOrder.date}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                  Billed To
                </span>
                <span className="text-slate-900 dark:text-white font-bold block">
                  Som Prakash Chaudhary
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  somthehit@hotmail.com
                </span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400 block mt-1">
                  Payment: {selectedReceiptOrder.paymentMethod}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-xl border border-slate-200 dark:border-[#163e26] overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#031107] font-semibold text-slate-700 dark:text-neutral-300 flex justify-between">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="p-3 border-t border-slate-200 dark:border-[#163e26] space-y-2">
                <div className="flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {selectedReceiptOrder.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      {selectedReceiptOrder.edition} • {selectedReceiptOrder.format}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedReceiptOrder.total}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-400 pt-2 border-t border-dashed border-slate-200 dark:border-[#163e26]">
                  <span>Fine Art Shipping & Insurance</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">COMPLIMENTARY</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                  <span>Wild Cat Conservation Fund Pledge (10%)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">INCLUDED</span>
                </div>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-[#072414] font-bold text-slate-900 dark:text-white flex justify-between border-t border-slate-200 dark:border-[#163e26]">
                <span>Total Amount Paid</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedReceiptOrder.total}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#163e26]">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: PROVENANCE & BLOCKCHAIN VERIFIER MODAL (Req 4)
          ======================================================== */}
      {selectedProvenanceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#06180e] border border-emerald-500/30 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#163e26]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-slate-900 dark:text-white">
                    Cryptographic Provenance Verification
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    Suban Fine Art Heritage Ledger
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvenanceOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0e2a1b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Provenance Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#031107] border border-slate-200 dark:border-[#163e26] space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold block mb-1">
                  Verified Artwork
                </span>
                <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                  {selectedProvenanceOrder.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
                  {selectedProvenanceOrder.edition} • {selectedProvenanceOrder.format}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500 font-bold">
                    Immutable SHA-256 Hash
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(selectedProvenanceOrder.fullHash)}
                    className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? "Copied!" : "Copy Full Hash"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#163e26] font-mono text-[11px] text-emerald-700 dark:text-emerald-400 break-all select-all">
                  {selectedProvenanceOrder.fullHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-[#163e26]/60 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                    Ledger Network
                  </span>
                  <span className="text-slate-800 dark:text-neutral-200 font-semibold">
                    Polygon POS (EIP-721)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                    Mint Block Height
                  </span>
                  <span className="text-slate-800 dark:text-neutral-200 font-semibold">
                    #62,918,204
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-[#163e26]/60 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                    Physical NFC Tag ID
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    NFC-NP-{selectedProvenanceOrder.id.replace("SBN-", "")}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase font-bold block">
                    Consensus State
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    IMMUTABLE
                  </span>
                </div>
              </div>
            </div>

            {/* External Verifier Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href={`https://polygonscan.com/tx/${selectedProvenanceOrder.fullHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
              >
                <span>View on Block Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedProvenanceOrder(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: LICENSE DETAILS & LEGAL TERMS MODAL (Req 4)
          ======================================================== */}
      {selectedLicenseAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#06180e] border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative">
            {/* Watermark Logo Accent */}
            <div className="absolute top-6 right-6 opacity-10 pointer-events-none">
              <ShieldCheck className="w-32 h-32 text-emerald-500" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#163e26]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Official Suban Fine Art Protocol
                  </span>
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
                    Commercial & Archival License Deed
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLicenseAsset(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0e2a1b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Overview Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-[#04160a] border border-emerald-300 dark:border-emerald-500/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold block">
                    Licensed Asset
                  </span>
                  <p className="font-headline font-bold text-slate-900 dark:text-white text-sm">
                    {selectedLicenseAsset.title}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    Ref ID: {selectedLicenseAsset.id}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold block">
                    Registered Grantee
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedLicenseAsset.licenseTerms.grantee}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Perpetual Non-Exclusive Grant</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200 dark:border-[#163e26] flex flex-wrap items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-neutral-400">
                  Territory: <strong>{selectedLicenseAsset.licenseTerms.territory}</strong>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  Validity: {selectedLicenseAsset.licenseTerms.validity}
                </span>
              </div>
            </div>

            {/* Permitted Uses Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-label uppercase tracking-wider text-slate-800 dark:text-neutral-200 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Permitted Rights & Authorized Usages</span>
              </h4>
              <div className="space-y-1.5">
                {selectedLicenseAsset.licenseTerms.permitted.map((term, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#030f06] border border-slate-200/80 dark:border-[#163e26]/70 flex items-start gap-2.5 text-xs text-slate-700 dark:text-neutral-300"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prohibited Restrictions Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-label uppercase tracking-wider text-red-700 dark:text-red-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Restrictions & Moral Rights Protection</span>
              </h4>
              <div className="space-y-1.5">
                {selectedLicenseAsset.licenseTerms.restrictions.map((term, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 flex items-start gap-2.5 text-xs text-slate-700 dark:text-neutral-300"
                  >
                    <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Verification Hash */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#030e06] border border-slate-200 dark:border-[#163e26] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">
                  License Deed SHA-256 Hash
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(selectedLicenseAsset.sha256)}
                  className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? "Copied!" : "Copy Hash"}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 break-all select-all">
                {selectedLicenseAsset.sha256}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#163e26]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadFile(selectedLicenseAsset, {
                      label: "Signed Legal License Deed",
                      ext: ".PDF",
                      size: "1.2 MB",
                      desc: "Official Certificate",
                    });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Deed (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLicenseAsset(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#0a2617] dark:hover:bg-[#103822] text-xs font-semibold text-slate-800 dark:text-neutral-200 transition-colors cursor-pointer"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
