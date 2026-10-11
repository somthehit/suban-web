"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

type GatewayType = "stripe" | "esewa" | "khalti" | "wire";
type CurrencyType = "USD" | "NPR";

interface OrderResult {
  orderNumber: string;
  id: string;
  totalAmount: number;
  currency: string;
  discountLabel: string | null;
  downloadToken: string;
  downloadExpiresAt: string;
}

const CONSERVATION_PCT = 0.1;

function CheckoutFormContent() {
  const searchParams = useSearchParams();
  const { settings } = useSiteSettings();
  const paymentConfig = settings?.payments;
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    currency: cartCurrency,
    setCurrency: setCartCurrency,
  } = useCart();

  // ── Form fields ───────────────────────────────────────────────────────────
  const [gateway, setGateway] = useState<GatewayType>("stripe");
  const [currency, setCurrency] = useState<CurrencyType>(cartCurrency || "USD");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [jurisdiction, setJurisdiction] = useState("NP");
  const [agreementChecked, setAgreementChecked] = useState(false);

  // Sync currency from cart
  useEffect(() => {
    if (cartCurrency && (cartCurrency === "USD" || cartCurrency === "NPR")) {
      setCurrency(cartCurrency);
    }
  }, [cartCurrency]);

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // eSewa
  const [esewaNumber, setEsewaNumber] = useState("");

  // Khalti
  const [khaltiNumber, setKhaltiNumber] = useState("");
  const [khaltiPin, setKhaltiPin] = useState("");

  // Promo / discount
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<
    | { status: "idle" }
    | { status: "checking" }
    | { status: "valid"; discountAmount: number; discountLabel: string; discountValue: number; discountType: string }
    | { status: "invalid"; message: string }
  >({ status: "idle" });

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  // ── Derived prices from cart ───────────────────────────────────────────────
  const baseAmount = cartItems.reduce((sum, item) => {
    const itemPrice = currency === "USD" ? item.priceUsd : item.priceNpr;
    return sum + itemPrice * (item.quantity || 1);
  }, 0);
  const discountAmount = promoState.status === "valid" ? promoState.discountAmount : 0;
  const conservationAmount = parseFloat(
    (Math.max(0, baseAmount - discountAmount) * CONSERVATION_PCT).toFixed(2)
  );
  const totalAmount = parseFloat(Math.max(0, baseAmount - discountAmount).toFixed(2));

  // ── Gateway change ────────────────────────────────────────────────────────
  const handleGatewayChange = (g: GatewayType) => {
    setGateway(g);
    if (g === "esewa" || g === "khalti") {
      setCurrency("NPR");
      setCartCurrency("NPR");
    } else {
      setCurrency("USD");
      setCartCurrency("USD");
    }
  };

  // ── Currency change ───────────────────────────────────────────────────────
  const handleCurrencyChange = (c: CurrencyType) => {
    setCurrency(c);
    setCartCurrency(c);
    // Re-validate promo if active
    if (promoState.status === "valid" && promoCode) {
      setPromoState({ status: "idle" });
    }
  };

  // ── Promo code validation ─────────────────────────────────────────────────
  const handleApplyPromo = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    setPromoState({ status: "checking" });
    try {
      const res = await fetch(
        `/api/discount?code=${encodeURIComponent(code)}&amount=${baseAmount}&currency=${currency}`
      );
      const data = await res.json().catch(() => null);
      if (data && data.success && data.valid) {
        setPromoState({
          status: "valid",
          discountAmount: data.discountAmount,
          discountLabel: data.label,
          discountValue: data.discountValue,
          discountType: data.discountType,
        });
      } else {
        setPromoState({ status: "invalid", message: (data && data.message) || "Invalid code." });
      }
    } catch {
      setPromoState({ status: "invalid", message: "Could not verify code. Try again." });
    }
  }, [promoCode, baseAmount, currency]);

  // ── Form validation ───────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (cartItems.length === 0)
      return "Your cart is empty. Please add items before checking out.";
    if (!fullName.trim()) return "Please enter your legal name.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    if (!agreementChecked)
      return "Please accept the SUBAN Ethical Conservation and Master License terms.";
    if (gateway === "stripe") {
      if (cardNumber.replace(/\s/g, "").length < 12) return "Please enter a valid card number.";
      if (!cardExp.trim()) return "Please enter the card expiration date.";
      if (!cardCvc.trim()) return "Please enter the CVC / security code.";
    }
    if (gateway === "esewa" && !esewaNumber.trim())
      return "Please enter your eSewa mobile number or ID.";
    if (gateway === "khalti") {
      if (!khaltiNumber.trim()) return "Please enter your Khalti registered number.";
      if (!khaltiPin.trim()) return "Please enter your Transaction MPIN.";
    }
    return null;
  };

  // ── Submit checkout ───────────────────────────────────────────────────────
  const handleAuthorizePayment = async () => {
    setFormError(null);
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setIsProcessing(true);
    try {
      // Build gateway payload (non-sensitive — never send raw card data to own API in prod)
      let gatewayPayload: Record<string, any> = {};
      if (gateway === "stripe") {
        gatewayPayload = {
          cardLast4: cardNumber.replace(/\s/g, "").slice(-4),
          cardExp,
        };
      } else if (gateway === "esewa") {
        gatewayPayload = { esewaId: esewaNumber };
      } else if (gateway === "khalti") {
        gatewayPayload = { khaltiNumber };
      }

      const idempotencyKey = `CHK-${email.trim().toLowerCase()}-${Date.now()}`;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: fullName.trim(),
          customerEmail: email.trim().toLowerCase(),
          organization: organization.trim(),
          jurisdiction,
          currency,
          gateway,
          promoCode: promoState.status === "valid" ? promoCode.trim() : "",
          idempotencyKey,
          items: cartItems.map((item) => ({
            productId: item.id,
            title: `${item.title}${item.subtitle ? ` — ${item.subtitle}` : ""}`,
            amount: (currency === "USD" ? item.priceUsd : item.priceNpr) * (item.quantity || 1),
            currency,
            quantity: item.quantity || 1,
          })),
          gatewayPayload,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.order) {
        clearCart();
        setOrderResult({
          orderNumber: data.order.orderNumber,
          id: data.order.id,
          totalAmount: data.order.totalAmount,
          currency: data.order.currency,
          discountLabel: data.order.discountLabel,
          downloadToken: data.downloadToken,
          downloadExpiresAt: data.downloadExpiresAt,
        });
      } else {
        setFormError(
          (data && data.error) ||
            `Payment could not be processed (Server error ${res.status}). Please try again.`
        );
      }
    } catch (e: any) {
      console.error("Checkout error:", e);
      setFormError("Network error — please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Format card number ────────────────────────────────────────────────────
  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExp = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (orderResult) {
    const expiryStr = new Date(orderResult.downloadExpiresAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return (
      <div className="flex flex-col w-full min-h-screen font-body antialiased bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] items-center justify-center px-4 py-16 transition-colors">
        <div className="max-w-xl w-full card-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
          {/* Green success bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-[#00e6b3] to-tertiary" />

          <div className="p-8 sm:p-10 flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-secondary/15 border border-secondary/30 flex items-center justify-center shadow-[0_0_32px_rgba(0,255,204,0.2)]">
              <span className="material-symbols-outlined text-4xl text-secondary">cloud_done</span>
            </div>

            {/* Headline */}
            <div>
              <p className="font-label text-xs uppercase tracking-widest text-secondary font-semibold mb-2">
                ✦ Payment Authorized & Verified
              </p>
              <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface dark:text-[#e8e0f0] tracking-tight">
                R2 Vault Token Generated
              </h1>
              <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0] mt-2 leading-relaxed">
                Your cryptographically signed master asset download link has been dispatched to{" "}
                <strong className="text-on-surface dark:text-[#e8e0f0]">{email}</strong>.
              </p>
            </div>

            {/* Order details */}
            <div className="w-full space-y-3 bg-surface-container/60 dark:bg-[#0a2416] rounded-xl p-5 border border-outline-variant/30 text-left">
              <div className="flex justify-between items-center text-xs font-label">
                <span className="text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Order Reference</span>
                <span className="font-mono font-bold text-secondary">{orderResult.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-label">
                <span className="text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Amount Charged</span>
                <span className="font-bold text-on-surface dark:text-[#e8e0f0]">
                  {orderResult.currency === "USD"
                    ? `$${Number(orderResult.totalAmount).toFixed(2)} USD`
                    : `रु ${Number(orderResult.totalAmount).toLocaleString()} NPR`}
                </span>
              </div>
              {orderResult.discountLabel && (
                <div className="flex justify-between items-center text-xs font-label text-secondary">
                  <span className="uppercase tracking-wider">Promo Applied</span>
                  <span className="font-semibold">{orderResult.discountLabel}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs font-label">
                <span className="text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Download Token</span>
                <span className="font-mono text-[10px] text-tertiary font-bold truncate max-w-[160px]">
                  {orderResult.downloadToken}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-label">
                <span className="text-on-surface-variant dark:text-[#a098b0] uppercase tracking-wider">Token Expires</span>
                <span className="text-[#ff2d78] font-semibold">{expiryStr}</span>
              </div>
            </div>

            {/* What's included */}
            <div className="w-full space-y-2 text-xs font-body text-on-surface-variant dark:text-[#a098b0]">
              {[
                "16-Bit ProPhoto TIFF + RAW master files",
                "C2PA cryptographic license certificate (PDF)",
                "Studio 3D LUT color profile",
                "Dispatch email with Cloudflare R2 signed link",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm shrink-0">check_circle</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <Link
                href="/gallery"
                className="flex-1 text-center px-5 py-3 rounded-xl card-surface border border-outline-variant/30 text-secondary font-label text-xs uppercase tracking-widest font-semibold hover:bg-surface-container transition-all"
              >
                ← Return to Gallery
              </Link>
              <Link
                href={`/account`}
                className="flex-1 text-center px-5 py-3 rounded-xl bg-secondary text-[#001a1a] font-label text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-all shadow-md"
              >
                View in My Account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main checkout UI ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full min-h-screen font-body antialiased bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] transition-colors duration-200">
      <main className="w-full min-h-screen">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">

          {/* Breadcrumb & Stepper */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <Link
                className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant hover:text-secondary transition-colors"
                href="/gallery"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Return to Gallery
              </Link>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-label uppercase tracking-widest text-[#ff2d78] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2d78] animate-pulse shadow-[0_0_8px_#ff2d78]" />
                Secure Checkout
              </span>
            </div>

            {/* Flow Stepper */}
            <div className="flex items-center gap-2 sm:gap-4 font-label text-xs tracking-wider">
              <div className="flex items-center gap-2 text-secondary font-semibold">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/30">✓</span>
                <span className="hidden sm:inline">Review</span>
              </div>
              <span className="text-outline-variant text-[10px]">━━</span>
              <div className="flex items-center gap-2 text-[#ff2d78] font-medium">
                <span className="w-5 h-5 rounded-full bg-[#ff2d78] text-white flex items-center justify-center text-[10px] font-bold shadow-[0_0_10px_rgba(255,45,120,0.5)]">2</span>
                <span>License &amp; Pay</span>
              </div>
              <span className="text-outline-variant text-[10px]">━━</span>
              <div className="flex items-center gap-2 text-on-surface-variant/60">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] card-surface text-on-surface-variant border border-outline-variant/40">3</span>
                <span className="hidden sm:inline">R2 Vault Dispatch</span>
              </div>
            </div>
          </div>

          {/* Main grid / Empty state */}
          {cartItems.length === 0 ? (
            <div className="py-20 text-center max-w-lg mx-auto space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-[#122e1f]/60 border border-[#00ffcc]/30 mx-auto flex items-center justify-center text-[#00ffcc] shadow-[0_0_30px_rgba(0,255,204,0.15)]">
                <span className="material-symbols-outlined text-4xl">shopping_cart</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-headline font-bold text-2xl text-on-surface dark:text-[#e8e0f0]">
                  Your Collection Cart is Empty
                </h2>
                <p className="font-body text-sm text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                  You don&apos;t have any photographic master licenses or limited fine art prints in your cart to checkout.
                  Please browse our gallery or editions shop to select specimens before proceeding.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/gallery"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#008769] hover:bg-[#007056] text-white font-label text-xs uppercase tracking-wider font-semibold transition-all shadow-md"
                >
                  Explore Wildlife Gallery
                </Link>
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl card-surface hover:bg-surface-container text-[#00ffcc] border border-[#00ffcc]/30 font-label text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Shop Limited Editions
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* ── LEFT: Checkout Form (7 cols) ── */}
              <div className="lg:col-span-7 space-y-8">

              {/* Title */}
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full font-label text-[10px] uppercase tracking-[0.2em] text-secondary bg-secondary/15 border border-secondary/25 font-semibold mb-3">
                  <span className="material-symbols-outlined text-xs">verified_user</span>
                  Cryptographically Signed Archival Acquisition
                </div>
                <h1 className="font-headline font-extrabold text-2xl sm:text-3xl lg:text-4xl text-on-surface dark:text-[#e8e0f0] tracking-tight leading-tight">
                  SECURE CHECKOUT &{" "}
                  <span className="text-[#ff2d78]">INSTANT </span>
                  <span className="text-secondary">ASSET LICENSING</span>
                </h1>
                <p className="font-body text-xs sm:text-sm text-on-surface-variant dark:text-[#a098b0] mt-2 leading-relaxed">
                  Acquiring high-bitrate master RAW/TIFF assets equipped with immutable C2PA provenance registry and authentic expedition metadata.
                </p>
              </div>

              {/* ── SECTION 01: Licensee Details ── */}
              <div className="rounded-xl p-6 sm:p-7 card-surface border border-outline-variant/30 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary font-label text-xs font-bold bg-secondary/15 border border-secondary/25">01</span>
                    <h2 className="font-headline font-semibold text-sm sm:text-base uppercase tracking-wider text-on-surface dark:text-[#e8e0f0]">Licensee &amp; Provenance Details</h2>
                  </div>
                  <span className="font-label text-[10px] text-secondary uppercase tracking-widest flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">lock</span> 256-Bit TLS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium" htmlFor="full-name">
                      Legal Entity / Full Name <span className="text-[#ff2d78]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="full-name"
                        type="text"
                        placeholder="Legal Licensee Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-secondary text-sm">badge</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium" htmlFor="billing-email">
                      Vault Delivery &amp; C2PA Dispatch Email <span className="text-[#ff2d78]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="billing-email"
                        type="email"
                        placeholder="curator@agency.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-secondary text-sm">mail_lock</span>
                    </div>
                    <p className="font-body text-[11px] text-on-surface-variant/70 dark:text-[#a098b0]/70 mt-1.5">
                      Signed Cloudflare R2 download tokens &amp; cryptographic certificate will be dispatched here.
                    </p>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium" htmlFor="publication-name">
                      Organization / Publication <span className="text-on-surface-variant/50 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      id="publication-name"
                      type="text"
                      placeholder="e.g. National Geographic, BBC Earth"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>

                  {/* Jurisdiction */}
                  <div>
                    <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium" htmlFor="billing-country">
                      Jurisdiction / Tax Territory
                    </label>
                    <div className="relative">
                      <select
                        id="billing-country"
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-secondary appearance-none cursor-pointer"
                      >
                        <option value="NP">Nepal (NPR रु Recommended)</option>
                        <option value="US">United States (USD $)</option>
                        <option value="GB">United Kingdom (GBP £)</option>
                        <option value="EU">European Union (EUR €)</option>
                        <option value="JP">Japan (JPY ¥)</option>
                        <option value="SG">Singapore (SGD $)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 02: Licensing Contract ── */}
              <div className="rounded-xl p-6 sm:p-7 card-surface border border-outline-variant/30 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary font-label text-xs font-bold bg-secondary/15 border border-secondary/25">02</span>
                  <h2 className="font-headline font-semibold text-sm sm:text-base uppercase tracking-wider text-on-surface dark:text-[#e8e0f0]">Licensing Contract Affirmation</h2>
                </div>

                <div className="p-4 rounded-lg space-y-3 mb-4 text-xs font-body text-on-surface-variant dark:text-[#a098b0] leading-relaxed bg-surface-container/50 border border-outline-variant/30">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">verified</span>
                    <span>
                      <strong className="text-on-surface dark:text-[#e8e0f0]">Single-Seat Extended Commercial Scope:</strong>{" "}
                      Includes perpetual global rights across OOH billboards, editorial covers, multi-channel streaming promos, and unlimited digital impressions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#ff2d78] text-base shrink-0 mt-0.5">block</span>
                    <span className="text-on-surface dark:text-[#e8e0f0]">
                      <strong>Strict Non-Permitted Usage:</strong> Resale as decentralized tokens/NFTs, sub-licensing to stock catalogs, or training generative AI models is legally barred under C2PA license watermark.
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input
                    checked={agreementChecked}
                    className="mt-1 h-4 w-4 rounded accent-secondary transition cursor-pointer"
                    id="license-agreement-chk"
                    type="checkbox"
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                  />
                  <span className="font-body text-xs text-on-surface dark:text-[#e8e0f0] leading-normal group-hover:text-secondary transition-colors">
                    I agree to the{" "}
                    <span className="text-secondary underline decoration-secondary/40 underline-offset-2">SUBAN Ethical Conservation Charter</span>{" "}
                    &amp; Master Commercial License terms. I confirm attribution as{" "}
                    <em>&ldquo;Photo: SUBAN Wildlife Conservation Archive&rdquo;</em>{" "}
                    where editorial layout permits.
                  </span>
                </label>
              </div>

              {/* ── SECTION 03: Payment Gateway ── */}
              <div className="rounded-xl p-6 sm:p-7 card-surface border border-outline-variant/30 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[#ff2d78] font-label text-xs font-bold bg-[#ff2d78]/15 border border-[#ff2d78]/25">03</span>
                    <h2 className="font-headline font-semibold text-sm sm:text-base uppercase tracking-wider text-on-surface dark:text-[#e8e0f0]">Select Payment Gateway</h2>
                  </div>
                  <span className="font-label text-[11px] text-on-surface-variant dark:text-[#a098b0] flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_currentColor]" />
                    Multi-Currency Instant Clearing
                  </span>
                </div>

                {/* Gateway Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {[
                    { id: "stripe" as GatewayType, icon: "credit_card", label: "Card / Stripe", sub: "Global • Apple Pay", color: "secondary" },
                    { id: "esewa" as GatewayType, icon: null, label: "eSewa Wallet", sub: "Nepal Digital Pay", color: "#60bb46" },
                    { id: "khalti" as GatewayType, icon: null, label: "Khalti Pay", sub: "M-Banking & ID", color: "#a855f7" },
                    { id: "wire" as GatewayType, icon: "account_balance", label: "Bank / Swift", sub: "Fonepay & Wire", color: "secondary" },
                  ].map((g) => {
                    const active = gateway === g.id;
                    const c = g.color === "secondary" ? "var(--color-secondary,#00ffcc)" : g.color;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGatewayChange(g.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-all text-center card-surface border cursor-pointer ${active ? "ring-1" : "hover:text-on-surface border-outline-variant/40"}`}
                        style={active ? { borderColor: c, boxShadow: `0 0 12px ${c}30`, color: c, outlineColor: c } : {}}
                      >
                        {g.icon ? (
                          <span className="material-symbols-outlined text-lg">{g.icon}</span>
                        ) : g.id === "esewa" ? (
                          <div className="w-5 h-5 rounded-full bg-[#60bb46] text-white flex items-center justify-center font-headline font-black text-[10px]">e</div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#5c2d91] text-white flex items-center justify-center font-headline font-black text-[9px]">K</div>
                        )}
                        <span className="font-label text-[11px] font-semibold tracking-wider uppercase">{g.label}</span>
                        <span className="text-[9px] font-body text-on-surface-variant">{g.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stripe Panel */}
                {gateway === "stripe" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant dark:text-[#a098b0]">Cardholder Transaction Details</span>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        {["VISA", "MASTERCARD", "AMEX"].map((b) => (
                          <span key={b} className="text-[10px] font-label px-2 py-0.5 rounded font-medium bg-surface-container border border-outline-variant/30">{b}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">Card Number</label>
                      <div className="relative">
                        <input
                          className="w-full px-4 py-3 rounded-lg text-sm font-label text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#ff2d78] transition-all tracking-wider"
                          placeholder="4242 •••• •••• 4242"
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        />
                        <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-secondary text-sm">credit_card</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">Expiration</label>
                        <input
                          className="w-full px-4 py-3 rounded-lg text-sm font-label text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#ff2d78] transition-all"
                          placeholder="MM / YY"
                          type="text"
                          inputMode="numeric"
                          value={cardExp}
                          onChange={(e) => setCardExp(formatExp(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">CVC / Security Code</label>
                        <div className="relative">
                          <input
                            className="w-full px-4 py-3 rounded-lg text-sm font-label text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#ff2d78] transition-all tracking-widest"
                            maxLength={4}
                            placeholder="CVC"
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          />
                          <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-on-surface-variant text-sm">help_outline</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg flex items-center justify-between text-xs text-on-surface-variant dark:text-[#a098b0] bg-surface-container/50 border border-outline-variant/30">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">shield</span>
                        Stripe Elements PCI-DSS Level 1 Encrypted
                      </span>
                      <span className="font-label text-[10px] text-secondary font-semibold">Tokenized</span>
                    </div>
                  </div>
                )}

                {/* eSewa Panel */}
                {gateway === "esewa" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container/50 border border-outline-variant/30 border-l-4 border-l-[#60bb46]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-[#60bb46]">eSewa Digital Wallet Checkout</span>
                          <span className="px-2 py-0.5 bg-[#60bb46]/20 text-[#60bb46] rounded text-[10px] font-label font-bold">Official Merchant</span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0]">
                          Merchant ID: <span className="font-label text-on-surface dark:text-[#e8e0f0] font-semibold">SUBAN_WILDLIFE_NPR_01</span>
                        </p>
                        <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0]">
                          Amount: <strong className="text-on-surface dark:text-[#e8e0f0]">रु {totalAmount.toLocaleString()} NPR</strong>
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg text-right bg-surface-container border border-outline-variant/30">
                        <span className="block text-[10px] font-label uppercase text-on-surface-variant dark:text-[#a098b0]">Fixed Conversion</span>
                        <span className="font-label text-xs font-bold text-secondary">1 USD = 133.33 NPR</span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1.5 font-medium">
                        eSewa Mobile Number / eSewa ID
                      </label>
                      <div className="relative">
                        <input
                          className="w-full px-4 py-3 rounded-lg text-sm font-label text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#60bb46]"
                          placeholder="98XXXXXXXX / esewa_id"
                          type="text"
                          value={esewaNumber}
                          onChange={(e) => setEsewaNumber(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-[#60bb46] text-sm">phone_iphone</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg text-xs text-on-surface-variant dark:text-[#a098b0] flex items-center gap-2 bg-surface-container/50 border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[#60bb46] text-sm">qr_code_scanner</span>
                      <span>QR code scan prompt will also be presented during gateway modal redirection.</span>
                    </div>
                  </div>
                )}

                {/* Khalti Panel */}
                {gateway === "khalti" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container/50 border border-outline-variant/30 border-l-4 border-l-[#a855f7]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-[#a855f7]">Khalti Instant Pay</span>
                          <span className="px-2 py-0.5 bg-[#a855f7]/20 text-[#a855f7] rounded text-[10px] font-label font-bold">Direct API</span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0]">Integrated M-Banking, ConnectIPS &amp; Khalti balance.</p>
                        <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0]">
                          Amount: <strong className="text-on-surface dark:text-[#e8e0f0]">रु {totalAmount.toLocaleString()} NPR</strong>
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[#a855f7] text-2xl">account_balance_wallet</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1 font-medium">Khalti Registered Number</label>
                        <input
                          className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                          placeholder="980XXXXXXX"
                          type="text"
                          value={khaltiNumber}
                          onChange={(e) => setKhaltiNumber(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] mb-1 font-medium">Transaction MPIN</label>
                        <input
                          className="w-full px-4 py-3 rounded-lg text-sm text-on-surface dark:text-[#e8e0f0] card-surface border border-outline-variant/40 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                          maxLength={6}
                          placeholder="••••••"
                          type="password"
                          value={khaltiPin}
                          onChange={(e) => setKhaltiPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Wire & Fonepay Panel */}
                {gateway === "wire" && (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-xl space-y-3 text-xs font-body bg-surface-container/50 border border-outline-variant/30">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-semibold text-secondary">
                          Direct Bank Remittance &amp; Fonepay All-Bank QR
                        </span>
                        <span className="font-label text-[10px] text-tertiary font-bold px-2 py-0.5 rounded bg-tertiary/10 border border-tertiary/20">
                          Immediate Holds Verified
                        </span>
                      </div>
                      <p className="text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                        {paymentConfig?.bank?.instructions ||
                          "For corporate licenses needing official tax invoice with PAN/VAT documentation. A temporary download hold token is emitted until remittance confirmation."}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-label text-[11px]">
                        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                          <span className="text-on-surface-variant dark:text-[#a098b0] block text-[10px] uppercase">BANK NAME</span>
                          <span className="text-on-surface dark:text-[#e8e0f0] font-semibold text-xs">
                            {paymentConfig?.bank?.bankName || "Standard Chartered Bank Nepal"}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                          <span className="text-on-surface-variant dark:text-[#a098b0] block text-[10px] uppercase">ACCOUNT HOLDER</span>
                          <span className="text-on-surface dark:text-[#e8e0f0] font-semibold text-xs">
                            {paymentConfig?.bank?.accountName || "SUBAN Wildlife Archive Pvt. Ltd."}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                          <span className="text-on-surface-variant dark:text-[#a098b0] block text-[10px] uppercase">ACCOUNT NUMBER</span>
                          <span className="text-secondary font-mono font-bold text-xs">
                            {paymentConfig?.bank?.accountNumber || "01-2948201-01"}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30">
                          <span className="text-on-surface-variant dark:text-[#a098b0] block text-[10px] uppercase">SWIFT / BIC &amp; ROUTING</span>
                          <span className="text-on-surface dark:text-[#e8e0f0] font-mono font-semibold text-xs">
                            {paymentConfig?.bank?.swiftCode || "SCBLNPKA"}{" "}
                            {paymentConfig?.bank?.routingNumber ? `• ${paymentConfig.bank.routingNumber}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Fonepay QR or Bank QR if configured */}
                      {(paymentConfig?.fonepay?.qrImageUrl || paymentConfig?.bank?.qrImageUrl) && (
                        <div className="mt-3 p-3.5 rounded-lg bg-[#05140d] border border-[#1b3d2a] flex items-center gap-4">
                          <div className="w-20 h-20 bg-white p-1 rounded-md shrink-0 border border-white/20 shadow-md flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={paymentConfig?.fonepay?.qrImageUrl || paymentConfig?.bank?.qrImageUrl}
                              alt="Scan & Pay QR"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="font-headline font-bold text-xs text-[#00ffcc] block">
                              Fonepay &amp; Mobile Banking Scan &amp; Pay
                            </span>
                            <span className="text-[11px] text-[#a098b0] block">
                              Merchant:{" "}
                              <strong className="text-[#e8e0f0]">
                                {paymentConfig?.fonepay?.merchantName || "SUBAN Wildlife Conservation"}
                              </strong>{" "}
                              ({paymentConfig?.fonepay?.merchantCode || "FP-SUB-2026-NEPAL"})
                            </span>
                            <p className="text-[10px] text-[#a098b0]">
                              Open any Nepali Mobile Banking app, tap <strong>Scan QR</strong>, and specify your Order Reference in the Remarks.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Promo Code */}
                <div className="pt-5 border-t border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      className={`w-full px-4 py-2.5 rounded-lg text-xs font-label text-on-surface dark:text-[#e8e0f0] card-surface border placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 uppercase tracking-wider transition-all ${
                        promoState.status === "valid"
                          ? "border-secondary focus:ring-secondary"
                          : promoState.status === "invalid"
                          ? "border-[#ff2d78] focus:ring-[#ff2d78]"
                          : "border-outline-variant/40 focus:ring-secondary"
                      }`}
                      id="discount-input"
                      placeholder="Conservation Token / Promo (e.g. BARDIA25)"
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (promoState.status !== "idle") setPromoState({ status: "idle" });
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                    <span className={`material-symbols-outlined absolute right-3 top-2.5 text-sm ${promoState.status === "valid" ? "text-secondary" : promoState.status === "invalid" ? "text-[#ff2d78]" : "text-on-surface-variant"}`}>
                      {promoState.status === "valid" ? "check_circle" : promoState.status === "invalid" ? "cancel" : "confirmation_number"}
                    </span>
                  </div>
                  <button
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg card-surface hover:bg-surface-container text-secondary font-label text-xs uppercase tracking-wider font-semibold transition-all border border-secondary/30 cursor-pointer disabled:opacity-50"
                    type="button"
                    disabled={promoState.status === "checking" || !promoCode.trim()}
                    onClick={handleApplyPromo}
                  >
                    {promoState.status === "checking" ? "Checking..." : "Apply"}
                  </button>
                </div>

                {/* Promo feedback */}
                {promoState.status === "valid" && (
                  <div className="text-[11px] font-label text-secondary flex items-center gap-1.5 mt-2 font-semibold">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    {promoState.discountLabel} — saving {promoState.discountType === "percentage" ? `${promoState.discountValue}%` : `${currency} ${promoState.discountAmount}`} on this order
                  </div>
                )}
                {promoState.status === "invalid" && (
                  <div className="text-[11px] font-label text-[#ff2d78] flex items-center gap-1.5 mt-2 font-semibold">
                    <span className="material-symbols-outlined text-xs">cancel</span>
                    {promoState.message}
                  </div>
                )}

                {/* Form error */}
                {formError && (
                  <div className="mt-4 p-4 rounded-xl bg-[#ff2d78]/10 border border-[#ff2d78]/30 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#ff2d78] text-lg shrink-0 mt-0.5">error</span>
                    <p className="font-body text-xs text-[#ff2d78] leading-relaxed">{formError}</p>
                  </div>
                )}

                {/* ── CTA BUTTON ── */}
                <div className="pt-6">
                  <button
                    className="w-full py-4 px-6 rounded-xl text-white font-headline font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 transform active:scale-[0.99] flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-[#ff2d78] hover:bg-[#b3004e] shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    disabled={isProcessing}
                    id="pay-submit-btn"
                    type="button"
                    onClick={handleAuthorizePayment}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="font-headline font-bold text-xs uppercase tracking-widest text-white">Generating Cryptographic Token...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">enhanced_encryption</span>
                          <span>AUTHORIZE &amp; UNLOCK MASTER ASSETS</span>
                        </div>
                        <span className="hidden sm:inline opacity-60">|</span>
                        <span className="font-label text-xs sm:text-sm tracking-widest font-normal">
                          {currency === "USD"
                            ? `$${totalAmount.toFixed(2)} USD`
                            : `रु ${totalAmount.toLocaleString()} NPR`}
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-center font-label text-[11px] text-on-surface-variant/70 dark:text-[#a098b0]/70 mt-2.5 flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Instant automated Cloudflare R2 signed token issued upon payment
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { icon: "verified_user", color: "text-secondary", label: "256-Bit SSL", sub: "Bank-Grade Encryption" },
                  { icon: "check_circle", color: "text-[#60bb46]", label: "eSewa & Stripe", sub: "Direct Gateways" },
                  { icon: "cloud_done", color: "text-[#ff2d78]", label: "R2 Vault Link", sub: "Zero Compression Loss" },
                  { icon: "fingerprint", color: "text-tertiary", label: "C2PA Verified", sub: "Cryptographic Provenance" },
                ].map((b) => (
                  <div key={b.label} className="p-3 rounded-lg flex items-center gap-2.5 card-surface border border-outline-variant/30 shadow-sm">
                    <span className={`material-symbols-outlined ${b.color} text-lg`}>{b.icon}</span>
                    <div>
                      <div className="font-label text-[10px] uppercase font-bold text-on-surface dark:text-[#e8e0f0]">{b.label}</div>
                      <div className="text-[9px] text-on-surface-variant dark:text-[#a098b0]">{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Order Summary (5 cols) ── */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">

              {/* Order Inclusions Card */}
              <div className="rounded-2xl overflow-hidden shadow-xl card-surface border border-outline-variant/30">
                {/* Header */}
                <div className="p-5 border-b border-outline-variant/30 bg-surface-container/40 flex items-center justify-between">
                  <div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-secondary font-semibold">
                      Your Order Inclusions
                    </span>
                    <h3 className="font-headline font-bold text-lg text-on-surface dark:text-[#e8e0f0] mt-0.5">
                      Cart Review ({totalCount} {totalCount === 1 ? "Item" : "Items"})
                    </h3>
                  </div>
                  <Link
                    href="/cart"
                    className="text-xs font-label text-secondary hover:underline flex items-center gap-1"
                  >
                    <span>Edit Cart</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </Link>
                </div>

                {/* Items List */}
                <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto divide-y divide-outline-variant/20">
                  {cartItems.map((item) => {
                    const itemPrice = currency === "USD" ? item.priceUsd : item.priceNpr;
                    const lineTotal = itemPrice * item.quantity;
                    const formattedLineTotal =
                      currency === "USD" ? `$${lineTotal.toFixed(2)} USD` : `रू ${lineTotal.toLocaleString()} NPR`;

                    return (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3.5 group">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-outline-variant/30 relative">
                          {item.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#a098b0]">
                              <span className="material-symbols-outlined text-xl">photo_camera</span>
                            </div>
                          )}
                          {item.format && (
                            <span className="absolute bottom-0.5 left-0.5 px-1 py-0.2 rounded text-[7px] font-label uppercase font-bold bg-black/80 text-[#00ffcc]">
                              {item.format}
                            </span>
                          )}
                        </div>

                        {/* Title and details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-headline font-semibold text-xs text-on-surface dark:text-[#e8e0f0] truncate">
                              {item.title}
                            </h4>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-on-surface-variant hover:text-[#ff2d78] transition-colors p-0.5 cursor-pointer"
                              title="Remove item from order"
                              aria-label={`Remove ${item.title}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>

                          {item.subtitle && (
                            <p className="text-[10px] font-body text-on-surface-variant dark:text-[#a098b0] truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center rounded-md bg-surface-container/60 border border-outline-variant/30 text-[11px] font-label">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-on-surface-variant hover:text-[#ff2d78] cursor-pointer"
                                title="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="px-2 font-semibold text-on-surface dark:text-[#e8e0f0]">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-on-surface-variant hover:text-[#00ffcc] cursor-pointer"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-headline font-bold text-xs text-secondary">
                              {formattedLineTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 pt-3 space-y-4 border-t border-outline-variant/30">
                  {/* License inclusions */}
                  <ul className="space-y-1.5 text-xs font-body text-on-surface-variant dark:text-[#a098b0]">
                    {[
                      "Worldwide perpetual licensing rights certificate",
                      "Instant cryptographically signed Cloudflare R2 vault link",
                      "PDF Certificate of Authenticity with C2PA digital provenance",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-on-surface dark:text-[#e8e0f0] text-[11px]">
                        <span className="material-symbols-outlined text-secondary text-xs">check_circle</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Currency switcher */}
                  <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="font-label text-xs uppercase tracking-wider text-on-surface-variant dark:text-[#a098b0] font-medium">
                      Billing Denomination:
                    </span>
                    <div className="flex items-center rounded-full p-1 text-[11px] font-label font-medium bg-surface-container border border-outline-variant/30">
                      {(["USD", "NPR"] as CurrencyType[]).map((c) => (
                        <button
                          key={c}
                          className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                            currency === c
                              ? "bg-[#008769] text-white shadow-sm font-semibold"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                          type="button"
                          onClick={() => handleCurrencyChange(c)}
                        >
                          {c === "USD" ? "USD ($)" : "NPR (रु)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ledger */}
                  <div className="space-y-2 pt-2 text-xs font-body text-on-surface-variant dark:text-[#a098b0]">
                    <div className="flex justify-between">
                      <span>Cart Subtotal ({totalCount} items)</span>
                      <span className="font-label font-semibold text-on-surface dark:text-[#e8e0f0]">
                        {currency === "USD" ? `$${baseAmount.toFixed(2)} USD` : `रु ${baseAmount.toLocaleString()} NPR`}
                      </span>
                    </div>

                    {promoState.status === "valid" && (
                      <div className="flex justify-between items-center text-secondary">
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-xs">local_offer</span>
                          Promo Discount ({promoState.discountValue}
                          {promoState.discountType === "percentage" ? "%" : " off"})
                        </span>
                        <span className="font-label font-semibold">
                          − {currency === "USD" ? `$${discountAmount.toFixed(2)}` : `रु ${discountAmount.toLocaleString()}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-secondary">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="material-symbols-outlined text-xs">nature</span>
                        Bardia Tiger Corridor Fund (10%)
                      </span>
                      <span className="font-label font-semibold">
                        {currency === "USD"
                          ? `$${conservationAmount.toFixed(2)} (Included)`
                          : `रु ${conservationAmount.toLocaleString()} (Included)`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span>Cross-Border Digital Export VAT</span>
                      <span className="font-label text-on-surface-variant dark:text-[#a098b0]">$0.00 (0%)</span>
                    </div>

                    {/* Grand Total */}
                    <div className="pt-4 border-t border-outline-variant/30 flex items-baseline justify-between">
                      <div>
                        <span className="font-headline font-bold text-sm uppercase tracking-wider text-on-surface dark:text-[#e8e0f0] block">
                          Total Due
                        </span>
                        <span className="text-[10px] font-label text-on-surface-variant dark:text-[#a098b0]">
                          Guaranteed rate 1 USD = 133.33 NPR
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-headline font-extrabold text-2xl text-[#ff2d78]">
                          {currency === "USD" ? `$${totalAmount.toFixed(2)} USD` : `रु ${totalAmount.toLocaleString()} NPR`}
                        </div>
                        <span className="text-[11px] font-label text-secondary block font-semibold">
                          {currency === "USD"
                            ? `रु ${(totalAmount * 133.33).toLocaleString(undefined, { maximumFractionDigits: 0 })} NPR`
                            : `$${(totalAmount / 133.33).toFixed(2)} USD Equivalent`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conservation mandate */}
              <div className="p-5 rounded-xl space-y-3 card-surface border border-outline-variant/30 border-l-4 border-l-secondary shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-lg">shield_with_heart</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-semibold text-xs uppercase tracking-wider text-on-surface dark:text-[#e8e0f0]">Direct Conservation Mandate</h4>
                    <span className="font-label text-[10px] text-secondary font-semibold">10% Dedicated Deployment</span>
                  </div>
                </div>
                <p className="font-body text-xs text-on-surface-variant dark:text-[#a098b0] leading-relaxed">
                  Every transaction directly equips Ranger Patrol Unit #4 in Thakurdwara, Bardia National Park with solar GPS collars and night-patrol thermals.
                </p>
                <div className="flex items-center gap-2 pt-1 font-label text-[10px] text-secondary font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Verified in partnership with Bardia Community Conservation Trust
                </div>
              </div>

              {/* Delivery notice */}
              <div className="p-4 rounded-xl text-xs font-body text-on-surface-variant dark:text-[#a098b0] space-y-1.5 card-surface border border-outline-variant/30 shadow-sm">
                <div className="flex items-center gap-2 text-on-surface dark:text-[#e8e0f0] font-semibold font-headline">
                  <span className="material-symbols-outlined text-[#ff2d78] text-base">bolt</span>
                  Instant Master Delivery Assurance
                </div>
                <p className="leading-relaxed">
                  Upon payment confirmation, a time-limited 24-hour signed Cloudflare R2 download token is created immediately and dispatched to your billing address along with your tamper-proof C2PA license ledger.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            Initializing Secure Checkout...
          </span>
        </div>
      }
    >
      <CheckoutFormContent />
    </Suspense>
  );
}
