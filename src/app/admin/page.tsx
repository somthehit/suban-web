"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Globe,
  Compass,
  Footprints,
  UserCheck,
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  Sliders,
  Image as ImageIcon,
  Share2,
  Award,
  Clock,
  Wrench,
  ShoppingBag,
  BookOpen,
  Receipt,
  RefreshCw,
  Check,
  Menu,
  X,
  HardDrive,
  Edit3,
  Search,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  ChevronUp,
  ChevronDown,
  Star,
  Copy,
  Archive,
  FileText,
  Calendar,
  Filter,
  ArrowUpRight,
  Tag,
  CheckSquare,
  Square,
  MoreVertical,
  CreditCard,
  Stamp,
  Feather,
  Volume2,
} from "lucide-react";
import { FileUploadDropzone } from "@/components/ui/FileUploadDropzone";
import { StorageBucketManager } from "@/components/admin/StorageBucketManager";
import { PaymentSettingsManager } from "@/components/admin/PaymentSettingsManager";
import { WatermarkSettingsManager } from "@/components/admin/WatermarkSettingsManager";
import { SpeciesManager } from "@/components/admin/wildlife/SpeciesManager";
import { AudioLibraryManager } from "@/components/admin/wildlife/AudioLibraryManager";
import { HotspotsManager } from "@/components/admin/wildlife/HotspotsManager";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { AVAILABLE_SOCIAL_PLATFORMS, SocialCustomLink, defaultPaymentSettings } from "@/lib/site-settings";

