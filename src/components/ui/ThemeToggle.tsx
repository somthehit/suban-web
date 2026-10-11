"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "full" | "pill";
  showLabel?: boolean;
}

export function ThemeToggle({
  className = "",
  variant = "icon",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";


  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-label uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
          isDark
            ? "bg-[#0e2818] hover:bg-[#163d27] text-[#00ffcc] border-[#00ffcc]/20 shadow-[0_0_10px_rgba(0,255,204,0.15)]"
            : "bg-[#e8f2ec] hover:bg-[#dbece1] text-[#008769] border-[#008769]/30 shadow-sm"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      >
        {isDark ? (
          <>
            <Sun className="w-3.5 h-3.5 text-[#ffe04a] animate-spin-slow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-[#008769]" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "full" || showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label text-xs uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
          isDark
            ? "bg-[#081e12] hover:bg-[#0c2819] text-[#e8e0f0] border-[#163e26]"
            : "bg-white hover:bg-[#edf4ef] text-[#0c1f15] border-[#d2e0d7] shadow-sm"
        } ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? "bg-[#0e2818] text-[#ffe04a]" : "bg-[#e2ede6] text-[#008769]"
            }`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </div>
          <span>Theme: {isDark ? "Dark Showcase" : "Light Gallery"}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isDark
              ? "bg-[#163e26] text-[#00ffcc]"
              : "bg-[#e0ece4] text-[#008769]"
          }`}
        >
          {isDark ? "DARK" : "LIGHT"}
        </span>
      </button>
    );
  }

  // Default Icon variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer group ${
        isDark
          ? "bg-[#0e2818] hover:bg-[#163d27] text-[#ffe04a] hover:text-[#fff0c0] border-[#00ffcc]/20 hover:border-[#00ffcc]/50 shadow-[0_0_12px_rgba(0,255,204,0.15)]"
          : "bg-[#edf4ef] hover:bg-[#e0ece4] text-[#008769] hover:text-[#005a46] border-[#cfded5] hover:border-[#008769]/40 shadow-sm"
      } ${className}`}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
        {isDark ? (
          <Sun className="w-4 h-4 text-[#ffe04a] transition-all" />
        ) : (
          <Moon className="w-4 h-4 text-[#008769] transition-all" />
        )}
      </div>
    </button>
  );
}

export default ThemeToggle;
