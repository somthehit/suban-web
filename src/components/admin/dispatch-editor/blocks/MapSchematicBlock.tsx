"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Navigation, Edit3, Check, Trash2, Crosshair, MapPin } from "lucide-react";

export function MapSchematicBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [title, setTitle] = useState(attrs.title || "Transect 4B: Babai River Confluence Hide");
  const [scale, setScale] = useState(attrs.scale || "Scale: 1:25,000 Expedition Grid");
  const [blindPos, setBlindPos] = useState(attrs.blindPos || "Blind Alpha Pos: 28°23′14″N");
  const [apexVector, setApexVector] = useState(attrs.apexVector || "Apex Sighting Vector: 194° SSW");
  const [distance, setDistance] = useState(attrs.distance || "Distance: 48.6m Direct");
  const [mapBg, setMapBg] = useState(
    attrs.mapBg ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGvlNdScL8Eaw68MmkUWl0yQirH3gbqyMWIYJr1Pmz_59DqSKiPqtC5ap4fV0MLk4eAwDqcRLG4OCT-CwpHJx7L8RTMMzNNMz18alO8AOdzn8e34LIafZhyzTZAr7ZCtAb6ITBc79MDttcg9F87EL94D1n2V8UXRJNmC9gNKqt9sP_mGZcajvsAgtz8j7Zl7b22Ub7G7y0v9oqDNdFKhNvlsR-OAcg-IGBjwlh1Pch"
  );

  const handleSave = () => {
    updateAttributes({
      title,
      scale,
      blindPos,
      apexVector,
      distance,
      mapBg,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-6 space-y-4 relative group">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-[#ff2d78] flex items-center gap-1.5 font-bold">
              <Navigation className="w-3.5 h-3.5" />
              <span>Topographic Schematic</span>
            </span>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#e8e0f0] mt-0.5">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-label text-xs text-slate-500 dark:text-[#a098b0] bg-slate-100 dark:bg-[#103420] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
              {scale}
            </span>
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Map Schematic" : "Edit Map Settings"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Schematic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Transect Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Grid Scale</label>
                <input
                  type="text"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Blind Position</label>
                <input
                  type="text"
                  value={blindPos}
                  onChange={(e) => setBlindPos(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Sighting Vector</label>
                <input
                  type="text"
                  value={apexVector}
                  onChange={(e) => setApexVector(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Direct Distance</label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Topographic Satellite / Map URL</label>
              <input
                type="text"
                value={mapBg}
                onChange={(e) => setMapBg(e.target.value)}
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

        {/* Map & Vector Canvas */}
        <div
          className="w-full h-64 bg-cover bg-center rounded-xl relative overflow-hidden flex flex-col justify-end p-4 shadow-inner border border-slate-200 dark:border-[#163e26]"
          style={{ backgroundImage: `url('${mapBg}')` }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[1.5px]" />

          {/* SVG Map Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" fill="none" viewBox="0 0 600 240">
            <path
              d="M 0,60 L 600,60 M 0,120 L 600,120 M 0,180 L 600,180 M 150,0 L 150,240 M 300,0 L 300,240 M 450,0 L 450,240"
              stroke="#ffffff"
              opacity="0.15"
              strokeDasharray="4 4"
              strokeWidth="0.7"
            />
            {/* River flow */}
            <path d="M 20,40 Q 180,110 320,100 T 580,180" opacity="0.85" stroke="#00ffcc" strokeWidth="2.5" />
            {/* Crossing trajectory */}
            <path d="M 380,20 Q 360,110 320,190" stroke="#ff2d78" strokeDasharray="6 3" strokeWidth="2" />
          </svg>

          {/* Waypoint Badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 bg-black/85 p-3 rounded-lg backdrop-blur border border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc]" />
              <span className="font-label text-xs text-white font-medium">{blindPos}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d78] shadow-[0_0_8px_#ff2d78]" />
              <span className="font-label text-xs text-white font-medium">{apexVector}</span>
            </div>
            <div className="font-label text-xs text-[#ffe04a] font-semibold">{distance}</div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