export default function AdminDashboardPage() {
  const { settings, updateSettings, saveSettings, resetSettings, isSaving, saveMessage } =
    useSiteSettings();

  const [activeTab, setActiveTab] = useState<
    "branding" | "navigation" | "footer" | "about" | "social" | "storage" | "watermark" | "products" | "posts" | "orders" | "payments" | "species" | "audio-library" | "hotspots"
  >("branding");

  // Local form state cloned from settings
  const [formData, setFormData] = useState(settings);

  // Live Database States
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [dbSpeciesList, setDbSpeciesList] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Field Dispatches (Posts) Enhanced State
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [postCounts, setPostCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
  });
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState<
    "all" | "published" | "draft" | "scheduled" | "archived"
  >("all");
  const [postCategoryFilter, setPostCategoryFilter] = useState("");
  const [postViewMode, setPostViewMode] = useState<"grid" | "table">("grid");
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isPerformingPostAction, setIsPerformingPostAction] = useState(false);

  // New Post Form state (legacy fallback)
  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    readingTimeMinutes: 6,
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postCreateMessage, setPostCreateMessage] = useState<string | null>(null);

  const loadDbData = async () => {
    setIsLoadingDb(true);
    try {
      const [pRes, bRes, oRes, sRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/posts").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/species?group=all").then((r) => r.json()).catch(() => null),
      ]);
      if (pRes?.success && Array.isArray(pRes.products)) setDbProducts(pRes.products);
      if (bRes?.success) {
        if (Array.isArray(bRes.posts)) setDbPosts(bRes.posts);
        if (bRes.counts) setPostCounts(bRes.counts);
        if (Array.isArray(bRes.categories)) setDbCategories(bRes.categories);
      }
      if (oRes?.success && Array.isArray(oRes.orders)) setDbOrders(oRes.orders);
      if (sRes?.success && Array.isArray(sRes.species)) setDbSpeciesList(sRes.species);
    } catch (err) {
      console.error("Error loading live database items:", err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDbData();
  }, []);

  // Photographic Products UI & Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [productViewMode, setProductViewMode] = useState<"grid" | "table">("grid");
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});

  const initialProductForm = {
    title: "",
    slug: "",
    speciesId: "",
    species: "",
    scientificName: "",
    locationName: "Bardia National Park, Nepal",
    camera: "Nikon Z9",
    lens: "NIKKOR Z 400mm f/2.8 TC VR S",
    priceUSD: 149,
    priceNPR: 19900,
    imageUrl: "",
    description: "",
    status: "published" as "published" | "archived" | "draft",
    isNewSpecies: false,
    newBirdCommonName: "",
    newBirdNepaliName: "",
    newBirdScientificName: "",
    newBirdIucnStatus: "LC",
    newBirdElevationMin: 2000,
    newBirdElevationMax: 4200,
    newBirdHabitat: "Alpine Conifer & Rhododendron Forest",
  };

  const [newProduct, setNewProduct] = useState(initialProductForm);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productCreateMessage, setProductCreateMessage] = useState<string | null>(null);

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setNewProduct(initialProductForm);
    setProductCreateMessage(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setNewProduct({
      ...initialProductForm,
      title: prod.title || "",
      slug: prod.slug || "",
      speciesId: prod.speciesId || "",
      species: prod.species || prod.speciesName || "",
      scientificName: prod.scientificName || "",
      locationName: prod.locationName || "Bardia National Park, Nepal",
      camera: prod.camera || "Nikon Z9",
      lens: prod.lens || "NIKKOR Z 400mm f/2.8 TC VR S",
      priceUSD: Number(prod.priceUSD) || 149,
      priceNPR: Number(prod.priceNPR) || 19900,
      imageUrl: prod.imageUrl || prod.thumbnailUrl || "",
      description: prod.description || "",
      status: prod.status === "archived" ? "archived" : prod.status === "draft" ? "draft" : "published",
    });
    setProductCreateMessage(null);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setProductCreateMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title.trim() || !newProduct.slug.trim()) return;
    setIsCreatingProduct(true);
    setProductCreateMessage(null);
    try {
      if (editingProductId) {
        // UPDATE existing product via PATCH
        const res = await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProductId,
            ...newProduct,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setProductCreateMessage("✅ Photograph updated successfully!");
          setDbProducts((prev) =>
            prev.map((p) =>
              p.id === editingProductId
                ? {
                  ...p,
                  ...newProduct,
                  thumbnailUrl: newProduct.imageUrl || p.thumbnailUrl,
                }
                : p
            )
          );
          setTimeout(() => {
            setIsProductModalOpen(false);
            setEditingProductId(null);
          }, 600);
          await loadDbData();
        } else {
          setProductCreateMessage(`❌ Error: ${data.error || "Failed to update product"}`);
        }
      } else {
        // CREATE new product via POST
        const payload = {
          ...newProduct,
          newSpeciesData: newProduct.isNewSpecies
            ? {
              commonName: newProduct.newBirdCommonName || newProduct.species || newProduct.title,
              nepaliName: newProduct.newBirdNepaliName || undefined,
              scientificName: newProduct.newBirdScientificName || newProduct.scientificName,
              iucnStatus: newProduct.newBirdIucnStatus || "LC",
              elevationMin: newProduct.newBirdElevationMin || 2000,
              elevationMax: newProduct.newBirdElevationMax || 4200,
              habitats: [newProduct.newBirdHabitat || "Himalayan Wilderness"],
              description: newProduct.description,
            }
            : undefined,
        };
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setProductCreateMessage(
            newProduct.isNewSpecies
              ? "✅ New Bird Species registered & Photograph published to store & Birds Hub!"
              : "✅ Photograph created & published to database!"
          );
          setNewProduct(initialProductForm);
          setTimeout(() => {
            setIsProductModalOpen(false);
          }, 800);
          await loadDbData();
        } else {
          setProductCreateMessage(`❌ Error: ${data.error || "Failed to create product"}`);
        }
      }
    } catch (err: any) {
      setProductCreateMessage(`❌ Error: ${err.message || "Network error"}`);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleToggleProductStatus = async (prod: any) => {
    const isCurrentlyActive = prod.status === "published";
    const nextStatus = isCurrentlyActive ? "archived" : "published";

    // Optimistic UI update
    setDbProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, status: nextStatus } : p))
    );
    setTogglingProductId(prod.id);

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prod.id,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setDbProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, status: prod.status } : p))
        );
        alert(`Failed to update status: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      setDbProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, status: prod.status } : p))
      );
      alert(`Network error: ${err.message}`);
    } finally {
      setTogglingProductId(null);
    }
  };

  const handleDeleteProduct = async (prod: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${prod.title}"?\n\nThis will remove its database entry, license pricing, and media records.`
    );
    if (!confirmed) return;

    setDeletingProductId(prod.id);
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(prod.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDbProducts((prev) => prev.filter((p) => p.id !== prod.id));
      } else {
        alert(`Failed to delete product: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      alert(`Network error deleting product: ${err.message}`);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.slug.trim() || !newPost.content.trim()) return;
    setIsCreatingPost(true);
    setPostCreateMessage(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      if (data.success) {
        setPostCreateMessage("✅ Dispatch published & persisted to Supabase database!");
        setNewPost({
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          coverImage: "",
          readingTimeMinutes: 6,
        });
        await loadDbData();
      } else {
        setPostCreateMessage(`❌ Error: ${data.error || "Failed to create post"}`);
      }
    } catch (err: any) {
      setPostCreateMessage(`❌ Error: ${err.message || "Network error"}`);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleTogglePostFeatured = async (post: any) => {
    const nextFeatured = !post.isFeatured;
    setDbPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, isFeatured: nextFeatured } : p))
    );
    try {
      await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, isFeatured: nextFeatured }),
      });
    } catch (e) {
      console.error(e);
      await loadDbData();
    }
  };

  const handleTogglePostArchive = async (post: any) => {
    const nextStatus = post.status === "archived" ? "draft" : "archived";
    setDbPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: nextStatus } : p))
    );
    try {
      await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status: nextStatus }),
      });
      await loadDbData();
    } catch (e) {
      console.error(e);
      await loadDbData();
    }
  };

  const handleDuplicatePost = async (post: any) => {
    setIsPerformingPostAction(true);
    try {
      const res = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id: post.id }),
      });
      const data = await res.json();
      if (data.success) {
        await loadDbData();
      } else {
        alert(data.error || "Failed to duplicate post");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPerformingPostAction(false);
    }
  };

  const handleDeletePost = async (post: any) => {
    const confirmed = window.confirm(`Permanently delete dispatch "${post.title}"? This cannot be undone.`);
    if (!confirmed) return;
    setIsPerformingPostAction(true);
    try {
      const res = await fetch(`/api/posts?id=${encodeURIComponent(post.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDbPosts((prev) => prev.filter((p) => p.id !== post.id));
        await loadDbData();
      } else {
        alert(data.error || "Failed to delete dispatch");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPerformingPostAction(false);
    }
  };

  const handleBulkPostOperation = async (
    operation: "publish" | "archive" | "draft" | "delete" | "category",
    value?: string
  ) => {
    if (selectedPostIds.length === 0) return;
    if (operation === "delete") {
      const confirmed = window.confirm(`Permanently delete ${selectedPostIds.length} selected dispatches?`);
      if (!confirmed) return;
    }
    setIsPerformingPostAction(true);
    try {
      const res = await fetch("/api/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk",
          ids: selectedPostIds,
          operation,
          value,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPostIds([]);
        await loadDbData();
      } else {
        alert(data.error || "Failed to perform bulk operation");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsPerformingPostAction(false);
    }
  };

  // Sync formData when settings change
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSaveAll = async () => {
    updateSettings(formData);
    await saveSettings(formData);
  };

  const handleReset = async () => {
    if (confirm("Reset all settings to default Stitch design specifications?")) {
      await resetSettings();
    }
  };

  // Nav Item Helpers
  const addNavItem = () => {
    const newItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      href: "/gallery",
    };
    setFormData((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        items: [...prev.navigation.items, newItem],
      },
    }));
  };

  const removeNavItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        items: prev.navigation.items.filter((item) => item.id !== id),
      },
    }));
  };

  const updateNavItem = (id: string, field: "label" | "href", value: string) => {
    setFormData((prev) => ({
      ...prev,
      navigation: {
        ...prev.navigation,
        items: prev.navigation.items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  // Ethics Helpers
  const addEthic = () => {
    const newEthic = {
      id: `ethic-${Date.now()}`,
      icon: "verified",
      title: "New Ethic Principle",
      description: "Detailed protocol description of this wildlife ethical guideline.",
    };
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        ethics: [...prev.about.ethics, newEthic],
      },
    }));
  };

  const removeEthic = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        ethics: prev.about.ethics.filter((e) => e.id !== id),
      },
    }));
  };

  // Expedition Helpers
  const addExpedition = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      year: "2025",
      region: "Remote Himalayas",
      altitude: "4,200m AMSL",
      title: "New Field Expedition Study",
      desc: "Documenting alpine fauna in untouched protected wilderness areas.",
      tag: "Field Study",
    };
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        expeditions: [newExp, ...prev.about.expeditions],
      },
    }));
  };

  const removeExpedition = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        expeditions: prev.about.expeditions.filter((e) => e.id !== id),
      },
    }));
  };

  // Gear Helpers
  const addGear = () => {
    const newGear = {
      id: `gear-${Date.now()}`,
      category: "Specialized Lens",
      item: "Nikkor Lens Specification",
      details: "High-aperture cold-resistant optical build.",
    };
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        gear: [...prev.about.gear, newGear],
      },
    }));
  };

  const removeGear = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        gear: prev.about.gear.filter((g) => g.id !== id),
      },
    }));
  };

  // Social Custom Links Helpers
  const addSocialLink = () => {
    const newLink: SocialCustomLink = {
      id: `social-${Date.now()}`,
      platform: "facebook",
      label: "Facebook",
      url: "https://facebook.com/",
      enabled: true,
    };
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        customLinks: [...(prev.social?.customLinks || []), newLink],
      },
    }));
  };

  const removeSocialLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        customLinks: (prev.social?.customLinks || []).filter((l) => l.id !== id),
      },
    }));
  };

  const updateSocialLink = (id: string, updates: Partial<SocialCustomLink>) => {
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        customLinks: (prev.social?.customLinks || []).map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
      },
    }));
  };

  const moveSocialLink = (index: number, direction: "up" | "down") => {
    const list = [...(formData.social?.customLinks || [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        customLinks: list,
      },
    }));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabMeta: Record<string, { title: string; subtitle: string }> = {
    branding: {
      title: "Site Identity & Brand Configuration",
      subtitle: "Define logos, typography accents, and public watermark overlays.",
    },
    navigation: {
      title: "Navigation Architecture & Links",
      subtitle: "Organize header navigation links, order, and destination routes.",
    },
    footer: {
      title: "Global Site Footer & Copyright",
      subtitle: "Control footer narrative, conservation badges, and legal links.",
    },
    social: {
      title: "Social Platforms & Expedition Wire",
      subtitle: "Manage public contact email, phone, Instagram, and YouTube channels.",
    },
    about: {
      title: "Naturalist Bio & Ethical Manifesto",
      subtitle: "Manage Suban's bio, field milestones, telemetry gear, and ethical rules.",
    },
    storage: {
      title: "Storage Buckets & Media Asset Library",
      subtitle: "Unified cloud & local bucket pipeline for gallery photographs, profile avatars, watermarks, and raw masters.",
    },
    watermark: {
      title: "Watermark & Copyright Protection",
      subtitle: "Live copyright stamp simulator, position geometry, C2PA authenticity, and transparency policies.",
    },
    products: {
      title: "Database Photographic Archive",
      subtitle: "Live inventory stored in Supabase PostgreSQL with license tiers & EXIF.",
    },
    posts: {
      title: "Field Journal Dispatches & Articles",
      subtitle: "Publish and manage high-altitude narratives, equipment logs, and field notes.",
    },
    orders: {
      title: "Live Customer Transactions & Payments",
      subtitle: "Real-time orders processed via Stripe, eSewa, Khalti, and Wire transfers.",
    },
    payments: {
      title: "Payment Gateways & Banking Setup",
      subtitle: "Configure Stripe, eSewa, Fonepay QR, and direct Bank wire settlement credentials.",
    },
  };

  const navGroups = [
    {
      title: "Site CMS & Identity",
      items: [
        { id: "branding", label: "Identity & Logo", icon: Globe },
        {
          id: "navigation",
          label: "Header Navbar",
          icon: Compass,
          badge: formData.navigation.items.length,
        },
        { id: "footer", label: "Global Footer", icon: Footprints },
        { id: "about", label: "About & Naturalist", icon: UserCheck },
        {
          id: "social",
          label: "Social & Contact",
          icon: Share2,
          badge: 6 + (formData.social?.customLinks?.length || 0),
        },
      ],
    },
    {
      title: "Cloud & Media Protection",
      items: [
        {
          id: "storage",
          label: "Media & Buckets",
          icon: HardDrive,
          badge: "5",
        },
        {
          id: "watermark",
          label: "Watermark Engine",
          icon: Stamp,
          badge: "Active",
        },
      ],
    },
    {
      title: "Database & Commerce",
      items: [
        {
          id: "products",
          label: "Photographic Products",
          icon: ShoppingBag,
          badge: dbProducts.length,
        },
        {
          id: "posts",
          label: "Field Dispatches",
          icon: BookOpen,
          badge: dbPosts.length,
        },
        {
          id: "orders",
          label: "Customer Orders",
          icon: Receipt,
          badge: dbOrders.length,
        },
        {
          id: "payments",
          label: "Payment Setup",
          icon: CreditCard,
          badge: "Active",
        },
      ],
    },
    {
      title: "Wildlife & Bioacoustics",
      items: [
        {
          id: "species",
          label: "Species Hub",
          icon: Feather,
          badge: "Avian",
        },
        {
          id: "audio-library",
          label: "Bioacoustic Library",
          icon: Volume2,
        },
        {
          id: "hotspots",
          label: "Sanctuaries & Hotspots",
          icon: Compass,
        },
      ],
    },
  ];

  const filteredProducts = dbProducts.filter((p) => {
    const q = productSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.species?.toLowerCase().includes(q) ||
      p.scientificName?.toLowerCase().includes(q) ||
      p.locationName?.toLowerCase().includes(q) ||
      p.camera?.toLowerCase().includes(q);

    const matchesStatus =
      productStatusFilter === "all" ||
      (productStatusFilter === "active" && p.status === "published") ||
      (productStatusFilter === "inactive" && p.status !== "published");

    return matchesSearch && matchesStatus;
  });

  const activeProductsCount = dbProducts.filter((p) => p.status === "published").length;
  const inactiveProductsCount = dbProducts.length - activeProductsCount;

  return (
    <div className="min-h-screen bg-[#04120a] text-[#e8e0f0] selection:bg-[#ff2d78] selection:text-[#ffe0ec] flex flex-col lg:flex-row">
      {/* ── MOBILE HEADER (Small Screens Only) ── */}
      <div className="lg:hidden bg-[#030e07] border-b border-[#163e26] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          {formData.brand.logoUrl || formData.about.portraitUrl ? (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.3)] shrink-0 flex items-center justify-center bg-[#0a2315]">
              <img
                src={formData.brand.logoUrl || formData.about.portraitUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0a2315] border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]">
              <Camera className="w-4 h-4" />
            </div>
          )}
          <div>
            <span className="font-headline font-bold text-xs text-slate-900 dark:text-white block">
              {formData.brand.siteName || "SUBAN Studio"}
            </span>
            <span className="font-label text-[9px] text-emerald-700 dark:text-[#00ffcc] uppercase tracking-wider font-semibold">
              Admin Panel
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveMessage && (
            <span className="text-[10px] font-label text-[#00ffcc] font-bold">Saved!</span>
          )}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-[#0a2416] text-[#00ffcc] border border-[#163e26]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── LEFT SIDEBAR MENU ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#030e07] border-r border-[#163e26] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand Banner */}
        <div className="p-5 border-b border-[#163e26]/80 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              {formData.brand.logoUrl || formData.about.portraitUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00ffcc]/60 shadow-[0_0_12px_rgba(0,255,204,0.3)] ring-2 ring-[#00ffcc]/20 shrink-0 flex items-center justify-center bg-[#0a2315] group-hover:border-[#00ffcc] group-hover:scale-105 transition-all">
                  <img
                    src={formData.brand.logoUrl || formData.about.portraitUrl}
                    alt={formData.brand.siteName || "SUBAN WILDLIFE"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0a2315] border border-[#00ffcc]/40 flex items-center justify-center text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.25)] group-hover:border-[#00ffcc] transition-all shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="font-headline font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block group-hover:text-[#00ffcc] transition-colors">
                  {formData.brand.siteName || "SUBAN WILDLIFE"}
                </span>
                <span className="font-label text-[9px] uppercase tracking-widest text-emerald-700 dark:text-[#00ffcc] font-bold">
                  Control Studio
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded text-[9px] font-label font-bold bg-[#ff2d78]/15 text-[#ff2d78] border border-[#ff2d78]/30">
              PRO
            </span>
          </div>

          {/* Database Status Pill */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#07190e] border border-[#163e26] text-[10px] font-label">
            <span className="text-[#a098b0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse" />
              Supabase PostgreSQL
            </span>
            <span className="text-[#00ffcc] font-mono font-bold">LIVE</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {navGroups.map((grp) => (
            <div key={grp.title} className="space-y-1">
              <span className="px-3 text-[10px] font-label uppercase tracking-widest text-[#a098b0]/70 font-bold block mb-1">
                {grp.title}
              </span>
              <nav className="space-y-1">
                {grp.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-label text-xs uppercase tracking-wider transition-all cursor-pointer ${isActive
                          ? "bg-gradient-to-r from-[#ff2d78]/20 to-[#ff2d78]/5 text-[#ff2d78] font-bold border-l-2 border-[#ff2d78] shadow-[0_0_12px_rgba(255,45,120,0.15)]"
                          : "text-[#a098b0] hover:text-[#e8e0f0] hover:bg-[#081e12]"
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#ff2d78]" : "text-slate-600 dark:text-[#a098b0]"}`} />
                        <span className={isActive ? "text-[#ff2d78]" : "text-slate-900 dark:text-[#e8e0f0]"}>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${isActive
                              ? "bg-[#ff2d78]/25 text-[#ff2d78]"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-[#163e26]/70 dark:text-[#00ffcc] dark:border-transparent"
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-[#163e26]/80 space-y-2 bg-[#020b05] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex-1 py-2 px-3 rounded-lg bg-[#ff2d78] hover:bg-[#b3004e] text-[#ffe0ec] text-xs font-label uppercase tracking-wider font-bold shadow-[0_0_12px_rgba(255,45,120,0.3)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Publish"}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#a098b0] hover:text-[#e8e0f0] text-xs transition-colors border border-[#163e26] cursor-pointer"
              title="Reset all settings to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase tracking-wider transition-colors border border-[#00ffcc]/30 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>

          {/* Theme Mode Toggle in Sidebar */}
          <ThemeToggle variant="full" />
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-20 bg-[#030e07]/90 backdrop-blur-md border-b border-[#163e26] px-6 lg:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-bold text-lg text-white">
                {tabMeta[activeTab]?.title || "Admin Control"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/30">
                ACTIVE SECTION
              </span>
            </div>
            <p className="text-xs text-[#a098b0] mt-0.5">
              {tabMeta[activeTab]?.subtitle || "Manage system configuration"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Theme Switcher Pill in Admin Header */}
            <ThemeToggle variant="pill" />

            {saveMessage && (
              <span className="text-xs font-label text-[#00ffcc] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#00ffcc]" />
                {saveMessage}
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg bg-[#ff2d78] hover:bg-[#b3004e] text-[#ffe0ec] text-xs font-label uppercase tracking-widest font-bold shadow-[0_0_16px_rgba(255,45,120,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Publishing..." : "Publish Changes"}</span>
            </button>
          </div>
        </header>

        {/* ── MAIN TAB CONTENT CONTAINER ── */}
        <div className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {/* ── TAB 1: SITE IDENTITY & BRANDING ── */}
          {activeTab === "branding" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6 bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26]">
                <div className="border-b border-[#163e26] pb-4">
                  <h3 className="font-headline font-bold text-xl text-white">
                    Site Identity &amp; Global Brand
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    These values define the branding rendered across the navigation, footer, and page headings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={formData.brand.siteName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: { ...formData.brand, siteName: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="SUBAN"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Slogan / Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.brand.slogan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: { ...formData.brand, slogan: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="Wildlife Photography"
                    />
                  </div>
                </div>

                <div>
                  <FileUploadDropzone
                    bucket="site"
                    value={formData.brand.logoUrl}
                    label="Studio Brand Logo Asset"
                    helperText="Uploads to 'site' bucket (SVG or transparent PNG)"
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        brand: { ...formData.brand, logoUrl: url },
                      })
                    }
                  />
                  <div className="mt-2 flex gap-3">
                    <input
                      type="text"
                      value={formData.brand.logoUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: { ...formData.brand, logoUrl: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2 rounded-lg text-xs font-mono text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="Or enter direct URL: https://.../logo.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Watermark Signature Text
                    </label>
                    <input
                      type="text"
                      value={formData.brand.watermarkText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: { ...formData.brand, watermarkText: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="© SUBAN Photography"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Working Hubs Cities
                    </label>
                    <input
                      type="text"
                      value={formData.brand.hubsText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: { ...formData.brand, hubsText: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="Kathmandu • London • New York"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={formData.brand.copyrightText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand: { ...formData.brand, copyrightText: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    placeholder="SUBAN Wildlife Fine Art Photography. All Rights Reserved."
                  />
                </div>
              </div>

              {/* Live Brand Preview Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#081e12] p-6 rounded-2xl border border-[#163e26] space-y-4">
                  <span className="font-label text-xs uppercase tracking-widest text-emerald-700 dark:text-[#00ffcc] font-bold">
                    Live Navbar Brand Preview
                  </span>
                  <div className="p-4 rounded-xl bg-[#04120a] border border-[#00ffcc]/30 flex items-center gap-3.5 shadow-sm">
                    {formData.brand.logoUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00ffcc]/60 shadow-[0_0_14px_rgba(0,255,204,0.35)] ring-2 ring-[#00ffcc]/20 shrink-0 flex items-center justify-center bg-[#0a2315]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="Logo preview"
                          src={formData.brand.logoUrl}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#0a2315] border-2 border-[#00ffcc]/40 flex items-center justify-center text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.25)] shrink-0">
                        <Camera className="w-5 h-5 text-[#00ffcc]" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="font-headline font-extrabold text-base tracking-widest uppercase text-slate-900 dark:text-white">
                        {formData.brand.siteName || "SUBAN"}
                      </div>
                      <div className="font-label text-[10px] tracking-[0.25em] text-emerald-800 dark:text-[#a098b0] uppercase font-bold">
                        {formData.brand.slogan || "Wild Life"}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-[#a098b0] space-y-2 pt-2 border-t border-[#163e26]">
                    <p>
                      <strong className="text-slate-900 dark:text-white">Watermark:</strong> {formData.brand.watermarkText}
                    </p>
                    <p>
                      <strong className="text-slate-900 dark:text-white">Hubs:</strong> {formData.brand.hubsText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: NAVBAR MENU ITEMS ── */}
          {activeTab === "navigation" && (
            <div className="space-y-6 bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#163e26] pb-4">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white">
                    Header Navigation Links
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    Add, update routes, labels, or remove navigation links across the global sticky navbar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addNavItem}
                  className="px-4 py-2 rounded-lg bg-[#00ffcc] hover:bg-[#00e6b8] text-[#001a1a] text-xs font-label uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 self-start"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Navigation Link</span>
                </button>
              </div>

              {/* Menu item rows */}
              <div className="space-y-3">
                {formData.navigation.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#0a2315] border border-[#1a442a] flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-6 h-6 rounded bg-[#103420] text-[#00ffcc] font-label text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      <div>
                        <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateNavItem(item.id, "label", e.target.value)}
                          className="w-full bg-[#081e12] border border-[#163e26] px-3 py-2 rounded text-xs text-white focus:border-[#00ffcc] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                          URL Path
                        </label>
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => updateNavItem(item.id, "href", e.target.value)}
                          className="w-full bg-[#081e12] border border-[#163e26] px-3 py-2 rounded text-xs text-[#00ffcc] font-mono focus:border-[#00ffcc] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNavItem(item.id)}
                      className="p-2 rounded hover:bg-[#ff2d78]/20 text-[#a098b0] hover:text-[#ff2d78] transition-colors shrink-0"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Header Feature Toggles */}
              <div className="pt-6 border-t border-[#163e26] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="p-4 rounded-xl bg-[#0a2315] border border-[#1a442a] flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-headline font-bold text-sm text-white">
                      Currency Switcher (USD / NPR)
                    </div>
                    <div className="text-xs text-[#a098b0]">
                      Show multi-currency toggle in header
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.navigation.showCurrencyToggle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        navigation: {
                          ...formData.navigation,
                          showCurrencyToggle: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#00ffcc] cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-xl bg-[#0a2315] border border-[#1a442a] flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-headline font-bold text-sm text-white">
                      Collector Cart Bag Indicator
                    </div>
                    <div className="text-xs text-[#a098b0]">
                      Display shopping bag with badge in header
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.navigation.showCart}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        navigation: {
                          ...formData.navigation,
                          showCart: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 accent-[#ff2d78] cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ── TAB 3: GLOBAL FOOTER ── */}
          {activeTab === "footer" && (
            <div className="space-y-6 bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26]">
              <div className="border-b border-[#163e26] pb-4">
                <h3 className="font-headline font-bold text-xl text-white">
                  Global Footer &amp; Dispatcher
                </h3>
                <p className="text-xs text-[#a098b0] mt-1">
                  Customize copyright, bio summaries, watermarking notice, and newsletter wording.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Footer Brand Bio Summary
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footer.aboutText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, aboutText: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] p-3 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Watermark Protected Archive Notice Text
                  </label>
                  <textarea
                    rows={2}
                    value={formData.footer.watermarkNotice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, watermarkNotice: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] p-3 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Field Dispatch Newsletter Title
                    </label>
                    <input
                      type="text"
                      value={formData.footer.dispatcherTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, dispatcherTitle: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Field Dispatch Description
                    </label>
                    <input
                      type="text"
                      value={formData.footer.dispatcherDesc}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, dispatcherDesc: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Terms of License Route
                    </label>
                    <input
                      type="text"
                      value={formData.footer.licenseTermsUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, licenseTermsUrl: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#00ffcc] font-mono focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Privacy Protocol Route
                    </label>
                    <input
                      type="text"
                      value={formData.footer.privacyUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, privacyUrl: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#00ffcc] font-mono focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: SOCIAL MEDIA & INQUIRIES ── */}
          {activeTab === "social" && (
            <div className="space-y-8 bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26]">
              {/* Header */}
              <div className="border-b border-[#163e26] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white flex items-center gap-2.5">
                    <Share2 className="w-5 h-5 text-[#00ffcc]" />
                    <span>Social Accounts &amp; Contact Directives</span>
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    Configure primary portfolio channels, inquiry triggers, and add additional social platforms with icons from the dropdown.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="px-4 py-2 bg-[#103420] hover:bg-[#00ffcc] text-[#00ffcc] hover:text-[#04120a] border border-[#00ffcc]/40 hover:border-[#00ffcc] rounded-xl text-xs font-label uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-[0_0_12px_rgba(0,255,204,0.15)] shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Social Platform</span>
                </button>
              </div>

              {/* Sub-Section 1: Core Channels */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ffcc]" />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-wider text-white">
                    Primary Portfolio &amp; Direct Channels
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="instagram" className="w-3 h-3" />
                      </span>
                      <span>Instagram Profile URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.social.instagram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, instagram: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="https://instagram.com/subanwildlife"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="vimeo" className="w-3 h-3" />
                      </span>
                      <span>Vimeo Portfolio URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.social.vimeo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, vimeo: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="https://vimeo.com/subanwildlife"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="px500" className="w-3 h-3" />
                      </span>
                      <span>500px Portfolio URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.social.px500}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, px500: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="https://500px.com/suban"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="twitter" className="w-3 h-3" />
                      </span>
                      <span>X / Twitter Handle URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.social.twitter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, twitter: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="https://x.com/subanwildlife"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="youtube" className="w-3 h-3" />
                      </span>
                      <span>YouTube Channel URL</span>
                    </label>
                    <input
                      type="url"
                      value={formData.social.youtube}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, youtube: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="https://youtube.com/@suban"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      <span className="w-5 h-5 rounded bg-[#0a2315] border border-[#1a442a] flex items-center justify-center text-[#00ffcc] shrink-0">
                        <SocialIcon platform="email" className="w-3 h-3" />
                      </span>
                      <span>Direct Inquiries Email</span>
                    </label>
                    <input
                      type="email"
                      value={formData.social.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          social: { ...formData.social, email: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="suban@subanwildlife.com"
                    />
                  </div>
                </div>
              </div>

              {/* Sub-Section 2: Additional Custom Channels with Dropdown Icons */}
              <div className="pt-6 border-t border-[#163e26] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff2d78]" />
                    <h4 className="font-headline font-bold text-sm uppercase tracking-wider text-white">
                      Additional Social Platforms &amp; Expedition Links
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#103420] text-[#00ffcc] border border-[#163e26]">
                      {(formData.social.customLinks || []).length} custom
                    </span>
                  </div>
                </div>

                {(!formData.social.customLinks || formData.social.customLinks.length === 0) ? (
                  <div className="p-8 border border-dashed border-[#163e26] rounded-xl text-center bg-[#05170d]/50">
                    <div className="w-10 h-10 rounded-full bg-[#0a2315] border border-[#1a442a] flex items-center justify-center mx-auto mb-3 text-[#00ffcc]">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-[#e8e0f0] font-medium">No additional social links added yet</p>
                    <p className="text-xs text-[#a098b0] mt-1 max-w-md mx-auto">
                      Click &ldquo;Add Social Platform&rdquo; above to connect Facebook, Flickr, TikTok, LinkedIn, Pinterest, Threads, WhatsApp, or custom links with their matching icons.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.social.customLinks.map((link, idx) => {
                      const currentPlatformMeta = AVAILABLE_SOCIAL_PLATFORMS.find(
                        (p) => p.id === link.platform
                      );

                      return (
                        <div
                          key={link.id}
                          className="p-4 bg-[#05170d] border border-[#163e26] rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-3.5 transition-all hover:border-[#00ffcc]/30 shadow-sm"
                        >
                          {/* Icon Preview + Platform Dropdown */}
                          <div className="w-full md:w-56 shrink-0">
                            <label className="block text-[10px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                              Platform &amp; Icon
                            </label>
                            <div className="flex items-center gap-2 bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded-lg focus-within:border-[#00ffcc]">
                              <div className="w-6 h-6 rounded bg-[#103420] border border-[#163e26] flex items-center justify-center text-[#00ffcc] shrink-0">
                                <SocialIcon platform={link.platform} className="w-3.5 h-3.5" />
                              </div>
                              <select
                                value={link.platform}
                                onChange={(e) => {
                                  const newPlat = e.target.value;
                                  const meta = AVAILABLE_SOCIAL_PLATFORMS.find((p) => p.id === newPlat);
                                  updateSocialLink(link.id, {
                                    platform: newPlat,
                                    label: meta?.label || link.label,
                                    icon: newPlat,
                                  });
                                }}
                                className="w-full bg-transparent text-xs text-[#e8e0f0] focus:outline-none cursor-pointer"
                              >
                                {AVAILABLE_SOCIAL_PLATFORMS.map((p) => (
                                  <option key={p.id} value={p.id} className="bg-[#081e12] text-white">
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Display Label Input */}
                          <div className="w-full md:w-48 shrink-0">
                            <label className="block text-[10px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                              Display Label
                            </label>
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => updateSocialLink(link.id, { label: e.target.value })}
                              className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded-lg text-xs text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                              placeholder="e.g. Facebook Page"
                            />
                          </div>

                          {/* URL Input */}
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-[10px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                              Profile / Channel URL
                            </label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateSocialLink(link.id, { url: e.target.value })}
                              className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded-lg text-xs text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none font-mono"
                              placeholder={currentPlatformMeta?.placeholder || "https://..."}
                            />
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-4 border-t md:border-t-0 border-[#163e26]/60 shrink-0">
                            {/* Active Toggle */}
                            <button
                              type="button"
                              title={
                                link.enabled !== false
                                  ? "Visible in Footer (Click to hide)"
                                  : "Hidden in Footer (Click to show)"
                              }
                              onClick={() =>
                                updateSocialLink(link.id, {
                                  enabled: link.enabled === false ? true : false,
                                })
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-label uppercase tracking-wider border flex items-center gap-1.5 transition-colors cursor-pointer ${link.enabled !== false
                                  ? "bg-[#103420] text-[#00ffcc] border-[#163e26]"
                                  : "bg-[#151c17] text-[#a098b0] border-[#203024]"
                                }`}
                            >
                              {link.enabled !== false ? (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-[#00ffcc]" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-[#a098b0]" />
                                  <span>Hidden</span>
                                </>
                              )}
                            </button>

                            {/* Move Up / Down */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveSocialLink(idx, "up")}
                                title="Move Up"
                                className="p-1.5 bg-[#0a2315] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] disabled:opacity-30 disabled:hover:text-[#a098b0] border border-[#1a442a] rounded-lg transition-colors cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (formData.social.customLinks?.length || 0) - 1}
                                onClick={() => moveSocialLink(idx, "down")}
                                title="Move Down"
                                className="p-1.5 bg-[#0a2315] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] disabled:opacity-30 disabled:hover:text-[#a098b0] border border-[#1a442a] rounded-lg transition-colors cursor-pointer"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => removeSocialLink(link.id)}
                              title="Remove Social Link"
                              className="p-1.5 bg-[#250d18] hover:bg-[#ff2d78] text-[#ff2d78] hover:text-white border border-[#441a2a] hover:border-[#ff2d78] rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 5: ABOUT PAGE & NATURALIST PROFILE ── */}
          {activeTab === "about" && (
            <div className="space-y-10">
              {/* Sub-Section 1: Naturalist Bio & Hero Details */}
              <div className="bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26] space-y-6">
                <div className="border-b border-[#163e26] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">
                      Photographer Profile &amp; Story
                    </h3>
                    <p className="text-xs text-[#a098b0] mt-1">
                      Control biographical storytelling, hero headers, portrait image, and telemetry metrics.
                    </p>
                  </div>
                  <Link
                    href="/about"
                    target="_blank"
                    className="text-xs font-label text-[#00ffcc] hover:underline flex items-center gap-1"
                  >
                    <span>Preview /about</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Naturalist Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.about.naturalistName}
                      onChange={(e) => {
                        const newName = e.target.value;
                        let updatedBio = formData.about.bioParagraph;
                        if (updatedBio && /^I am [^,]+,/i.test(updatedBio.trim())) {
                          updatedBio = updatedBio.replace(/^I am [^,]+,/i, `I am ${newName},`);
                        } else if (updatedBio && updatedBio.includes("Suban Bajracharya")) {
                          updatedBio = updatedBio.replaceAll("Suban Bajracharya", newName);
                        }
                        setFormData({
                          ...formData,
                          about: {
                            ...formData.about,
                            naturalistName: newName,
                            bioParagraph: updatedBio,
                          },
                        });
                      }}
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={formData.about.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, title: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Field Base Station
                    </label>
                    <input
                      type="text"
                      value={formData.about.baseStation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, baseStation: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Official Affiliations / Credentials
                    </label>
                    <input
                      type="text"
                      value={formData.about.credentials}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, credentials: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <FileUploadDropzone
                    bucket="profiles"
                    value={formData.about.portraitUrl}
                    label="Suban's Naturalist Profile Photo / Avatar *"
                    helperText="Uploads directly to 'profiles' bucket with live portrait preview"
                    aspectRatio="square"
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, portraitUrl: url },
                      })
                    }
                  />
                  <div className="mt-2 flex gap-4 items-center">
                    <input
                      type="text"
                      value={formData.about.portraitUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, portraitUrl: e.target.value },
                        })
                      }
                      className="flex-1 bg-[#0a2315] border border-[#1a442a] px-4 py-2 rounded-lg text-xs font-mono text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                      placeholder="Or enter direct URL: https://..."
                    />
                    {formData.about.portraitUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt="Portrait preview"
                        src={formData.about.portraitUrl}
                        className="w-8 h-8 rounded-full object-cover border border-[#00ffcc]/30 shrink-0"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Hero Headline Prefix
                    </label>
                    <input
                      type="text"
                      value={formData.about.heroHeadline}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, heroHeadline: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                      Hero Gradient Accent Text
                    </label>
                    <input
                      type="text"
                      value={formData.about.heroGradientText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          about: { ...formData.about, heroGradientText: e.target.value },
                        })
                      }
                      className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-sm text-[#ff2d78] focus:border-[#ff2d78] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Full Biography Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={formData.about.bioParagraph}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, bioParagraph: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] p-3 rounded-lg text-sm text-[#e8e0f0] leading-relaxed focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>

                {/* 4 Key Metrics */}
                <div className="pt-4 border-t border-[#163e26]">
                  <h4 className="font-label text-xs uppercase tracking-wider text-[#00ffcc] mb-3">
                    Telemetry Stat Badges
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                        Field Experience
                      </label>
                      <input
                        type="text"
                        value={formData.about.metrics.fieldExperience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              metrics: {
                                ...formData.about.metrics,
                                fieldExperience: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded text-sm text-[#00ffcc] font-bold focus:border-[#00ffcc] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                        Max Altitude
                      </label>
                      <input
                        type="text"
                        value={formData.about.metrics.maxAltitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              metrics: {
                                ...formData.about.metrics,
                                maxAltitude: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded text-sm text-[#ffe04a] font-bold focus:border-[#00ffcc] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                        Master Plates
                      </label>
                      <input
                        type="text"
                        value={formData.about.metrics.masterPlates}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              metrics: {
                                ...formData.about.metrics,
                                masterPlates: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded text-sm text-[#ff2d78] font-bold focus:border-[#00ffcc] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-label uppercase text-[#a098b0] mb-1">
                        Royalty %
                      </label>
                      <input
                        type="text"
                        value={formData.about.metrics.royaltyPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            about: {
                              ...formData.about,
                              metrics: {
                                ...formData.about.metrics,
                                royaltyPercent: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full bg-[#0a2315] border border-[#1a442a] px-3 py-2 rounded text-sm text-[#00ffcc] font-bold focus:border-[#00ffcc] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Section 2: The Field Manifesto */}
              <div className="bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26] space-y-5">
                <div className="border-b border-[#163e26] pb-4">
                  <h3 className="font-headline font-bold text-xl text-white">
                    The Field Manifesto &amp; Philosophy
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    The central quote and ethics declaration on wildlife non-disturbance.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Manifesto Quote
                  </label>
                  <textarea
                    rows={2}
                    value={formData.about.manifestoQuote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, manifestoQuote: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] p-3 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1.5">
                    Manifesto Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={formData.about.manifestoText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, manifestoText: e.target.value },
                      })
                    }
                    className="w-full bg-[#0a2315] border border-[#1a442a] p-3 rounded-lg text-sm text-[#e8e0f0] focus:border-[#00ffcc] focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub-Section 3: IUCN Ethical Principles */}
              <div className="bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#163e26] pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">
                      IUCN Biological Directives ({formData.about.ethics.length})
                    </h3>
                    <p className="text-xs text-[#a098b0] mt-1">
                      Manage the ethical cards shown in the 4 Biological Directives section.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addEthic}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00ffcc] text-[#001a1a] text-xs font-label uppercase tracking-wider font-bold flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Principle</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.about.ethics.map((ethic, idx) => (
                    <div
                      key={ethic.id}
                      className="p-4 rounded-xl bg-[#0a2315] border border-[#1a442a] space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label text-xs text-[#00ffcc] font-bold">
                          Directive #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEthic(ethic.id)}
                          className="text-[#a098b0] hover:text-[#ff2d78] transition-colors"
                          title="Delete Directive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ethic.title}
                        onChange={(e) => {
                          const updated = formData.about.ethics.map((item) =>
                            item.id === ethic.id ? { ...item, title: e.target.value } : item
                          );
                          setFormData({
                            ...formData,
                            about: { ...formData.about, ethics: updated },
                          });
                        }}
                        className="w-full bg-[#081e12] border border-[#163e26] px-3 py-2 rounded text-sm text-white font-bold focus:border-[#00ffcc] focus:outline-none"
                        placeholder="Title"
                      />

                      <textarea
                        rows={3}
                        value={ethic.description}
                        onChange={(e) => {
                          const updated = formData.about.ethics.map((item) =>
                            item.id === ethic.id ? { ...item, description: e.target.value } : item
                          );
                          setFormData({
                            ...formData,
                            about: { ...formData.about, ethics: updated },
                          });
                        }}
                        className="w-full bg-[#081e12] border border-[#163e26] p-2.5 rounded text-xs text-[#a098b0] focus:border-[#00ffcc] focus:outline-none"
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Section 4: Expedition Annals */}
              <div className="bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#163e26] pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">
                      Himalayan Expedition Annals ({formData.about.expeditions.length})
                    </h3>
                    <p className="text-xs text-[#a098b0] mt-1">
                      Timeline cards displaying documented expeditions with altitudinal stats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addExpedition}
                    className="px-3.5 py-1.5 rounded-lg bg-[#ffe04a] text-[#1a1000] text-xs font-label uppercase tracking-wider font-bold flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Expedition</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.about.expeditions.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-5 rounded-xl bg-[#0a2315] border border-[#1a442a] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={exp.year}
                            onChange={(e) => {
                              const updated = formData.about.expeditions.map((item) =>
                                item.id === exp.id ? { ...item, year: e.target.value } : item
                              );
                              setFormData({
                                ...formData,
                                about: { ...formData.about, expeditions: updated },
                              });
                            }}
                            className="w-20 bg-[#081e12] border border-[#163e26] px-2.5 py-1.5 rounded text-xs font-bold text-[#ffe04a]"
                          />
                          <input
                            type="text"
                            value={exp.altitude}
                            onChange={(e) => {
                              const updated = formData.about.expeditions.map((item) =>
                                item.id === exp.id ? { ...item, altitude: e.target.value } : item
                              );
                              setFormData({
                                ...formData,
                                about: { ...formData.about, expeditions: updated },
                              });
                            }}
                            className="w-36 bg-[#081e12] border border-[#163e26] px-2.5 py-1.5 rounded text-xs text-[#00ffcc]"
                            placeholder="Altitude"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeExpedition(exp.id)}
                          className="text-[#a098b0] hover:text-[#ff2d78] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={exp.region}
                          onChange={(e) => {
                            const updated = formData.about.expeditions.map((item) =>
                              item.id === exp.id ? { ...item, region: e.target.value } : item
                            );
                            setFormData({
                              ...formData,
                              about: { ...formData.about, expeditions: updated },
                            });
                          }}
                          className="w-full bg-[#081e12] border border-[#163e26] px-3 py-2 rounded text-xs text-white"
                          placeholder="Region"
                        />

                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = formData.about.expeditions.map((item) =>
                              item.id === exp.id ? { ...item, title: e.target.value } : item
                            );
                            setFormData({
                              ...formData,
                              about: { ...formData.about, expeditions: updated },
                            });
                          }}
                          className="w-full bg-[#081e12] border border-[#163e26] px-3 py-2 rounded text-xs text-white font-bold"
                          placeholder="Expedition Title"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={exp.desc}
                        onChange={(e) => {
                          const updated = formData.about.expeditions.map((item) =>
                            item.id === exp.id ? { ...item, desc: e.target.value } : item
                          );
                          setFormData({
                            ...formData,
                            about: { ...formData.about, expeditions: updated },
                          });
                        }}
                        className="w-full bg-[#081e12] border border-[#163e26] p-2.5 rounded text-xs text-[#a098b0]"
                        placeholder="Narrative description"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-Section 5: Gear Rig */}
              <div className="bg-[#081e12] p-6 lg:p-8 rounded-2xl border border-[#163e26] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#163e26] pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">
                      Extreme Field Kit &amp; Gear ({formData.about.gear.length})
                    </h3>
                    <p className="text-xs text-[#a098b0] mt-1">
                      Camera bodies, telephoto glass, audio rigs, and cryptographic tags.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addGear}
                    className="px-3.5 py-1.5 rounded-lg bg-[#ff2d78] text-[#ffe0ec] text-xs font-label uppercase tracking-wider font-bold flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Gear Item</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.about.gear.map((gear) => (
                    <div
                      key={gear.id}
                      className="p-4 rounded-xl bg-[#0a2315] border border-[#1a442a] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={gear.category}
                          onChange={(e) => {
                            const updated = formData.about.gear.map((item) =>
                              item.id === gear.id ? { ...item, category: e.target.value } : item
                            );
                            setFormData({
                              ...formData,
                              about: { ...formData.about, gear: updated },
                            });
                          }}
                          className="bg-transparent text-[10px] font-label uppercase tracking-wider text-[#ff2d78] border-b border-[#ff2d78]/30 focus:outline-none w-3/4"
                          placeholder="Category"
                        />
                        <button
                          type="button"
                          onClick={() => removeGear(gear.id)}
                          className="text-[#a098b0] hover:text-[#ff2d78] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={gear.item}
                        onChange={(e) => {
                          const updated = formData.about.gear.map((item) =>
                            item.id === gear.id ? { ...item, item: e.target.value } : item
                          );
                          setFormData({
                            ...formData,
                            about: { ...formData.about, gear: updated },
                          });
                        }}
                        className="w-full bg-[#081e12] border border-[#163e26] px-2.5 py-1.5 rounded text-xs text-white font-bold"
                        placeholder="Item name"
                      />

                      <textarea
                        rows={2}
                        value={gear.details}
                        onChange={(e) => {
                          const updated = formData.about.gear.map((item) =>
                            item.id === gear.id ? { ...item, details: e.target.value } : item
                          );
                          setFormData({
                            ...formData,
                            about: { ...formData.about, gear: updated },
                          });
                        }}
                        className="w-full bg-[#081e12] border border-[#163e26] p-2 rounded text-xs text-[#a098b0]"
                        placeholder="Details"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: DATABASE PHOTOGRAPHIC PRODUCTS ── */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Top Bar with Add Button and DB Refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#081e12] p-6 rounded-2xl border border-[#163e26]">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#ff2d78]" />
                    <span>Photographic Archive &amp; Licensing Products</span>
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    All items are stored in PostgreSQL on Supabase, connected to license tiers, media versions, and photo EXIF metadata.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00d4aa] text-[#001a14] text-xs font-label uppercase font-extrabold tracking-wider hover:opacity-90 shadow-[0_0_20px_rgba(0,255,204,0.35)] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Photograph</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadDbData}
                    disabled={isLoadingDb}
                    className="px-3.5 py-2.5 rounded-xl bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase tracking-wider border border-[#00ffcc]/30 flex items-center gap-2 transition-all cursor-pointer"
                    title="Refresh Database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filter, Search & View Mode Controls Bar */}
              <div className="bg-[#081e12] p-4 rounded-2xl border border-[#163e26] flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#a098b0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Search by title, species, location, camera..."
                    className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] pl-9 pr-8 py-2 rounded-xl text-xs text-white placeholder-[#a098b0]/50 outline-none transition-colors"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a098b0] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filters & View Switcher */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Tabs */}
                  <div className="flex items-center bg-[#04120a] p-1 rounded-xl border border-[#163e26]">
                    <button
                      type="button"
                      onClick={() => setProductStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider transition-all cursor-pointer ${productStatusFilter === "all"
                          ? "bg-[#163e26] text-[#00ffcc] font-bold shadow-sm"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                    >
                      All ({dbProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductStatusFilter("active")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${productStatusFilter === "active"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Active ({activeProductsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductStatusFilter("inactive")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${productStatusFilter === "inactive"
                          ? "bg-amber-950 text-amber-400 border border-amber-500/30 font-bold shadow-sm"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Inactive ({inactiveProductsCount})
                    </button>
                  </div>

                  {/* View Switcher: Grid vs Table */}
                  <div className="flex items-center bg-[#04120a] p-1 rounded-xl border border-[#163e26]">
                    <button
                      type="button"
                      onClick={() => setProductViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${productViewMode === "grid"
                          ? "bg-[#163e26] text-[#00ffcc]"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductViewMode("table")}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${productViewMode === "table"
                          ? "bg-[#163e26] text-[#00ffcc]"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                      title="Table / List View"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Inventory Display */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-[#081e12] rounded-2xl border border-[#163e26] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#04120a] border border-[#163e26] flex items-center justify-center mx-auto text-[#a098b0]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base text-white">No photographs found</h4>
                    <p className="text-xs text-[#a098b0] mt-1 max-w-sm mx-auto">
                      {productSearchQuery
                        ? `No photographs matching "${productSearchQuery}". Try clearing search or resetting filters.`
                        : productStatusFilter !== "all"
                          ? `No ${productStatusFilter} photographs found in database.`
                          : "Your database inventory is currently empty. Add your first wildlife photograph."}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 rounded-xl bg-[#00ffcc] text-[#001a14] font-label text-xs uppercase font-bold tracking-wider hover:bg-[#c0fff4] inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,204,0.25)]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Photograph</span>
                    </button>
                  </div>
                </div>
              ) : productViewMode === "grid" ? (
                /* ── GRID VIEW ── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => {
                    const isActive = p.status === "published";
                    const isImageBroken = brokenImageIds[p.id];
                    const isToggling = togglingProductId === p.id;
                    const isDeleting = deletingProductId === p.id;

                    return (
                      <div
                        key={p.id}
                        className="bg-[#081e12] rounded-2xl border border-[#163e26] overflow-hidden hover:border-[#00ffcc]/40 transition-all group flex flex-col justify-between shadow-lg"
                      >
                        {/* Image Thumbnail Container with Safe Error Fallback */}
                        <div className="aspect-[16/10] bg-[#04120a] relative overflow-hidden">
                          {isImageBroken || !p.imageUrl ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#04120a] to-[#0c2819] text-[#a098b0] p-4 text-center">
                              <Camera className="w-8 h-8 opacity-40 mb-2" />
                              <span className="text-[11px] font-label uppercase tracking-wider opacity-60">
                                Preview Unavailable
                              </span>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl || p.thumbnailUrl}
                              alt={p.title}
                              onError={() =>
                                setBrokenImageIds((prev) => ({ ...prev, [p.id]: true }))
                              }
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          {/* Status Badge (Top Left) */}
                          <div className="absolute top-3 left-3">
                            {isActive ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                Inactive
                              </span>
                            )}
                          </div>

                          {/* Price Badge (Top Right) */}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#04120a]/80 backdrop-blur-md font-label text-[11px] font-bold text-white border border-[#163e26]">
                            ${p.priceUSD || 149}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-headline font-bold text-base text-white group-hover:text-[#00ffcc] transition-colors line-clamp-1">
                                {p.title}
                              </h5>
                            </div>
                            <p className="text-xs text-[#00ffcc]/80 line-clamp-1 italic mt-0.5 font-serif">
                              {p.species || p.scientificName || "Wildlife Subject"}
                            </p>
                            <p className="text-[11px] text-[#a098b0] line-clamp-1 mt-1 flex items-center gap-1">
                              <span>📍</span>
                              <span>{p.locationName || "Nepal"}</span>
                            </p>
                          </div>

                          {/* Pricing and Slug row */}
                          <div className="py-2 px-3 rounded-xl bg-[#04120a] border border-[#163e26]/80 flex items-center justify-between text-xs font-label">
                            <span className="text-[#a098b0]">
                              रु <strong className="text-white">{(p.priceNPR || 19900).toLocaleString()}</strong> NPR
                            </span>
                            <span className="text-[#00ffcc] font-mono text-[10px] max-w-[120px] truncate">
                              /{p.slug}
                            </span>
                          </div>

                          {/* One-Click Status Active ⟷ Inactive Toggle */}
                          <div className="pt-2 border-t border-[#163e26]/70 flex items-center justify-between">
                            <span className="text-xs font-label uppercase tracking-wider text-[#a098b0]">
                              Status:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(p)}
                              disabled={isToggling}
                              className={`px-3 py-1 rounded-lg text-xs font-label uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isActive
                                  ? "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30"
                                  : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-700"
                                }`}
                              title={isActive ? "Click to set Inactive" : "Click to set Active"}
                            >
                              {isToggling ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isActive ? (
                                <ToggleRight className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-neutral-500" />
                              )}
                              <span>{isActive ? "Active (On)" : "Inactive (Off)"}</span>
                            </button>
                          </div>

                          {/* Action Buttons: View, Edit, Delete */}
                          <div className="pt-3 border-t border-[#163e26]/70 flex items-center justify-between gap-2">
                            <Link
                              href={`/gallery/${p.slug}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-all"
                              title="View public gallery page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(p)}
                                className="px-3 py-1.5 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase font-bold tracking-wider flex items-center gap-1.5 border border-[#00ffcc]/30 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p)}
                                disabled={isDeleting}
                                className="px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-xs font-label uppercase font-bold flex items-center gap-1.5 border border-red-800/40 transition-all cursor-pointer disabled:opacity-50"
                                title="Delete photograph"
                              >
                                <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? "animate-spin" : ""}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ── TABLE VIEW ── */
                <div className="bg-[#081e12] rounded-2xl border border-[#163e26] overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-body">
                      <thead className="bg-[#04120a] font-label text-[10px] uppercase tracking-wider text-[#a098b0] border-b border-[#163e26]">
                        <tr>
                          <th className="px-5 py-3.5">Photograph</th>
                          <th className="px-5 py-3.5">Species / Subject</th>
                          <th className="px-5 py-3.5">Location</th>
                          <th className="px-5 py-3.5">Pricing</th>
                          <th className="px-5 py-3.5">Active Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#163e26]/60">
                        {filteredProducts.map((p) => {
                          const isActive = p.status === "published";
                          const isImageBroken = brokenImageIds[p.id];
                          const isToggling = togglingProductId === p.id;
                          const isDeleting = deletingProductId === p.id;

                          return (
                            <tr key={p.id} className="hover:bg-[#0c2819] transition-colors">
                              {/* Photo & Title */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-9 rounded-lg bg-[#04120a] overflow-hidden border border-[#163e26] shrink-0">
                                    {isImageBroken || !p.imageUrl ? (
                                      <div className="w-full h-full flex items-center justify-center text-[#a098b0]">
                                        <Camera className="w-4 h-4 opacity-50" />
                                      </div>
                                    ) : (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={p.imageUrl || p.thumbnailUrl}
                                        alt={p.title}
                                        onError={() =>
                                          setBrokenImageIds((prev) => ({ ...prev, [p.id]: true }))
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-headline font-bold text-white block truncate max-w-[200px]">
                                      {p.title}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#00ffcc]/80 block truncate max-w-[180px]">
                                      /{p.slug}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Species */}
                              <td className="px-5 py-3.5 text-[#e8e0f0]">
                                <span className="font-serif italic">
                                  {p.species || p.scientificName || "Wildlife Subject"}
                                </span>
                              </td>

                              {/* Location */}
                              <td className="px-5 py-3.5 text-[#a098b0]">
                                {p.locationName || "Nepal"}
                              </td>

                              {/* Pricing */}
                              <td className="px-5 py-3.5">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#ffe04a] block">
                                    ${p.priceUSD || 149} USD
                                  </span>
                                  <span className="text-[10px] text-[#a098b0] block">
                                    रु {(p.priceNPR || 19900).toLocaleString()} NPR
                                  </span>
                                </div>
                              </td>

                              {/* Status & Toggle */}
                              <td className="px-5 py-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleProductStatus(p)}
                                  disabled={isToggling}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-label uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer ${isActive
                                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900"
                                      : "bg-neutral-900 text-neutral-400 border border-neutral-700 hover:bg-neutral-800"
                                    }`}
                                  title={isActive ? "Click to deactivate" : "Click to activate"}
                                >
                                  {isToggling ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                                        }`}
                                    />
                                  )}
                                  <span>{isActive ? "Active" : "Inactive"}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/gallery/${p.slug}`}
                                    target="_blank"
                                    className="p-1.5 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-all"
                                    title="View on public site"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditProduct(p)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase font-bold tracking-wider flex items-center gap-1 border border-[#00ffcc]/30 transition-all cursor-pointer"
                                    title="Edit photograph"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p)}
                                    disabled={isDeleting}
                                    className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-800/40 transition-all cursor-pointer disabled:opacity-50"
                                    title="Delete photograph"
                                  >
                                    <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? "animate-spin" : ""}`} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── PRODUCT CREATE / EDIT MODAL DIALOG ── */}
              {isProductModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
                  <div className="bg-[#081e12] border border-[#163e26] rounded-2xl w-full max-w-3xl my-auto shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-[#163e26] flex items-center justify-between bg-[#04120a]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-label uppercase font-extrabold px-2 py-0.5 rounded bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20">
                            {editingProductId ? "EDITING ARCHIVE" : "NEW ARCHIVE ENTRY"}
                          </span>
                          <h4 className="font-headline font-bold text-base text-white">
                            {editingProductId
                              ? `Edit: ${newProduct.title || "Photograph"}`
                              : "Upload & Add New Photograph"}
                          </h4>
                        </div>
                        <p className="text-xs text-[#a098b0] mt-0.5">
                          {editingProductId
                            ? "Updates PostgreSQL records across products, media, metadata & prices."
                            : "Uploads master photo and populates gallery product database tables."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseProductModal}
                        className="p-2 rounded-xl bg-[#081e12] hover:bg-[#163e26] text-[#a098b0] hover:text-white transition-all cursor-pointer border border-[#163e26]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Modal Body / Form */}
                    <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
                      {productCreateMessage && (
                        <div
                          className={`p-3.5 rounded-xl text-xs font-label ${productCreateMessage.startsWith("✅")
                              ? "bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc]"
                              : "bg-[#ff2d78]/10 border border-[#ff2d78]/30 text-[#ff2d78]"
                            }`}
                        >
                          {productCreateMessage}
                        </div>
                      )}

                      {/* Active Status Selector */}
                      <div className="p-4 rounded-xl bg-[#04120a] border border-[#163e26] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="font-label text-xs uppercase font-bold text-white block">
                            Publication Status
                          </span>
                          <span className="text-xs text-[#a098b0]">
                            Active items are displayed in public gallery. Inactive items are hidden.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#081e12] p-1 rounded-xl border border-[#163e26]">
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, status: "published" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${newProduct.status === "published"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-sm"
                                : "text-[#a098b0] hover:text-white"
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Active</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, status: "archived" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${newProduct.status === "archived" || newProduct.status === "draft"
                                ? "bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm"
                                : "text-[#a098b0] hover:text-white"
                              }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Inactive</span>
                          </button>
                        </div>
                      </div>

                      {/* Master Photo Dropzone */}
                      <div className="p-4 rounded-xl bg-[#04120a] border border-[#163e26]">
                        <FileUploadDropzone
                          bucket="gallery"
                          value={newProduct.imageUrl}
                          label="Master Photograph Capture *"
                          helperText="Drag & drop wildlife photograph (JPEG, PNG, WebP, TIFF, DNG)"
                          aspectRatio="video"
                          onChange={(url, info) => {
                            setNewProduct((prev) => {
                              const updated = { ...prev, imageUrl: url };
                              if (!prev.title && info?.filename) {
                                const cleanTitle = info.filename
                                  .replace(/[-_]/g, " ")
                                  .replace(/\.[^/.]+$/, "")
                                  .replace(/\b\w/g, (c) => c.toUpperCase());
                                const autoSlug = cleanTitle
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/(^-|-$)+/g, "");
                                updated.title = cleanTitle;
                                updated.slug = autoSlug;
                              }
                              return updated;
                            });
                          }}
                        />
                        <div className="mt-2.5">
                          <input
                            type="url"
                            value={newProduct.imageUrl}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, imageUrl: e.target.value })
                            }
                            placeholder="Or enter direct image URL: https://..."
                            className="w-full bg-[#081e12] border border-[#163e26] focus:border-[#00ffcc] px-3 py-1.5 rounded-lg text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Title & Slug */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Artwork Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={newProduct.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              const autoSlug = val
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)+/g, "");
                              setNewProduct({
                                ...newProduct,
                                title: val,
                                slug: newProduct.slug ? newProduct.slug : autoSlug,
                              });
                            }}
                            placeholder="e.g. Royal Bengal Tiger in Morning Mist"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Slug (URL Path) *
                          </label>
                          <input
                            type="text"
                            required
                            value={newProduct.slug}
                            onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                            placeholder="e.g. royal-bengal-tiger-morning-mist"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2.5 rounded-xl text-xs font-mono text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Avian Species Link & New Bird Registration */}
                      <div className="p-4 rounded-xl bg-[#04120a] border border-[#163e26] space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#163e26]">
                          <div>
                            <label className="block text-xs font-label uppercase tracking-wider text-[#00ffcc] font-bold flex items-center gap-1.5">
                              <span className="text-sm">🐦</span>
                              <span>Avian Species Integration (Birds Hub &amp; Monograph)</span>
                            </label>
                            <p className="text-[11px] text-[#a098b0] mt-0.5">
                              Link this photograph to an existing bird or register a brand-new avian species.
                            </p>
                          </div>
                          
                          {/* Toggle Mode: Link Existing vs Create New */}
                          <div className="flex items-center gap-1.5 bg-[#081e12] p-1 rounded-xl border border-[#163e26] self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, isNewSpecies: false })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-label uppercase font-bold transition-all cursor-pointer ${
                                !newProduct.isNewSpecies
                                  ? "bg-[#163e26] text-[#00ffcc] shadow-sm"
                                  : "text-[#a098b0] hover:text-white"
                              }`}
                            >
                              Existing Bird
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setNewProduct({
                                  ...newProduct,
                                  isNewSpecies: true,
                                  speciesId: "",
                                  newBirdCommonName: newProduct.species || "",
                                  newBirdScientificName: newProduct.scientificName || "",
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-label uppercase font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                newProduct.isNewSpecies
                                  ? "bg-gradient-to-r from-[#00ffcc] to-[#00d4aa] text-[#001a14] shadow-[0_0_12px_rgba(0,255,204,0.3)]"
                                  : "text-[#a098b0] hover:text-[#00ffcc]"
                              }`}
                            >
                              <span>+ New Bird</span>
                            </button>
                          </div>
                        </div>

                        {!newProduct.isNewSpecies ? (
                          /* Mode 1: Select Existing Bird */
                          <div>
                            <select
                              value={newProduct.speciesId}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                if (selectedId === "__NEW_SPECIES__") {
                                  setNewProduct((prev) => ({
                                    ...prev,
                                    isNewSpecies: true,
                                    speciesId: "",
                                  }));
                                  return;
                                }
                                const found = dbSpeciesList.find((s) => s.id === selectedId);
                                setNewProduct((prev) => ({
                                  ...prev,
                                  speciesId: selectedId,
                                  species: found ? found.commonName : prev.species,
                                  scientificName: found ? found.scientificName : prev.scientificName,
                                  title:
                                    !prev.title || prev.title.startsWith("Himalayan")
                                      ? found
                                        ? `${found.commonName} Exhibition Print`
                                        : prev.title
                                      : prev.title,
                                }));
                              }}
                              className="w-full bg-[#081e12] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none cursor-pointer"
                            >
                              <option value="">None (General Wildlife Photograph)</option>
                              <option value="__NEW_SPECIES__" className="text-[#00ffcc] font-bold">
                                ✨ + Register as a Brand-New Bird Species...
                              </option>
                              {dbSpeciesList.map((sp) => (
                                <option key={sp.id} value={sp.id}>
                                  🐦 {sp.commonName} {sp.nepaliName ? `(${sp.nepaliName})` : ""} — [{sp.scientificName}]
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center justify-between mt-2 text-[11px] text-[#a098b0]">
                              <span>
                                {newProduct.speciesId ? (
                                  <span className="text-[#00ffcc]">
                                    ✓ Will attach to this bird&apos;s monograph at /birds/[slug] with copyright protection.
                                  </span>
                                ) : (
                                  "No bird linked. Will only be published to general gallery & store."
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveTab("species")}
                                className="text-[#00ffcc] hover:underline font-mono text-[10px] cursor-pointer"
                              >
                                Open Species Hub ↗
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Mode 2: Register Brand-New Bird Species Inline */
                          <div className="p-3.5 rounded-xl bg-[#081e12] border border-[#00ffcc]/30 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-label uppercase font-bold text-[#00ffcc] flex items-center gap-1.5">
                                <span>✨ Registering Brand-New Bird Species</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                Monograph will be created
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                                  Bird Common Name *
                                </label>
                                <input
                                  type="text"
                                  required={newProduct.isNewSpecies}
                                  value={newProduct.newBirdCommonName}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewProduct((prev) => ({
                                      ...prev,
                                      newBirdCommonName: val,
                                      species: val,
                                      title: prev.title ? prev.title : `${val} Fine Art Print`,
                                      slug: prev.slug
                                        ? prev.slug
                                        : `${val.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-print`,
                                    }));
                                  }}
                                  placeholder="e.g. Satyr Tragopan, Rufous-vented Tit"
                                  className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-lg text-xs text-white outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                                  Nepali Name (नेपाली नाम)
                                </label>
                                <input
                                  type="text"
                                  value={newProduct.newBirdNepaliName}
                                  onChange={(e) =>
                                    setNewProduct({ ...newProduct, newBirdNepaliName: e.target.value })
                                  }
                                  placeholder="e.g. मुनाल, चिबे, राज धनेश"
                                  className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-lg text-xs text-white outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                                  Scientific Name *
                                </label>
                                <input
                                  type="text"
                                  value={newProduct.newBirdScientificName}
                                  onChange={(e) =>
                                    setNewProduct((prev) => ({
                                      ...prev,
                                      newBirdScientificName: e.target.value,
                                      scientificName: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g. Tragopan satyra"
                                  className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-lg text-xs font-mono text-white outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                                  IUCN Red List Status
                                </label>
                                <select
                                  value={newProduct.newBirdIucnStatus}
                                  onChange={(e) =>
                                    setNewProduct({ ...newProduct, newBirdIucnStatus: e.target.value })
                                  }
                                  className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-lg text-xs text-white outline-none cursor-pointer"
                                >
                                  <option value="LC">LC — Least Concern</option>
                                  <option value="NT">NT — Near Threatened</option>
                                  <option value="VU">VU — Vulnerable</option>
                                  <option value="EN">EN — Endangered</option>
                                  <option value="CR">CR — Critically Endangered</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-label uppercase tracking-wider text-[#a098b0] mb-1">
                                  Habitat &amp; Elevation
                                </label>
                                <input
                                  type="text"
                                  value={newProduct.newBirdHabitat}
                                  onChange={(e) =>
                                    setNewProduct({ ...newProduct, newBirdHabitat: e.target.value })
                                  }
                                  placeholder="e.g. Rhododendron Forest (2400-4200m)"
                                  className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-lg text-xs text-white outline-none"
                                />
                              </div>
                            </div>

                            <p className="text-[11px] text-[#00ffcc]/80 pt-1 border-t border-[#163e26]">
                              ✓ Publishing will automatically create this new bird monograph in the Birds Hub (/birds) and attach this master photograph as its primary plate!
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Species */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Common Species
                          </label>
                          <input
                            type="text"
                            value={newProduct.species}
                            onChange={(e) => setNewProduct({ ...newProduct, species: e.target.value })}
                            placeholder="e.g. Bengal Tiger"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Scientific Name
                          </label>
                          <input
                            type="text"
                            value={newProduct.scientificName}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, scientificName: e.target.value })
                            }
                            placeholder="e.g. Panthera tigris"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2 rounded-xl text-xs italic text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Location, Camera & Lens */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Encounter Location
                          </label>
                          <input
                            type="text"
                            value={newProduct.locationName}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, locationName: e.target.value })
                            }
                            placeholder="e.g. Bardia National Park, Nepal"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Camera Body
                          </label>
                          <input
                            type="text"
                            value={newProduct.camera}
                            onChange={(e) => setNewProduct({ ...newProduct, camera: e.target.value })}
                            placeholder="e.g. Nikon Z9"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            Optical Lens
                          </label>
                          <input
                            type="text"
                            value={newProduct.lens}
                            onChange={(e) => setNewProduct({ ...newProduct, lens: e.target.value })}
                            placeholder="e.g. NIKKOR Z 400mm f/2.8"
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3 py-2 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            License Price USD ($) *
                          </label>
                          <input
                            type="number"
                            value={newProduct.priceUSD}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, priceUSD: Number(e.target.value) })
                            }
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                            License Price NPR (रु) *
                          </label>
                          <input
                            type="number"
                            value={newProduct.priceNPR}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, priceNPR: Number(e.target.value) })
                            }
                            className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2.5 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      {/* Field Story */}
                      <div>
                        <label className="block text-xs font-label uppercase tracking-wider text-[#a098b0] mb-1">
                          Field Encounter Story
                        </label>
                        <textarea
                          rows={3}
                          value={newProduct.description}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, description: e.target.value })
                          }
                          placeholder="Detailed narrative description of the encounter and conservation background..."
                          className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] p-3.5 rounded-xl text-xs text-white outline-none resize-none"
                        />
                      </div>

                      {/* Modal Footer Controls */}
                      <div className="pt-4 border-t border-[#163e26] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleCloseProductModal}
                          className="px-4 py-2.5 rounded-xl bg-[#04120a] hover:bg-[#163e26] text-[#a098b0] hover:text-white font-label text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#163e26]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingProduct}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00d4aa] text-[#001a14] font-label text-xs uppercase font-extrabold tracking-wider hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,204,0.35)] disabled:opacity-50"
                        >
                          <Save className="w-4 h-4 stroke-[2.5]" />
                          <span>
                            {isCreatingProduct
                              ? editingProductId
                                ? "Updating Photograph..."
                                : "Publishing to Database..."
                              : editingProductId
                                ? "Save Changes"
                                : "Publish to Database"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 7: FIELD DISPATCHES (POSTS LIST) ── */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {/* Header with prominent + New Dispatch action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#081e12] p-6 lg:p-7 rounded-2xl border border-[#163e26]">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-[#00ffcc]" />
                    <span>Field Journal Dispatches &amp; Naturalist Articles</span>
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    Manage editorial expeditions, nocturnal observations, research notes, and field telemetry.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={loadDbData}
                    disabled={isLoadingDb}
                    className="px-3.5 py-2.5 rounded-xl bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase tracking-wider border border-[#00ffcc]/30 flex items-center gap-2 transition-all cursor-pointer"
                    title="Refresh from database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>

                  <Link
                    href="/admin/dispatches/new"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00d4aa] text-[#001a14] font-label text-xs uppercase font-extrabold tracking-wider hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,204,0.35)]"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ New Dispatch</span>
                  </Link>
                </div>
              </div>

              {/* Filter Tabs with Live Status Counts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#163e26]/60 text-xs font-label uppercase tracking-wider">
                {[
                  { id: "all", label: "All Dispatches", count: postCounts.all },
                  { id: "published", label: "Published", count: postCounts.published },
                  { id: "draft", label: "Drafts", count: postCounts.draft },
                  { id: "scheduled", label: "Scheduled", count: postCounts.scheduled },
                  { id: "archived", label: "Archived", count: postCounts.archived },
                ].map((tab) => {
                  const isActive = postStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setPostStatusFilter(tab.id as any);
                        setSelectedPostIds([]);
                      }}
                      className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${isActive
                          ? "bg-[#103420] text-[#00ffcc] border-[#00ffcc]/40 shadow-[0_0_12px_rgba(0,255,204,0.15)] font-bold"
                          : "bg-[#081e12]/60 text-[#a098b0] border-[#163e26]/60 hover:text-white hover:border-[#163e26]"
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive
                            ? "bg-[#04120a] text-[#00ffcc] border border-[#00ffcc]/30"
                            : "bg-[#04120a]/80 text-[#a098b0]"
                          }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search, Category Filter, View Mode Toggle */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#081e12] p-4 rounded-xl border border-[#163e26]">
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                  {/* Search */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-[#a098b0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      placeholder="Search dispatches by title, slug, excerpt..."
                      className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] pl-10 pr-3.5 py-2 rounded-xl text-xs text-white placeholder-[#a098b0]/60 outline-none"
                    />
                    {postSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPostSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a098b0] hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="w-full sm:w-56">
                    <select
                      value={postCategoryFilter}
                      onChange={(e) => setPostCategoryFilter(e.target.value)}
                      className="w-full bg-[#04120a] border border-[#163e26] focus:border-[#00ffcc] px-3.5 py-2 rounded-xl text-xs text-[#e8e0f0] outline-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {dbCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <div className="flex items-center bg-[#04120a] p-1 rounded-xl border border-[#163e26]">
                    <button
                      type="button"
                      onClick={() => setPostViewMode("grid")}
                      className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${postViewMode === "grid"
                          ? "bg-[#103420] text-[#00ffcc] shadow-sm"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostViewMode("table")}
                      className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${postViewMode === "table"
                          ? "bg-[#103420] text-[#00ffcc] shadow-sm"
                          : "text-[#a098b0] hover:text-white"
                        }`}
                      title="Table View"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bulk Action Bar (Visible when items selected) */}
              {selectedPostIds.length > 0 && (
                <div className="p-3.5 bg-[#103420] border border-[#00ffcc]/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-fade-in text-xs font-label">
                  <div className="flex items-center gap-2.5 text-white">
                    <CheckSquare className="w-4 h-4 text-[#00ffcc]" />
                    <span className="font-bold">{selectedPostIds.length} dispatches selected</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isPerformingPostAction}
                      onClick={() => handleBulkPostOperation("publish")}
                      className="px-3 py-1.5 rounded-lg bg-[#04120a] hover:bg-[#00ffcc] text-[#00ffcc] hover:text-[#04120a] border border-[#00ffcc]/40 transition-all font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      disabled={isPerformingPostAction}
                      onClick={() => handleBulkPostOperation("archive")}
                      className="px-3 py-1.5 rounded-lg bg-[#04120a] hover:bg-zinc-200 text-zinc-300 hover:text-[#04120a] border border-zinc-700 transition-all font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      disabled={isPerformingPostAction}
                      onClick={() => handleBulkPostOperation("draft")}
                      className="px-3 py-1.5 rounded-lg bg-[#04120a] hover:bg-amber-400 text-amber-300 hover:text-[#04120a] border border-amber-600 transition-all font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Set Draft
                    </button>
                    <button
                      type="button"
                      disabled={isPerformingPostAction}
                      onClick={() => handleBulkPostOperation("delete")}
                      className="px-3 py-1.5 rounded-lg bg-[#250d18] hover:bg-[#ff2d78] text-[#ff2d78] hover:text-white border border-[#ff2d78]/40 transition-all font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Delete Selected
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPostIds([])}
                      className="px-3 py-1.5 text-[#a098b0] hover:text-white transition-all cursor-pointer underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Filtered Posts List */}
              {(() => {
                const q = postSearchQuery.trim().toLowerCase();
                const list = dbPosts.filter((post) => {
                  const matchesSearch =
                    !q ||
                    post.title?.toLowerCase().includes(q) ||
                    post.slug?.toLowerCase().includes(q) ||
                    post.excerpt?.toLowerCase().includes(q) ||
                    post.locationLabel?.toLowerCase().includes(q);

                  const matchesStatus =
                    postStatusFilter === "all" ||
                    (post.status || "draft").toLowerCase() === postStatusFilter.toLowerCase();

                  const matchesCategory =
                    !postCategoryFilter || post.categoryId === postCategoryFilter;

                  return matchesSearch && matchesStatus && matchesCategory;
                });

                if (list.length === 0) {
                  return (
                    <div className="p-12 text-center bg-[#081e12] rounded-2xl border border-[#163e26] text-[#a098b0] space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#103420] border border-[#163e26] flex items-center justify-center mx-auto text-[#00ffcc]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-base text-white">No field dispatches found</h4>
                        <p className="text-xs text-[#a098b0] mt-1 max-w-sm mx-auto">
                          {postSearchQuery || postCategoryFilter || postStatusFilter !== "all"
                            ? "Try clearing your filters or search terms."
                            : "Start your journal by creating your first expedition dispatch."}
                        </p>
                      </div>
                      <div>
                        <Link
                          href="/admin/dispatches/new"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ffcc] text-[#04120a] text-xs font-label uppercase font-bold tracking-wider hover:bg-[#c0fff4] transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create Dispatch</span>
                        </Link>
                      </div>
                    </div>
                  );
                }

                if (postViewMode === "grid") {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {list.map((post) => {
                        const isSelected = selectedPostIds.includes(post.id);
                        const status = (post.status || "draft").toLowerCase();

                        return (
                          <div
                            key={post.id}
                            className={`bg-[#081e12] rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col group relative ${isSelected
                                ? "border-[#00ffcc] shadow-[0_0_16px_rgba(0,255,204,0.2)]"
                                : "border-[#163e26] hover:border-[#00ffcc]/50 hover:shadow-lg"
                              }`}
                          >
                            {/* Card Cover with Fallback & Overlays */}
                            <div className="relative aspect-[16/10] bg-[#04120a] overflow-hidden">
                              <ImageWithFallback
                                src={post.coverImage}
                                alt={post.title}
                                fallbackText="Cover unavailable"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />

                              {/* Top Left: Checkbox */}
                              <div className="absolute top-3 left-3 z-20">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPostIds((prev) =>
                                      prev.includes(post.id)
                                        ? prev.filter((id) => id !== post.id)
                                        : [...prev, post.id]
                                    );
                                  }}
                                  className="p-1 rounded-md bg-[#04120a]/80 backdrop-blur-md border border-[#163e26] text-white hover:border-[#00ffcc] transition-colors cursor-pointer"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-[#00ffcc]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#a098b0]" />
                                  )}
                                </button>
                              </div>

                              {/* Top Right: Featured Pin Toggle */}
                              <div className="absolute top-3 right-3 z-20">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePostFeatured(post)}
                                  title={post.isFeatured ? "Featured dispatch (click to unfeature)" : "Feature this dispatch"}
                                  className={`p-1.5 rounded-md backdrop-blur-md border transition-all cursor-pointer ${post.isFeatured
                                      ? "bg-amber-950/90 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(255,224,74,0.4)]"
                                      : "bg-[#04120a]/80 text-[#a098b0] border-[#163e26] hover:text-amber-300 hover:border-amber-500/40"
                                    }`}
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${post.isFeatured ? "fill-amber-300 text-amber-300" : ""
                                      }`}
                                  />
                                </button>
                              </div>

                              {/* Bottom Cover Gradient & Status Badges */}
                              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#04120a] via-[#04120a]/70 to-transparent flex items-center justify-between gap-2 z-10">
                                <span
                                  className={`text-[10px] font-label uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${status === "published"
                                      ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                                      : status === "scheduled"
                                        ? "bg-indigo-950/90 text-indigo-300 border-indigo-500/40"
                                        : status === "archived"
                                          ? "bg-zinc-900/90 text-zinc-400 border-zinc-700/40"
                                          : "bg-amber-950/90 text-amber-300 border-amber-500/40"
                                    }`}
                                >
                                  {status}
                                </span>

                                {post.categoryName && (
                                  <span className="text-[10px] font-label text-[#e8e0f0] bg-[#103420]/80 border border-[#163e26] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Tag className="w-2.5 h-2.5 text-[#00ffcc]" />
                                    <span>{post.categoryName}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-label text-[#a098b0]">
                                  <span>{post.readingTimeMinutes || 4} min read</span>
                                  <span>
                                    {post.publishedAt
                                      ? new Date(post.publishedAt).toLocaleDateString()
                                      : post.createdAt
                                        ? new Date(post.createdAt).toLocaleDateString()
                                        : "Draft"}
                                  </span>
                                </div>

                                <h4 className="font-headline font-bold text-base text-white group-hover:text-[#00ffcc] transition-colors line-clamp-2">
                                  <Link href={`/admin/dispatches/${post.id}`}>{post.title}</Link>
                                </h4>

                                <p className="text-xs text-[#a098b0] line-clamp-2 leading-relaxed">
                                  {post.excerpt || post.content || "No excerpt provided."}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-[#163e26] flex items-center justify-between text-[11px] font-mono text-[#a098b0]">
                                <span className="truncate max-w-[130px]">/{post.slug}</span>
                                <div className="flex items-center gap-1 text-[10px] text-[#00ffcc]">
                                  <Eye className="w-3 h-3" />
                                  <span>{post.views || 0}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card Action Menu Bar */}
                            <div className="px-4 py-2.5 bg-[#05170d] border-t border-[#163e26] flex items-center justify-between gap-1 text-xs">
                              <Link
                                href={`/admin/dispatches/${post.id}`}
                                className="px-2.5 py-1 rounded-lg bg-[#0e2417] hover:bg-[#00ffcc] text-[#00ffcc] hover:text-[#04120a] border border-[#00ffcc]/30 font-label uppercase text-[10px] tracking-wider transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </Link>

                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/blog/${post.slug}`}
                                  target="_blank"
                                  title="Preview on public site"
                                  className="p-1.5 rounded-lg bg-[#081e12] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-colors"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicatePost(post)}
                                  title="Duplicate as draft"
                                  className="p-1.5 rounded-lg bg-[#081e12] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePostArchive(post)}
                                  title={status === "archived" ? "Restore to Draft" : "Archive dispatch"}
                                  className="p-1.5 rounded-lg bg-[#081e12] hover:bg-[#103420] text-[#a098b0] hover:text-amber-300 border border-[#163e26] transition-colors cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePost(post)}
                                  title="Delete dispatch"
                                  className="p-1.5 rounded-lg bg-[#250d18] hover:bg-[#ff2d78] text-[#ff2d78] hover:text-white border border-[#ff2d78]/30 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                // Table View
                return (
                  <div className="bg-[#081e12] rounded-2xl border border-[#163e26] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#04120a] border-b border-[#163e26] text-[#a098b0] font-label uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="p-3.5 w-10">
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedPostIds.length === list.length) {
                                    setSelectedPostIds([]);
                                  } else {
                                    setSelectedPostIds(list.map((p) => p.id));
                                  }
                                }}
                                className="p-1 rounded text-white"
                              >
                                {selectedPostIds.length === list.length ? (
                                  <CheckSquare className="w-4 h-4 text-[#00ffcc]" />
                                ) : (
                                  <Square className="w-4 h-4 text-[#a098b0]" />
                                )}
                              </button>
                            </th>
                            <th className="p-3.5 w-20">Cover</th>
                            <th className="p-3.5">Title &amp; Slug</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Read Time</th>
                            <th className="p-3.5">Views</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#163e26]/60">
                          {list.map((post) => {
                            const isSelected = selectedPostIds.includes(post.id);
                            const status = (post.status || "draft").toLowerCase();

                            return (
                              <tr
                                key={post.id}
                                className={`hover:bg-[#0a2315] transition-colors ${isSelected ? "bg-[#103420]/50" : ""
                                  }`}
                              >
                                <td className="p-3.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedPostIds((prev) =>
                                        prev.includes(post.id)
                                          ? prev.filter((id) => id !== post.id)
                                          : [...prev, post.id]
                                      )
                                    }
                                    className="p-1 rounded cursor-pointer"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-[#00ffcc]" />
                                    ) : (
                                      <Square className="w-4 h-4 text-[#a098b0]" />
                                    )}
                                  </button>
                                </td>
                                <td className="p-3.5">
                                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-[#04120a] border border-[#163e26] shrink-0">
                                    <ImageWithFallback
                                      src={post.coverImage}
                                      alt={post.title}
                                      fallbackText="—"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePostFeatured(post)}
                                      className="cursor-pointer"
                                      title={post.isFeatured ? "Featured" : "Not featured"}
                                    >
                                      <Star
                                        className={`w-3.5 h-3.5 ${post.isFeatured
                                            ? "fill-amber-300 text-amber-300"
                                            : "text-[#a098b0]/40 hover:text-amber-300"
                                          }`}
                                      />
                                    </button>
                                    <div>
                                      <Link
                                        href={`/admin/dispatches/${post.id}`}
                                        className="font-headline font-bold text-white hover:text-[#00ffcc] transition-colors line-clamp-1"
                                      >
                                        {post.title}
                                      </Link>
                                      <span className="font-mono text-[10px] text-[#a098b0]">
                                        /{post.slug}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 text-[#a098b0]">
                                  {post.categoryName || "—"}
                                </td>
                                <td className="p-3.5">
                                  <span
                                    className={`text-[10px] font-label uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${status === "published"
                                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                                        : status === "scheduled"
                                          ? "bg-indigo-950 text-indigo-300 border-indigo-500/40"
                                          : status === "archived"
                                            ? "bg-zinc-900 text-zinc-400 border-zinc-700/40"
                                            : "bg-amber-950 text-amber-300 border-amber-500/40"
                                      }`}
                                  >
                                    {status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-[#a098b0]">
                                  {post.readingTimeMinutes || 4}m
                                </td>
                                <td className="p-3.5 font-mono text-[#00ffcc]">
                                  {post.views || 0}
                                </td>
                                <td className="p-3.5 text-[#a098b0] whitespace-nowrap text-[11px]">
                                  {post.publishedAt
                                    ? new Date(post.publishedAt).toLocaleDateString()
                                    : "Draft"}
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5">
                                    <Link
                                      href={`/admin/dispatches/${post.id}`}
                                      className="p-1.5 rounded-lg bg-[#0e2417] hover:bg-[#00ffcc] text-[#00ffcc] hover:text-[#04120a] border border-[#00ffcc]/30 transition-all"
                                      title="Edit dispatch"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Link>
                                    <Link
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                      className="p-1.5 rounded-lg bg-[#04120a] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-colors"
                                      title="Preview"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicatePost(post)}
                                      className="p-1.5 rounded-lg bg-[#04120a] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26] transition-colors cursor-pointer"
                                      title="Duplicate"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePost(post)}
                                      className="p-1.5 rounded-lg bg-[#250d18] hover:bg-[#ff2d78] text-[#ff2d78] hover:text-white border border-[#ff2d78]/30 transition-colors cursor-pointer"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── TAB 8: LIVE ORDERS & TRANSACTIONS ── */}
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#081e12] p-6 rounded-2xl border border-[#163e26]">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#ffe04a]" />
                    <span>Customer Orders &amp; Conservation Transactions</span>
                  </h3>
                  <p className="text-xs text-[#a098b0] mt-1">
                    Live orders generated via Stripe, eSewa, Khalti, and Wire transfer checkout flows.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDbData}
                  disabled={isLoadingDb}
                  className="px-4 py-2 rounded-lg bg-[#0e2417] hover:bg-[#163e26] text-[#00ffcc] text-xs font-label uppercase tracking-wider border border-[#00ffcc]/30 flex items-center gap-2 self-start sm:self-auto transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? "animate-spin" : ""}`} />
                  <span>Refresh Live Orders</span>
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#081e12] p-5 rounded-xl border border-[#163e26]">
                  <span className="text-xs font-label uppercase tracking-wider text-[#a098b0]">
                    Total Recorded Orders
                  </span>
                  <div className="font-headline font-extrabold text-3xl text-white mt-1">
                    {dbOrders.length}
                  </div>
                  <span className="text-[10px] font-label text-[#00ffcc] mt-1 block">
                    Stored in PostgreSQL database
                  </span>
                </div>
                <div className="bg-[#081e12] p-5 rounded-xl border border-[#163e26]">
                  <span className="text-xs font-label uppercase tracking-wider text-[#a098b0]">
                    Total Settled Volume
                  </span>
                  <div className="font-headline font-extrabold text-3xl text-[#00ffcc] mt-1">
                    $
                    {dbOrders
                      .reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0)
                      .toFixed(2)}
                  </div>
                  <span className="text-[10px] font-label text-[#a098b0] mt-1 block">
                    Across Multi-Currency gateways
                  </span>
                </div>
                <div className="bg-[#081e12] p-5 rounded-xl border border-[#163e26]">
                  <span className="text-xs font-label uppercase tracking-wider text-[#a098b0]">
                    Dedicated Conservation Fund
                  </span>
                  <div className="font-headline font-extrabold text-3xl text-[#ff2d78] mt-1">
                    $
                    {(
                      dbOrders.reduce(
                        (acc, curr) => acc + (parseFloat(curr.totalAmount) || 0),
                        0
                      ) * 0.1
                    ).toFixed(2)}
                  </div>
                  <span className="text-[10px] font-label text-white/70 mt-1 block">
                    10% Bardia Ranger Unit Deployment
                  </span>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#081e12] rounded-2xl border border-[#163e26] overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[#163e26] flex items-center justify-between">
                  <h4 className="font-headline font-bold text-sm text-white">Recent Transactions</h4>
                  <span className="text-[10px] font-label text-[#00ffcc] uppercase">
                    Real-time Database Query
                  </span>
                </div>

                {dbOrders.length === 0 ? (
                  <div className="p-12 text-center text-[#a098b0] text-xs">
                    No orders recorded yet. Make a simulated or live checkout on the site to see records populate here!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-body">
                      <thead className="bg-[#04120a] font-label text-[10px] uppercase tracking-wider text-[#a098b0] border-b border-[#163e26]">
                        <tr>
                          <th className="px-6 py-3.5">Order Ref</th>
                          <th className="px-6 py-3.5">Customer Email</th>
                          <th className="px-6 py-3.5">Amount</th>
                          <th className="px-6 py-3.5">Status</th>
                          <th className="px-6 py-3.5">Date &amp; Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#163e26]/60">
                        {dbOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-[#0c2819] transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-[#00ffcc]">
                              {ord.orderNumber}
                            </td>
                            <td className="px-6 py-4 text-white">{ord.customerEmail}</td>
                            <td className="px-6 py-4 font-bold text-[#ffe04a]">
                              {ord.currency === "USD" ? "$" : "रु "}
                              {parseFloat(ord.totalAmount).toLocaleString()} {ord.currency}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-label uppercase font-bold bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20">
                                {ord.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#a098b0]">
                              {new Date(ord.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: STORAGE BUCKETS & MEDIA ASSET PIPELINE ── */}
          {activeTab === "storage" && <StorageBucketManager />}

          {/* ── TAB: WATERMARK & COPYRIGHT PROTECTION ENGINE ── */}
          {activeTab === "watermark" && <WatermarkSettingsManager />}

          {/* ── TAB: PAYMENT GATEWAYS & SETTLEMENT PIPELINE ── */}
          {activeTab === "payments" && (
            <PaymentSettingsManager
              payments={formData.payments || defaultPaymentSettings}
              onChange={(updatedPayments) =>
                setFormData((prev) => ({ ...prev, payments: updatedPayments }))
              }
              onSave={handleSaveAll}
              isSaving={isSaving}
              saveMessage={saveMessage}
            />
          )}

          {/* ── TAB: WILDLIFE SPECIES HUB ── */}
          {activeTab === "species" && <SpeciesManager />}

          {/* ── TAB: BIOACOUSTICS FIELD AUDIO LIBRARY ── */}
          {activeTab === "audio-library" && <AudioLibraryManager />}

          {/* ── TAB: SANCTUARIES & BIRDING HOTSPOTS ── */}
          {activeTab === "hotspots" && <HotspotsManager />}
        </div>
      </main>
    </div>
  );
}
