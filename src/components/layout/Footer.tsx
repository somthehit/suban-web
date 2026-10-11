"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { SocialIcon } from "@/components/ui/SocialIcon";

export function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  // Consolidate all social links (core + custom)
  const socialLinks: Array<{ id: string; platform: string; label: string; url: string }> = [];

  if (settings.social.instagram) {
    socialLinks.push({ id: "instagram", platform: "instagram", label: "Instagram", url: settings.social.instagram });
  }
  if (settings.social.vimeo) {
    socialLinks.push({ id: "vimeo", platform: "vimeo", label: "Vimeo", url: settings.social.vimeo });
  }
  if (settings.social.px500) {
    socialLinks.push({ id: "px500", platform: "px500", label: "500px", url: settings.social.px500 });
  }
  if (settings.social.twitter) {
    socialLinks.push({ id: "twitter", platform: "twitter", label: "X / Twitter", url: settings.social.twitter });
  }
  if (settings.social.youtube) {
    socialLinks.push({ id: "youtube", platform: "youtube", label: "YouTube", url: settings.social.youtube });
  }

  if (Array.isArray(settings.social.customLinks)) {
    settings.social.customLinks.forEach((link) => {
      if (link.enabled !== false && link.url) {
        socialLinks.push({
          id: link.id,
          platform: link.platform || "custom",
          label: link.label || "Link",
          url: link.url,
        });
      }
    });
  }

  const navLinks = settings.navigation?.items || [
    { id: "nav-gallery", label: "Fine Art Gallery", href: "/gallery" },
    { id: "nav-collections", label: "Limited Editions", href: "/collections" },
    { id: "nav-blog", label: "Expedition Journal", href: "/blog" },
    { id: "nav-licensing", label: "Rights & Licensing", href: "/licensing" },
    { id: "nav-about", label: "Studio & Ethics", href: "/about" },
  ];

  return (
    <footer className="w-full mt-24 bg-[#030e07] border-t border-[#00ffcc]/15 text-[#e8e0f0] selection:bg-[#ff2d78] selection:text-[#ffe0ec] transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-14">
          {/* Brand & Protected Archive (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between pr-4 space-y-6">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group inline-flex">
                {settings.brand.logoUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00ffcc]/40 ring-1 ring-[#00ffcc]/20 shrink-0 flex items-center justify-center bg-[#0a2315] group-hover:scale-105 transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={settings.brand.siteName}
                      src={settings.brand.logoUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0a2315] border border-[#00ffcc]/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base text-[#00ffcc]">
                      photo_camera
                    </span>
                  </div>
                )}
                <span className="font-headline font-bold text-sm tracking-widest uppercase text-slate-900 dark:text-[#e8e0f0] group-hover:text-[#00ffcc] transition-colors">
                  {settings.brand.siteName} {settings.brand.slogan ? `— ${settings.brand.slogan}` : ""}
                </span>
              </Link>
              <p className="font-body text-sm text-[#a098b0] leading-relaxed max-w-sm">
                {settings.footer.aboutText}
              </p>
            </div>

            <div className="pt-2">
              <div className="font-label text-xs tracking-wider uppercase text-[#00ffcc] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00ffcc] inline-block shadow-[0_0_6px_#00ffcc] animate-pulse" />
                Watermark Protected Archive
              </div>
              <p className="font-body text-xs text-[#a098b0]/80 max-w-sm leading-relaxed">
                {settings.footer.watermarkNotice}
              </p>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-headline font-semibold text-xs tracking-widest uppercase text-[#e8e0f0]">
              Navigation
            </h4>
            <ul className="space-y-2.5 font-label text-xs tracking-wider uppercase text-[#a098b0]">
              {navLinks.map((item) => (
                <li key={item.id || item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-[#ff2d78] transition-colors inline-block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  className="text-[#a098b0] hover:text-[#00ffcc] transition-colors inline-block"
                >
                  Collector Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Field Dispatch Dispatcher & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-headline font-semibold text-xs tracking-widest uppercase text-[#e8e0f0]">
              {settings.footer.dispatcherTitle}
            </h4>
            <p className="font-body text-xs text-[#a098b0] leading-relaxed">
              {settings.footer.dispatcherDesc}
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a2315] border border-[#1a442a] px-4 py-2.5 rounded-lg text-xs text-[#e8e0f0] placeholder:text-[#a098b0]/50 focus:outline-none focus:border-[#ff2d78] focus:ring-1 focus:ring-[#ff2d78] transition-all"
                  placeholder="collector@domain.com"
                  type="email"
                  required
                />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-xs text-[#a098b0] pointer-events-none">
                  mail
                </span>
              </div>
              <button
                className="px-4 py-2.5 bg-[#103420] hover:bg-[#b3004e] text-[#e8e0f0] hover:text-[#ffe0ec] font-label text-xs tracking-wider uppercase rounded-lg transition-all shadow-[0_0_12px_rgba(255,45,120,0.15)] border border-[#1a442a] hover:border-[#ff2d78] shrink-0"
                type="submit"
              >
                {subscribed ? "Joined ✓" : "Join"}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-[#00ffcc] font-label animate-fade-in">
                Thank you. You have been added to the confidential dispatch list.
              </p>
            )}

            {/* Social Links from Admin Settings */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-[#a098b0]">
              {socialLinks.map((item) => (
                <a
                  key={item.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#081e12] hover:bg-[#103420] text-[#a098b0] hover:text-[#00ffcc] border border-[#163e26]/60 hover:border-[#00ffcc]/40 text-xs font-label uppercase tracking-wider transition-all"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  title={item.label}
                >
                  <SocialIcon platform={item.platform} className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-label text-[#a098b0]/70 border-t border-[#1a442a]/40">
          <div>
            © {new Date().getFullYear()} {settings.brand.copyrightText}
          </div>
          <div className="flex items-center gap-6">
            <span>{settings.brand.hubsText}</span>
            <Link
              className="hover:text-[#e8e0f0] transition-colors"
              href={settings.footer.licenseTermsUrl || "/licensing"}
            >
              Terms of License
            </Link>
            <Link
              className="hover:text-[#e8e0f0] transition-colors"
              href={settings.footer.privacyUrl || "/about"}
            >
              Privacy Protocol
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
