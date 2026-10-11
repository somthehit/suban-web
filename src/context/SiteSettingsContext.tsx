"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { defaultSiteSettings, SiteSettings } from "@/lib/site-settings";

interface SiteSettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  saveSettings: (newSettings?: SiteSettings) => Promise<boolean>;
  resetSettings: () => Promise<boolean>;
  isLoading: boolean;
  isSaving: boolean;
  saveMessage: string | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSiteSettings,
  updateSettings: () => {},
  saveSettings: async () => false,
  resetSettings: async () => false,
  isLoading: true,
  isSaving: false,
  saveMessage: null,
});

const STORAGE_KEY = "suban_site_settings_v1";

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Load from API + localStorage on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        // First try localStorage for instant reactivity
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setSettings((prev) => ({
              ...prev,
              ...parsed,
              brand: { ...prev.brand, ...parsed.brand },
              navigation: { ...prev.navigation, ...parsed.navigation },
              footer: { ...prev.footer, ...parsed.footer },
              social: { ...prev.social, ...parsed.social },
              about: { ...prev.about, ...parsed.about },
              home: { ...prev.home, ...parsed.home },
              payments: {
                ...prev.payments,
                ...(parsed.payments || {}),
                stripe: { ...prev.payments?.stripe, ...(parsed.payments?.stripe || {}) },
                esewa: { ...prev.payments?.esewa, ...(parsed.payments?.esewa || {}) },
                fonepay: { ...prev.payments?.fonepay, ...(parsed.payments?.fonepay || {}) },
                bank: { ...prev.payments?.bank, ...(parsed.payments?.bank || {}) },
                khalti: { ...prev.payments?.khalti, ...(parsed.payments?.khalti || {}) },
              },
              watermark: {
                ...prev.watermark,
                ...(parsed.watermark || {}),
              },
            }));
          } catch (e) {
            console.error("Local storage parse error:", e);
          }
        }

        // Then sync from server API
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          try {
            const data = await res.json();
            if (data.success && data.settings) {
              setSettings(data.settings);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data.settings));
            }
          } catch (jsonErr) {
            console.warn("Failed to parse settings JSON:", jsonErr);
          }
        }
      } catch (err) {
        console.error("Failed to load settings from server:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();

    const handleWatermarkUpdated = (e: any) => {
      if (e?.detail) {
        const wm = e.detail;
        setSettings((prev) => ({
          ...prev,
          watermark: {
            ...prev.watermark,
            enabled: wm.isActive ?? prev.watermark.enabled,
            text: wm.text ?? prev.watermark.text,
            logoUrl: wm.logoUrl !== undefined ? wm.logoUrl : prev.watermark.logoUrl,
            opacity: wm.opacityPercent ?? prev.watermark.opacity,
            position: wm.position ?? prev.watermark.position,
            size: wm.size ?? prev.watermark.size,
            isTiled: wm.isTiled !== undefined ? wm.isTiled : prev.watermark.isTiled,
            margin: wm.margin ?? prev.watermark.margin,
            rotation: wm.rotation ?? prev.watermark.rotation,
            tileCount: wm.tileCount ?? prev.watermark.tileCount,
            fontFamily: wm.fontFamily ?? prev.watermark.fontFamily,
            fontSize: wm.fontSize ?? prev.watermark.fontSize,
            color: wm.color ?? prev.watermark.color,
            blendMode: wm.blendMode ?? prev.watermark.blendMode,
          },
        }));
      }
    };

    window.addEventListener("suban_watermark_updated", handleWatermarkUpdated);
    return () => {
      window.removeEventListener("suban_watermark_updated", handleWatermarkUpdated);
    };
  }, []);

  const updateSettings = (partial: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const merged: SiteSettings = {
        ...prev,
        ...partial,
        brand: { ...prev.brand, ...(partial.brand || {}) },
        navigation: { ...prev.navigation, ...(partial.navigation || {}) },
        footer: { ...prev.footer, ...(partial.footer || {}) },
        social: {
          ...prev.social,
          ...(partial.social || {}),
          customLinks:
            partial.social?.customLinks !== undefined
              ? partial.social.customLinks
              : prev.social.customLinks || [],
        },
        about: { ...prev.about, ...(partial.about || {}) },
        home: { ...prev.home, ...(partial.home || {}) },
        payments: {
          ...prev.payments,
          ...(partial.payments || {}),
          stripe: { ...prev.payments?.stripe, ...(partial.payments?.stripe || {}) },
          esewa: { ...prev.payments?.esewa, ...(partial.payments?.esewa || {}) },
          fonepay: { ...prev.payments?.fonepay, ...(partial.payments?.fonepay || {}) },
          bank: { ...prev.payments?.bank, ...(partial.payments?.bank || {}) },
          khalti: { ...prev.payments?.khalti, ...(partial.payments?.khalti || {}) },
        },
        watermark: {
          ...prev.watermark,
          ...(partial.watermark || defaultSiteSettings.watermark),
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const saveSettings = async (customSettings?: SiteSettings): Promise<boolean> => {
    setIsSaving(true);
    setSaveMessage(null);
    const toSave = customSettings || settings;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
        setSaveMessage("✓ Settings saved and published live!");
        setTimeout(() => setSaveMessage(null), 4000);
        return true;
      } else {
        setSaveMessage("Saved locally (offline mode)");
        setTimeout(() => setSaveMessage(null), 4000);
        return true;
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Saved locally to browser");
      setTimeout(() => setSaveMessage(null), 4000);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        } else {
          setSettings(defaultSiteSettings);
        }
      } else {
        setSettings(defaultSiteSettings);
      }
      setSaveMessage("✓ Reset to defaults completed!");
      setTimeout(() => setSaveMessage(null), 4000);
      return true;
    } catch (err) {
      setSettings(defaultSiteSettings);
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        saveSettings,
        resetSettings,
        isLoading,
        isSaving,
        saveMessage,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
