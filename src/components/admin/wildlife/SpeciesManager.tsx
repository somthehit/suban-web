"use client";

import React, { useState, useEffect } from "react";
import {
  Feather,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  RefreshCw,
  Check,
  Flame,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  Camera,
  ExternalLink,
} from "lucide-react";

interface SpeciesData {
  id: string;
  slug: string;
  group: string;
  commonName: string;
  nepaliName?: string | null;
  scientificName: string;
  family?: string | null;
  order?: string | null;
  iucnStatus?: string | null;
  nepalStatus?: string | null;
  residency?: string | null;
  endemic?: boolean;
  isBirdOfTheWeek?: boolean;
  isFeatured?: boolean;
  isSensitive?: boolean;
  elevationMin?: number | null;
  elevationMax?: number | null;
  habitats?: string[] | null;
  sizeCm?: number | null;
  wingspanCm?: number | null;
  weightG?: number | null;
  diet?: string | null;
  description?: string | null;
  bestMonths?: number[];
  audioCount?: number;
  mediaCount?: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function SpeciesManager() {
  const [speciesList, setSpeciesList] = useState<SpeciesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [iucnFilter, setIucnFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Partial<SpeciesData> | null>(null);
  const [activeTab, setActiveTab] = useState<"taxonomy" | "status" | "morphology" | "phenology" | "narrative">("taxonomy");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Dedicated Product / Plate Upload Modal for a Species
  const [productUploadSpecies, setProductUploadSpecies] = useState<SpeciesData | null>(null);
  const [newBirdProduct, setNewBirdProduct] = useState({
    title: "",
    slug: "",
    imageUrl: "",
    priceUSD: 149,
    priceNPR: 19900,
    camera: "Nikon Z9",
    lens: "NIKKOR Z 400mm f/2.8 TC VR S",
    locationName: "Langtang National Park, Nepal",
    description: "",
  });
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [uploadProductMessage, setUploadProductMessage] = useState("");

  const handleOpenUploadProduct = (sp: SpeciesData) => {
    setProductUploadSpecies(sp);
    setNewBirdProduct({
      title: `${sp.commonName} Fine Art Plate`,
      slug: `${sp.slug}-fine-art-plate-${Date.now().toString(36)}`,
      imageUrl: "",
      priceUSD: 149,
      priceNPR: 19900,
      camera: "Nikon Z9",
      lens: "NIKKOR Z 400mm f/2.8 TC VR S",
      locationName: "Himalayan Sanctuary, Nepal",
      description: `Original master photographic exhibition plate of the ${sp.commonName} (${sp.scientificName}), photographed in pristine alpine wilderness.`,
    });
    setUploadProductMessage("");
  };

  const handleSaveBirdProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUploadSpecies || !newBirdProduct.title.trim() || !newBirdProduct.imageUrl.trim()) {
      setUploadProductMessage("Please specify both an image URL and title.");
      return;
    }

    setIsUploadingProduct(true);
    setUploadProductMessage("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speciesId: productUploadSpecies.id,
          species: productUploadSpecies.commonName,
          scientificName: productUploadSpecies.scientificName,
          title: newBirdProduct.title,
          slug: newBirdProduct.slug,
          imageUrl: newBirdProduct.imageUrl,
          priceUSD: Number(newBirdProduct.priceUSD) || 149,
          priceNPR: Number(newBirdProduct.priceNPR) || 19900,
          camera: newBirdProduct.camera,
          lens: newBirdProduct.lens,
          locationName: newBirdProduct.locationName,
          description: newBirdProduct.description,
          status: "published",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUploadProductMessage("✅ Fine Art Product uploaded & linked to bird monograph!");
        loadSpecies();
        setTimeout(() => {
          setProductUploadSpecies(null);
        }, 1200);
      } else {
        setUploadProductMessage(`❌ Error: ${data.error || "Failed to create product"}`);
      }
    } catch (err) {
      setUploadProductMessage("❌ Network error saving bird product");
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const loadSpecies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/species?group=all");
      const data = await res.json();
      if (data.success && Array.isArray(data.species)) {
        setSpeciesList(data.species);
      }
    } catch (err) {
      console.error("Failed to load species:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  const handleOpenCreate = () => {
    setEditingSpecies({
      group: "bird",
      commonName: "",
      nepaliName: "",
      scientificName: "",
      family: "",
      order: "",
      iucnStatus: "LC",
      nepalStatus: "Common",
      residency: "resident",
      endemic: false,
      isFeatured: false,
      isBirdOfTheWeek: false,
      isSensitive: false,
      elevationMin: 100,
      elevationMax: 3000,
      habitats: ["Subalpine Oak-Rhododendron"],
      description: "",
      bestMonths: [3, 4, 5, 10, 11],
    });
    setActiveTab("taxonomy");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sp: SpeciesData) => {
    setEditingSpecies({ ...sp });
    setActiveTab("taxonomy");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingSpecies?.commonName || !editingSpecies?.scientificName) {
      alert("Common name and Scientific name are required.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    try {
      const method = editingSpecies.id ? "PATCH" : "POST";
      const res = await fetch("/api/species", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSpecies),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("Saved successfully!");
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveMessage("");
          loadSpecies();
        }, 800);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/species?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadSpecies();
      }
    } catch (err) {
      alert("Failed to delete species");
    }
  };

  const toggleMonth = (mNum: number) => {
    if (!editingSpecies) return;
    const current = editingSpecies.bestMonths || [];
    const updated = current.includes(mNum)
      ? current.filter((m) => m !== mNum)
      : [...current, mNum].sort((a, b) => a - b);
    setEditingSpecies({ ...editingSpecies, bestMonths: updated });
  };

  const filteredSpecies = speciesList.filter((sp) => {
    if (iucnFilter !== "all" && sp.iucnStatus !== iucnFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        sp.commonName.toLowerCase().includes(q) ||
        sp.scientificName.toLowerCase().includes(q) ||
        sp.nepaliName?.toLowerCase().includes(q) ||
        sp.family?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search common, nepali or scientific name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
            />
          </div>

          <select
            value={iucnFilter}
            onChange={(e) => setIucnFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
          >
            <option value="all">All IUCN</option>
            <option value="CR">CR (Critically End.)</option>
            <option value="EN">EN (Endangered)</option>
            <option value="VU">VU (Vulnerable)</option>
            <option value="NT">NT (Near Threat.)</option>
            <option value="LC">LC (Least Concern)</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title="Toggle View Mode"
          >
            {viewMode === "grid" ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          <button
            onClick={loadSpecies}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00ffcc] to-[#38ef7d] text-slate-950 shadow-[0_0_16px_rgba(0,255,204,0.3)] hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Species</span>
          </button>
        </div>
      </div>

      {/* Grid or Table Mode */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">Loading species database...</div>
      ) : filteredSpecies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <Feather className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">No species found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpecies.map((sp) => (
            <div
              key={sp.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-emerald-500/50 dark:hover:border-[#00ffcc]/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-[#00ffcc]/30">
                      {sp.iucnStatus || "LC"}
                    </span>
                    {sp.endemic && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-transparent">
                        Endemic
                      </span>
                    )}
                    {sp.isBirdOfTheWeek && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-transparent flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Spotlight</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 cursor-pointer transition-colors"
                      title="Edit species"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sp.id, sp.commonName)}
                      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Delete species"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{sp.commonName}</h4>
                  {sp.nepaliName && (
                    <span className="text-sm font-semibold text-emerald-700 dark:text-[#00ffcc] font-serif">{sp.nepaliName}</span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 italic font-serif mb-3">{sp.scientificName}</div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                  {sp.description || "No narrative summary provided."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>{sp.residency || "Resident"}</span>
                <button
                  type="button"
                  onClick={() => handleOpenUploadProduct(sp)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-[#00ffcc]/30 dark:hover:bg-[#00ffcc]/25 transition-all flex items-center gap-1 cursor-pointer"
                  title="Upload Fine Art Photographic Product for this species"
                >
                  <Camera className="w-3 h-3" />
                  <span>Upload Product</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-black/40 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="p-3.5">Common Name</th>
                <th className="p-3.5">Scientific Name</th>
                <th className="p-3.5">Nepali Name</th>
                <th className="p-3.5">IUCN</th>
                <th className="p-3.5">Residency</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {filteredSpecies.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">{sp.commonName}</td>
                  <td className="p-3.5 italic font-serif">{sp.scientificName}</td>
                  <td className="p-3.5 text-emerald-700 dark:text-[#00ffcc] font-serif">{sp.nepaliName || "—"}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-transparent">
                      {sp.iucnStatus || "LC"}
                    </span>
                  </td>
                  <td className="p-3.5 capitalize">{sp.residency || "Resident"}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenUploadProduct(sp)}
                      className="px-2 py-1 rounded text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:text-[#00ffcc] dark:bg-[#00ffcc]/10 dark:hover:bg-[#00ffcc]/20 dark:border-[#00ffcc]/30 text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Upload Product"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Product</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(sp)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(sp.id, sp.commonName)}
                      className="p-1 rounded text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && editingSpecies && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#00ffcc]/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-[#00ffcc]/10 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc] shadow-sm">
                  <Feather className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingSpecies.id ? `Edit: ${editingSpecies.commonName}` : "Create New Species Monograph"}
                    </h3>
                    {editingSpecies.iucnStatus && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-[#00ffcc]/30">
                        {editingSpecies.iucnStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono italic">
                    {editingSpecies.scientificName ? `[${editingSpecies.scientificName}]` : "Complete Avian Natural History Profile"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/30 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 py-2.5 border-b border-slate-200/80 dark:border-white/10 flex gap-2 text-xs font-mono overflow-x-auto bg-slate-50/30 dark:bg-black/20">
              {[
                { id: "taxonomy", num: "1", label: "Taxonomy" },
                { id: "status", num: "2", label: "Status & Residency" },
                { id: "morphology", num: "3", label: "Morphology" },
                { id: "phenology", num: "4", label: "Phenology (Months)" },
                { id: "narrative", num: "5", label: "Narrative" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs ${
                    activeTab === t.id
                      ? "bg-white dark:bg-[#00ffcc]/15 text-emerald-800 dark:text-[#00ffcc] shadow-sm border border-slate-200/90 dark:border-[#00ffcc]/40 font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-mono font-bold ${
                    activeTab === t.id
                      ? "bg-emerald-100 text-emerald-800 dark:bg-[#00ffcc]/30 dark:text-[#00ffcc]"
                      : "bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}>
                    {t.num}
                  </span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeTab === "taxonomy" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Common English Name <span className="text-emerald-600 dark:text-[#00ffcc]">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingSpecies.commonName || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, commonName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs"
                      placeholder="e.g. Himalayan Monal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Scientific Binomial Name <span className="text-emerald-600 dark:text-[#00ffcc]">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingSpecies.scientificName || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, scientificName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 italic font-serif focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs"
                      placeholder="e.g. Lophophorus impejanus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Nepali Name (Devanagari)
                    </label>
                    <input
                      type="text"
                      value={editingSpecies.nepaliName || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, nepaliName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-serif focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs"
                      placeholder="उदा. डाँफे"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Family
                    </label>
                    <input
                      type="text"
                      value={editingSpecies.family || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, family: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs"
                      placeholder="e.g. Phasianidae"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Order
                    </label>
                    <input
                      type="text"
                      value={editingSpecies.order || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, order: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs"
                      placeholder="e.g. Galliformes"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
                      Group
                    </label>
                    <select
                      value={editingSpecies.group || "bird"}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, group: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-50 focus:bg-white dark:bg-black/40 dark:hover:bg-black/50 dark:focus:bg-black/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:focus:border-[#00ffcc] dark:focus:ring-[#00ffcc]/10 shadow-sm transition-all text-xs cursor-pointer"
                    >
                      <option value="bird">Bird (Avian)</option>
                      <option value="mammal">Mammal</option>
                      <option value="reptile">Reptile</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "status" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Global IUCN Status</label>
                    <select
                      value={editingSpecies.iucnStatus || "LC"}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, iucnStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
                    >
                      <option value="CR">Critically Endangered (CR)</option>
                      <option value="EN">Endangered (EN)</option>
                      <option value="VU">Vulnerable (VU)</option>
                      <option value="NT">Near Threatened (NT)</option>
                      <option value="LC">Least Concern (LC)</option>
                      <option value="DD">Data Deficient (DD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Nepal Status</label>
                    <input
                      type="text"
                      value={editingSpecies.nepalStatus || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, nepalStatus: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. Nationally Protected / Vulnerable"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Residency / Migration</label>
                    <select
                      value={editingSpecies.residency || "resident"}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, residency: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
                    >
                      <option value="resident">Resident Breeder</option>
                      <option value="summer">Summer Visitor</option>
                      <option value="winter">Winter Visitor</option>
                      <option value="passage">Passage Migrant</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 font-sans">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingSpecies.endemic || false}
                        onChange={(e) => setEditingSpecies({ ...editingSpecies, endemic: e.target.checked })}
                        className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/40 text-emerald-600 dark:text-[#00ffcc] focus:ring-emerald-500"
                      />
                      <span>Nepal Endemic (Only occurs in Nepal)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={editingSpecies.isBirdOfTheWeek || false}
                        onChange={(e) =>
                          setEditingSpecies({ ...editingSpecies, isBirdOfTheWeek: e.target.checked })
                        }
                        className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-black/40 text-emerald-600 dark:text-[#00ffcc] focus:ring-emerald-500"
                      />
                      <span>Feature in Bird of the Week Spotlight</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "morphology" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Length (cm)</label>
                    <input
                      type="number"
                      value={editingSpecies.sizeCm || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, sizeCm: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. 70"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Wingspan (cm)</label>
                    <input
                      type="number"
                      value={editingSpecies.wingspanCm || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, wingspanCm: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. 80"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Weight (g)</label>
                    <input
                      type="number"
                      value={editingSpecies.weightG || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, weightG: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. 2100"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Elevation Min (m)</label>
                    <input
                      type="number"
                      value={editingSpecies.elevationMin || ""}
                      onChange={(e) =>
                        setEditingSpecies({ ...editingSpecies, elevationMin: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. 2600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Elevation Max (m)</label>
                    <input
                      type="number"
                      value={editingSpecies.elevationMax || ""}
                      onChange={(e) =>
                        setEditingSpecies({ ...editingSpecies, elevationMax: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. 4500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Diet</label>
                    <input
                      type="text"
                      value={editingSpecies.diet || ""}
                      onChange={(e) => setEditingSpecies({ ...editingSpecies, diet: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="Roots, tubers, berries"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Primary Habitats (comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(editingSpecies.habitats) ? editingSpecies.habitats.join(", ") : ""}
                      onChange={(e) =>
                        setEditingSpecies({
                          ...editingSpecies,
                          habitats: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                      placeholder="e.g. Subalpine Oak-Rhododendron, Alpine Meadows"
                    />
                  </div>
                </div>
              )}

              {activeTab === "phenology" && (
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3 font-sans">
                    Select the peak observation and vocal activity months for this species in Nepal:
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {MONTHS.map((m, idx) => {
                      const mNum = idx + 1;
                      const selected = (editingSpecies.bestMonths || []).includes(mNum);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMonth(mNum)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selected
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:bg-[#00ffcc]/20 dark:border-[#00ffcc] dark:text-[#00ffcc] font-bold"
                              : "bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "narrative" && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Monograph Narrative & Field Identification Notes</label>
                  <textarea
                    rows={6}
                    value={editingSpecies.description || ""}
                    onChange={(e) => setEditingSpecies({ ...editingSpecies, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                    placeholder="Enter comprehensive natural history, behavior, plumage characteristics, and field context..."
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 sm:p-6 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
              <span className="text-xs font-mono text-emerald-700 dark:text-[#00ffcc] font-medium">{saveMessage}</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="group px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:!text-red-600 hover:!bg-red-50 hover:!border-red-300 dark:hover:!text-red-400 dark:hover:!bg-red-950/40 dark:hover:!border-red-800 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-red-500/10 active:scale-95 flex items-center gap-1.5 font-sans"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-[#00ffcc] to-[#38ef7d] text-slate-950 hover:opacity-95 hover:shadow-[0_0_20px_rgba(0,255,204,0.35)] active:scale-95 disabled:opacity-50 font-sans cursor-pointer shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Monograph"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Dedicated Upload Bird Product Modal */}
      {productUploadSpecies && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/60 dark:bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-600 dark:text-[#00ffcc] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Photographic Product for {productUploadSpecies.commonName}
                  </h3>
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-[#00ffcc]">
                    [{productUploadSpecies.scientificName}] • Attaches to /birds/{productUploadSpecies.slug} & /gallery
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductUploadSpecies(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBirdProduct} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              {uploadProductMessage && (
                <div
                  className={`p-3 rounded-xl ${
                    uploadProductMessage.startsWith("✅")
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                      : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30"
                  }`}
                >
                  {uploadProductMessage}
                </div>
              )}

              {/* Master Image URL */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  High-Resolution Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or cloud storage URL"
                  value={newBirdProduct.imageUrl}
                  onChange={(e) =>
                    setNewBirdProduct({ ...newBirdProduct, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  Watermark overlay protection will be automatically rendered on public exhibition plates.
                </p>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Artwork / Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBirdProduct.title}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                    Store Slug (URL Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBirdProduct.slug}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">Price (USD $)</label>
                  <input
                    type="number"
                    value={newBirdProduct.priceUSD}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, priceUSD: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">Price (NPR रु)</label>
                  <input
                    type="number"
                    value={newBirdProduct.priceNPR}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, priceNPR: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
              </div>

              {/* Camera & Lens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">Camera Body</label>
                  <input
                    type="text"
                    value={newBirdProduct.camera}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, camera: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">Telephoto Lens</label>
                  <input
                    type="text"
                    value={newBirdProduct.lens}
                    onChange={(e) =>
                      setNewBirdProduct({ ...newBirdProduct, lens: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1 font-sans">
                  Field Dispatch / Print Description
                </label>
                <textarea
                  rows={2}
                  value={newBirdProduct.description}
                  onChange={(e) =>
                    setNewBirdProduct({ ...newBirdProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] font-sans"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductUploadSpecies(null)}
                  className="group px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-800/60 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5 font-sans"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isUploadingProduct}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-[#00ffcc] to-[#38ef7d] text-slate-950 hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-lg font-sans"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isUploadingProduct ? "Publishing..." : "Publish Product & Link Plate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
