"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { ShieldCheck, Ban, Leaf, HeartHandshake, Edit3, Check, Trash2 } from "lucide-react";

export function EthicsProtocolBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [card1Title, setCard1Title] = useState(attrs.card1Title || "Zero Infiltration");
  const [card1Desc, setCard1Desc] = useState(
    attrs.card1Desc || "Strict non-invasive blinds. No acoustic playback, baiting, or tree platforms were utilized."
  );
  const [card2Title, setCard2Title] = useState(attrs.card2Title || "Non-Disruptive Drone Ban");
  const [card2Desc, setCard2Desc] = useState(
    attrs.card2Desc || "100% aerial drone exclusion applied. Compliant with Bardia National Park buffer-zone laws."
  );
  const [card3Title, setCard3Title] = useState(attrs.card3Title || "10% Direct Royalty");
  const [card3Desc, setCard3Desc] = useState(
    attrs.card3Desc || "10% of all image sales from this dispatch go directly to Community Anti-Poaching Units (CBAPU)."
  );

  const handleSave = () => {
    updateAttributes({
      card1Title,
      card1Desc,
      card2Title,
      card2Desc,
      card3Title,
      card3Desc,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-6 space-y-4 relative group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00ffcc]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">
              Ethical Wildlife Photography Protocol
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Protocol" : "Edit Ethical Principles"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Protocol Block"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase text-slate-500 block">Pillar 1</label>
                <input
                  type="text"
                  value={card1Title}
                  onChange={(e) => setCard1Title(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
                <textarea
                  rows={2}
                  value={card1Desc}
                  onChange={(e) => setCard1Desc(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase text-slate-500 block">Pillar 2</label>
                <input
                  type="text"
                  value={card2Title}
                  onChange={(e) => setCard2Title(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
                <textarea
                  rows={2}
                  value={card2Desc}
                  onChange={(e) => setCard2Desc(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-label uppercase text-slate-500 block">Pillar 3</label>
                <input
                  type="text"
                  value={card3Title}
                  onChange={(e) => setCard3Title(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
                <textarea
                  rows={2}
                  value={card3Desc}
                  onChange={(e) => setCard3Desc(e.target.value)}
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
                Apply
              </button>
            </div>
          </div>
        )}

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-body">
          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
            <span className="font-label font-bold text-slate-900 dark:text-[#e8e0f0] flex items-center gap-1.5 text-xs">
              <Ban className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ffcc]" />
              {card1Title}
            </span>
            <span className="text-slate-600 dark:text-[#a098b0] text-[11px] leading-relaxed">
              {card1Desc}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
            <span className="font-label font-bold text-slate-900 dark:text-[#e8e0f0] flex items-center gap-1.5 text-xs">
              <Leaf className="w-3.5 h-3.5 text-[#ff2d78]" />
              {card2Title}
            </span>
            <span className="text-slate-600 dark:text-[#a098b0] text-[11px] leading-relaxed">
              {card2Desc}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5">
            <span className="font-label font-bold text-slate-900 dark:text-[#e8e0f0] flex items-center gap-1.5 text-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-[#ffe04a]" />
              {card3Title}
            </span>
            <span className="text-slate-600 dark:text-[#a098b0] text-[11px] leading-relaxed">
              {card3Desc}
            </span>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
