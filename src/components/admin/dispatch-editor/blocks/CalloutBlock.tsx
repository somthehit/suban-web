"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, Info, ShieldAlert, Compass, Edit3, Check, Trash2 } from "lucide-react";

export function CalloutBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [type, setType] = useState<"warning" | "note" | "expedition">(attrs.type || "expedition");
  const [title, setTitle] = useState(attrs.title || "Field Caution • Monsoon Silt Risk");
  const [content, setContent] = useState(
    attrs.content ||
      "High river turbidity reduces reflection clarity and increases bank subsidence danger. Maintain at least 15m distance from undercut banks."
  );

  const handleSave = () => {
    updateAttributes({ type, title, content });
    setIsEditing(false);
  };

  const getStyle = () => {
    switch (type) {
      case "warning":
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          border: "border-amber-300 dark:border-amber-900/60",
          bg: "bg-amber-50/60 dark:bg-amber-950/20",
          titleColor: "text-amber-800 dark:text-amber-300",
        };
      case "note":
        return {
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
          border: "border-blue-300 dark:border-blue-900/60",
          bg: "bg-blue-50/60 dark:bg-blue-950/20",
          titleColor: "text-blue-800 dark:text-blue-300",
        };
      case "expedition":
      default:
        return {
          icon: <Compass className="w-5 h-5 text-emerald-500 dark:text-[#00ffcc] shrink-0 mt-0.5" />,
          border: "border-emerald-300 dark:border-[#163e26]",
          bg: "bg-emerald-50/50 dark:bg-[#081e12]",
          titleColor: "text-emerald-800 dark:text-[#00ffcc]",
        };
    }
  };

  const style = getStyle();

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div
        className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm relative group transition-colors`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {style.icon}
            <div className="space-y-1 flex-1">
              <h4 className={`font-headline font-bold text-sm ${style.titleColor}`}>
                {title}
              </h4>
              <p className="text-xs text-slate-700 dark:text-[#a098b0] leading-relaxed">
                {content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Callout" : "Edit Callout"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Callout"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="p-4 rounded-xl bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-3 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Callout Tone</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                >
                  <option value="expedition">Expedition Note (Green)</option>
                  <option value="warning">Field Caution (Amber)</option>
                  <option value="note">Naturalist Context (Blue)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Callout Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Callout Message</label>
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
      </div>
    </NodeViewWrapper>
  );
}
