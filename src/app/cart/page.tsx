"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    subtotalUsd,
    subtotalNpr,
    currency,
    setCurrency,
  } = useCart();

  const currentSubtotal = currency === "USD" ? subtotalUsd : subtotalNpr;
  const conservationShare = currentSubtotal * 0.1;

  return (
    <div className="w-full min-h-screen bg-background dark:bg-[#04120a] text-on-surface dark:text-[#e8e0f0] transition-colors py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-[#a098b0] mb-2">
              <Link href="/gallery" className="hover:text-[#00ffcc] transition-colors">
                Gallery
              </Link>
              <span>/</span>
              <span className="text-[#ff2d78] font-semibold">Collection Cart</span>
            </div>
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface dark:text-[#e8e0f0] flex items-center gap-3">
              <span>Your Cart</span>
              <span className="text-xs font-label font-bold px-2.5 py-0.5 rounded-full bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_10px_rgba(255,45,120,0.5)]">
                {totalCount} {totalCount === 1 ? "Specimen" : "Specimens"}
              </span>
            </h1>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-label uppercase text-[#a098b0] font-medium">Currency:</span>
            <div className="flex items-center rounded-lg p-1 text-xs font-label bg-surface-container/60 border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded transition-colors ${
                  currency === "USD"
                    ? "bg-[#163d27] text-[#00ffcc] font-semibold shadow-sm"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-3 py-1 rounded transition-colors ${
                  currency === "NPR"
                    ? "bg-[#163d27] text-[#00ffcc] font-semibold shadow-sm"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                NPR (रू)
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="py-20 text-center max-w-lg mx-auto space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-[#122e1f]/60 border border-[#00ffcc]/30 mx-auto flex items-center justify-center text-[#00ffcc] shadow-[0_0_30px_rgba(0,255,204,0.15)]">
              <span className="material-symbols-outlined text-5xl">shopping_cart</span>
            </div>
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-2xl text-on-surface dark:text-[#e8e0f0]">
                Your collection cart is currently empty
              </h2>
              <p className="font-body text-sm text-[#a098b0] leading-relaxed">
                Add photographic fine art prints or commercial high-resolution licenses from our gallery to begin your order.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/gallery"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#008769] hover:bg-[#007056] text-white font-label text-xs uppercase tracking-wider font-semibold transition-all shadow-md"
              >
                Browse Wildlife Gallery
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
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 8 Cols: Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-label uppercase tracking-wider text-[#a098b0]">
                  Items in your order ({items.length})
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-label text-[#a098b0] hover:text-[#ff2d78] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">remove_shopping_cart</span>
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const itemPrice = currency === "USD" ? item.priceUsd : item.priceNpr;
                  const lineTotal = itemPrice * item.quantity;
                  const formattedLineTotal =
                    currency === "USD" ? `$${lineTotal.toFixed(2)}` : `रू ${lineTotal.toLocaleString()}`;
                  const formattedUnitPrice =
                    currency === "USD" ? `$${itemPrice}` : `रू ${itemPrice.toLocaleString()}`;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl card-surface border border-outline-variant/30 hover:border-secondary/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-sm"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-outline-variant/30 relative">
                        {item.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#a098b0]">
                            <span className="material-symbols-outlined text-3xl">photo_camera</span>
                          </div>
                        )}
                        {item.format && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-label uppercase font-bold bg-black/80 text-[#00ffcc]">
                            {item.format}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-headline font-bold text-base text-on-surface dark:text-[#e8e0f0] truncate">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs font-body text-[#a098b0] truncate">
                            {item.subtitle}
                          </p>
                        )}
                        {item.archiveRef && (
                          <span className="text-[10px] font-mono text-secondary">
                            ARCHIVE #{item.archiveRef}
                          </span>
                        )}
                        <div className="text-xs font-label text-[#a098b0] pt-1">
                          Unit Price: <span className="text-on-surface dark:text-[#e8e0f0] font-semibold">{formattedUnitPrice}</span>
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-outline-variant/20">
                        <div className="font-headline font-bold text-base text-secondary">
                          {formattedLineTotal}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Stepper */}
                          <div className="flex items-center rounded-lg bg-surface-container/60 border border-outline-variant/30 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded flex items-center justify-center text-[#a098b0] hover:text-[#ff2d78] hover:bg-surface-container transition-colors"
                              title="Decrease quantity"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {item.quantity === 1 ? "delete" : "remove"}
                              </span>
                            </button>
                            <span className="px-3 text-xs font-label font-semibold text-on-surface dark:text-[#e8e0f0]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded flex items-center justify-center text-[#a098b0] hover:text-[#00ffcc] hover:bg-surface-container transition-colors"
                              title="Increase quantity"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg text-[#a098b0] hover:text-[#ff2d78] hover:bg-[#ff2d78]/10 transition-colors"
                            title="Remove item"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Gallery CTA */}
              <div className="pt-4">
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-wider text-secondary hover:underline font-semibold"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Add more prints from the gallery
                </Link>
              </div>
            </div>

            {/* Right 4 Cols: Order Summary & Checkout CTA */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
              <div className="p-6 rounded-2xl card-surface border border-outline-variant/30 shadow-lg space-y-5">
                <h2 className="font-headline font-bold text-lg text-on-surface dark:text-[#e8e0f0] border-b border-outline-variant/30 pb-3">
                  Summary ({totalCount} items)
                </h2>

                <div className="space-y-3 text-xs font-body">
                  <div className="flex justify-between items-center">
                    <span className="text-[#a098b0]">Items Subtotal</span>
                    <span className="font-headline font-semibold text-on-surface dark:text-[#e8e0f0]">
                      {currency === "USD"
                        ? `$${subtotalUsd.toFixed(2)} USD`
                        : `रू ${subtotalNpr.toLocaleString()} NPR`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">nature</span>
                      Bardia Tiger Fund (10%)
                    </span>
                    <span className="font-label font-semibold">
                      {currency === "USD"
                        ? `$${conservationShare.toFixed(2)} (Included)`
                        : `रू ${conservationShare.toLocaleString(undefined, { maximumFractionDigits: 0 })} (Included)`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#a098b0]">
                    <span>Standard Vault Dispatch</span>
                    <span className="font-label text-secondary font-semibold">FREE</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-baseline">
                  <div>
                    <span className="font-headline font-bold text-sm uppercase text-on-surface dark:text-[#e8e0f0] block">
                      Total
                    </span>
                    <span className="text-[10px] font-label text-[#a098b0]">Taxes &amp; licensing included</span>
                  </div>
                  <div className="text-right">
                    <div className="font-headline font-black text-2xl text-[#ff2d78]">
                      {currency === "USD"
                        ? `$${subtotalUsd.toFixed(2)}`
                        : `रू ${subtotalNpr.toLocaleString()}`}
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 px-6 rounded-xl bg-[#ff2d78] hover:bg-[#d81159] text-white font-label text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,45,120,0.35)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Proceed to Checkout</span>
                </button>

                <p className="text-[11px] font-label text-center text-[#a098b0]">
                  Instant Cloudflare R2 cryptographically signed vault tokens issued upon confirmation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
