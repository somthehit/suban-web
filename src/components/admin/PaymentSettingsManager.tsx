"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  ArrowUpRight,
  Upload,
  Globe,
  Coins,
} from "lucide-react";
import { PaymentSettings } from "@/lib/site-settings";

interface PaymentSettingsManagerProps {
  payments: PaymentSettings;
  onChange: (updated: PaymentSettings) => void;
  onSave: () => void;
  isSaving: boolean;
  saveMessage: string | null;
}

type SubTab = "all" | "stripe" | "esewa" | "fonepay" | "bank" | "khalti";

export function PaymentSettingsManager({
  payments,
  onChange,
  onSave,
  isSaving,
  saveMessage,
}: PaymentSettingsManagerProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<SubTab>("all");
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showEsewaSecret, setShowEsewaSecret] = useState(false);
  const [showFonepaySecret, setShowFonepaySecret] = useState(false);
  const [showKhaltiSecret, setShowKhaltiSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const updateStripe = (updates: Partial<PaymentSettings["stripe"]>) => {
    onChange({
      ...payments,
      stripe: { ...payments.stripe, ...updates },
    });
  };

  const updateEsewa = (updates: Partial<PaymentSettings["esewa"]>) => {
    onChange({
      ...payments,
      esewa: { ...payments.esewa, ...updates },
    });
  };

  const updateFonepay = (updates: Partial<PaymentSettings["fonepay"]>) => {
    onChange({
      ...payments,
      fonepay: { ...payments.fonepay, ...updates },
    });
  };

  const updateBank = (updates: Partial<PaymentSettings["bank"]>) => {
    onChange({
      ...payments,
      bank: { ...payments.bank, ...updates },
    });
  };

  const updateKhalti = (updates: Partial<PaymentSettings["khalti"]>) => {
    onChange({
      ...payments,
      khalti: { ...payments.khalti, ...updates },
    });
  };

  const activeCount = [
    payments.stripe?.enabled,
    payments.esewa?.enabled,
    payments.fonepay?.enabled,
    payments.bank?.enabled,
    payments.khalti?.enabled,
  ].filter(Boolean).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Top Bar / Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Gateways */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Active Gateways
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#00ffcc]/10 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">
              {activeCount} of 5
            </span>
            <span className="text-xs text-emerald-600 dark:text-[#00ffcc] font-label font-semibold">Enabled</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">Ready to receive customer checkouts</p>
        </div>

        {/* Multi-Currency */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Settlement Currencies
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-[#38bdf8]/10 border border-sky-200 dark:border-[#38bdf8]/30 flex items-center justify-center text-sky-600 dark:text-[#38bdf8]">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">USD &amp; NPR</span>
            <span className="text-xs text-sky-600 dark:text-[#38bdf8] font-label font-semibold">Dual FX</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">Stripe for USD, eSewa/Fonepay for NPR</p>
        </div>

        {/* Instant R2 Dispatch */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-lg relative overflow-hidden group transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-label uppercase tracking-wider text-slate-500 dark:text-[#a098b0]">
              Vault Security
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-[#60bb46]/10 border border-emerald-200 dark:border-[#60bb46]/30 flex items-center justify-center text-emerald-600 dark:text-[#60bb46]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-extrabold text-2xl text-slate-900 dark:text-[#e8e0f0]">Auto-Issue</span>
            <span className="text-xs text-emerald-600 dark:text-[#60bb46] font-label font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#a098b0] mt-1">Signed 24h R2 tokens on verification</p>
        </div>

        {/* Global Save Action */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-[#0e2a1d] dark:to-[#081b12] border border-emerald-200 dark:border-[#00ffcc]/30 shadow-sm dark:shadow-lg flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-label uppercase tracking-wider text-emerald-700 dark:text-[#00ffcc] font-semibold">
              Live Persistence
            </span>
            <span className="material-symbols-outlined text-emerald-600 dark:text-[#00ffcc] text-lg">cloud_done</span>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00ffcc] dark:hover:bg-[#00e6b8] dark:text-[#04120a] font-label text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-md dark:shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving Setup..." : "Save Payment Setup"}</span>
            </button>
            {saveMessage && (
              <p className="text-[11px] font-label text-center text-emerald-600 dark:text-[#00ffcc] mt-1.5 animate-fadeIn font-semibold">
                {saveMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sub-navigation filter pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-[#1b3d2a] pt-1">
        {[
          { id: "all", label: "All Payment Channels", icon: Layers, count: 5 },
          { id: "stripe", label: "Stripe (Global / Cards)", icon: CreditCard, enabled: payments.stripe?.enabled },
          { id: "esewa", label: "eSewa (Nepal Wallet)", icon: Wallet, enabled: payments.esewa?.enabled },
          { id: "fonepay", label: "Fonepay (Interbank QR)", icon: QrCode, enabled: payments.fonepay?.enabled },
          { id: "bank", label: "Bank Transfer / SWIFT", icon: Building2, enabled: payments.bank?.enabled },
          { id: "khalti", label: "Khalti Pay", icon: Globe, enabled: payments.khalti?.enabled },
        ].map((tab) => {
          const isActive = selectedSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedSubTab(tab.id as SubTab)}
              className={`px-4 py-2.5 rounded-xl font-label text-xs uppercase tracking-wider font-semibold flex items-center gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm dark:bg-[#163d27] dark:text-[#00ffcc] dark:border-[#00ffcc]/40 dark:shadow-[0_0_15px_rgba(0,255,204,0.15)]"
                  : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50 dark:bg-[#081b12]/60 dark:text-[#a098b0] dark:border-[#1b3d2a] dark:hover:text-[#e8e0f0] dark:hover:bg-[#0c2419]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.enabled !== undefined && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    tab.enabled
                      ? "bg-emerald-500 dark:bg-[#00ffcc] shadow-[0_0_6px_rgba(16,185,129,0.5)] dark:shadow-[0_0_6px_#00ffcc]"
                      : "bg-slate-300 dark:bg-[#4a5568]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. STRIPE GATEWAY SETUP                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(selectedSubTab === "all" || selectedSubTab === "stripe") && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1b3d2a]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-[#635bff]/15 border border-indigo-200 dark:border-[#635bff]/30 flex items-center justify-center text-[#635bff] shadow-sm dark:shadow-[0_0_15px_rgba(99,91,255,0.2)]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
                    Stripe Payment Gateway
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-[#635bff]/20 dark:text-[#a5a0ff] dark:border-[#635bff]/30">
                    Global / USD
                  </span>
                </div>
                <p className="text-xs font-body text-slate-500 dark:text-[#a098b0] mt-0.5">
                  Accept Visa, Mastercard, American Express, Apple Pay, and Google Pay worldwide.
                </p>
              </div>
            </div>

            {/* Enable toggle & mode */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#05140d] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1b3d2a]">
                <span className="text-[11px] font-label text-slate-500 dark:text-[#a098b0] uppercase">Environment:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateStripe({ mode: payments.stripe?.mode === "live" ? "test" : "live" })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase transition-all cursor-pointer ${
                    payments.stripe?.mode === "live"
                      ? "bg-[#ff2d78] text-white shadow-sm dark:shadow-[0_0_10px_rgba(255,45,120,0.5)]"
                      : "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffe04a] dark:text-[#121c00] font-extrabold"
                  }`}
                >
                  {payments.stripe?.mode === "live" ? "Live Production" : "Test / Sandbox"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => updateStripe({ enabled: !payments.stripe?.enabled })}
                className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
              >
                {payments.stripe?.enabled ? (
                  <ToggleRight className="w-7 h-7 text-emerald-600 dark:text-[#00ffcc]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-[#a098b0]" />
                )}
                <span>{payments.stripe?.enabled ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Publishable Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Publishable Key (Client-Side)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payments.stripe?.publishableKey || ""}
                  onChange={(e) => updateStripe({ publishableKey: e.target.value })}
                  placeholder="pk_test_..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-indigo-500 dark:focus:border-[#00ffcc] focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(payments.stripe?.publishableKey, "stripe-pk")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-600 dark:text-[#a098b0] dark:hover:text-[#00ffcc] cursor-pointer"
                  title="Copy Publishable Key"
                >
                  {copiedKey === "stripe-pk" ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Secret Key (Restricted Server API)
              </label>
              <div className="relative">
                <input
                  type={showStripeSecret ? "text" : "password"}
                  value={payments.stripe?.secretKey || ""}
                  onChange={(e) => updateStripe({ secretKey: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-indigo-500 dark:focus:border-[#00ffcc] focus:outline-none pr-16"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStripeSecret(!showStripeSecret)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#a098b0] dark:hover:text-[#e8e0f0] cursor-pointer"
                  >
                    {showStripeSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.stripe?.secretKey, "stripe-sk")}
                    className="text-slate-400 hover:text-indigo-600 dark:text-[#a098b0] dark:hover:text-[#00ffcc] cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "stripe-sk" ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Webhook Signing Secret
              </label>
              <input
                type="text"
                value={payments.stripe?.webhookSecret || ""}
                onChange={(e) => updateStripe({ webhookSecret: e.target.value })}
                placeholder="whsec_..."
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-indigo-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Default Currency */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Default Settlement Currency
              </label>
              <select
                value={payments.stripe?.currency || "USD"}
                onChange={(e) => updateStripe({ currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-label uppercase text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-indigo-500 dark:focus:border-[#00ffcc] focus:outline-none cursor-pointer"
              >
                <option value="USD">USD — United States Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="AUD">AUD — Australian Dollar (A$)</option>
                <option value="CAD">CAD — Canadian Dollar (C$)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#05140d]/80 border border-slate-200 dark:border-[#1b3d2a] flex items-start gap-3 text-xs text-slate-600 dark:text-[#a098b0]">
            <Info className="w-4 h-4 text-indigo-500 dark:text-[#635bff] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-slate-900 dark:text-[#e8e0f0] font-semibold">Stripe Webhook Endpoint URL</span>
              <p className="font-mono text-[11px] text-indigo-600 dark:text-[#00ffcc]">
                https://yourdomain.com/api/webhooks/stripe
              </p>
              <p>Configure this webhook in your Stripe Dashboard to handle asynchronous payment intents.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. ESEWA DIGITAL WALLET (NEPAL)                             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(selectedSubTab === "all" || selectedSubTab === "esewa") && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1b3d2a]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-[#60bb46]/15 border border-emerald-200 dark:border-[#60bb46]/30 flex items-center justify-center text-emerald-600 dark:text-[#60bb46] shadow-sm dark:shadow-[0_0_15px_rgba(96,187,70,0.2)]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
                    eSewa Mobile Wallet (Nepal)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#60bb46]/20 dark:text-[#60bb46] dark:border-[#60bb46]/30">
                    Nepal NPR रु
                  </span>
                </div>
                <p className="text-xs font-body text-slate-500 dark:text-[#a098b0] mt-0.5">
                  Direct digital wallet settlement across Nepal with automated HMAC-SHA256 signature verification.
                </p>
              </div>
            </div>

            {/* Enable toggle & mode */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#05140d] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1b3d2a]">
                <span className="text-[11px] font-label text-slate-500 dark:text-[#a098b0] uppercase">Environment:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateEsewa({
                      mode: payments.esewa?.mode === "live" ? "test" : "live",
                      merchantCode:
                        payments.esewa?.mode === "live"
                          ? "EPAYTEST"
                          : payments.esewa?.merchantCode || "EPAYTEST",
                      serviceUrl:
                        payments.esewa?.mode === "live"
                          ? "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
                          : "https://epay.esewa.com.np/api/epay/main/v2/form",
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase transition-all cursor-pointer ${
                    payments.esewa?.mode === "live"
                      ? "bg-emerald-600 text-white font-extrabold shadow-sm dark:shadow-[0_0_10px_rgba(96,187,70,0.5)]"
                      : "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffe04a] dark:text-[#121c00] font-extrabold"
                  }`}
                >
                  {payments.esewa?.mode === "live" ? "Live eSewa Production" : "UAT / EPAYTEST"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => updateEsewa({ enabled: !payments.esewa?.enabled })}
                className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
              >
                {payments.esewa?.enabled ? (
                  <ToggleRight className="w-7 h-7 text-emerald-600 dark:text-[#60bb46]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-[#a098b0]" />
                )}
                <span>{payments.esewa?.enabled ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Merchant Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                eSewa Merchant Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payments.esewa?.merchantCode || ""}
                  onChange={(e) => updateEsewa({ merchantCode: e.target.value })}
                  placeholder="EPAYTEST or Live Merchant ID"
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#60bb46] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateEsewa({
                      merchantCode: "EPAYTEST",
                      secretKey: "8gBm/Du7G2n5MtN",
                      mode: "test",
                    })
                  }
                  className="absolute right-2.5 top-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-[#163d27] dark:text-[#00ffcc] text-[10px] font-label font-bold uppercase hover:bg-emerald-200 dark:hover:bg-[#1a4b30] cursor-pointer"
                  title="Load official eSewa test credentials"
                >
                  Reset UAT
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Secret Hash Key (HMAC-SHA256)
              </label>
              <div className="relative">
                <input
                  type={showEsewaSecret ? "text" : "password"}
                  value={payments.esewa?.secretKey || ""}
                  onChange={(e) => updateEsewa({ secretKey: e.target.value })}
                  placeholder="8gBm/Du7G2n5MtN"
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#60bb46] focus:outline-none pr-16"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEsewaSecret(!showEsewaSecret)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#a098b0] dark:hover:text-[#e8e0f0] cursor-pointer"
                  >
                    {showEsewaSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.esewa?.secretKey, "esewa-sk")}
                    className="text-slate-400 hover:text-emerald-600 dark:text-[#a098b0] dark:hover:text-[#60bb46] cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "esewa-sk" ? (
                      <Check className="w-4 h-4 text-emerald-600 dark:text-[#60bb46]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Service Form Endpoint */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                API Form Action Endpoint
              </label>
              <input
                type="text"
                value={
                  payments.esewa?.serviceUrl ||
                  (payments.esewa?.mode === "live"
                    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
                    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form")
                }
                onChange={(e) => updateEsewa({ serviceUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#60bb46] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. FONEPAY / FONPAY INTERBANK QR & GATEWAY                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(selectedSubTab === "all" || selectedSubTab === "fonepay") && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1b3d2a]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-50 dark:bg-[#ff2d78]/15 border border-pink-200 dark:border-[#ff2d78]/30 flex items-center justify-center text-[#ff2d78] shadow-sm dark:shadow-[0_0_15px_rgba(255,45,120,0.2)]">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
                    Fonepay / Fonpay QR Setup
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-pink-50 text-pink-700 border border-pink-200 dark:bg-[#ff2d78]/20 dark:text-[#ff2d78] dark:border-[#ff2d78]/30">
                    Nepal All-Bank QR
                  </span>
                </div>
                <p className="text-xs font-body text-slate-500 dark:text-[#a098b0] mt-0.5">
                  Interbank QR standard supported by 50+ Nepali commercial banks &amp; digital wallets.
                </p>
              </div>
            </div>

            {/* Enable toggle & mode */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#05140d] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1b3d2a]">
                <span className="text-[11px] font-label text-slate-500 dark:text-[#a098b0] uppercase">Environment:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateFonepay({
                      mode: payments.fonepay?.mode === "live" ? "sandbox" : "live",
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase transition-all cursor-pointer ${
                    payments.fonepay?.mode === "live"
                      ? "bg-[#ff2d78] text-white font-extrabold shadow-sm dark:shadow-[0_0_10px_rgba(255,45,120,0.5)]"
                      : "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffe04a] dark:text-[#121c00] font-extrabold"
                  }`}
                >
                  {payments.fonepay?.mode === "live" ? "Live Merchant" : "Sandbox"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => updateFonepay({ enabled: !payments.fonepay?.enabled })}
                className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
              >
                {payments.fonepay?.enabled ? (
                  <ToggleRight className="w-7 h-7 text-[#ff2d78]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-[#a098b0]" />
                )}
                <span>{payments.fonepay?.enabled ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Merchant Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Fonepay Merchant Code
              </label>
              <input
                type="text"
                value={payments.fonepay?.merchantCode || ""}
                onChange={(e) => updateFonepay({ merchantCode: e.target.value })}
                placeholder="e.g. FP-SUB-2026-NEPAL"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#ff2d78] focus:outline-none"
              />
            </div>

            {/* Merchant Registered Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Registered Business / Merchant Name
              </label>
              <input
                type="text"
                value={payments.fonepay?.merchantName || ""}
                onChange={(e) => updateFonepay({ merchantName: e.target.value })}
                placeholder="SUBAN Wildlife Fine Art & Conservation Archive"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#ff2d78] focus:outline-none"
              />
            </div>

            {/* API Secret */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Fonepay API Secret Key
              </label>
              <div className="relative">
                <input
                  type={showFonepaySecret ? "text" : "password"}
                  value={payments.fonepay?.apiSecret || ""}
                  onChange={(e) => updateFonepay({ apiSecret: e.target.value })}
                  placeholder="fonepay_secret_..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#ff2d78] focus:outline-none pr-16"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFonepaySecret(!showFonepaySecret)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#a098b0] dark:hover:text-[#e8e0f0] cursor-pointer"
                  >
                    {showFonepaySecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.fonepay?.apiSecret, "fonepay-sk")}
                    className="text-slate-400 hover:text-[#ff2d78] dark:text-[#a098b0] dark:hover:text-[#ff2d78] cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "fonepay-sk" ? (
                      <Check className="w-4 h-4 text-[#ff2d78]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Fonepay QR Image URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Fonepay Merchant QR Code Image URL
              </label>
              <input
                type="text"
                value={payments.fonepay?.qrImageUrl || ""}
                onChange={(e) => updateFonepay({ qrImageUrl: e.target.value })}
                placeholder="https://.../fonepay-qr.jpg or uploaded storage asset"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#ff2d78] focus:outline-none"
              />
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Customer QR Checkout Instructions
              </label>
              <textarea
                rows={2}
                value={payments.fonepay?.instructions || ""}
                onChange={(e) => updateFonepay({ instructions: e.target.value })}
                placeholder="Instructions displayed on checkout screen for customers scanning the QR code..."
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#ff2d78] focus:outline-none"
              />
            </div>
          </div>

          {/* QR Preview Card */}
          {payments.fonepay?.qrImageUrl && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-white p-1.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/20 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={payments.fonepay.qrImageUrl}
                  alt="Fonepay Merchant QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-headline font-bold text-slate-900 dark:text-[#e8e0f0]">
                  Active Fonepay Merchant QR Live Preview
                </span>
                <p className="text-[11px] text-slate-500 dark:text-[#a098b0]">
                  This QR code will be displayed to customers selecting Fonepay during checkout.
                </p>
                <span className="inline-block text-[10px] font-mono text-emerald-800 bg-emerald-100 dark:text-[#00ffcc] dark:bg-[#163d27] px-2 py-0.5 rounded font-semibold">
                  {payments.fonepay.merchantName || "Verified Merchant"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. BANK TRANSFER & SWIFT WIRE SETTLEMENT                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(selectedSubTab === "all" || selectedSubTab === "bank") && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1b3d2a]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-[#00ffcc]/15 border border-emerald-200 dark:border-[#00ffcc]/30 flex items-center justify-center text-emerald-600 dark:text-[#00ffcc] shadow-sm dark:shadow-[0_0_15px_rgba(0,255,204,0.2)]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
                    Bank Transfer &amp; SWIFT Wire Setup
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-[#00ffcc]/20 dark:text-[#00ffcc] dark:border-[#00ffcc]/30">
                    Corporate Remittance
                  </span>
                </div>
                <p className="text-xs font-body text-slate-500 dark:text-[#a098b0] mt-0.5">
                  Direct commercial banking details for high-tier acquisitions, editorial organizations, and domestic RTGS.
                </p>
              </div>
            </div>

            {/* Enable toggle */}
            <button
              type="button"
              onClick={() => updateBank({ enabled: !payments.bank?.enabled })}
              className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
            >
              {payments.bank?.enabled ? (
                <ToggleRight className="w-7 h-7 text-emerald-600 dark:text-[#00ffcc]" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-[#a098b0]" />
              )}
              <span>{payments.bank?.enabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Bank Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Bank Name
              </label>
              <input
                type="text"
                value={payments.bank?.bankName || ""}
                onChange={(e) => updateBank({ bankName: e.target.value })}
                placeholder="e.g. Standard Chartered Bank Nepal"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Account Holder Legal Name
              </label>
              <input
                type="text"
                value={payments.bank?.accountName || ""}
                onChange={(e) => updateBank({ accountName: e.target.value })}
                placeholder="SUBAN Wildlife Conservation Archive Pvt. Ltd."
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payments.bank?.accountNumber || ""}
                  onChange={(e) => updateBank({ accountNumber: e.target.value })}
                  placeholder="01-2948201-01"
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-emerald-700 dark:text-[#00ffcc] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(payments.bank?.accountNumber, "bank-acc")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600 dark:text-[#a098b0] dark:hover:text-[#00ffcc] cursor-pointer"
                  title="Copy Account Number"
                >
                  {copiedKey === "bank-acc" ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Branch Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Branch Location
              </label>
              <input
                type="text"
                value={payments.bank?.branchName || ""}
                onChange={(e) => updateBank({ branchName: e.target.value })}
                placeholder="Kathmandu Corporate Branch, New Road"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* SWIFT / BIC */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                SWIFT / BIC Code (International)
              </label>
              <input
                type="text"
                value={payments.bank?.swiftCode || ""}
                onChange={(e) => updateBank({ swiftCode: e.target.value })}
                placeholder="SCBLNPKA"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono uppercase text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Routing / Clearing Number */}
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Routing / NCHL Clearing Code
              </label>
              <input
                type="text"
                value={payments.bank?.routingNumber || ""}
                onChange={(e) => updateBank({ routingNumber: e.target.value })}
                placeholder="90123001"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Bank QR Image URL */}
            <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Mobile Banking / Scan &amp; Pay QR Image URL
              </label>
              <input
                type="text"
                value={payments.bank?.qrImageUrl || ""}
                onChange={(e) => updateBank({ qrImageUrl: e.target.value })}
                placeholder="https://.../bank-qr.png or paste image link"
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>

            {/* Instructions */}
            <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Customer Remittance Instructions &amp; Tax Narration
              </label>
              <textarea
                rows={2}
                value={payments.bank?.instructions || ""}
                onChange={(e) => updateBank({ instructions: e.target.value })}
                placeholder="Instructions on including the Order Reference and acquiring official PAN/VAT invoice receipts..."
                className="w-full px-4 py-2.5 rounded-xl text-xs font-body text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-emerald-500 dark:focus:border-[#00ffcc] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. KHALTI DIGITAL WALLET                                    */}
      {/* ─────────────────────────────────────────────────────────── */}
      {(selectedSubTab === "all" || selectedSubTab === "khalti") && (
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#081b12] border border-slate-200 dark:border-[#1b3d2a] shadow-sm dark:shadow-xl space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-[#1b3d2a]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-[#a855f7]/15 border border-purple-200 dark:border-[#a855f7]/30 flex items-center justify-center text-[#a855f7] shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
                    Khalti Mobile Wallet
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 dark:bg-[#a855f7]/20 dark:text-[#a855f7] dark:border-[#a855f7]/30">
                    Nepal NPR रु
                  </span>
                </div>
                <p className="text-xs font-body text-slate-500 dark:text-[#a098b0] mt-0.5">
                  Khalti e-wallet payments via Khalti ID and MPIN confirmation.
                </p>
              </div>
            </div>

            {/* Enable toggle & mode */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#05140d] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1b3d2a]">
                <span className="text-[11px] font-label text-slate-500 dark:text-[#a098b0] uppercase">Environment:</span>
                <button
                  type="button"
                  onClick={() =>
                    updateKhalti({
                      mode: payments.khalti?.mode === "live" ? "test" : "live",
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-label font-bold uppercase transition-all cursor-pointer ${
                    payments.khalti?.mode === "live"
                      ? "bg-purple-600 text-white font-extrabold shadow-sm dark:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                      : "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-[#ffe04a] dark:text-[#121c00] font-extrabold"
                  }`}
                >
                  {payments.khalti?.mode === "live" ? "Live Production" : "Test Sandbox"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => updateKhalti({ enabled: !payments.khalti?.enabled })}
                className="flex items-center gap-2 text-xs font-label uppercase font-bold text-slate-700 dark:text-[#e8e0f0] cursor-pointer"
              >
                {payments.khalti?.enabled ? (
                  <ToggleRight className="w-7 h-7 text-[#a855f7]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-400 dark:text-[#a098b0]" />
                )}
                <span>{payments.khalti?.enabled ? "Enabled" : "Disabled"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Khalti Public Key
              </label>
              <input
                type="text"
                value={payments.khalti?.publicKey || ""}
                onChange={(e) => updateKhalti({ publicKey: e.target.value })}
                placeholder="test_public_key_..."
                className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#a855f7] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-label uppercase tracking-wider text-slate-600 dark:text-[#a098b0] font-medium">
                Khalti Secret Key
              </label>
              <div className="relative">
                <input
                  type={showKhaltiSecret ? "text" : "password"}
                  value={payments.khalti?.secretKey || ""}
                  onChange={(e) => updateKhalti({ secretKey: e.target.value })}
                  placeholder="test_secret_key_..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-mono text-slate-900 dark:text-[#e8e0f0] bg-slate-50 dark:bg-[#05140d] border border-slate-200 dark:border-[#1b3d2a] focus:border-[#a855f7] focus:outline-none pr-16"
                />
                <div className="absolute right-3 top-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowKhaltiSecret(!showKhaltiSecret)}
                    className="text-slate-400 hover:text-slate-700 dark:text-[#a098b0] dark:hover:text-[#e8e0f0] cursor-pointer"
                  >
                    {showKhaltiSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.khalti?.secretKey, "khalti-sk")}
                    className="text-slate-400 hover:text-[#a855f7] dark:text-[#a098b0] dark:hover:text-[#a855f7] cursor-pointer"
                    title="Copy Secret Key"
                  >
                    {copiedKey === "khalti-sk" ? (
                      <Check className="w-4 h-4 text-[#a855f7]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Footer */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 dark:bg-[#081b12]/95 backdrop-blur-md border border-slate-200 dark:border-[#1b3d2a] shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#a098b0]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#00ffcc] animate-pulse" />
          <span>Configured changes will immediately apply to customer checkout.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-[#00ffcc] dark:hover:bg-[#00e6b8] dark:text-[#04120a] font-label text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all shadow-md dark:shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
