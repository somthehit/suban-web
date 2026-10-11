"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { ShoppingBag, Edit3, Check, Trash2, Award } from "lucide-react";

export function ShopPrintBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [title, setTitle] = useState(
    attrs.title || "Acquire Limited Fine Art Print or Commercial RAW License"
  );
  const [subtitle, setSubtitle] = useState(
    attrs.subtitle ||
      "Hand-signed, embossed with digital cryptographic provenance. 100% archival pigment print rated for 150+ years lightfastness."
  );
  const [edition, setEdition] = useState(attrs.edition || "Edition 04 / 25");
  const [paper, setPaper] = useState(attrs.paper || "Archival Museum Rag / Hahnemühle");
  const [image, setImage] = useState(
    attrs.image ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkIjaJgW6V2K5nhQw4YsdxkZwtamfhDsLNdCTVS8ZA2wRSczAvDlhCqvgXSzvHHJ6_wDbGUNbMzmKjLXzqZrlVR7N4B_-kklNEZypcUxjrhpRVCvtpCrMoLDz-vF_5Gx17Y5I50xg6OqSFB2OcpME5MxluDo_FX5F0pRfNHzqE1eVIERY6hg0nxdO6wnUB4vdqxGBmcHX8a6jCDcrOXO-Kug7WIsNhCtHZCPkpRIS4"
  );
  const [rawPrice, setRawPrice] = useState(attrs.rawPrice || "$39");
  const [commPrice, setCommPrice] = useState(attrs.commPrice || "$180");
  const [printPrice, setPrintPrice] = useState(attrs.printPrice || "$350");
  const [selectedTier, setSelectedTier] = useState<"raw" | "comm" | "print">("print");

  const handleSave = () => {
    updateAttributes({
      title,
      subtitle,
      edition,
      paper,
      image,
      rawPrice,
      commPrice,
      printPrice,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-md p-6 sm:p-8 relative overflow-hidden group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
          <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop This Photo • Fine Art Print &amp; RAW Licensing</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Print Settings" : "Edit Print & Licensing"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Print Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Paper Specification</label>
                <input
                  type="text"
                  value={paper}
                  onChange={(e) => setPaper(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Subtext / Archival Guarantee</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Edition Tag</label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Personal RAW Price</label>
                <input
                  type="text"
                  value={rawPrice}
                  onChange={(e) => setRawPrice(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Commercial Price</label>
                <input
                  type="text"
                  value={commPrice}
                  onChange={(e) => setCommPrice(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Signed Print Price</label>
                <input
                  type="text"
                  value={printPrice}
                  onChange={(e) => setPrintPrice(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Framed Mockup Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}

        {/* Display Card Body */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-44 aspect-[4/3] rounded-lg overflow-hidden bg-black/60 shrink-0 shadow-md relative group border border-slate-200 dark:border-[#163e26]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" alt="Framed gallery print" src={image} />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/85 font-label text-[10px] text-[#ffe04a] uppercase tracking-wider font-semibold">
              {edition}
            </div>
          </div>

          <div className="flex flex-col flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#ff2d78]/15 text-[#ff2d78] font-label text-[11px] font-bold uppercase tracking-wider">
                Collector Release
              </span>
              <span className="text-xs font-label text-slate-500 dark:text-[#a098b0]">{paper}</span>
            </div>

            <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-[#e8e0f0]">
              {title}
            </h3>

            <p className="font-body text-xs text-slate-600 dark:text-[#a098b0] leading-relaxed">
              {subtitle}
            </p>

            {/* Tier Selectors */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTier("raw")}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  selectedTier === "raw"
                    ? "bg-emerald-50 dark:bg-[#103420] border-emerald-500 dark:border-[#00ffcc] text-emerald-700 dark:text-[#00ffcc] shadow-sm font-semibold"
                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#163e26] hover:bg-slate-100"
                }`}
              >
                <div className="font-label text-[10px] uppercase text-slate-500 dark:text-[#a098b0]">Personal RAW</div>
                <div className="font-headline text-xs font-bold text-slate-900 dark:text-white">{rawPrice} USD</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier("comm")}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  selectedTier === "comm"
                    ? "bg-emerald-50 dark:bg-[#103420] border-emerald-500 dark:border-[#00ffcc] text-emerald-700 dark:text-[#00ffcc] shadow-sm font-semibold"
                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#163e26] hover:bg-slate-100"
                }`}
              >
                <div className="font-label text-[10px] uppercase text-slate-500 dark:text-[#a098b0]">Commercial</div>
                <div className="font-headline text-xs font-bold text-slate-900 dark:text-white">{commPrice} USD</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier("print")}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  selectedTier === "print"
                    ? "bg-emerald-50 dark:bg-[#103420] border-emerald-500 dark:border-[#00ffcc] text-emerald-700 dark:text-[#00ffcc] shadow-sm font-semibold"
                    : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#163e26] hover:bg-slate-100"
                }`}
              >
                <div className="font-label text-[10px] uppercase text-emerald-600 dark:text-[#00ffcc] font-semibold">Signed Print</div>
                <div className="font-headline text-xs font-bold text-slate-900 dark:text-white">{printPrice} USD</div>
              </button>
            </div>

            {/* Simulated CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-label text-slate-500">Tier Selected:</span>
                <span className="font-headline font-bold text-sm text-emerald-600 dark:text-[#00ffcc]">
                  {selectedTier === "raw" ? `Personal RAW (${rawPrice})` : selectedTier === "comm" ? `Commercial Editorial (${commPrice})` : `Signed Fine Art Print (${printPrice})`}
                </span>
              </div>
              <div className="px-5 py-2.5 rounded-lg bg-[#ff2d78] text-white font-label text-xs uppercase tracking-wider font-semibold shadow-[0_0_16px_rgba(255,45,120,0.3)] text-center cursor-default">
                Instant License / Reserve Print
              </div>
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
