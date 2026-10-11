"use client";

import React, { useState, useEffect } from "react";
import {
  Stamp,
  ShieldCheck,
  Save,
  RotateCcw,
  Upload,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Grid,
  Maximize2,
  Lock,
  Layers,
  Image as ImageIcon,
  Type,
  Move,
  RotateCw,
  Repeat,
  Palette,
  ExternalLink,
} from "lucide-react";

interface WatermarkData {
  id?: string;
  text: string;
  logoUrl: string | null;
  opacity: string;
  opacityPercent: number;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "tiled";
  size: number;
  isTiled: boolean;
  margin: number;
  isActive: boolean;
  rotation: number; // in degrees, e.g. -30
  tileCount: number; // number of repetitions on canvas, e.g. 4, 9, 16, 25
  fontFamily: "sans" | "mono" | "serif";
  fontSize: number; // e.g. 12
  color: string; // e.g. "#ffffff"
  blendMode: "normal" | "overlay" | "screen" | "soft-light";
}

const PREVIEW_PHOTOS = [
  {
    id: "snow-leopard",
    title: "Snow Leopard • Spiti Valley",
    url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "bengal-tiger",
    title: "Royal Bengal Tiger • Bardia",
    url: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "rhino",
    title: "One-Horned Rhino • Chitwan",
    url: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "golden-eagle",
    title: "Himalayan Golden Eagle",
    url: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=1200&auto=format&fit=crop&q=80",
  },
];

const TEXT_PRESETS = [
  "© SUBAN WILDLIFE PHOTOGRAPHY",
  "© SUBAN FINE ART ARCHIVE • NEPAL",
  "SUBAN WILDLIFE • ARCHIVAL MASTER",
  "© Suban Bajracharya • C2PA Verified",
];

const ROTATION_PRESETS = [
  { label: "0° (Flat)", angle: 0 },
  { label: "-25° (Subtle)", angle: -25 },
  { label: "-45° (Diagonal)", angle: -45 },
  { label: "+45° (Reverse)", angle: 45 },
  { label: "-90° (Vertical)", angle: -90 },
];

const QUANTITY_PRESETS = [
  { label: "Sparse (4 Tiles • 2×2)", count: 4 },
  { label: "Standard (9 Tiles • 3×3)", count: 9 },
  { label: "Dense (16 Tiles • 4×4)", count: 16 },
  { label: "High Security (25 Tiles • 5×5)", count: 25 },
];

const COLOR_PRESETS = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Studio Silver", value: "#e2e8f0" },
  { label: "Neon Mint", value: "#a7f3d0" },
  { label: "Translucent Gold", value: "#fef08a" },
  { label: "Soft Pink", value: "#fbcfe8" },
];

const BADGE_PRESETS = [
  {
    id: "c2pa",
    name: "C2PA Provenance Shield",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" stroke="#ffffff" stroke-width="4"/><path d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z" stroke="#ffffff" stroke-width="3" fill="none"/><text x="50" y="55" fill="#ffffff" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">C2PA</text></svg>`,
  },
  {
    id: "monogram",
    name: "Suban Studio Monogram",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="80" height="80" rx="16" stroke="#ffffff" stroke-width="4"/><text x="50" y="62" fill="#ffffff" font-size="34" font-family="sans-serif" font-weight="bold" text-anchor="middle">SB</text></svg>`,
  },
  {
    id: "seal",
    name: "Wildlife Conservation Seal",
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" stroke="#ffffff" stroke-width="3" stroke-dasharray="4 4"/><circle cx="50" cy="50" r="34" stroke="#ffffff" stroke-width="2"/><text x="50" y="54" fill="#ffffff" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">AUTHENTIC</text></svg>`,
  },
];

