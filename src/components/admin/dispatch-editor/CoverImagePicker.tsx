"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Target, Image as ImageIcon, Loader2 } from "lucide-react";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface CoverImagePickerProps {
  coverImage: string | null;
  focalX: number;
  focalY: number;
  onChangeCover: (url: string | null, mediaId?: string | null) => void;
  onChangeFocal: (x: number, y: number) => void;
}

export default function CoverImagePicker({
  coverImage,
  focalX = 50,
  focalY = 50,
  onChangeCover,
  onChangeFocal,
}: CoverImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFocalGuide, setShowFocalGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file (JPEG, PNG, WebP).");
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "site");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }
      onChangeCover(data.url);
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
    onChangeFocal(x, y);
    setShowFocalGuide(true);
  };

  return (
    <div className="space-y-2">
      {/* If Cover exists */}
      {coverImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#163e26] bg-[#05170d] group">
          <div
            ref={imageContainerRef}
            onClick={handleContainerClick}
            className="relative h-64 sm:h-80 md:h-96 w-full cursor-crosshair overflow-hidden"
            title="Click anywhere to set the visual focal point"
          >
            <ImageWithFallback
              src={coverImage}
              alt="Dispatch Cover Preview"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              style={{ objectPosition: `${focalX}% ${focalY}%` }}
            />

            {/* Focal Point Indicator Crosshair */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-150 z-20"
              style={{ left: `${focalX}%`, top: `${focalY}%` }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#00ffcc] bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_15px_rgba(0,255,204,0.8)]">
                <div className="w-2 h-2 rounded-full bg-[#00ffcc]" />
              </div>
              <span className="absolute left-1/2 -translate-x-1/2 top-9 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#00ffcc] whitespace-nowrap border border-[#00ffcc]/30 pointer-events-none">
                Focal {focalX}%, {focalY}%
              </span>
            </div>

            {/* Hint Overlay Banner */}
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between text-xs text-white/80 pointer-events-none z-10">
              <span className="flex items-center gap-1.5 font-label text-[11px] text-[#00ffcc]">
                <Target className="w-3.5 h-3.5" />
                <span>Click image to adjust crop focal point</span>
              </span>
              <span className="text-[10px] font-mono text-white/60">
                Position: {focalX}% / {focalY}%
              </span>
            </div>
          </div>

          {/* Action buttons (top right) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Replace Cover Image (Click to upload new photo)"
              className="px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs font-label uppercase tracking-wider backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#00ffcc]" />
              <span>Replace Cover</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeCover(null)}
              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 backdrop-blur-md border border-rose-500/40 transition-all cursor-pointer shadow-lg"
              title="Remove Cover Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
          }}
          title="Upload dispatch cover image (Drag & drop or click to browse)"
          className={`h-48 sm:h-60 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group tiptap-cover-dropzone shadow-xs ${
            isUploading
              ? "border-[#00ffcc] bg-emerald-50 dark:bg-[#00ffcc]/5"
              : "border-slate-300 dark:border-[#163e26] hover:border-emerald-500 dark:hover:border-[#00ffcc]/60 bg-white dark:bg-[#081e12]/40 hover:bg-slate-50 dark:hover:bg-[#081e12]/80"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-[#00ffcc] animate-spin" />
              <p className="text-xs font-label text-emerald-600 dark:text-[#00ffcc] uppercase tracking-wider font-semibold">
                Uploading high-res cover to site bucket...
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#103420] border border-slate-200 dark:border-[#163e26] group-hover:border-emerald-400 dark:group-hover:border-[#00ffcc]/40 flex items-center justify-center text-slate-500 dark:text-[#a098b0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] transition-colors mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-headline font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] transition-colors">
                Add Expedition Cover Image
              </h4>
              <p className="text-xs text-slate-600 dark:text-[#a098b0] mt-1 max-w-sm">
                Drag &amp; drop high-resolution photograph (JPEG, WebP, PNG up to 20MB) or click to browse.
              </p>
              <span className="mt-3 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#103420] text-emerald-700 dark:text-[#00ffcc] text-[10px] font-mono border border-slate-200 dark:border-[#00ffcc]/20 font-medium">
                Focal crop &amp; aspect control enabled
              </span>
            </>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2 rounded-lg">
          {uploadError}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
