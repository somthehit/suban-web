"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  FolderDown,
  Trash2,
} from "lucide-react";

interface FileUploadDropzoneProps {
  bucket: "gallery" | "profiles" | "watermarks" | "site" | "raw-vault";
  value?: string;
  onChange: (url: string, fileInfo?: { filename: string; size: number; mimeType: string }) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  accept?: string;
  className?: string;
}

export function FileUploadDropzone({
  bucket,
  value,
  onChange,
  label = "Upload Image",
  helperText,
  aspectRatio = "auto",
  accept = "image/*",
  className = "",
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      // Simulate step progress
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 100);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url, {
        filename: data.filename,
        size: data.size,
        mimeType: data.mimeType,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to upload file");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatBucketName = (b: string) => {
    switch (b) {
      case "gallery":
        return "Gallery Bucket (50MB)";
      case "profiles":
        return "Profiles Bucket (10MB)";
      case "watermarks":
        return "Watermarks Bucket (10MB)";
      case "site":
        return "Site Assets Bucket (20MB)";
      case "raw-vault":
        return "Archival RAW Vault (200MB)";
      default:
        return `${b} Bucket`;
    }
  };

  const filename = value ? value.split("/").pop() || "Uploaded File" : "";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-label uppercase tracking-wider font-semibold text-on-surface dark:text-[#e8e0f0]">
          {label}
        </label>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-bold">
          {bucket}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Uploaded state */}
      {value ? (
        <div className="card-surface rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm transition-all hover:shadow-md">
          {/* Image preview frame */}
          <div
            className={`w-full overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/50 relative group ${
              aspectRatio === "square"
                ? "aspect-square"
                : aspectRatio === "video"
                ? "aspect-video"
                : aspectRatio === "portrait"
                ? "aspect-[3/4]"
                : "max-h-56 min-h-[160px]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />

            {/* Direct Open Link on Hover */}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white/90 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              title="Open in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Ready badge */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm text-[11px] font-medium">
              <Check className="w-3 h-3" />
              <span>Synced to /{bucket}/</span>
            </div>
          </div>

          {/* Action & Info Toolbar */}
          <div className="p-3 bg-surface-container/30 border-t border-outline-variant/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-medium text-on-surface dark:text-white truncate" title={filename}>
                {filename}
              </p>
              <p className="text-[10px] text-on-surface-variant dark:text-[#a098b0] truncate">
                {value}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={copyUrl}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-primary text-xs font-label uppercase tracking-wider flex items-center gap-1 transition-all"
                title="Copy relative or public URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy URL"}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface dark:text-[#e8e0f0] text-xs font-label uppercase tracking-wider flex items-center gap-1 transition-all"
                title="Select another file to replace"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Dropzone state */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed transition-all p-6 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden ${
            isDragging
              ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,204,0.2)] scale-[1.01]"
              : "border-outline-variant/40 hover:border-primary/60 bg-surface-container/20 hover:bg-surface-container/35"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3 py-2 w-full max-w-xs">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-xs font-label">
                  <span className="text-on-surface dark:text-white font-medium">Uploading file...</span>
                  <span className="text-primary font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-[11px] text-on-surface-variant dark:text-[#a098b0]">
                Storing in {formatBucketName(bucket)}
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <Upload className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-on-surface dark:text-white">
                  Drag &amp; drop file here, or{" "}
                  <span className="text-primary underline underline-offset-2">Browse</span>
                </p>
                <p className="text-xs text-on-surface-variant dark:text-[#a098b0]">
                  {helperText || `Uploads directly into '${bucket}' bucket with instant CDN preview`}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-label uppercase tracking-wider font-semibold border border-primary/30 transition-all flex items-center gap-1.5"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