export function WatermarkSettingsManager() {
  const [data, setData] = useState<WatermarkData>({
    text: "© SUBAN WILDLIFE PHOTOGRAPHY",
    logoUrl: null,
    opacity: "0.45",
    opacityPercent: 45,
    position: "bottom-right",
    size: 25,
    isTiled: false,
    margin: 24,
    isActive: true,
    rotation: -30,
    tileCount: 9,
    fontFamily: "sans",
    fontSize: 12,
    color: "#ffffff",
    blendMode: "normal",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [watermarkMode, setWatermarkMode] = useState<"text" | "logo" | "both">("both");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Load from database on mount
  useEffect(() => {
    setIsLoading(true);
    fetch("/api/admin/watermark")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.watermark) {
          const wm = json.watermark;
          setData({
            id: wm.id,
            text: wm.text || "© SUBAN WILDLIFE PHOTOGRAPHY",
            logoUrl: wm.logoUrl || null,
            opacity: wm.opacity || "0.45",
            opacityPercent: wm.opacityPercent ?? Math.round(parseFloat(wm.opacity || "0.45") * 100),
            position: wm.position || "bottom-right",
            size: wm.size || 25,
            isTiled: Boolean(wm.isTiled),
            margin: wm.margin ?? 24,
            isActive: wm.isActive ?? true,
            rotation: wm.rotation ?? -30,
            tileCount: wm.tileCount ?? 9,
            fontFamily: wm.fontFamily || "sans",
            fontSize: wm.fontSize ?? 12,
            color: wm.color || "#ffffff",
            blendMode: wm.blendMode || "normal",
          });
          if (wm.logoUrl) {
            setWatermarkMode("both");
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load watermark:", err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/watermark", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: data.text,
          logoUrl: data.logoUrl,
          opacity: (data.opacityPercent / 100).toFixed(2),
          opacityPercent: data.opacityPercent,
          position: data.isTiled ? "tiled" : data.position,
          size: data.size,
          isTiled: data.isTiled,
          margin: data.margin,
          isActive: data.isActive,
          rotation: data.rotation,
          tileCount: data.tileCount,
          fontFamily: data.fontFamily,
          fontSize: data.fontSize,
          color: data.color,
          blendMode: data.blendMode,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("suban_watermark_updated", { detail: json.watermark })
          );
        }
        setSaveMessage("✅ Watermark configuration saved to database!");
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        setErrorMessage(json.error || "Failed to save settings");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setData({
      text: "© SUBAN WILDLIFE PHOTOGRAPHY",
      logoUrl: null,
      opacity: "0.45",
      opacityPercent: 45,
      position: "bottom-right",
      size: 25,
      isTiled: false,
      margin: 24,
      isActive: true,
      rotation: -30,
      tileCount: 9,
      fontFamily: "sans",
      fontSize: 12,
      color: "#ffffff",
      blendMode: "normal",
    });
    setWatermarkMode("text");
  };

  // Upload logo to watermarks bucket
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "watermarks");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.url) {
        setData((prev) => ({ ...prev, logoUrl: json.url }));
        setWatermarkMode("both");
        setSaveMessage("Badge uploaded to watermarks bucket!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setErrorMessage(json.error || "Upload failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload watermark image");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const currentPhoto = PREVIEW_PHOTOS[selectedPhotoIndex];

  // Helper for computing grid columns
  const getGridColsClass = (count: number) => {
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 16) return "grid-cols-4 grid-rows-4";
    return "grid-cols-5 grid-rows-5";
  };

  // Helper for font family class
  const getFontFamilyClass = (fam: string) => {
    if (fam === "mono") return "font-mono";
    if (fam === "serif") return "font-serif italic";
    return "font-headline";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Top Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Watermark Engine
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#00ffcc]/10 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc]">
              <Stamp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">
              {data.isActive ? "Enforced" : "Disabled"}
            </span>
            <span className="text-xs text-emerald-600 dark:text-[#00ffcc] font-label font-semibold">
              {data.isTiled ? `${data.tileCount} Tiles` : "Single Stamp"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">
            Overlaid on public web resolution previews
          </p>
        </div>

        {/* Rotation & Angle */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Rotation Angle
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-[#ffe04a]/10 border border-amber-200 dark:border-[#ffe04a]/30 flex items-center justify-center text-amber-600 dark:text-[#ffe04a]">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">
              {data.rotation}°
            </span>
            <span className="text-xs text-amber-600 dark:text-[#ffe04a] font-label font-semibold">
              {data.rotation === 0 ? "Horizontal" : data.rotation < 0 ? "Diagonal Left" : "Diagonal Right"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">
            Applied across single and tiled stamps
          </p>
        </div>

        {/* Repetition Density (How Many) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Pattern Density (How Many)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-[#a855f7]/10 border border-indigo-200 dark:border-[#a855f7]/30 flex items-center justify-center text-indigo-600 dark:text-[#a855f7]">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">
              {data.isTiled ? `${data.tileCount} Repeats` : "1 Stamp"}
            </span>
            <span className="text-xs text-indigo-600 dark:text-[#a855f7] font-label font-semibold">
              {data.opacityPercent}% Alpha
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">
            {data.isTiled ? "Multi-tile matrix protection" : "Corner anchor protection"}
          </p>
        </div>

        {/* Global Save Action */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-[#0e2a1d] dark:to-[#081b12] border border-emerald-200 dark:border-[#00ffcc]/30 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-label uppercase tracking-wider text-emerald-700 dark:text-[#00ffcc] font-semibold">
              Live Protection
            </span>
            <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ffcc] text-lg">
              lock_person
            </span>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00ffcc] dark:hover:bg-[#00e6b8] dark:text-[#04120a] font-label text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Setup..." : "Save Watermark Setup"}</span>
            </button>
            {saveMessage && (
              <p className="text-[11px] font-label text-center text-emerald-600 dark:text-[#00ffcc] mt-1.5 animate-fadeIn font-semibold">
                {saveMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-[11px] font-label text-center text-rose-600 mt-1.5 animate-fadeIn font-semibold">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout: Visual Preview Canvas & Configuration Controls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT: Interactive Live Visual Preview (Sticky on Desktop) ── */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-4 transition-colors">
            {/* Preview Header & Image Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                  <span>Real-Time Watermark Simulator</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-[#a098b0]">
                  Live rendering over high-resolution wildlife master
                </p>
              </div>

              {/* Photo Selector Pills */}
              <div className="flex items-center gap-1">
                {PREVIEW_PHOTOS.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                      selectedPhotoIndex === idx
                        ? "bg-emerald-600 text-white border-emerald-600 dark:bg-[#00ffcc] dark:text-[#04120a] dark:border-[#00ffcc]"
                        : "bg-slate-100 dark:bg-[#05140d] text-slate-600 dark:text-[#a098b0] border-slate-200 dark:border-[#1b3d2a] hover:bg-slate-200"
                    }`}
                    title={p.title}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Canvas Frame with Overlay ── */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-300 dark:border-[#1b3d2a] shadow-inner select-none group">
              {/* Background Photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Watermark Overlay Layer */}
              {data.isActive && (
                <>
                  {data.isTiled ? (
                    /* ── Tiled Watermark Repeating Matrix with Dynamic Quantity & Rotation ── */
                    <div
                      className={`absolute inset-0 pointer-events-none grid ${getGridColsClass(
                        data.tileCount
                      )} p-3 overflow-hidden`}
                      style={{
                        opacity: data.opacityPercent / 100,
                        mixBlendMode: data.blendMode as any,
                      }}
                    >
                      {Array.from({ length: data.tileCount }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center p-1"
                        >
                          <div
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-black/40 backdrop-blur-[1px] border border-white/20 whitespace-nowrap shadow-md transition-all duration-200"
                            style={{
                              transform: `rotate(${data.rotation}deg) scale(${data.size / 25})`,
                              color: data.color,
                            }}
                          >
                            {/* Logo if configured */}
                            {(watermarkMode === "logo" || watermarkMode === "both") && data.logoUrl && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={data.logoUrl}
                                alt="Badge"
                                className="w-3.5 h-3.5 object-contain filter invert"
                              />
                            )}

                            {/* Text if configured */}
                            {(watermarkMode === "text" || watermarkMode === "both") && (
                              <span
                                className={`${getFontFamilyClass(data.fontFamily)} font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
                                style={{ fontSize: `${data.fontSize}px` }}
                              >
                                {data.text || "© SUBAN PHOTOGRAPHY"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* ── Single Precision Position Watermark with Dynamic Rotation ── */
                    <div
                      className={`absolute pointer-events-none flex ${
                        data.position === "top-left"
                          ? "top-0 left-0"
                          : data.position === "top-right"
                          ? "top-0 right-0"
                          : data.position === "bottom-left"
                          ? "bottom-0 left-0"
                          : data.position === "bottom-right"
                          ? "bottom-0 right-0"
                          : "inset-0 items-center justify-center"
                      }`}
                      style={{
                        padding: `${data.margin}px`,
                        opacity: data.opacityPercent / 100,
                        mixBlendMode: data.blendMode as any,
                      }}
                    >
                      <div
                        className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/25 shadow-xl transition-all duration-200"
                        style={{
                          transform: `scale(${data.size / 25}) rotate(${data.rotation}deg)`,
                          transformOrigin:
                            data.position === "top-left"
                              ? "top left"
                              : data.position === "top-right"
                              ? "top right"
                              : data.position === "bottom-left"
                              ? "bottom left"
                              : data.position === "bottom-right"
                              ? "bottom right"
                              : "center center",
                          color: data.color,
                        }}
                      >
                        {/* Logo if configured */}
                        {(watermarkMode === "logo" || watermarkMode === "both") && data.logoUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={data.logoUrl}
                            alt="Watermark Badge"
                            className="w-5 h-5 object-contain"
                          />
                        )}

                        {/* Text if configured */}
                        {(watermarkMode === "text" || watermarkMode === "both") && (
                          <span
                            className={`${getFontFamilyClass(data.fontFamily)} font-bold tracking-wider whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]`}
                            style={{ fontSize: `${data.fontSize}px` }}
                          >
                            {data.text}
                          </span>
                        )}

                        {/* C2PA Provenance Micro Seal */}
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-white/20 text-white border border-white/30">
                          C2PA
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Tag in Canvas Top Bar */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                  {currentPhoto.title}
                </span>
                {data.isActive ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                    {data.isTiled ? `TILED (${data.tileCount}x)` : "SINGLE"} • {data.rotation}°
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-rose-500/90 text-white backdrop-blur-md">
                    UNPROTECTED
                  </span>
                )}
              </div>
            </div>

            {/* Canvas Legend Information */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500 dark:text-[#a098b0]">
              <span className="font-mono text-[11px] truncate">
                Angle: <strong className="text-slate-800 dark:text-white">{data.rotation}°</strong>
              </span>
              <span className="font-mono text-[11px] truncate">
                Count: <strong className="text-slate-800 dark:text-white">{data.isTiled ? data.tileCount : 1}</strong>
              </span>
              <span className="font-mono text-[11px] truncate">
                Alpha: <strong className="text-slate-800 dark:text-white">{data.opacityPercent}%</strong>
              </span>
              <span className="font-mono text-[11px] truncate">
                Scale: <strong className="text-slate-800 dark:text-white">{data.size}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Configuration Controls ── */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. MASTER TOGGLE & MODE */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1b3d2a]">
              <div>
                <h4 className="font-headline font-bold text-base text-slate-900 dark:text-[#e8e0f0]">
                  Copyright Enforcement
                </h4>
                <p className="text-xs text-slate-500 dark:text-[#a098b0]">
                  Enable or disable copyright overlays across public web photographs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
              >
                <span
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                    data.isActive ? "bg-emerald-600 dark:bg-[#00ffcc]" : "bg-slate-300 dark:bg-[#4a5568]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      data.isActive ? "translate-x-6 dark:bg-[#04120a]" : "translate-x-0"
                    }`}
                  />
                </span>
                <span>{data.isActive ? "Active" : "Disabled"}</span>
              </button>
            </div>

            {/* Mode selection tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Watermark Type Composition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "text", label: "Text Only", icon: Type },
                  { id: "logo", label: "Graphic Badge", icon: ImageIcon },
                  { id: "both", label: "Dual (Badge + Text)", icon: Layers },
                ].map((mode) => {
                  const isCur = watermarkMode === mode.id;
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setWatermarkMode(mode.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-label font-bold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCur
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-[#163d27] dark:text-[#00ffcc] dark:border-[#00ffcc]/40 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a] hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. ROTATION CONTROLS (NEW FEATURE) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b3d2a]">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-amber-500 dark:text-[#ffe04a]" />
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                  Watermark Rotation Angle
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-[#ffe04a]/10 dark:text-[#ffe04a] text-xs font-mono font-bold border border-amber-200 dark:border-[#ffe04a]/30">
                {data.rotation}°
              </span>
            </div>

            {/* Quick Angle Preset Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-label uppercase text-slate-500 dark:text-[#a098b0]">
                Quick Angle Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {ROTATION_PRESETS.map((p) => {
                  const isCur = data.rotation === p.angle;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, rotation: p.angle }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase font-bold transition-all border cursor-pointer ${
                        isCur
                          ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-[#ffe04a] dark:text-[#121c00] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a] hover:bg-slate-100"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-label">
                <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                  Continuous Rotation Degree (-90° to +90°)
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-[#ffe04a]">
                  {data.rotation}°
                </span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={data.rotation}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                }
                className="w-full accent-amber-500 dark:accent-[#ffe04a] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. HOW MANY: REPETITION COUNT & DENSITY CONTROLS (NEW FEATURE) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b3d2a]">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-indigo-500 dark:text-[#a855f7]" />
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                  Repetition Density &amp; Count (How Many)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setData((prev) => ({ ...prev, isTiled: !prev.isTiled }))}
                className={`px-3 py-1 rounded-lg text-xs font-label font-bold uppercase transition-all cursor-pointer border ${
                  data.isTiled
                    ? "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-purple-900/30 dark:text-[#a855f7] dark:border-[#a855f7]/40 shadow-sm"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a]"
                }`}
              >
                {data.isTiled ? "Tiled Pattern Active" : "Enable Multi-Tile Pattern"}
              </button>
            </div>

            {data.isTiled ? (
              <div className="space-y-4">
                {/* Density Preset Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-label uppercase text-slate-500 dark:text-[#a098b0]">
                    Standard Grid Configurations:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {QUANTITY_PRESETS.map((q) => {
                      const isCur = data.tileCount === q.count;
                      return (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => setData((prev) => ({ ...prev, tileCount: q.count }))}
                          className={`p-2.5 rounded-xl text-xs font-label font-bold uppercase transition-all border cursor-pointer text-left ${
                            isCur
                              ? "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-[#163d27] dark:text-[#00ffcc] dark:border-[#00ffcc]/40 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a] hover:bg-slate-100"
                          }`}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Quantity Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-label">
                    <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                      Exact Tile Count (How Many On Image)
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-[#a855f7]">
                      {data.tileCount} Watermarks
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    step="1"
                    value={data.tileCount}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, tileCount: Number(e.target.value) }))
                    }
                    className="w-full accent-indigo-600 dark:accent-[#a855f7] cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-[#a098b0]">
                    Generates a balanced responsive matrix protecting against AI image cropping and scraping.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] text-xs text-slate-600 dark:text-[#a098b0] flex items-center justify-between">
                <span>Single corner stamp active. Click &quot;Enable Multi-Tile Pattern&quot; above to repeat multiple watermarks across the photo.</span>
              </div>
            )}
          </div>

          {/* 4. TYPOGRAPHY & COLOR STYLING (NEW ENHANCEMENTS) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-5 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-[#1b3d2a]">
              <Palette className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
              <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                Typography, Color &amp; Blend Mode
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Font Family */}
              <div className="space-y-1.5">
                <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0]">
                  Typography Family
                </label>
                <select
                  value={data.fontFamily}
                  onChange={(e) => setData((prev) => ({ ...prev, fontFamily: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-label font-bold text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:outline-none cursor-pointer"
                >
                  <option value="sans">Modern Clean Sans-Serif</option>
                  <option value="mono">Technical Archival Monospace</option>
                  <option value="serif">Fine Art Exhibition Serif</option>
                </select>
              </div>

              {/* Blend Mode */}
              <div className="space-y-1.5">
                <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0]">
                  Optical Blend Mode
                </label>
                <select
                  value={data.blendMode}
                  onChange={(e) => setData((prev) => ({ ...prev, blendMode: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-label font-bold text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:outline-none cursor-pointer"
                >
                  <option value="normal">Normal (Opaque Surface)</option>
                  <option value="overlay">Overlay (Adaptive Luminance)</option>
                  <option value="screen">Screen (Soft Ambient Highlight)</option>
                  <option value="soft-light">Soft Light (Subtle Texture)</option>
                </select>
              </div>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-label">
                <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                  Text Font Size
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-[#00ffcc]">
                  {data.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="9"
                max="24"
                step="1"
                value={data.fontSize}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                }
                className="w-full accent-emerald-600 dark:accent-[#00ffcc] cursor-pointer"
              />
            </div>

            {/* Color Palette Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-label uppercase text-slate-500 dark:text-[#a098b0]">
                Watermark Foreground Tint:
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => {
                  const isCur = data.color === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, color: c.value }))}
                      className={`px-3 py-1 rounded-lg text-xs font-label font-bold flex items-center gap-2 border cursor-pointer ${
                        isCur
                          ? "bg-slate-200 text-slate-900 border-slate-400 dark:bg-[#163d27] dark:text-[#00ffcc] dark:border-[#00ffcc]"
                          : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a]"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/30"
                        style={{ backgroundColor: c.value }}
                      />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. TEXT CONTENT & PRESETS */}
          {(watermarkMode === "text" || watermarkMode === "both") && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-4 transition-colors">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                  Copyright Text Specification
                </h4>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0]">
                  Watermark Label String
                </label>
                <input
                  type="text"
                  value={data.text}
                  onChange={(e) => setData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. © SUBAN WILDLIFE PHOTOGRAPHY"
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-headline font-bold text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
                />
              </div>

              {/* Quick Text Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-label uppercase text-slate-500 dark:text-[#a098b0]">
                  Quick Studio Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TEXT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, text: preset }))}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#05140d] dark:hover:bg-[#163d27] text-slate-700 dark:text-[#a098b0] text-[10px] font-mono border border-slate-200 dark:border-[#1b3d2a] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. LOGO & BADGE GRAPHIC SETUP */}
          {(watermarkMode === "logo" || watermarkMode === "both") && (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-4 transition-colors">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600 dark:text-[#38bdf8]" />
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                  Watermark Badge Graphic (.PNG / .SVG)
                </h4>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0]">
                  Badge Graphic URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={data.logoUrl || ""}
                    onChange={(e) => setData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://.../watermark-badge.png or upload below"
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-sky-500 dark:focus:border-[#38bdf8] focus:outline-none"
                  />
                  <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#05140d] dark:hover:bg-[#163e26] text-slate-700 dark:text-[#e8e0f0] text-xs font-label font-bold uppercase border border-slate-200 dark:border-[#1b3d2a] flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingLogo ? "Uploading..." : "Upload PNG"}</span>
                    <input
                      type="file"
                      accept="image/png,image/svg+xml,image/webp"
                      onChange={handleUploadLogo}
                      className="hidden"
                      disabled={isUploadingLogo}
                    />
                  </label>
                </div>
              </div>

              {/* Preset Badges */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-label uppercase text-slate-500 dark:text-[#a098b0]">
                  Or Select Pre-Engineered Badge:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {BADGE_PRESETS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          logoUrl: `data:image/svg+xml;utf8,${encodeURIComponent(b.svg)}`,
                        }))
                      }
                      className="p-2 rounded-xl bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] hover:border-emerald-400 dark:hover:border-[#00ffcc] flex flex-col items-center gap-1.5 text-center cursor-pointer group"
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center p-1 bg-slate-800 rounded-lg group-hover:scale-110 transition-transform"
                        dangerouslySetInnerHTML={{ __html: b.svg }}
                      />
                      <span className="text-[10px] font-label text-slate-700 dark:text-[#a098b0] line-clamp-1">
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. POSITION MATRIX (FOR SINGLE WATERMARK) & SLIDERS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1b3d2a]">
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                <h4 className="font-headline font-bold text-sm text-slate-900 dark:text-[#e8e0f0]">
                  Anchor Placement &amp; Geometry
                </h4>
              </div>
            </div>

            {/* 9-Box Grid Position Selector (Only when single stamp) */}
            {!data.isTiled && (
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0]">
                  Anchor Placement on Canvas
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-xs">
                  {[
                    { id: "top-left", label: "Top Left" },
                    { id: "center", label: "Center Stage" },
                    { id: "top-right", label: "Top Right" },
                    { id: "bottom-left", label: "Bottom Left" },
                    { id: "center", label: "Center" },
                    { id: "bottom-right", label: "Bottom Right" },
                  ].map((pos, idx) => {
                    const isSelected = data.position === pos.id;
                    return (
                      <button
                        key={`${pos.id}-${idx}`}
                        type="button"
                        onClick={() =>
                          setData((prev) => ({
                            ...prev,
                            position: pos.id as any,
                            isTiled: false,
                          }))
                        }
                        className={`p-2.5 rounded-xl border text-[11px] font-label font-bold uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 dark:bg-[#00ffcc] dark:text-[#04120a] dark:border-[#00ffcc] shadow-sm"
                            : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#05140d] dark:text-[#a098b0] dark:border-[#1b3d2a] hover:bg-slate-100"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? "bg-white dark:bg-[#04120a]" : "bg-slate-400 dark:bg-[#4a5568]"
                          }`}
                        />
                        <span className="text-[9px]">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sliders: Opacity, Scale, Margin */}
            <div className="space-y-4 pt-2">
              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-label">
                  <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                    Opacity Transparency
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#00ffcc]">
                    {data.opacityPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={data.opacityPercent}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      opacityPercent: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600 dark:accent-[#00ffcc] cursor-pointer"
                />
              </div>

              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-label">
                  <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                    Watermark Scale
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-[#00ffcc]">
                    {data.size}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={data.size}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, size: Number(e.target.value) }))
                  }
                  className="w-full accent-emerald-600 dark:accent-[#00ffcc] cursor-pointer"
                />
              </div>

              {/* Margin Slider */}
              {!data.isTiled && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-label">
                    <span className="text-slate-600 dark:text-[#a098b0] uppercase">
                      Edge Margin Offset
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-[#00ffcc]">
                      {data.margin}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={data.margin}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, margin: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-600 dark:accent-[#00ffcc] cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Footer ── */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 dark:bg-[#081b12]/95 backdrop-blur-md border border-slate-200 dark:border-[#1b3d2a] shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#a098b0]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#00ffcc] animate-pulse" />
          <span>
            Changes to watermark angle ({data.rotation}°), density ({data.isTiled ? data.tileCount : 1}x), and style are automatically preserved in PostgreSQL.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#05140d] dark:hover:bg-[#163e26] text-slate-600 dark:text-[#a098b0] text-xs transition-colors border border-slate-200 dark:border-[#1b3d2a] cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00ffcc] dark:hover:bg-[#00e6b8] dark:text-[#04120a] font-label text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all shadow-md dark:shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Publishing..." : "Publish Watermark"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
