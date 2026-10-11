"use client";

import React, { useState, useEffect } from "react";
import { Compass, Plus, MapPin, RefreshCw, X, Save, Search } from "lucide-react";

export function HotspotsManager() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("Central Himalayas");
  const [district, setDistrict] = useState("");
  const [elevationMinM, setElevationMinM] = useState<number | "">("");
  const [elevationMaxM, setElevationMaxM] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const loadHotspots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotspots");
      const data = await res.json();
      if (data.success) setHotspots(data.hotspots);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHotspots();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/hotspots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          region,
          district,
          elevationMinM: elevationMinM ? Number(elevationMinM) : null,
          elevationMaxM: elevationMaxM ? Number(elevationMaxM) : null,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName("");
        setDescription("");
        loadHotspots();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredHotspots = hotspots.filter((h) => {
    if (regionFilter !== "all" && h.region !== regionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name?.toLowerCase().includes(q);
      const matchDistrict = h.district?.toLowerCase().includes(q);
      const matchRegion = h.region?.toLowerCase().includes(q);
      const matchDesc = h.description?.toLowerCase().includes(q);
      return Boolean(matchName || matchDistrict || matchRegion || matchDesc);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#00ffcc]/10 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Birding Sanctuaries & Hotspots</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-700 dark:text-[#00ffcc] border border-emerald-200 dark:border-[#00ffcc]/30">
                {filteredHotspots.length} {filteredHotspots.length === 1 ? "sanctuary" : "sanctuaries"}
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">National parks, reserves, and field localities</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadHotspots}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh sanctuaries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00ffcc] to-[#38ef7d] text-slate-950 shadow-[0_0_16px_rgba(0,255,204,0.3)] hover:opacity-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sanctuary</span>
          </button>
        </div>
      </div>

      {/* Search & Region Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sanctuary by name, district, elevation, or description..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region Filter */}
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
        >
          <option value="all">All Regions</option>
          <option value="Central Himalayas">Central Himalayas</option>
          <option value="Eastern Himalayas">Eastern Himalayas</option>
          <option value="Western Himalayas">Western Himalayas</option>
          <option value="Terai Lowlands">Terai Lowlands</option>
          <option value="Kathmandu Valley">Kathmandu Valley</option>
          <option value="Pokhara Valley">Pokhara Valley</option>
          <option value="Trans-Himalaya">Trans-Himalaya</option>
        </select>

        {(searchQuery || regionFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setRegionFilter("all");
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5 justify-center font-sans"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Loading sanctuaries...</div>
      ) : hotspots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <MapPin className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">No birding sanctuaries added yet</p>
        </div>
      ) : filteredHotspots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm">
          <Search className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No sanctuaries match your search</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the region filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setRegionFilter("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-700 dark:text-[#00ffcc] border border-emerald-200 dark:border-[#00ffcc]/30 hover:bg-emerald-100 dark:hover:bg-[#00ffcc]/25 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHotspots.map((h) => (
            <div
              key={h.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-[#00ffcc]/15 dark:text-[#00ffcc] dark:border-transparent">
                    {h.region}
                  </span>
                  {h.district && <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{h.district}</span>}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{h.name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {h.description || "Prime birdwatching hotspot."}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 text-[11px] font-mono text-emerald-700 dark:text-[#00ffcc]">
                {h.elevationMinM && h.elevationMaxM ? `${h.elevationMinM}m - ${h.elevationMaxM}m` : "Nepal"}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#00ffcc]/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                <span>Add Sanctuary / Hotspot</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Sanctuary / Park Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chitwan National Park"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Terai Lowlands"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chitwan"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Elevation Min (m)</label>
                  <input
                    type="number"
                    value={elevationMinM}
                    onChange={(e) => setElevationMinM(e.target.value ? Number(e.target.value) : "")}
                    placeholder="100"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Elevation Max (m)</label>
                  <input
                    type="number"
                    value={elevationMaxM}
                    onChange={(e) => setElevationMaxM(e.target.value ? Number(e.target.value) : "")}
                    placeholder="815"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key birding trails, seasonality, and notable species..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="group px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-800/60 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5 font-sans"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#00ffcc] text-slate-950 font-bold hover:opacity-90 disabled:opacity-50 font-sans cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Sanctuary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
