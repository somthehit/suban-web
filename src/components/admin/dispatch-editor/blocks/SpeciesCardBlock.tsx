"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Sparkles, Edit3, Check, Trash2, PawPrint } from "lucide-react";

export function SpeciesCardBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [commonName, setCommonName] = useState(attrs.commonName || "Royal Bengal Tiger");
  const [scientificName, setScientificName] = useState(attrs.scientificName || "Panthera tigris tigris");
  const [iucnStatus, setIucnStatus] = useState(attrs.iucnStatus || "Endangered (IUCN 3.1)");
  const [population, setPopulation] = useState(attrs.population || "~355 in Nepal (2022 Census)");
  const [habitat, setHabitat] = useState(attrs.habitat || "Dense Sal Forest & Alluvial Grassland");
  const [keyBehavior, setKeyBehavior] = useState(attrs.keyBehavior || "Solitary, crepuscular river-stalking");
  const [image, setImage] = useState(
    attrs.image ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpf5U2dkfjFHjrm7Ar0JWd4ol2oSojuqHRw0SsROkoapkBkLZW3d-8oTSRbUtcR8eWq7mpTDECFIWf6sHyIoZ7UnVSpnaPA9FgbEWamuorPFPUeGv7rjOyMKI4kaaR6mUWA0vQBhkntUksogD9j8uXjVMgF3pU9jHdEMn7LEN96IXOs6dVA-dj0Ou5FNGIPSMZ1vgqMN_0n3ZrOBQOc4KAEYDdOSZaxRTtm0Mw2Sd"
  );

  const handleSave = () => {
    updateAttributes({
      commonName,
      scientificName,
      iucnStatus,
      population,
      habitat,
      keyBehavior,
      image,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-6 relative overflow-hidden group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00ffcc]">
            <PawPrint className="w-4 h-4" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">
              Species Field Profile
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Species Card" : "Edit Species Data"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Species Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Common Name</label>
                <input
                  type="text"
                  value={commonName}
                  onChange={(e) => setCommonName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Scientific Name</label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">IUCN Red List Status</label>
                <input
                  type="text"
                  value={iucnStatus}
                  onChange={(e) => setIucnStatus(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Census / Population</label>
                <input
                  type="text"
                  value={population}
                  onChange={(e) => setPopulation(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Habitat Ecosystem</label>
                <input
                  type="text"
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Ethological Behavior</label>
              <input
                type="text"
                value={keyBehavior}
                onChange={(e) => setKeyBehavior(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Species Photo URL</label>
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
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-full sm:w-36 aspect-square rounded-xl overflow-hidden bg-black/60 shrink-0 border border-slate-200 dark:border-[#163e26]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full h-full object-cover" alt={commonName} src={image} />
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-headline font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                  {commonName}
                </h3>
                <span className="font-serif italic text-xs text-slate-500 dark:text-[#a098b0]">
                  {scientificName}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 font-label text-[10px] font-bold uppercase tracking-wider">
                {iucnStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
                <span className="text-[10px] uppercase font-label text-slate-500 dark:text-[#a098b0] block">Population</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{population}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
                <span className="text-[10px] uppercase font-label text-slate-500 dark:text-[#a098b0] block">Habitat</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{habitat}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#a098b0] pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-300">Observation Note:</span> {keyBehavior}
            </p>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
