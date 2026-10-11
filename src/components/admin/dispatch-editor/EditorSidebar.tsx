"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Folder,
  Calendar,
  Clock,
  MapPin,
  Star,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  Hash,
  Eye,
  Globe,
  Lock,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EditorSidebarProps {
  postId?: string | null;
  title: string;
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  scheduledAt: string | null;
  categoryId: string | null;
  categories: Category[];
  tags: string[];
  readingTimeMinutes: number;
  wordCount: number;
  isFeatured: boolean;
  locationLabel: string;
  locationPrecision: string;
  onChangeSlug: (slug: string) => void;
  onChangeStatus: (status: "draft" | "published" | "scheduled" | "archived") => void;
  onChangeScheduledAt: (dateStr: string | null) => void;
  onChangeCategory: (categoryId: string | null) => void;
  onChangeTags: (tags: string[]) => void;
  onChangeReadingTime: (minutes: number) => void;
  onChangeFeatured: (isFeatured: boolean) => void;
  onChangeLocation: (label: string, precision: string) => void;
}

export default function EditorSidebar({
  postId,
  title,
  slug,
  status,
  scheduledAt,
  categoryId,
  categories,
  tags = [],
  readingTimeMinutes,
  wordCount,
  isFeatured,
  locationLabel,
  locationPrecision,
  onChangeSlug,
  onChangeStatus,
  onChangeScheduledAt,
  onChangeCategory,
  onChangeTags,
  onChangeReadingTime,
  onChangeFeatured,
  onChangeLocation,
}: EditorSidebarProps) {
  const [tagInput, setTagInput] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"available" | "taken" | "idle">("idle");

  // Slug availability check
  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck.trim()) {
      setSlugStatus("idle");
      return;
    }
    setSlugChecking(true);
    try {
      const url = `/api/posts?action=check-slug&slug=${encodeURIComponent(
        slugToCheck
      )}${postId ? `&excludeId=${postId}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSlugStatus(data.available ? "available" : "taken");
      }
    } catch {
      setSlugStatus("idle");
    } finally {
      setSlugChecking(false);
    }
  };

  const handleSlugBlur = () => {
    checkSlugAvailability(slug);
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      onChangeTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChangeTags(tags.filter((t) => t !== tagToRemove));
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6 text-[#e8e0f0]">
      {/* 1. Publishing Status & Schedule */}
      <div className="p-5 rounded-2xl bg-[#081e12] border border-[#163e26] space-y-4 shadow-sm">
        <h4 className="text-xs font-label uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-[#163e26] pb-3">
          <Calendar className="w-3.5 h-3.5 text-[#00ffcc]" />
          <span>Publishing &amp; Status</span>
        </h4>

        {/* Status Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs font-label uppercase">
          {[
            { id: "draft", label: "Draft", color: "amber" },
            { id: "published", label: "Published", color: "emerald" },
            { id: "scheduled", label: "Scheduled", color: "cyan" },
            { id: "archived", label: "Archived", color: "rose" },
          ].map((s) => {
            const isSelected = status === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeStatus(s.id as any)}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                  isSelected
                    ? "bg-[#103420] text-[#00ffcc] border-[#00ffcc]/60 shadow-[0_0_10px_rgba(0,255,204,0.15)]"
                    : "bg-[#04120a] text-[#a098b0] border-[#163e26] hover:text-white hover:border-[#163e26]/80"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Scheduled Date Picker */}
        {status === "scheduled" && (
          <div className="space-y-1.5 pt-2 border-t border-[#163e26]">
            <label className="text-[11px] font-label uppercase tracking-wider text-[#00ffcc] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Broadcast Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt ? scheduledAt.substring(0, 16) : ""}
              onChange={(e) => onChangeScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="w-full px-3 py-2 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc]"
            />
          </div>
        )}

        {/* Featured Dispatch Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#163e26]">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isFeatured ? "text-amber-400 fill-amber-400" : "text-[#a098b0]"}`} />
            <div>
              <span className="text-xs font-semibold text-white block">Featured Dispatch</span>
              <span className="text-[10px] text-[#a098b0] block">Showcase in hero showcase</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChangeFeatured(!isFeatured)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              isFeatured ? "bg-[#00ffcc]" : "bg-[#103420]"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-[#04120a] transition-transform ${
                isFeatured ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. URL Slug & Taxonomy */}
      <div className="p-5 rounded-2xl bg-[#081e12] border border-[#163e26] space-y-4 shadow-sm">
        <h4 className="text-xs font-label uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-[#163e26] pb-3">
          <Globe className="w-3.5 h-3.5 text-[#00ffcc]" />
          <span>Permalink &amp; Category</span>
        </h4>

        {/* Slug input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-label uppercase tracking-wider text-[#a098b0]">
              Slug URL
            </label>
            <button
              type="button"
              onClick={() => {
                const auto = slugify(title);
                onChangeSlug(auto);
                checkSlugAvailability(auto);
              }}
              className="text-[10px] text-[#00ffcc] hover:underline flex items-center gap-1 font-mono"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>From Title</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                onChangeSlug(e.target.value);
                setSlugStatus("idle");
              }}
              onBlur={handleSlugBlur}
              placeholder="e.g. ridge-patrol-winter"
              className="w-full px-3 py-2 pr-8 rounded-xl bg-[#04120a] border border-[#163e26] text-xs font-mono text-white focus:outline-none focus:border-[#00ffcc]"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {slugChecking ? (
                <RefreshCw className="w-3.5 h-3.5 text-[#00ffcc] animate-spin" />
              ) : slugStatus === "available" ? (
                <span title="Slug is available">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              ) : slugStatus === "taken" ? (
                <span title="Slug is already taken">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </span>
              ) : null}
            </div>
          </div>
          <span className="text-[10px] text-[#a098b0] font-mono block truncate">
            /blog/{slug || "..."}
          </span>
        </div>

        {/* Category selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-label uppercase tracking-wider text-[#a098b0] flex items-center gap-1.5">
            <Folder className="w-3 h-3 text-[#00ffcc]" />
            <span>Journal Category</span>
          </label>
          <select
            value={categoryId || ""}
            onChange={(e) => onChangeCategory(e.target.value || null)}
            className="w-full px-3 py-2 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc] cursor-pointer"
          >
            <option value="">Uncategorized Dispatches</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags management */}
        <div className="space-y-2">
          <label className="text-[11px] font-label uppercase tracking-wider text-[#a098b0] flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#00ffcc]" />
            <span>Field Tags</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter"
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc]"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 rounded-xl bg-[#103420] text-[#00ffcc] text-xs font-bold hover:bg-[#163e26]"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[#04120a] border border-[#163e26] text-[10px] font-mono text-[#00ffcc] flex items-center gap-1"
                >
                  <Hash className="w-2.5 h-2.5" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 ml-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Field Location & Conservation Telemetry */}
      <div className="p-5 rounded-2xl bg-[#081e12] border border-[#163e26] space-y-4 shadow-sm">
        <h4 className="text-xs font-label uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-[#163e26] pb-3">
          <MapPin className="w-3.5 h-3.5 text-[#00ffcc]" />
          <span>Location &amp; Conservation</span>
        </h4>

        <div className="space-y-1.5">
          <label className="text-[11px] font-label uppercase tracking-wider text-[#a098b0]">
            Location Label
          </label>
          <input
            type="text"
            value={locationLabel}
            onChange={(e) => onChangeLocation(e.target.value, locationPrecision)}
            placeholder="e.g. Shey Phoksundo National Park, 3,600m"
            className="w-full px-3 py-2 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-label uppercase tracking-wider text-[#a098b0] flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Precision (Species Safety)</span>
          </label>
          <select
            value={locationPrecision}
            onChange={(e) => onChangeLocation(locationLabel, e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#04120a] border border-[#163e26] text-xs text-white focus:outline-none focus:border-[#00ffcc] cursor-pointer"
          >
            <option value="national_park">General National Park / Sanctuary</option>
            <option value="regional_valley">Valley / River Basin (Obfuscated)</option>
            <option value="confidential_protected">Protected Confidential (No GPS)</option>
            <option value="exact_coordinates">Exact Coordinates (Public)</option>
          </select>
        </div>
      </div>

      {/* 4. Reading Telemetry */}
      <div className="p-5 rounded-2xl bg-[#081e12] border border-[#163e26] space-y-3 shadow-sm">
        <h4 className="text-xs font-label uppercase tracking-wider text-white font-bold flex items-center gap-2 border-b border-[#163e26] pb-3">
          <Clock className="w-3.5 h-3.5 text-[#00ffcc]" />
          <span>Telemetry &amp; Reading Time</span>
        </h4>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#04120a] border border-[#163e26]">
            <span className="text-lg font-headline font-bold text-white block">
              {wordCount.toLocaleString()}
            </span>
            <span className="text-[10px] font-label uppercase text-[#a098b0]">Words</span>
          </div>

          <div className="p-3 rounded-xl bg-[#04120a] border border-[#163e26]">
            <div className="flex items-center justify-center gap-1 text-lg font-headline font-bold text-[#00ffcc]">
              <input
                type="number"
                min={1}
                max={120}
                value={readingTimeMinutes}
                onChange={(e) => onChangeReadingTime(Number(e.target.value) || 1)}
                className="w-12 bg-transparent text-center focus:outline-none border-b border-[#00ffcc]/40"
              />
              <span className="text-xs font-normal">min</span>
            </div>
            <span className="text-[10px] font-label uppercase text-[#a098b0]">Read Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
