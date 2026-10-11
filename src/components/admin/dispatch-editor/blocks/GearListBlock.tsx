"use client";

import React, { useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Wrench, CheckCircle2, Edit3, Check, Trash2, Plus, X } from "lucide-react";

export function GearListBlockComponent({ node, updateAttributes, deleteNode }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const attrs = node.attrs || {};

  const [category, setCategory] = useState(attrs.category || "Expedition Optical Loadout");
  const defaultItems = [
    "Primary: Nikon Z9 Flagship + Nikkor Z 400mm f/2.8 TC VR S",
    "Secondary: Nikon Z8 Flagship + Nikkor Z 70-200mm f/2.8 VR S",
    "Support: Gitzo Systematic Series 5 Carbon + Wimberley WH-200 Gimbal",
    "Field Audio: Zoom F3 32-Bit Float Recorder + Sennheiser MKH 416",
    "Power: 4x EN-EL18d Batteries + Goal Zero 100W Expedition Solar Panel",
  ];

  const [items, setItems] = useState<string[]>(
    Array.isArray(attrs.items) && attrs.items.length > 0 ? attrs.items : defaultItems
  );

  const [newItem, setNewItem] = useState("");

  const handleSave = () => {
    updateAttributes({ category, items });
    setIsEditing(false);
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <NodeViewWrapper className="my-6 not-prose">
      <div className="rounded-2xl border border-slate-200 dark:border-[#163e26] bg-white dark:bg-[#081e12] shadow-sm p-6 relative group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00ffcc]">
            <Wrench className="w-4 h-4" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">
              {category}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-[#00ffcc]"
              title={isEditing ? "Save Gear List" : "Edit Gear List"}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit3 className="w-4 h-4 text-slate-600 dark:text-[#a098b0]" />}
            </button>
            <button
              type="button"
              onClick={deleteNode}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete Gear List"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 space-y-3 mb-4">
            <div>
              <label className="text-[10px] font-label uppercase text-slate-500 block mb-1">Loadout Category Title</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-label uppercase text-slate-500 block">Gear Items</label>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx] = e.target.value;
                      setItems(updated);
                    }}
                    className="flex-1 text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add new equipment item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  className="flex-1 text-xs p-2 rounded-lg bg-white dark:bg-[#04120a] border border-slate-300 dark:border-[#163e26]"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 bg-slate-200 dark:bg-[#103420] text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
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

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a2416] border border-slate-100 dark:border-white/5 text-xs text-slate-800 dark:text-[#e8e0f0]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc] shrink-0 mt-0.5" />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </NodeViewWrapper>
  );
}
