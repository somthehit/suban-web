"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Compass, Mountain, Thermometer, Volume2, Edit3, Check, Trash2 } from "lucide-react";

export function FieldStatsBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [waypoint, setWaypoint] = useState(attrs.waypoint || "28°23′14″N 81°18′02″E");
  const [elevation, setElevation] = useState(attrs.elevation || "152m AMSL (Bardia Basin)");
  const [temperature, setTemperature] = useState(attrs.temperature || "9.4°C / 48.9°F (Mist Drop)");
  const [acoustics, setAcoustics] = useState(attrs.acoustics || "32 dB (Ambient Forest)");

  const handleSave = () => {
    updateAttributes({ waypoint, elevation, temperature, acoustics });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-4 sm:p-5 relative group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-3">
          <span className="font-label text-xs uppercase tracking-widest text-emerald-600 dark:text-[#00ffcc] font-bold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>High-Altitude Telemetry Ribbon</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Stats" : "Edit Stats"}
            >
              {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit3 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Ribbon"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">GPS Waypoint</label>
              <input
                type="text"
                value={waypoint}
                onChange={(e) => setWaypoint(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Elevation</label>
              <input
                type="text"
                value={elevation}
                onChange={(e) => setElevation(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Temperature</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Dawn Acoustics</label>
              <input
                type="text"
                value={acoustics}
                onChange={(e) => setAcoustics(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>
            <div className="col-span-full flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
              <span className="font-label text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#a098b0] flex items-center gap-1 font-semibold">
                <Compass className="w-3 h-3 text-emerald-600 dark:text-[#00ffcc]" />
                <span>GPS Waypoint</span>
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#e8e0f0] truncate">
                {waypoint}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
              <span className="font-label text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#a098b0] flex items-center gap-1 font-semibold">
                <Mountain className="w-3 h-3 text-[#ff2d78]" />
                <span>Elevation</span>
              </span>
              <span className="font-label text-xs font-bold text-slate-900 dark:text-[#e8e0f0] truncate">
                {elevation}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
              <span className="font-label text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#a098b0] flex items-center gap-1 font-semibold">
                <Thermometer className="w-3 h-3 text-amber-500" />
                <span>Temperature</span>
              </span>
              <span className="font-label text-xs font-bold text-slate-900 dark:text-[#e8e0f0] truncate">
                {temperature}
              </span>
            </div>

            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
              <span className="font-label text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#a098b0] flex items-center gap-1 font-semibold">
                <Volume2 className="w-3 h-3 text-emerald-600 dark:text-[#00ffcc]" />
                <span>Dawn Acoustics</span>
              </span>
              <span className="font-label text-xs font-bold text-slate-900 dark:text-[#e8e0f0] truncate">
                {acoustics}
              </span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
