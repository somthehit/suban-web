"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Camera, Edit3, Check, Trash2 } from "lucide-react";

export function OpticsBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [bodyRig, setBodyRig] = useState(attrs.bodyRig || "Nikon Z9 Flagship (Dual CFexpress)");
  const [primaryGlass, setPrimaryGlass] = useState(attrs.primaryGlass || "Nikkor Z 400mm f/2.8 TC VR S");
  const [effectiveFocal, setEffectiveFocal] = useState(attrs.effectiveFocal || "560mm (Internal 1.4x Active)");
  const [exposureValues, setExposureValues] = useState(attrs.exposureValues || "1/1600s • f/4.0 • ISO 3200");
  const [shutterProfile, setShutterProfile] = useState(attrs.shutterProfile || "Silent Electronic (0.0dB)");
  const [afAlgorithm, setAfAlgorithm] = useState(attrs.afAlgorithm || "3D Matrix Animal Eye-AF");

  const handleSave = () => {
    updateAttributes({
      bodyRig,
      primaryGlass,
      effectiveFocal,
      exposureValues,
      shutterProfile,
      afAlgorithm,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm overflow-hidden transition-all group">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 bg-slate-50 dark:bg-[#0d2b1a]/50 border-b border-slate-200 dark:border-[#163e26]">
          <div className="flex items-center gap-2 text-[#ff2d78] font-headline text-sm font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Optics &amp; Field Telemetry</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-label text-xs text-slate-500 dark:text-[#a098b0] uppercase tracking-widest font-semibold hidden sm:inline">
              Nikon Professional DPS
            </span>
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1.5 rounded-lg text-slate-600 dark:text-[#00ffcc] hover:bg-slate-200 dark:hover:bg-[#103420] transition-colors"
              title={isEditing ? "Save Telemetry Data" : "Edit Telemetry Data"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Optics Block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-black/20">
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                Body Rig
              </label>
              <input
                type="text"
                value={bodyRig}
                onChange={(e) => setBodyRig(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                Primary Glass
              </label>
              <input
                type="text"
                value={primaryGlass}
                onChange={(e) => setPrimaryGlass(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                Effective Focal
              </label>
              <input
                type="text"
                value={effectiveFocal}
                onChange={(e) => setEffectiveFocal(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-emerald-600 dark:text-[#00ffcc] font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                Exposure Values
              </label>
              <input
                type="text"
                value={exposureValues}
                onChange={(e) => setExposureValues(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                Shutter Profile
              </label>
              <input
                type="text"
                value={shutterProfile}
                onChange={(e) => setShutterProfile(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 dark:text-[#a098b0] block mb-1">
                AF Algorithm
              </label>
              <input
                type="text"
                value={afAlgorithm}
                onChange={(e) => setAfAlgorithm(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26] text-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-full flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-label uppercase font-bold hover:bg-emerald-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-6">
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                Body Rig
              </span>
              <span className="font-body text-sm font-semibold text-slate-900 dark:text-[#e8e0f0] mt-0.5">
                {bodyRig}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                Primary Glass
              </span>
              <span className="font-body text-sm font-semibold text-slate-900 dark:text-[#e8e0f0] mt-0.5">
                {primaryGlass}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                Effective Focal
              </span>
              <span className="font-body text-sm font-semibold text-emerald-600 dark:text-[#00ffcc] mt-0.5">
                {effectiveFocal}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                Exposure Values
              </span>
              <span className="font-body text-sm font-semibold text-slate-900 dark:text-[#e8e0f0] mt-0.5">
                {exposureValues}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                Shutter Profile
              </span>
              <span className="font-body text-sm font-semibold text-slate-900 dark:text-[#e8e0f0] mt-0.5">
                {shutterProfile}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-slate-500 dark:text-[#a098b0] uppercase tracking-wider">
                AF Algorithm
              </span>
              <span className="font-body text-sm font-semibold text-slate-900 dark:text-[#e8e0f0] mt-0.5">
                {afAlgorithm}
              </span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
