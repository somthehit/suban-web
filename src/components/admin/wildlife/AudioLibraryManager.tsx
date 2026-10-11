"use client";

import React, { useState, useEffect } from "react";
import {
  Volume2,
  Plus,
  Upload,
  Trash2,
  RefreshCw,
  Search,
  Music,
  Check,
  X,
  Play,
  Pause,
} from "lucide-react";
import { AudioPlayer } from "@/components/ui/AudioPlayer";

export function AudioLibraryManager() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [speciesList, setSpeciesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [selectedSpeciesId, setSelectedSpeciesId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("song");
  const [locationLabel, setLocationLabel] = useState("");
  const [quality, setQuality] = useState("A");
  const [soundDescription, setSoundDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recRes, spRes] = await Promise.all([
        fetch("/api/audio/recordings"),
        fetch("/api/species?group=all"),
      ]);
      const recData = await recRes.json();
      const spData = await spRes.json();
      if (recData.success) setRecordings(recData.recordings);
      if (spData.success) setSpeciesList(spData.species);
    } catch (err) {
      console.error("Failed to load recordings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpeciesId) {
      alert("Please select a target species");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("speciesId", selectedSpeciesId);
      formData.append("title", title || "Field Recording");
      formData.append("type", type);
      formData.append("locationLabel", locationLabel);
      formData.append("quality", quality);
      formData.append("soundDescription", soundDescription);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/audio/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        setTitle("");
        setFile(null);
        loadData();
      } else {
        alert("Upload error: " + data.error);
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [speciesSearch, setSpeciesSearch] = useState("");

  const filteredRecordings = recordings.filter((track) => {
    if (typeFilter !== "all" && track.type !== typeFilter) return false;
    if (qualityFilter !== "all" && track.quality !== qualityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = track.title?.toLowerCase().includes(q);
      const matchCommon = track.speciesCommon?.toLowerCase().includes(q);
      const matchScientific = track.speciesScientific?.toLowerCase().includes(q);
      const matchLocation = track.locationLabel?.toLowerCase().includes(q);
      const matchDesc = track.soundDescription?.toLowerCase().includes(q);
      return Boolean(matchTitle || matchCommon || matchScientific || matchLocation || matchDesc);
    }
    return true;
  });

  const filteredSpeciesOptions = speciesList.filter((s) => {
    if (!speciesSearch.trim()) return true;
    const q = speciesSearch.toLowerCase();
    return Boolean(
      s.commonName?.toLowerCase().includes(q) ||
      s.scientificName?.toLowerCase().includes(q) ||
      s.nepaliName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-[#00ffcc]/10 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc]">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Bioacoustic Audio Library</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-700 dark:text-[#00ffcc] border border-emerald-200 dark:border-[#00ffcc]/30">
                {filteredRecordings.length} {filteredRecordings.length === 1 ? "track" : "tracks"}
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Manage field recordings, waveforms, and call types</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh recordings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSpeciesSearch("");
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00ffcc] to-[#38ef7d] text-slate-950 shadow-[0_0_16px_rgba(0,255,204,0.3)] hover:opacity-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio Track</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings by species, title, location, or sound type..."
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

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
        >
          <option value="all">All Call Types</option>
          <option value="song">Song</option>
          <option value="call">Call</option>
          <option value="alarm_call">Alarm Call</option>
          <option value="flight_call">Flight Call</option>
          <option value="dawn_chorus">Dawn Chorus</option>
        </select>

        {/* Quality Filter */}
        <select
          value={qualityFilter}
          onChange={(e) => setQualityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
        >
          <option value="all">All Grades</option>
          <option value="A">Grade A (Master)</option>
          <option value="B">Grade B (Clean)</option>
          <option value="C">Grade C (Minor Noise)</option>
        </select>

        {(searchQuery || typeFilter !== "all" || qualityFilter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setQualityFilter("all");
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer flex items-center gap-1.5 justify-center font-sans"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Tracks Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-mono">Loading audio recordings...</div>
      ) : recordings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm">
          <Music className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-slate-400">No field soundscapes uploaded yet</p>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm">
          <Search className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No recordings match your search</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the call type and grade filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("all");
              setQualityFilter("all");
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-700 dark:text-[#00ffcc] border border-emerald-200 dark:border-[#00ffcc]/30 hover:bg-emerald-100 dark:hover:bg-[#00ffcc]/25 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecordings.map((track) => (
            <div
              key={track.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-emerald-800 dark:text-[#00ffcc] font-mono">
                  {track.speciesCommon}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic">
                  [{track.speciesScientific}]
                </span>
              </div>

              <AudioPlayer track={track} className="bg-slate-50/70 dark:bg-gradient-to-b dark:from-[#0a2315]/90 dark:to-[#04120a]/95" />
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#06180e] border border-slate-200 dark:border-[#00ffcc]/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                <span>Upload Field Recording</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs font-mono">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 dark:text-slate-300 font-medium font-sans">Target Species *</label>
                  {speciesSearch && (
                    <span className="text-[10px] text-emerald-600 dark:text-[#00ffcc] font-mono">
                      {filteredSpeciesOptions.length} matching
                    </span>
                  )}
                </div>

                {/* Quick Species Search Filter */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={speciesSearch}
                    onChange={(e) => setSpeciesSearch(e.target.value)}
                    placeholder="Search species (e.g. Monal, Spiny Babbler, Eagle)..."
                    className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                  />
                  {speciesSearch && (
                    <button
                      type="button"
                      onClick={() => setSpeciesSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                      title="Clear species filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedSpeciesId}
                  onChange={(e) => setSelectedSpeciesId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
                >
                  <option value="">
                    {filteredSpeciesOptions.length === 0 ? "No species match filter..." : "Select a species..."}
                  </option>
                  {filteredSpeciesOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.commonName} ({s.scientificName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Track Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dawn Territorial Song & Whistle"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
                  >
                    <option value="song">Song</option>
                    <option value="call">Call</option>
                    <option value="alarm_call">Alarm Call</option>
                    <option value="flight_call">Flight Call</option>
                    <option value="dawn_chorus">Dawn Chorus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Acoustic Grade</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] cursor-pointer"
                  >
                    <option value="A">Grade A (Studio Master)</option>
                    <option value="B">Grade B (Clean Field)</option>
                    <option value="C">Grade C (Minor Noise)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Location Label</label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. Langtang National Park, Upper Kyanjin"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-sans focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium font-sans">Audio File (.mp3, .wav, .flac, .ogg)</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-sans file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-[#00ffcc]/20 dark:file:text-[#00ffcc]"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="group px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 hover:border-red-300 dark:hover:text-red-400 dark:hover:bg-red-950/30 dark:hover:border-red-800/60 font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5 font-sans"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-[#00ffcc] text-slate-950 font-bold hover:opacity-90 disabled:opacity-50 font-sans cursor-pointer"
                >
                  {uploading ? "Uploading..." : "Save Recording"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
