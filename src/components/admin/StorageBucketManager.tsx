"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FolderArchive,
  Image as ImageIcon,
  User,
  Stamp,
  Globe,
  Lock,
  Upload,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Eye,
  ExternalLink,
  HardDrive,
  FileText,
  AlertCircle,
  X,
  Search,
  ArrowUpDown,
  FolderDown,
  Layers,
  Sparkles,
} from "lucide-react";

type BucketId = "gallery" | "profiles" | "watermarks" | "site" | "raw-vault";

interface BucketMeta {
  id: BucketId;
  name: string;
  description: string;
  public: boolean;
  limitMB: number;
  icon: any;
  color: string;
}

const BUCKET_DEFS: BucketMeta[] = [
  {
    id: "gallery",
    name: "Gallery & Prints",
    description: "Public high-resolution wildlife captures, exhibition monographs, fine art master previews.",
    public: true,
    limitMB: 50,
    icon: ImageIcon,
    color: "#00ffcc",
  },
  {
    id: "profiles",
    name: "Profile & Avatars",
    description: "Photographer bio portraits, author avatars, and studio headshots.",
    public: true,
    limitMB: 10,
    icon: User,
    color: "#38bdf8",
  },
  {
    id: "watermarks",
    name: "Watermarks & Badges",
    description: "Cryptographic overlay PNGs, copyright marks, studio insignia.",
    public: true,
    limitMB: 10,
    icon: Stamp,
    color: "#eab308",
  },
  {
    id: "site",
    name: "Site & Brand Assets",
    description: "Logos, hero backdrops, editorial press kit images, banners.",
    public: true,
    limitMB: 20,
    icon: Globe,
    color: "#a855f7",
  },
  {
    id: "raw-vault",
    name: "Archival RAW Vault",
    description: "Private full-bitrate Nikon Z9 NEF/RAW & 16-Bit ProPhoto master archives.",
    public: false,
    limitMB: 200,
    icon: Lock,
    color: "#ff2d78",
  },
];

interface FileItem {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  mimeType: string;
  bucket: string;
}

