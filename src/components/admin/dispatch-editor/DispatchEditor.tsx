"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  Sidebar as SidebarIcon,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import CoverImagePicker from "./CoverImagePicker";
import TipTapEditor, { TipTapEditorHandle } from "./TipTapEditor";
import EditorSidebar from "./EditorSidebar";
import MediaDrawer from "./MediaDrawer";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DispatchEditorProps {
  initialPostId?: string | null;
}

export default function DispatchEditor({ initialPostId }: DispatchEditorProps) {
  const router = useRouter();

  // Identification & State
  const [postId, setPostId] = useState<string | null>(initialPostId || null);
  const [loadingInitial, setLoadingInitial] = useState(Boolean(initialPostId));
  const [categories, setCategories] = useState<Category[]>([]);

  // Editorial Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentJson, setContentJson] = useState<any>(null);
  const [contentHtml, setContentHtml] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFocalX, setCoverFocalX] = useState<number>(50);
  const [coverFocalY, setCoverFocalY] = useState<number>(50);
  const [status, setStatus] = useState<"draft" | "published" | "scheduled" | "archived">("draft");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(3);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>("");
  const [locationPrecision, setLocationPrecision] = useState<string>("national_park");
  const [wordCount, setWordCount] = useState<number>(0);

  // UI state
  const [isMediaDrawerOpen, setIsMediaDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [hasTabCollision, setHasTabCollision] = useState(false);

  // Autosave Telemetry
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved" | "idle">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for debouncing, checking changes & imperative TipTap handle
  const editorHandleRef = useRef<TipTapEditorHandle>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  const isSavingRef = useRef(false);

  // Tab Collision Guard using BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const channelId = `suban_editor_tab_${postId || "new"}`;
    const myTabId = Math.random().toString(36).substring(2, 9);
    const channel = new BroadcastChannel(channelId);

    // Broadcast ping to detect existing tabs
    channel.postMessage({ type: "ping", tabId: myTabId });

    channel.onmessage = (event) => {
      if (event.data?.tabId && event.data.tabId !== myTabId) {
        if (event.data.type === "ping") {
          setHasTabCollision(true);
          channel.postMessage({ type: "pong", tabId: myTabId });
        } else if (event.data.type === "pong") {
          setHasTabCollision(true);
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [postId]);

  // 1. Fetch categories
  useEffect(() => {
    fetch("/api/posts?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.warn("Failed to load categories:", err));
  }, []);

  // 2. Fetch existing post if editing
  useEffect(() => {
    if (!initialPostId) return;

    setLoadingInitial(true);
    fetch(`/api/posts?id=${initialPostId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.post) {
          const p = data.post;
          setTitle(p.title || "");
          setSlug(p.slug || "");
          setExcerpt(p.excerpt || "");
          setContentJson(p.contentJson || null);
          setContentHtml(p.contentHtml || p.content || "");
          setCoverImage(p.coverImage || null);
          setCoverFocalX(p.coverFocalX ?? 50);
          setCoverFocalY(p.coverFocalY ?? 50);
          setStatus(p.status || "draft");
          setScheduledAt(p.scheduledAt ? new Date(p.scheduledAt).toISOString() : null);
          setCategoryId(p.categoryId || null);
          setReadingTimeMinutes(p.readingTimeMinutes || 3);
          setIsFeatured(Boolean(p.isFeatured));
          setLocationLabel(p.locationLabel || "");
          setLocationPrecision(p.locationPrecision || "national_park");

          // Estimate words
          const text = (p.content || p.excerpt || "").trim();
          const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
          setWordCount(words);
          setSaveStatus("saved");
          setLastSavedTime(
            new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }
      })
      .catch((err) => {
        console.error("Error loading post:", err);
        setErrorMessage("Failed to load dispatch details");
      })
      .finally(() => {
        setLoadingInitial(false);
      });
  }, [initialPostId]);

  // 3. Save implementation
  const performSave = useCallback(
    async (overrideStatus?: "draft" | "published" | "scheduled" | "archived") => {
      // Must have title
      if (!title.trim()) {
        return;
      }

      const postStatus = overrideStatus || status;
      isSavingRef.current = true;
      setSaveStatus("saving");
      setErrorMessage(null);

      const payload: Record<string, any> = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim(),
        content: contentHtml,
        contentJson,
        contentHtml,
        coverImage,
        coverFocalX,
        coverFocalY,
        status: postStatus,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        categoryId: categoryId || null,
        readingTimeMinutes,
        isFeatured,
        locationLabel: locationLabel.trim() || null,
        locationPrecision,
      };

      try {
        let res;
        if (postId) {
          // Update existing
          res = await fetch("/api/posts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: postId, ...payload }),
          });
        } else {
          // Create new post
          res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Save failed");
        }

        const savedPost = data.post;
        if (!postId && savedPost?.id) {
          setPostId(savedPost.id);
          // Seamlessly update URL without full page reload
          window.history.replaceState(null, "", `/admin/dispatches/${savedPost.id}`);
        }

        if (savedPost?.slug && !slug) {
          setSlug(savedPost.slug);
        }

        if (overrideStatus) {
          setStatus(overrideStatus);
        }

        isDirtyRef.current = false;
        setSaveStatus("saved");
        setLastSavedAt(new Date());
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      } catch (err: any) {
        console.error("Autosave error:", err);
        setSaveStatus("unsaved");
        setErrorMessage(err.message || "Failed to autosave changes");
      } finally {
        isSavingRef.current = false;
      }
    },
    [
      postId,
      title,
      slug,
      excerpt,
      contentHtml,
      contentJson,
      coverImage,
      coverFocalX,
      coverFocalY,
      status,
      scheduledAt,
      categoryId,
      readingTimeMinutes,
      isFeatured,
      locationLabel,
      locationPrecision,
    ]
  );

  // 4. Debounced trigger for autosave
  const triggerAutosave = useCallback(() => {
    isDirtyRef.current = true;
    setSaveStatus("unsaved");
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      performSave();
    }, 1500);
  }, [performSave]);

  // Handle TipTap content updates
  const handleContentChange = (json: any, html: string, plainText: string) => {
    setContentJson(json);
    setContentHtml(html);
    const words = plainText.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);

    // Auto-update reading time
    const calc = Math.max(1, Math.ceil(words / 200));
    setReadingTimeMinutes(calc);

    triggerAutosave();
  };

  // Warn on tab close if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        performSave("draft");
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setIsMediaDrawerOpen((prev) => !prev);
      } else if (e.key === "Escape" && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [performSave, isFocusMode]);

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#04120a] flex items-center justify-center text-white font-body">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00ffcc] animate-spin" />
          <p className="text-xs font-mono text-[#a098b0]">Loading dispatch canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04120a] text-[#e8e0f0] flex flex-col font-body selection:bg-[#00ffcc] selection:text-[#04120a]">
      {/* ── TOP HEADER BAR ── */}
      <header className="h-16 border-b border-[#163e26] bg-[#081e12]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#a098b0] hover:text-[#00ffcc] transition-colors p-2 rounded-xl hover:bg-[#103420]"
            title="Back to Control Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Control Studio</span>
          </Link>

          <div className="h-4 w-px bg-[#163e26]" />

          {/* Title & Status */}
          <div className="flex items-center gap-2 max-w-xs sm:max-w-md truncate">
            <span className="text-sm font-headline font-bold text-white truncate">
              {title || "Untitled Dispatch"}
            </span>

            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                status === "published"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                  : status === "scheduled"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                  : status === "archived"
                  ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                  : "bg-amber-950/80 text-amber-300 border-amber-500/40"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Autosave status badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#a098b0] font-mono px-2.5 py-1 rounded-lg bg-[#04120a] border border-[#163e26]">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-400">Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#00ffcc]">
                  Saved {lastSavedTime ? `at ${lastSavedTime}` : ""}
                </span>
              </>
            ) : saveStatus === "unsaved" ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#a098b0]" />
                <span>Autosave ready</span>
              </>
            )}
          </div>

          {/* Media Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMediaDrawerOpen(!isMediaDrawerOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMediaDrawerOpen
                ? "bg-[#103420] text-[#00ffcc] border-[#00ffcc]/40"
                : "bg-[#081e12] text-[#a098b0] border-[#163e26] hover:text-white"
            }`}
            title="Toggle Media Assets Drawer (Ctrl+M)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Settings Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSidebarOpen
                ? "bg-[#103420] text-[#00ffcc] border-[#00ffcc]/40"
                : "bg-[#081e12] text-[#a098b0] border-[#163e26] hover:text-white"
            }`}
            title="Toggle Editorial Settings Sidebar"
          >
            <SidebarIcon className="w-4 h-4" />
          </button>

          {/* Preview Public Article */}
          <Link
            href={slug ? `/blog/${slug}?preview=true` : "/blog"}
            target="_blank"
            className="px-3.5 py-1.5 rounded-xl border border-[#163e26] hover:border-[#00ffcc]/40 bg-[#0a2315] hover:bg-[#103420] text-xs font-label uppercase tracking-wider text-[#a098b0] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Preview Dispatch in new tab"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Link>

          {/* Save Draft */}
          {status !== "draft" ? (
            <button
              type="button"
              onClick={() => performSave("draft")}
              className="px-3.5 py-1.5 rounded-xl border border-[#163e26] hover:bg-[#103420] text-xs font-label uppercase tracking-wider text-[#a098b0] hover:text-white transition-all cursor-pointer"
              title="Save changes as Draft (Ctrl+S)"
            >
              Save as Draft
            </button>
          ) : (
            <button
              type="button"
              onClick={() => performSave("draft")}
              className="px-3.5 py-1.5 rounded-xl border border-[#163e26] hover:bg-[#103420] text-xs font-label uppercase tracking-wider text-[#a098b0] hover:text-white transition-all cursor-pointer"
              title="Save Draft (Ctrl+S)"
            >
              Save Draft
            </button>
          )}

          {/* Publish or Update button */}
          <button
            type="button"
            onClick={() => performSave("published")}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00ffcc] to-[#00d4aa] hover:opacity-95 text-[#04120a] text-xs font-label uppercase font-extrabold tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,204,0.35)] flex items-center gap-1.5 cursor-pointer"
            title="Publish / Broadcast Dispatch live to website"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{status === "published" ? "Update Published" : "Publish Dispatch"}</span>
          </button>
        </div>
      </header>

      {/* Multi-Tab Collision Alert Banner */}
      {hasTabCollision && (
        <div className="bg-amber-950/90 border-b border-amber-600/60 text-amber-200 px-6 py-2.5 text-xs flex items-center justify-between z-30 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Multi-Tab Collision Warning:</strong> This dispatch is active in another browser tab. To prevent accidental overwrites, please edit in only one window.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setHasTabCollision(false)}
            className="text-xs hover:underline text-amber-300 font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Floating Exit Pill during Zen Focus Mode */}
      {isFocusMode && (
        <div className="fixed top-4 right-6 z-50 flex items-center gap-2.5 bg-slate-900/95 dark:bg-[#081e12]/95 backdrop-blur-md border border-slate-700 dark:border-[#00ffcc]/40 px-3.5 py-1.5 rounded-full shadow-2xl text-xs font-mono text-emerald-400 animate-in fade-in-50">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Zen Focus Mode</span>
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-label uppercase font-bold tracking-wider transition-colors"
          >
            Exit (Esc)
          </button>
        </div>
      )}

      {/* Error alert toast */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-300 px-6 py-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs hover:underline text-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 3-COLUMN LAYOUT BODY ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Media Library Drawer */}
        <MediaDrawer
          isOpen={isMediaDrawerOpen}
          onClose={() => setIsMediaDrawerOpen(false)}
          onInsertImage={(url, alt) => {
            editorHandleRef.current?.insertImage(url, alt);
          }}
          onInsertGallery={(items) => {
            editorHandleRef.current?.insertGallery(items);
          }}
          onSetAsCover={(url) => {
            setCoverImage(url);
            triggerAutosave();
          }}
        />

        {/* Center Column: Writing Canvas */}
        <main
          className={`flex-1 overflow-y-auto px-4 sm:px-8 py-8 mx-auto space-y-6 w-full transition-all ${
            isFocusMode ? "max-w-3xl lg:px-16" : "max-w-4xl lg:px-12"
          }`}
        >
          {/* Cover Image Picker */}
          {!isFocusMode && (
            <CoverImagePicker
              coverImage={coverImage}
              focalX={coverFocalX}
              focalY={coverFocalY}
              onChangeCover={(url) => {
                setCoverImage(url);
                triggerAutosave();
              }}
              onChangeFocal={(x, y) => {
                setCoverFocalX(x);
                setCoverFocalY(y);
                triggerAutosave();
              }}
            />
          )}

          {/* Title Input */}
          <div className="pt-2">
            <textarea
              rows={1}
              placeholder="Expedition Title..."
              value={title}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              onChange={(e) => {
                setTitle(e.target.value);
                triggerAutosave();
              }}
              className="w-full bg-transparent border-none outline-none shadow-none p-0 text-3xl sm:text-4xl md:text-5xl font-headline font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-0 leading-tight resize-none overflow-hidden"
            />
          </div>

          {/* Excerpt / Subheading Input */}
          <div>
            <textarea
              placeholder="Add an evocative field synopsis, expedition location overview, or editorial abstract..."
              rows={2}
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                triggerAutosave();
              }}
              className="w-full bg-transparent border-none outline-none shadow-none p-0 text-lg sm:text-xl text-slate-600 dark:text-[#c8bfd8] placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:ring-0 resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* TipTap Rich Text Canvas */}
          <div className="pt-2">
            <TipTapEditor
              ref={editorHandleRef}
              initialContent={contentJson || contentHtml}
              onChange={handleContentChange}
              onOpenMediaDrawer={() => setIsMediaDrawerOpen(true)}
              saveStatus={saveStatus}
              lastSavedAt={lastSavedAt}
              lastSavedTime={lastSavedTime}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
            />
          </div>
        </main>

        {/* Right Column: Editorial Settings Sidebar */}
        {!isFocusMode && isSidebarOpen && (
          <aside className="border-l border-[#163e26] bg-[#06180e] overflow-y-auto p-5 shrink-0 hidden lg:block">
            <EditorSidebar
              postId={postId}
              title={title}
              slug={slug}
              status={status}
              scheduledAt={scheduledAt}
              categoryId={categoryId}
              categories={categories}
              tags={tags}
              readingTimeMinutes={readingTimeMinutes}
              wordCount={wordCount}
              isFeatured={isFeatured}
              locationLabel={locationLabel}
              locationPrecision={locationPrecision}
              onChangeSlug={(newSlug) => {
                setSlug(newSlug);
                triggerAutosave();
              }}
              onChangeStatus={(newStatus) => {
                setStatus(newStatus);
                triggerAutosave();
              }}
              onChangeScheduledAt={(newDate) => {
                setScheduledAt(newDate);
                triggerAutosave();
              }}
              onChangeCategory={(newCat) => {
                setCategoryId(newCat);
                triggerAutosave();
              }}
              onChangeTags={(newTags) => {
                setTags(newTags);
                triggerAutosave();
              }}
              onChangeReadingTime={(mins) => {
                setReadingTimeMinutes(mins);
                triggerAutosave();
              }}
              onChangeFeatured={(feat) => {
                setIsFeatured(feat);
                triggerAutosave();
              }}
              onChangeLocation={(loc, prec) => {
                setLocationLabel(loc);
                setLocationPrecision(prec);
                triggerAutosave();
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
