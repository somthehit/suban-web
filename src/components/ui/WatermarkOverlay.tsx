"use client";

import React from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { defaultWatermarkSettings, WatermarkSiteSettings } from "@/lib/site-settings";

interface WatermarkOverlayProps {
  /**
   * Layout variant:
   * - "card": Scaled down slightly for thumbnail product cards (Home, Gallery grid, Collections grid).
   * - "full": Full fidelity scale for large hero view or single photo exhibition stage.
   */
  variant?: "card" | "full";
  /** Optional custom class overrides */
  className?: string;
  /** Optional direct override for custom watermark settings */
  override?: Partial<WatermarkSiteSettings>;
}

export function WatermarkOverlay({
  variant = "card",
  className = "",
  override,
}: WatermarkOverlayProps) {
  const { settings } = useSiteSettings();
  const wm = {
    ...defaultWatermarkSettings,
    ...(settings?.watermark || {}),
    ...(override || {}),
  };

  // If watermark protection is explicitly disabled in admin, render nothing
  if (!wm.enabled) {
    return null;
  }

  const isCard = variant === "card";
  const opacityVal = Math.max(0.05, Math.min(1, (wm.opacity ?? 45) / 100));
  const rotation = wm.rotation ?? -30;
  const tileCount = Math.max(2, Math.min(25, wm.tileCount ?? 9));
  const text = wm.text || "© SUBAN WILDLIFE PHOTOGRAPHY";
  const color = wm.color || "#ffffff";
  const blendMode = (wm.blendMode as any) || "normal";

  // Compute font size based on variant
  const baseFontSize = wm.fontSize || 12;
  const fontSizePx = isCard
    ? Math.max(8, Math.min(16, Math.round(baseFontSize * 0.85)))
    : baseFontSize;

  // Font family helper
  const fontFamilyClass =
    wm.fontFamily === "mono"
      ? "font-mono"
      : wm.fontFamily === "serif"
      ? "font-serif italic"
      : "font-headline";

  // Grid columns calculator for repeating tiles
  const getGridClass = (count: number) => {
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    if (count <= 16) return "grid-cols-4 grid-rows-4";
    return "grid-cols-5 grid-rows-5";
  };

  // Margin for single position stamp
  const marginPx = isCard
    ? Math.max(8, Math.min(20, Math.round((wm.margin ?? 24) * 0.6)))
    : (wm.margin ?? 24);

  // Scale factor
  const scaleRatio = isCard
    ? Math.max(0.65, Math.min(1.2, (wm.size ?? 25) / 28))
    : Math.max(0.75, Math.min(2.0, (wm.size ?? 25) / 25));

  // Single stamp positioning
  const getPositionClass = (pos: string) => {
    switch (pos) {
      case "top-left":
        return "top-0 left-0 items-start justify-start";
      case "top-right":
        return "top-0 right-0 items-start justify-end";
      case "bottom-left":
        return "bottom-0 left-0 items-end justify-start";
      case "bottom-right":
        return "bottom-0 right-0 items-end justify-end";
      case "center":
      default:
        return "inset-0 items-center justify-center";
    }
  };

  const getTransformOrigin = (pos: string) => {
    switch (pos) {
      case "top-left":
        return "top left";
      case "top-right":
        return "top right";
      case "bottom-left":
        return "bottom left";
      case "bottom-right":
        return "bottom right";
      default:
        return "center center";
    }
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {wm.isTiled ? (
        /* ── Multi-Tile Grid Watermark (Repetition Count & Dynamic Rotation) ── */
        <div
          className={`w-full h-full grid ${getGridClass(
            tileCount
          )} p-1 sm:p-2 transition-opacity duration-300`}
          style={{
            opacity: opacityVal,
            mixBlendMode: blendMode,
          }}
        >
          {Array.from({ length: tileCount }).map((_, i) => (
            <div key={i} className="flex items-center justify-center p-0.5 overflow-hidden">
              <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/35 backdrop-blur-[1px] border border-white/15 shadow-sm whitespace-nowrap transition-transform duration-300"
                style={{
                  transform: `rotate(${rotation}deg) scale(${scaleRatio})`,
                  color,
                }}
              >
                {wm.logoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={wm.logoUrl}
                    alt=""
                    className="w-3 h-3 object-contain filter invert opacity-90 shrink-0"
                  />
                )}
                <span
                  className={`${fontFamilyClass} font-bold tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
                  style={{ fontSize: `${fontSizePx}px` }}
                >
                  {text}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Single Precision Anchor Watermark ── */
        <div
          className={`absolute flex ${getPositionClass(wm.position)} transition-opacity duration-300`}
          style={{
            padding: `${marginPx}px`,
            opacity: opacityVal,
            mixBlendMode: blendMode,
          }}
        >
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/45 backdrop-blur-sm border border-white/20 shadow-lg transition-transform duration-300"
            style={{
              transform: `rotate(${rotation}deg) scale(${scaleRatio})`,
              transformOrigin: getTransformOrigin(wm.position),
              color,
            }}
          >
            {wm.logoUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={wm.logoUrl}
                alt=""
                className="w-4 h-4 object-contain filter invert opacity-95 shrink-0"
              />
            )}
            <span
              className={`${fontFamilyClass} font-bold tracking-wider whitespace-nowrap uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
              style={{ fontSize: `${fontSizePx}px` }}
            >
              {text}
            </span>
            <span className="px-1 py-0.2 rounded text-[7px] font-mono font-bold uppercase bg-white/20 text-white/90 border border-white/30">
              C2PA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
