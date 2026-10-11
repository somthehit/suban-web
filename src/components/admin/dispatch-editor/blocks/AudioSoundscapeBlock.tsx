"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Play, Pause, Volume2, Edit3, Check, Trash2, Radio } from "lucide-react";

export function AudioSoundscapeBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [title, setTitle] = useState(attrs.title || "Babai River Dawn Soundscape (Ambient 3D Audio)");
  const [duration, setDuration] = useState(attrs.duration || "04:15 AM • 4m 20s");
  const [format, setFormat] = useState(attrs.format || "32-Bit Float Ambisonics");

  const handleSave = () => {
    updateAttributes({ title, duration, format });
    setIsEditing(false);
  };

  const waveHeights = [3, 6, 8, 12, 7, 4, 10, 11, 6, 4, 8, 12, 9, 5, 7, 10, 4, 6, 3, 8, 11, 6, 2, 5, 9, 4, 7, 3];

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-6 space-y-4 relative group">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <span className="font-label text-xs uppercase tracking-widest text-emerald-600 dark:text-[#00ffcc] flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Binaural Field Audio</span>
            </span>
            <h3 className="font-headline font-bold text-base text-slate-900 dark:text-[#e8e0f0] mt-0.5">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-label text-xs text-slate-500 dark:text-[#a098b0] bg-slate-100 dark:bg-[#103420] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-mono">
              {duration}
            </span>
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Audio" : "Edit Soundscape Details"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Soundscape"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editing Inputs */}
        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3">
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Soundscape Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Duration / Time</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Audio Format Badge</label>
                <input
                  type="text"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Waveform graphic */}
        <div className="w-full h-14 bg-slate-100 dark:bg-[#030d07] rounded-xl px-4 flex items-center justify-between gap-1 overflow-hidden border border-slate-200 dark:border-white/5">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                i % 3 === 0
                  ? "bg-[#ff2d78]"
                  : isPlaying
                  ? "bg-emerald-500 dark:bg-[#00ffcc] animate-pulse"
                  : "bg-emerald-400/60 dark:bg-[#00ffcc]/60"
              }`}
              style={{
                height: isPlaying ? `${Math.min(h * 3.5, 48)}px` : `${h * 2.5}px`,
              }}
            />
          ))}
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-[#ff2d78] hover:bg-[#b3004e] text-white flex items-center justify-center transition-all shadow-[0_0_12px_rgba(255,45,120,0.4)]"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="text-xs font-mono text-slate-500 dark:text-[#a098b0]">
              <span className="text-emerald-600 dark:text-[#00ffcc] font-bold">
                {isPlaying ? "02:45" : "01:14"}
              </span>{" "}
              / <span>04:20</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-[#a098b0]">
            <Volume2 className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
            <span className="font-label text-[11px] uppercase tracking-wider text-emerald-700 dark:text-[#00ffcc] font-semibold hidden sm:inline">
              {format}
            </span>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
