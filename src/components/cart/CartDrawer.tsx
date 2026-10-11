"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    subtotalUsd,
    subtotalNpr,
    currency,
    setCurrency,
  } = useCart();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const currentSubtotal = currency === "USD" ? subtotalUsd : subtotalNpr;
  const conservationShare = currentSubtotal * 0.1;

  const handleCheckoutClick = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative w-full max-w-md bg-[#0a1811] text-[#e8e0f0] border-l border-[#244b35]/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] h-full flex flex-col z-10 transition-transform duration-300 ease-out animate-slideInRight"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b3d2a] flex items-center justify-between bg-[#0e2218]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#163d27] border border-[#00ffcc]/30 flex items-center justify-center text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.2)]">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-base text-[#e8e0f0] tracking-wide">
                  Your Cart
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-label font-bold bg-[#ff2d78] text-[#ffe0ec] shadow-[0_0_8px_rgba(255,45,120,0.5)]">
                  {totalCount}
                </span>
              </div>
              <p className="text-[11px] font-label text-[#a098b0]">
                {items.length === 1 ? "1 unique specimen" : `${items.length} unique specimens`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency switch */}
            <div className="flex items-center rounded-lg p-0.5 text-[10px] font-label bg-[#06120b] border border-[#244b35]/80">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-2 py-1 rounded transition-colors ${
                  currency === "USD"
                    ? "bg-[#163d27] text-[#00ffcc] font-semibold"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-2 py-1 rounded transition-colors ${
                  currency === "NPR"
                    ? "bg-[#163d27] text-[#00ffcc] font-semibold"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                NPR
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeCart}
              className="w-8 h-8 rounded-lg bg-[#122e1f] hover:bg-[#1a422d] text-[#a098b0] hover:text-[#e8e0f0] border border-[#244b35]/60 flex items-center justify-center transition-colors"
              aria-label="Close Cart"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#122c1d]/60 border border-[#244b35] flex items-center justify-center text-[#a098b0]/70">
                <span className="material-symbols-outlined text-4xl">shopping_cart_checkout</span>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="font-headline font-semibold text-base text-[#e8e0f0]">
                  Your cart is empty
                </h3>
                <p className="text-xs font-body text-[#a098b0] leading-relaxed">
                  You haven&apos;t added any photographic master licenses or limited fine art prints yet.
                </p>
              </div>
              <div className="flex flex-col w-full max-w-xs gap-2 pt-3">
                <Link
                  href="/gallery"
                  onClick={closeCart}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#008769] hover:bg-[#00a37f] text-white font-label text-xs uppercase tracking-wider font-semibold text-center transition-all shadow-[0_0_15px_rgba(0,135,105,0.3)]"
                >
                  Explore Wildlife Gallery
                </Link>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#122c1d] hover:bg-[#1b3d2a] text-[#00ffcc] border border-[#00ffcc]/30 font-label text-xs uppercase tracking-wider font-semibold text-center transition-all"
                >
                  Shop Limited Editions
                </Link>
              </div>
            </div>
          ) : (
            /* Item list */
            items.map((item) => {
              const itemPrice = currency === "USD" ? item.priceUsd : item.priceNpr;
              const lineTotal = itemPrice * item.quantity;
              const formattedPrice =
                currency === "USD" ? `$${itemPrice}` : `रू ${itemPrice.toLocaleString()}`;
              const formattedLineTotal =
                currency === "USD" ? `$${lineTotal.toFixed(2)}` : `रू ${lineTotal.toLocaleString()}`;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#0f241a]/80 border border-[#224833]/70 hover:border-[#2f6245] transition-all flex gap-3.5 relative group shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-[#244b35]/60 relative">
                    {item.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#a098b0]">
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                      </div>
                    )}
                    {item.format && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-label uppercase font-bold bg-black/80 text-[#00ffcc] backdrop-blur-xs">
                        {item.format === "print" ? "Print" : "Digital"}
                      </span>
                    )}
                  </div>

                  {/* Info & controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-headline font-semibold text-xs sm:text-sm text-[#e8e0f0] truncate leading-tight">
                          {item.title}
                        </h4>
                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          title="Remove item from cart"
                          className="text-[#a098b0] hover:text-[#ff2d78] p-1 -mr-1 -mt-1 rounded-lg hover:bg-[#ff2d78]/10 transition-colors cursor-pointer"
                          aria-label={`Remove ${item.title}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      {item.subtitle && (
                        <p className="text-[10px] font-label text-[#a098b0] mt-0.5 truncate">
                          {item.subtitle}
                        </p>
                      )}
                      {item.archiveRef && (
                        <span className="text-[9px] font-mono text-[#00ffcc]/80 mt-0.5 block">
                          REF #{item.archiveRef}
                        </span>
                      )}
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#1a3a27]/60">
                      <div>
                        <div className="font-headline font-bold text-xs sm:text-sm text-[#00ffcc]">
                          {formattedLineTotal}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[9px] font-label text-[#a098b0]">
                            {formattedPrice} each
                          </div>
                        )}
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center rounded-lg bg-[#07150c] border border-[#244b35] p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#a098b0] hover:text-[#ff2d78] hover:bg-[#163d27] transition-colors"
                          title="Decrease quantity"
                          aria-label="Decrease quantity"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {item.quantity === 1 ? "delete" : "remove"}
                          </span>
                        </button>

                        <span className="px-2 text-xs font-label font-semibold text-[#e8e0f0] min-w-5 text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#a098b0] hover:text-[#00ffcc] hover:bg-[#163d27] transition-colors"
                          title="Increase quantity"
                          aria-label="Increase quantity"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer (only when items exist) */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#1b3d2a] bg-[#0c1f15] space-y-3">
            {/* Subtotal & Details */}
            <div className="space-y-1.5 text-xs font-body">
              <div className="flex items-center justify-between">
                <span className="text-[#a098b0]">Subtotal ({totalCount} items)</span>
                <span className="font-headline font-bold text-base text-[#e8e0f0]">
                  {currency === "USD"
                    ? `$${subtotalUsd.toFixed(2)} USD`
                    : `रू ${subtotalNpr.toLocaleString()} NPR`}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#00ffcc]/90 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">nature</span>
                  Bardia &amp; Snow Leopard Fund (10%)
                </span>
                <span className="font-label font-semibold">
                  {currency === "USD"
                    ? `$${conservationShare.toFixed(2)} (Included)`
                    : `रू ${conservationShare.toLocaleString(undefined, { maximumFractionDigits: 0 })} (Included)`}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-5 rounded-xl bg-[#ff2d78] hover:bg-[#d81159] text-white font-label text-xs uppercase tracking-widest font-semibold flex items-center justify-between transition-all shadow-[0_0_20px_rgba(255,45,120,0.35)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">lock</span>
                <span>Proceed to Checkout</span>
              </div>
              <span className="font-headline font-bold text-sm">
                {currency === "USD"
                  ? `$${subtotalUsd.toFixed(2)}`
                  : `रू ${subtotalNpr.toLocaleString()}`}
              </span>
            </button>

            {/* Bottom auxiliary links */}
            <div className="flex items-center justify-between pt-1 text-[11px] font-label text-[#a098b0]">
              <button
                type="button"
                onClick={closeCart}
                className="hover:text-[#00ffcc] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Continue Browsing
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="hover:text-[#ff2d78] transition-colors flex items-center gap-1"
                title="Remove all items from cart"
              >
                <span className="material-symbols-outlined text-sm">remove_shopping_cart</span>
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
