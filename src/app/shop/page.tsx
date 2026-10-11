"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface ShopProduct {
  id: string;
  slug: string;
  title: string;
  type: string;
  species: string;
  usdDigital: number;
  nprDigital: number;
  usdPrint: number | null;
  nprPrint: number | null;
  imageUrl: string;
}

export default function ShopPage() {
  const { addItem } = useCart();
  const [currency, setCurrency] = useState<"USD" | "NPR">("USD");
  const [selectedFormat, setSelectedFormat] = useState<"digital" | "print">("digital");

  const initialProducts: ShopProduct[] = [
    {
      id: "prod-1",
      slug: "the-stare-royal-bengal-tiger",
      title: "The Stare of the Royal Bengal Tiger",
      type: "Master Archive Plate",
      species: "Panthera tigris tigris",
      usdDigital: 180,
      nprDigital: 24000,
      usdPrint: 350,
      nprPrint: 46000,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDbkzB0KNWUihmxdwg701UklJzOFnQze1yRR4eaBpZ42SOynbZLl8y-lB6KQF13SIwVEfc_k5Fyx2WBgB8fpxgfivt1d2g9-n11eS2LEbKlR4Yg7lIHWjkdKR1Uqr3QTkLNJVgL347Tx3YrP4S6QAMCcWJqYbKitXGzOGh0AJGVvdglGV5a1_6KnPo2Wr6bq2kK51eeOT7UQ9BJYBmXUyY-SrR1bAni38IpnV7KPk5c",
    },
    {
      id: "prod-2",
      slug: "snow-leopard-cliff-vigil",
      title: "The Phantom Ridge Vigil",
      type: "Sub-Zero Archive Plate",
      species: "Panthera uncia",
      usdDigital: 180,
      nprDigital: 24000,
      usdPrint: 350,
      nprPrint: 46000,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBGvGhfGijqswK1fxrL2hcsZIW3EN6jE7ZQkYzG41iVZ8Ec03zbFZgk1FagG4oArkBtdiQHBmhxKabj_TpvJtszx7gLG0baqnNRL4ppKwpbLTf4FQbwWVGX10XyI7PqFLwu6Y1zgiOMXQLbr7Cqko1EB46aCFJsG9-SbJGk7HblzHtUhIYDnw-aZGN4YZPIgyuiNAf-QZJzUhDVLClttr3EZG4KRe3Diuiip7cduLm8",
    },
    {
      id: "prod-3",
      slug: "armored-colossus-sundown",
      title: "The Armored Colossus at Sundown",
      type: "Megafauna Plate",
      species: "Rhinoceros unicornis",
      usdDigital: 149,
      nprDigital: 19900,
      usdPrint: 289,
      nprPrint: 38500,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDcSv71LdnQGsNWRtV3NhRUQ6wwwvWjabDwd6HWvd-vV5ZMl8ZaYuw-_GIAeeTqXSMjAMeXsJ2nDHIajle21gyuoc5IKGGG0US-AcnLt2QdmF49jcRF0XOpf2OHl9bzEKh0FSrQO67AQx3rgcYzZDrGYMV1EBt4RiHxVdhmzaYutWpDibzgij6iHVlh4bqZG1vjpHwk1vShU8_McdtdfjTcg26dNPgCXYNw1pfyR-iJ",
    },
    {
      id: "prod-4",
      slug: "himalayan-master-presets-2026",
      title: "Himalayan Lightroom Master Profiles",
      type: "Sensor Calibration Pack",
      species: "Pro Dual-Gamut LUTs & XMP",
      usdDigital: 79,
      nprDigital: 10500,
      usdPrint: null,
      nprPrint: null,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBTkCmv-8xuwk2lnFO3kevsTXVGpDrPm8FUesI-DRZ4tHEglgtDehXg43dhHChFwieAzpqmrPjO5D7Z2Xdl3pMEcBcPStYDYgUC2gNVayCPZkwDd11sVE-CqZvPbPaFE8diavgPPB1CEkUFYya3Nar3OMsE2WzKCSms6MxirjIfbxS7EUNaAUVNV4uWD5TZxKg6eSe8bPSCvg1BElalVQCFkctwcFe1r8dRUnUxWQY8",
    },
  ];

  const [products, setProducts] = useState<ShopProduct[]>(initialProducts);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const liveItems: ShopProduct[] = data.products.map((p: any, idx: number) => ({
            id: p.id || `live-prod-${idx}`,
            slug: p.slug,
            title: p.title,
            type: p.productType === "photograph" ? "Master Archive Plate" : "Fine Art Edition",
            species: p.species || p.scientificName || "Wildlife Subject",
            usdDigital: p.priceUSD || 149,
            nprDigital: p.priceNPR || 19900,
            usdPrint: (p.priceUSD || 149) * 2,
            nprPrint: (p.priceNPR || 19900) * 2,
            imageUrl: p.imageUrl || initialProducts[idx % initialProducts.length].imageUrl,
          }));
          setProducts(liveItems);
        }
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  return (
    <div className="w-full bg-[#04120a] text-[#e8e0f0] min-h-screen selection:bg-[#b3004e] selection:text-[#ffe0ec]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-10">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#163e26] pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12301f] text-[#00ffcc] text-xs font-label uppercase tracking-widest border border-[#00ffcc]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]" />
              Official Fine Art &amp; RAW Vault
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-5xl text-[#e8e0f0] tracking-tight">
              Collector &amp; Commercial Shop
            </h1>
            <p className="font-body text-sm text-[#a098b0] max-w-2xl leading-relaxed">
              Acquire master photographic licenses and limited physical Hahnemühle fine art prints. Multi-currency checkout via Stripe, eSewa, and Khalti with instant cryptographic R2 vault fulfillment.
            </p>
          </div>

          {/* Controls: Currency & Format */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Format Toggle */}
            <div className="flex items-center bg-[#0a2416] p-1 rounded-xl border border-[#163e26]">
              <button
                type="button"
                onClick={() => setSelectedFormat("digital")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider transition-all ${
                  selectedFormat === "digital"
                    ? "bg-[#ff2d78] text-[#ffe0ec] font-bold shadow-[0_0_12px_rgba(255,45,120,0.3)]"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                Digital RAW
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat("print")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider transition-all ${
                  selectedFormat === "print"
                    ? "bg-[#ff2d78] text-[#ffe0ec] font-bold shadow-[0_0_12px_rgba(255,45,120,0.3)]"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                Fine Art Print
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="flex items-center bg-[#0a2416] p-1 rounded-xl border border-[#163e26]">
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider transition-all ${
                  currency === "USD"
                    ? "bg-[#143d25] text-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency("NPR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider transition-all ${
                  currency === "NPR"
                    ? "bg-[#143d25] text-[#00ffcc] font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]"
                    : "text-[#a098b0] hover:text-[#e8e0f0]"
                }`}
              >
                NPR (रू)
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => {
            const isDigitalOnly = item.usdPrint === null && selectedFormat === "print";
            const price =
              selectedFormat === "digital"
                ? currency === "USD"
                  ? `$${item.usdDigital}`
                  : `रू ${item.nprDigital.toLocaleString()}`
                : item.usdPrint
                ? currency === "USD"
                  ? `$${item.usdPrint}`
                  : `रू ${item.nprPrint?.toLocaleString()}`
                : "Digital Only";

            return (
              <div
                key={item.id}
                className="bg-[#0a2416] rounded-2xl overflow-hidden flex flex-col justify-between border border-[#163e26] hover:border-[#00ffcc]/30 transition-all duration-300 shadow-xl group hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-square overflow-hidden bg-[#06170d]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-label uppercase bg-[#04120a]/85 backdrop-blur-md text-[#00ffcc] border border-white/10">
                      {item.type}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-label text-[#a098b0]">{item.species}</span>
                    <h3 className="font-headline font-bold text-base text-[#e8e0f0] group-hover:text-[#ff2d78] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-xs font-label text-[#ffe04a] pt-1">
                      {selectedFormat === "digital"
                        ? "Instant Cloudflare R2 Vault Token"
                        : isDigitalOnly
                        ? "Not available as physical print"
                        : "Hand-Signed 24x36\" Cotton Rag"}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between border-t border-[#163e26] pt-3">
                    <div>
                      <span className="text-[10px] uppercase font-label text-[#a098b0]">Total Price</span>
                      <p className="font-headline font-extrabold text-lg text-[#e8e0f0]">{price}</p>
                    </div>

                    {isDigitalOnly ? (
                      <span className="text-[11px] font-label text-[#a098b0]">Digital Only</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const isPrint = selectedFormat === "print";
                          addItem(
                            {
                              id: `${item.slug}-${selectedFormat}`,
                              slug: item.slug,
                              title: item.title,
                              subtitle: isPrint
                                ? 'Hand-Signed 24x36" Fine Art Print'
                                : "Instant Cloudflare R2 Vault Token",
                              species: item.species,
                              image: item.imageUrl,
                              format: selectedFormat,
                              priceUsd: isPrint ? (item.usdPrint ?? 350) : item.usdDigital,
                              priceNpr: isPrint ? (item.nprPrint ?? 46000) : item.nprDigital,
                            },
                            true
                          );
                        }}
                        className="px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-semibold bg-[#ff2d78] hover:bg-[#b3004e] text-[#ffe0ec] shadow-[0_0_12px_rgba(255,45,120,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
