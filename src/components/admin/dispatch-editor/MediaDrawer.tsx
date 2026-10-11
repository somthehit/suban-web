"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Layers,
} from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface MediaItem {
  id: string;
  url: string;
  title?: string;
  altText?: string;
}

interface MediaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (url: string, alt?: string) => void;
  onInsertGallery?: (items: { url: string; alt?: string }[]) => void;
  onSetAsCover: (url: string) => void;
}

export default function MediaDrawer({
  isOpen,
  onClose,
  onInsertImage,
  onInsertGallery,
  onSetAsCover,
}: MediaDrawerProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Alt text modal state for single insert
  const [altModalItem, setAltModalItem] = useState<MediaItem | null>(null);
  const [altTextInput, setAltTextInput] = useState("");

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/upload?bucket=gallery");
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setMediaList(
          data.files.map((f: any, idx: number) => ({
            id: f.name || `file-${idx}`,
            url: f.url,
            title: f.name,
            altText: f.name?.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "") || "Field photograph",
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to load drawer media list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "gallery");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const cleanName = file.name.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "");
        const newItem: MediaItem = {
          id: data.filename || `new-${Date.now()}`,
          url: data.url,
          title: file.name,
          altText: cleanName,
        };
        setMediaList((prev) => [newItem, ...prev]);
        // Prompt for alt text on upload
        setAltModalItem(newItem);
        setAltTextInput(cleanName);
      }
    } catch (err) {
      console.error("Drawer upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInsertGallery = () => {
    const selectedItems = mediaList
      .filter((m) => selectedIds.includes(m.id))
      .map((m) => ({ url: m.url, alt: m.altText || m.title || "Field photograph" }));

    if (onInsertGallery && selectedItems.length > 0) {
      onInsertGallery(selectedItems);
      setSelectedIds([]);
      onClose();
    }
  };

  const openInsertSingle = (item: MediaItem) => {
    setAltModalItem(item);
    setAltTextInput(item.altText || item.title?.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "") || "");
  };

  const confirmInsertSingle = () => {
    if (!altModalItem) return;
    const finalAlt = altTextInput.trim() || altModalItem.title || "Field photograph";
    onInsertImage(altModalItem.url, finalAlt);
    setAltModalItem(null);
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) =>
    (m.title || m.url).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-[#06180e] border-r border-[#163e26] shadow-2xl flex flex-col font-body text-[#e8e0f0] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="h-16 px-5 border-b border-[#163e26] flex items-center justify-between shrink-0 bg-[#081e12]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#00ffcc]" />
            <h3 className="font-headline font-bold text-sm text-white">Media Vault</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#103420] text-[#00ffcc]">
              {mediaList.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadMedia}
              disabled={loading}
              className="p-1.5 rounded-lg text-[#a098b0] hover:text-[#00ffcc] hover:bg-[#103420]"
              title="Refresh Vault"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#a098b0] hover:text-white hover:bg-[#103420]"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Upload Zone & Search */}
        <div className="p-4 border-b border-[#163e26] space-y-3 bg-[#081e12]/50">
          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#163e26] hover:border-[#00ffcc]/60 bg-[#04120a] hover:bg-[#103420]/30 transition-all cursor-pointer text-xs font-label uppercase tracking-wider text-[#00ffcc] font-bold">
            {uploading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#00ffcc]" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{uploading ? "Uploading Asset..." : "Upload New Photo"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#a098b0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search photographs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#a098b0] pt-1">
            <span>Tip: Drag photos onto canvas directly</span>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-rose-400 hover:underline"
              >
                Clear ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && mediaList.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-[#a098b0] flex flex-col items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#00ffcc]" />
              <span>Scanning gallery vault...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#a098b0]">
              No photos found in gallery.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", item.url);
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({
                          src: item.url,
                          alt: item.altText || item.title || "Field photograph",
                        })
                      );
                    }}
                    className={`group relative rounded-xl overflow-hidden border transition-all aspect-square cursor-grab active:cursor-grabbing ${
                      isSelected
                        ? "border-[#00ffcc] ring-2 ring-[#00ffcc]/30 bg-[#082816]"
                        : "border-[#163e26] bg-[#04120a] hover:border-[#00ffcc]/60"
                    }`}
                  >
                    <ImageWithFallback
                      src={item.url}
                      alt={item.title || "Media Item"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Checkbox badge */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(item.id);
                      }}
                      className="absolute top-2 left-2 z-10 p-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 text-white hover:text-[#00ffcc] transition-colors"
                      title={isSelected ? "Deselect" : "Select for batch gallery"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#00ffcc]" />
                      ) : (
                        <Square className="w-4 h-4 text-white/70" />
                      )}
                    </button>

                    {/* Hover overlay with action buttons */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between backdrop-blur-xs">
                      <span className="text-[10px] text-white font-mono truncate pl-7">
                        {item.title}
                      </span>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => openInsertSingle(item)}
                          className="w-full py-1 rounded bg-[#00ffcc] text-[#04120a] text-[10px] font-label uppercase font-bold hover:bg-[#c0fff4] flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetAsCover(item.url)}
                          className="w-full py-1 rounded bg-[#103420] text-[#00ffcc] text-[10px] font-label uppercase font-bold hover:bg-[#163e26] border border-[#00ffcc]/30"
                        >
                          Set Cover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Multi-selection Sticky Footer */}
        {selectedIds.length > 0 && (
          <div className="p-4 border-t border-[#163e26] bg-[#081e12] space-y-2 animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[#00ffcc]">
                {selectedIds.length} photo{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-[#a098b0] hover:text-white"
              >
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={handleInsertGallery}
              className="w-full py-2.5 rounded-xl bg-[#00ffcc] text-[#04120a] font-label text-xs uppercase tracking-wider font-bold hover:bg-[#c0fff4] flex items-center justify-center gap-2 shadow-lg"
            >
              <Layers className="w-4 h-4" />
              <span>Insert as Gallery ({selectedIds.length})</span>
            </button>
          </div>
        )}
      </aside>

      {/* Required Alt-Text Dialog for Single Photo Insertion */}
      {altModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#081e12] border border-[#163e26] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-headline font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#00ffcc]" />
                <span>Accessibility &amp; Alt Text</span>
              </h4>
              <button
                type="button"
                onClick={() => setAltModalItem(null)}
                className="p-1 rounded text-[#a098b0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-black/40 border border-[#163e26]">
              <ImageWithFallback
                src={altModalItem.url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-label uppercase text-[#a098b0] block font-semibold">
                Alternative Description (Required for Screen Readers &amp; SEO)
              </label>
              <textarea
                rows={2}
                value={altTextInput}
                placeholder="Describe the wildlife subject, lighting, and habitat action..."
                onChange={(e) => setAltTextInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc]"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAltModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-label uppercase text-[#a098b0] hover:text-white hover:bg-[#103420]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmInsertSingle}
                className="px-4 py-2 rounded-xl text-xs font-label uppercase font-bold bg-[#00ffcc] text-[#04120a] hover:bg-[#c0fff4]"
              >
                Insert Photograph
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
