"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NavbarSearch } from "@/components/layout/NavbarSearch";

export function Navbar() {
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const { openCart, totalCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch directly from customer profile API
    fetch("/api/customer/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          if (data.user.image) {
            setUserAvatar(data.user.image);
            setImageError(false);
          }
          if (data.user.name) {
            setUserName(data.user.name);
          }
        } else {
          setUserAvatar(null);
          setUserName(null);
        }
      })
      .catch(() => {});

    const handleProfileUpdate = (e: any) => {
      if (e.detail?.image !== undefined) {
        setUserAvatar(e.detail.image || null);
        setImageError(false);
      }
      if (e.detail?.name) {
        setUserName(e.detail.name);
      }
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
    };
  }, [pathname]);

  const hasImage = Boolean(userAvatar && !imageError);
  const hasUser = Boolean(userAvatar || userName);
  const displayName = userName || "Collector";
  const initial = displayName.charAt(0).toUpperCase() || "C";

  const rawItems = settings.navigation?.items || [
    { id: "nav-gallery", label: "Gallery & Shop", href: "/gallery" },
    { id: "nav-birds", label: "Birds", href: "/birds" },
    { id: "nav-collections", label: "Curated Collections", href: "/collections" },
    { id: "nav-blog", label: "Field Journal", href: "/blog" },
    { id: "nav-licensing", label: "Licensing", href: "/licensing" },
    { id: "nav-about", label: "About", href: "/about" },
  ];

  // Guarantee Birds button is always available in navbar
  const hasBirds = rawItems.some((item) => item.href === "/birds");
  const navLinks = hasBirds
    ? rawItems
    : [
        ...rawItems.slice(0, 1),
        { id: "nav-birds", label: "Birds", href: "/birds" },
        ...rawItems.slice(1),
      ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#04120a]/90 border-b border-[#00ffcc]/15 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand Logo & Title from Admin Settings */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            className="flex items-center gap-3 group shrink-0"
            href="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            {settings.brand.logoUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00ffcc]/50 shadow-[0_0_12px_rgba(0,255,204,0.25)] ring-2 ring-[#00ffcc]/20 shrink-0 flex items-center justify-center bg-[#0a2315] group-hover:border-[#00ffcc] group-hover:scale-105 transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={settings.brand.siteName}
                  src={settings.brand.logoUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0a2315] border border-[#00ffcc]/30 flex items-center justify-center transition-all duration-300 group-hover:border-[#00ffcc] group-hover:shadow-[0_0_12px_rgba(0,255,204,0.4)] shrink-0">
                <span className="material-symbols-outlined text-lg text-[#00ffcc] transition-transform duration-300 group-hover:scale-110">
                  photo_camera
                </span>
              </div>
            )}

            <div className="flex flex-col whitespace-nowrap shrink-0">
              <span className="font-headline font-bold text-base tracking-widest uppercase text-slate-900 dark:text-[#e8e0f0] group-hover:text-[#00ffcc] transition-colors whitespace-nowrap">
                {settings.brand.siteName || "SUBAN"}
              </span>
              <span className="font-label text-[10px] tracking-[0.25em] text-[#3e5a48] dark:text-[#a098b0] uppercase font-semibold whitespace-nowrap">
                {settings.brand.slogan || "Wild Life"}
              </span>
            </div>
          </Link>
        </div>

        {/* Dynamic Desktop Navigation from Admin Settings */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 font-label text-xs tracking-wider uppercase shrink-0">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id || item.href}
                href={item.href}
                className={`py-1 transition-all duration-200 ${
                  active
                    ? "text-[#ff2d78] font-bold drop-shadow-[0_0_8px_rgba(255,45,120,0.6)]"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Simple Search Input (Desktop & Tablet) */}
          <div className="hidden md:flex items-center">
            <NavbarSearch />
          </div>

          {/* Theme Mode Switcher */}
          <ThemeToggle />

          {/* Optional Currency Toggle Switcher */}
          {settings.navigation.showCurrencyToggle !== false && (
            <div className="flex items-center bg-[#0e2818] rounded-full p-1 text-[11px] font-label font-medium text-[#a098b0] border border-[#00ffcc]/10">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  currency === "USD"
                    ? "bg-[#163d27] text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)] font-semibold"
                    : "hover:text-[#e8e0f0]"
                }`}
              >
                USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  currency === "NPR"
                    ? "bg-[#163d27] text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)] font-semibold"
                    : "hover:text-[#e8e0f0]"
                }`}
              >
                NPR
              </button>
            </div>
          )}

          {/* Optional Cart Bag Icon with Live Badge */}
          {settings.navigation.showCart !== false && (
            <button
              type="button"
              onClick={openCart}
              className="relative p-2 text-[#a098b0] hover:text-[#ff2d78] transition-colors flex items-center justify-center cursor-pointer group"
              title={`View Cart (${totalCount} item${totalCount === 1 ? "" : "s"})`}
              aria-label={`Shopping Cart with ${totalCount} items`}
            >
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                shopping_bag
              </span>
              {totalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#ff2d78] text-[#ffe0ec] text-[10px] font-label font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,45,120,0.7)] animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Collector Account Link / Avatar */}
          <div className="flex items-center pl-2 border-l border-slate-200 dark:border-[#302840]/60">
            {hasImage ? (
              <Link
                className="relative p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500 dark:hover:ring-[#00ffcc]/60 transition-all duration-300 flex items-center justify-center group"
                href="/account"
                title={`${displayName} — Collector Account`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/70 dark:border-[#00ffcc]/60 bg-slate-100 dark:bg-[#0a2315] shadow-sm group-hover:scale-105 group-hover:border-emerald-500 dark:group-hover:border-[#00ffcc] transition-all duration-300 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userAvatar!}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#04120a] rounded-full shadow-xs" />
              </Link>
            ) : hasUser ? (
              <Link
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#0c2617]/90 hover:bg-slate-200 dark:hover:bg-[#113420] border border-slate-200 dark:border-[#00ffcc]/30 hover:border-emerald-500 dark:hover:border-[#00ffcc] text-slate-800 dark:text-[#e8e0f0] hover:text-emerald-700 dark:hover:text-[#00ffcc] transition-all duration-300 shadow-sm group"
                href="/account"
                title={`${displayName} — Collector Account`}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-[#00ffcc]/40 text-emerald-800 dark:text-[#00ffcc] text-[11px] font-headline font-bold flex items-center justify-center uppercase shrink-0">
                  {initial}
                </div>
                <span className="text-xs font-headline font-semibold truncate max-w-[110px] sm:max-w-[140px] text-slate-800 dark:text-[#e8e0f0] group-hover:text-emerald-700 dark:group-hover:text-[#00ffcc]">
                  {displayName}
                </span>
              </Link>
            ) : (
              <Link
                className="p-1.5 rounded-lg text-slate-600 dark:text-[#a098b0] hover:text-emerald-600 dark:hover:text-[#00ffcc] hover:bg-slate-100 dark:hover:bg-[#10281c] transition-colors flex items-center justify-center"
                href="/account"
                title="Collector Account & Sign In"
              >
                <span className="material-symbols-outlined text-[22px]">account_circle</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden pl-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#a098b0] hover:text-[#00ffcc] transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07190f] border-b border-[#00ffcc]/20 px-6 py-5 space-y-4 shadow-2xl">
          {/* Quick Mobile Search Input */}
          <NavbarSearch onNavigate={() => setMobileMenuOpen(false)} inline={true} />

          <nav className="flex flex-col space-y-3 font-label text-xs uppercase tracking-wider">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id || item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg transition-all ${
                    active
                      ? "bg-[#113420] text-[#ff2d78] font-bold border border-[#ff2d78]/30 shadow-[0_0_8px_rgba(255,45,120,0.3)]"
                      : "text-[#a098b0] hover:bg-[#0c2617] hover:text-[#00ffcc]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme switcher in mobile drawer */}
          <div className="pt-2">
            <ThemeToggle variant="full" />
          </div>

          <div className="pt-3 border-t border-[#163e26] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openCart();
              }}
              className="px-4 py-2 rounded-lg bg-[#ff2d78] hover:bg-[#d81159] text-[#ffe0ec] text-xs font-label uppercase tracking-widest font-semibold flex items-center gap-2 shadow-[0_0_10px_rgba(255,45,120,0.4)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              <span>Cart ({totalCount})</span>
            </button>

            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2 rounded-lg bg-[#0c2617] border border-[#00ffcc]/20 text-[#00ffcc] text-xs font-label uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-[#103420]"
            >
              {hasImage ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00ffcc]/60 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userAvatar!}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : hasUser ? (
                <div className="w-5 h-5 rounded-full bg-[#00ffcc]/20 text-[#00ffcc] text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                  {initial}
                </div>
              ) : (
                <span className="material-symbols-outlined text-sm">account_circle</span>
              )}
              <span className="truncate max-w-[120px]">{displayName}</span>
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;