export function StorageBucketManager() {
  const [selectedBucket, setSelectedBucket] = useState<BucketId>("gallery");
  const [bucketFiles, setBucketFiles] = useState<Record<string, FileItem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");

  // Multi-upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/upload");
      const data = await res.json();
      if (data.success && data.files) {
        setBucketFiles(data.files);
      }
    } catch (err: any) {
      console.error("Failed to load bucket files:", err);
      setStatusMessage("Failed to connect to storage API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Permanently delete '${filename}' from '${selectedBucket}' bucket?`)) return;

    try {
      const res = await fetch(
        `/api/upload?bucket=${selectedBucket}&filename=${encodeURIComponent(filename)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ Deleted '${filename}'`);
        await fetchFiles();
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Upload multiple files
  const handleBatchUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingMultiple(true);
    setStatusMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressText(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", selectedBucket);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        failCount++;
      }
    }

    setIsUploadingMultiple(false);
    setUploadProgressText(null);

    if (failCount === 0) {
      setStatusMessage(`✅ Successfully uploaded ${successCount} file(s) to '${selectedBucket}'!`);
    } else {
      setStatusMessage(`⚠️ Uploaded ${successCount} file(s), ${failCount} failed.`);
    }

    await fetchFiles();
    if (multiFileInputRef.current) multiFileInputRef.current.value = "";
  };

  // Filter & sort files
  const rawFiles = bucketFiles[selectedBucket] || [];
  const filteredFiles = rawFiles
    .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size") {
        return b.size - a.size;
      }
      return 0;
    });

  const totalBytesInBucket = rawFiles.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const currentDef = BUCKET_DEFS.find((b) => b.id === selectedBucket)!;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="card-surface p-6 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <HardDrive className="w-5 h-5 text-primary" />
            <h3 className="font-headline font-bold text-lg text-on-surface dark:text-white">
              Storage Buckets &amp; Cloud Asset Pipeline
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20">
              Supabase + Local
            </span>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-[#a098b0]">
            Centralized bucket storage for photography galleries, profile avatars, branding logos, and licensed RAW master vaults.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFiles}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant/30 text-xs font-label uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Buckets</span>
        </button>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-label ${
            statusMessage.startsWith("✅")
              ? "bg-primary/10 border border-primary/30 text-primary"
              : statusMessage.startsWith("⚠️")
              ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Bucket Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {BUCKET_DEFS.map((b) => {
          const files = bucketFiles[b.id] || [];
          const count = files.length;
          const bytes = files.reduce((acc, curr) => acc + (curr.size || 0), 0);
          const isSelected = selectedBucket === b.id;
          const Icon = b.icon;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBucket(b.id);
                setSearchQuery("");
              }}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? "card-surface border-primary shadow-[0_0_15px_rgba(0,255,204,0.15)] ring-1 ring-primary/40"
                  : "card-surface border-outline-variant/30 hover:border-outline-variant/60 hover:bg-surface-container/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${b.color}20`, color: b.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant dark:text-[#a098b0] border border-outline-variant/20">
                  {count} {count === 1 ? "file" : "files"}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-on-surface dark:text-white truncate">
                {b.name}
              </h4>
              <p className="text-[10px] text-on-surface-variant dark:text-[#a098b0] mt-0.5">
                {formatBytes(bytes)} • {b.limitMB}MB max
              </p>
            </button>
          );
        })}
      </div>

      {/* Current Bucket Details & Upload Dropzone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Direct Multi-File Upload Zone */}
        <div className="lg:col-span-5 card-surface p-6 rounded-2xl border border-outline-variant/30 space-y-4 h-fit">
          <div className="border-b border-outline-variant/20 pb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-bold text-sm text-on-surface dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload to &ldquo;{currentDef.name}&rdquo;</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
                {currentDef.public ? "Public CDN" : "Private Vault"}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-[#a098b0] mt-1">
              {currentDef.description}
            </p>
          </div>

          {/* Hidden Multi-file input */}
          <input
            ref={multiFileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleBatchUpload(e.target.files);
              }
            }}
          />

          {/* Drag & drop multi-file zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleBatchUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => !isUploadingMultiple && multiFileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
              isDragging
                ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,204,0.2)] scale-[1.01]"
                : "border-outline-variant/40 hover:border-primary/60 bg-surface-container/20 hover:bg-surface-container/35"
            }`}
          >
            {isUploadingMultiple ? (
              <div className="py-4 space-y-3">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-xs font-medium text-on-surface dark:text-white">
                  {uploadProgressText || "Uploading files..."}
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-on-surface dark:text-white">
                    Drag &amp; drop photos here, or{" "}
                    <span className="text-primary underline underline-offset-2">Browse</span>
                  </p>
                  <p className="text-xs text-on-surface-variant dark:text-[#a098b0]">
                    Select single or multiple files • Up to {currentDef.limitMB}MB each
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    multiFileInputRef.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-label uppercase tracking-wider font-semibold border border-primary/30 transition-all flex items-center gap-1.5"
                >
                  <FolderDown className="w-3.5 h-3.5" />
                  <span>Choose Files</span>
                </button>
              </>
            )}
          </div>

          {/* Bucket details box */}
          <div className="p-3.5 rounded-xl bg-surface-container/30 border border-outline-variant/20 text-[11px] text-on-surface-variant dark:text-[#a098b0] space-y-1.5">
            <div className="flex justify-between">
              <span>Target Directory:</span>
              <code className="text-primary font-mono">/public/uploads/{selectedBucket}/</code>
            </div>
            <div className="flex justify-between">
              <span>Total Usage:</span>
              <span className="font-semibold text-on-surface dark:text-white">
                {formatBytes(totalBytesInBucket)} ({rawFiles.length} files)
              </span>
            </div>
            <div className="flex justify-between">
              <span>File Limit:</span>
              <span>{currentDef.limitMB} MB per file</span>
            </div>
          </div>
        </div>

        {/* Right Column: File Gallery for active bucket */}
        <div className="lg:col-span-7 card-surface p-6 rounded-2xl border border-outline-variant/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
            <div>
              <h4 className="font-headline font-bold text-sm text-on-surface dark:text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-primary" />
                <span>Files in &ldquo;{selectedBucket}&rdquo;</span>
              </h4>
              <p className="text-xs text-on-surface-variant dark:text-[#a098b0] mt-0.5">
                {rawFiles.length} item{rawFiles.length === 1 ? "" : "s"} stored ({formatBytes(totalBytesInBucket)})
              </p>
            </div>

            {/* Search and Sort Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface dark:text-white outline-none focus:border-primary w-36 sm:w-44"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface dark:text-white outline-none focus:border-primary"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A-Z</option>
                <option value="size">File Size</option>
              </select>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="py-14 text-center text-on-surface-variant dark:text-[#a098b0] space-y-2">
              <ImageIcon className="w-12 h-12 mx-auto opacity-30 text-primary" />
              <p className="text-sm font-medium text-on-surface dark:text-white">
                {searchQuery ? "No files matched your filter." : "No files in this bucket yet."}
              </p>
              <p className="text-xs">
                {searchQuery
                  ? "Try searching for a different keyword."
                  : "Use the dropzone on the left to upload photos into this bucket."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container/20 hover:border-primary/50 transition-all p-3 space-y-2.5 group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Thumbnail preview */}
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="w-full h-36 rounded-lg bg-black/5 dark:bg-black/50 overflow-hidden relative cursor-pointer flex items-center justify-center border border-outline-variant/20"
                    >
                      {file.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-on-surface-variant opacity-50" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <p
                        className="text-xs font-mono font-medium text-on-surface dark:text-white truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant dark:text-[#a098b0] mt-0.5">
                        <span className="font-mono">{formatBytes(file.size)}</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-outline-variant/20">
                    <button
                      type="button"
                      onClick={() => handleCopy(file.url)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-primary text-[11px] font-label uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Copy Public URL"
                    >
                      {copiedUrl === file.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl === file.url ? "Copied!" : "Copy Link"}</span>
                    </button>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface-variant dark:text-[#a098b0] hover:text-primary transition-colors"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(file.name)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                      title="Delete from bucket"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card-surface max-w-3xl w-full rounded-2xl border border-outline-variant/40 overflow-hidden shadow-2xl space-y-4 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-on-surface dark:text-white truncate max-w-md">
                  {previewFile.name}
                </h4>
                <p className="text-[11px] text-on-surface-variant dark:text-[#a098b0]">
                  Bucket: <code className="text-primary font-mono">{previewFile.bucket}</code> • Size:{" "}
                  {formatBytes(previewFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-black/60 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <input
                type="text"
                readOnly
                value={previewFile.url}
                className="flex-1 bg-surface-container/50 border border-outline-variant/30 px-3 py-1.5 rounded-lg text-xs font-mono text-on-surface dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleCopy(previewFile.url)}
                className="px-4 py-1.5 rounded-lg bg-primary text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedUrl === previewFile.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl === previewFile.url ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
