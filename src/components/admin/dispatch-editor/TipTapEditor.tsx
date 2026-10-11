"use client";

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Sparkles,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Maximize2,
  Minimize2,
  ChevronDown,
  Camera,
  Compass,
  Radio,
  Navigation,
  ShoppingBag,
  ShieldCheck,
  PawPrint,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

import { customEditorExtensions } from "./blocks/customNodes";

export interface TipTapEditorHandle {
  insertImage: (url: string, alt?: string) => void;
  insertGallery: (images: { url: string; alt?: string }[]) => void;
}

interface TipTapEditorProps {
  initialContent?: any;
  onChange: (json: any, html: string, plainText: string) => void;
  onOpenMediaDrawer?: () => void;
  saveStatus?: "saved" | "saving" | "unsaved" | "idle";
  lastSavedAt?: Date | null;
  lastSavedTime?: string | null;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(function TipTapEditor(
  {
    initialContent,
    onChange,
    onOpenMediaDrawer,
    saveStatus = "idle",
    lastSavedAt,
    lastSavedTime,
    isFocusMode = false,
    onToggleFocusMode,
  },
  ref
) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [showMoreBlocksMenu, setShowMoreBlocksMenu] = useState(false);
  const [showFloatingPlusMenu, setShowFloatingPlusMenu] = useState(false);
  const [liveWordCount, setLiveWordCount] = useState(0);
  const [liveReadingTime, setLiveReadingTime] = useState(1);
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreBlocksMenuRef = useRef<HTMLDivElement>(null);

  // Close "More blocks" menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreBlocksMenuRef.current && !moreBlocksMenuRef.current.contains(e.target as Node)) {
        setShowMoreBlocksMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Relative timer ticker
  useEffect(() => {
    if (!lastSavedAt) return;
    const updateTimeAgo = () => {
      const diff = Math.floor((Date.now() - new Date(lastSavedAt).getTime()) / 1000);
      setSecondsAgo(Math.max(0, diff));
    };
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: "Write your expedition narrative, field log, or press '/' for rich blocks...",
      }),
      ImageExtension.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-xl border border-slate-200 dark:border-[#163e26] max-w-full my-6 shadow-xl",
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-emerald-600 dark:text-[#00ffcc] underline hover:text-emerald-500 dark:hover:text-[#c0fff4] cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ...customEditorExtensions,
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: "tiptap ProseMirror focus:outline-none min-h-[440px] py-4",
      },
      handleDrop(view, event) {
        // Handle drag & drop from media drawer or local desktop
        const jsonData = event.dataTransfer?.getData("application/json");
        if (jsonData) {
          try {
            const data = JSON.parse(jsonData);
            if (data.src) {
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (coordinates) {
                view.dispatch(
                  view.state.tr.insert(
                    coordinates.pos,
                    view.state.schema.nodes.image.create({ src: data.src, alt: data.alt || "" })
                  )
                );
                return true;
              }
            }
          } catch {}
        }

        const textUrl = event.dataTransfer?.getData("text/plain");
        if (textUrl && (textUrl.startsWith("http://") || textUrl.startsWith("https://"))) {
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (coordinates) {
            view.dispatch(
              view.state.tr.insert(
                coordinates.pos,
                view.state.schema.nodes.image.create({ src: textUrl, alt: "Field photograph" })
              )
            );
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const text = editor.getText();

      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      setLiveWordCount(words);
      setLiveReadingTime(Math.max(1, Math.ceil(words / 200)));

      onChange(json, html, text);

      // Slash command detection
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 20), from, "\n");
      const lastSlashIndex = textBefore.lastIndexOf("/");
      if (lastSlashIndex !== -1 && !textBefore.slice(lastSlashIndex).includes(" ")) {
        setShowSlashMenu(true);
        setSlashQuery(textBefore.slice(lastSlashIndex + 1).toLowerCase());
      } else {
        setShowSlashMenu(false);
      }
    },
    immediatelyRender: false,
  });

  // Sync initial content if loaded asynchronously
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
      setLiveWordCount(words);
      setLiveReadingTime(Math.max(1, Math.ceil(words / 200)));
    }
  }, [editor, initialContent]);

  // Expose imperative handle for MediaDrawer
  useImperativeHandle(ref, () => ({
    insertImage: (url: string, alt?: string) => {
      if (!editor) return;
      editor.chain().focus().setImage({ src: url, alt: alt || "Field photograph" }).run();
    },
    insertGallery: (images: { url: string; alt?: string }[]) => {
      if (!editor || images.length === 0) return;
      const chain = editor.chain().focus();
      for (const img of images) {
        chain.setImage({ src: img.url, alt: img.alt || "Field photograph" });
      }
      chain.run();
    },
  }));

  if (!editor) {
    return (
      <div className="h-64 rounded-xl border border-slate-200 dark:border-[#163e26] bg-slate-50 dark:bg-[#081e12] animate-pulse flex items-center justify-center text-xs font-mono text-slate-500 dark:text-[#a098b0]">
        Initializing TipTap Engine &amp; Rich Blocks...
      </div>
    );
  }

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim() })
        .run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "gallery");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      }
    } catch (err) {
      console.error("Failed to upload image into editor:", err);
    } finally {
      e.target.value = "";
    }
  };

  // Block insertion helper
  const insertCustomBlock = (blockType: string, attrs = {}) => {
    editor.chain().focus().insertContent({ type: blockType, attrs }).run();
    setShowMoreBlocksMenu(false);
    setShowFloatingPlusMenu(false);
  };

  const slashCommands = [
    {
      title: "Heading 2",
      sub: "Major expedition chapter divider",
      icon: <Heading2 className="w-4 h-4 text-[#00ffcc]" />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      sub: "Subsection or species section",
      icon: <Heading3 className="w-4 h-4 text-[#00ffcc]" />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Optics & Field Telemetry",
      sub: "Camera, lens, focal length, EXIF metrics",
      icon: <Camera className="w-4 h-4 text-[#ff2d78]" />,
      action: () => insertCustomBlock("opticsBlock"),
    },
    {
      title: "Field Stats Ribbon",
      sub: "GPS waypoint, elevation, temperature, acoustics",
      icon: <Compass className="w-4 h-4 text-emerald-500" />,
      action: () => insertCustomBlock("fieldStatsBlock"),
    },
    {
      title: "Binaural Field Audio",
      sub: "Interactive 3D ambient soundscape player",
      icon: <Radio className="w-4 h-4 text-[#00ffcc]" />,
      action: () => insertCustomBlock("audioSoundscapeBlock"),
    },
    {
      title: "Topographic Map Schematic",
      sub: "Vector river flow, hide waypoint, apex trajectory",
      icon: <Navigation className="w-4 h-4 text-[#ff2d78]" />,
      action: () => insertCustomBlock("mapSchematicBlock"),
    },
    {
      title: "Fine Art Print & RAW License",
      sub: "Tiered print and commercial acquisition card",
      icon: <ShoppingBag className="w-4 h-4 text-[#ffe04a]" />,
      action: () => insertCustomBlock("shopPrintBlock"),
    },
    {
      title: "Ethical Photography Protocol",
      sub: "Zero infiltration, drone ban, 10% royalty guarantee",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      action: () => insertCustomBlock("ethicsProtocolBlock"),
    },
    {
      title: "Species Field Profile",
      sub: "IUCN Red List status, population, behavior card",
      icon: <PawPrint className="w-4 h-4 text-[#ff2d78]" />,
      action: () => insertCustomBlock("speciesCardBlock"),
    },
    {
      title: "Naturalist Callout Box",
      sub: "Field caution, expedition note, or protocol alert",
      icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
      action: () => insertCustomBlock("calloutBlock"),
    },
    {
      title: "Expedition Gear List",
      sub: "Optical bodies, support rig, audio, power checklist",
      icon: <Wrench className="w-4 h-4 text-emerald-500" />,
      action: () => insertCustomBlock("gearListBlock"),
    },
    {
      title: "Bullet Checklist",
      sub: "Field observations or pack checklist",
      icon: <List className="w-4 h-4 text-slate-400" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Numbered Steps",
      sub: "Sequential tracking trajectory",
      icon: <ListOrdered className="w-4 h-4 text-slate-400" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Field Quote",
      sub: "Evocative quote with large quotation mark",
      icon: <Quote className="w-4 h-4 text-slate-400" />,
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Horizontal Divider",
      sub: "Pause between expedition narratives",
      icon: <Minus className="w-4 h-4 text-slate-400" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: "Upload Photograph",
      sub: "Insert high-resolution photograph file",
      icon: <Upload className="w-4 h-4 text-slate-400" />,
      action: () => fileInputRef.current?.click(),
    },
  ];

  const filteredCommands = slashCommands.filter(
    (c) =>
      c.title.toLowerCase().includes(slashQuery) ||
      c.sub.toLowerCase().includes(slashQuery)
  );

  return (
    <div ref={editorRef} className="space-y-3 relative">
      {/* ── 1. FLOATING SELECTION BUBBLE MENU ── */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-900/95 dark:bg-[#06180e]/95 backdrop-blur-md border border-slate-700 dark:border-[#00ffcc]/30 shadow-2xl text-white z-40 transition-all animate-in fade-in-50 zoom-in-95"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("bold") ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("italic") ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("strike") ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("code") ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-white/15 mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-emerald-600 text-white"
              : "hover:bg-white/10 text-slate-300"
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-emerald-600 text-white"
              : "hover:bg-white/10 text-slate-300"
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("blockquote")
              ? "bg-emerald-600 text-white"
              : "hover:bg-white/10 text-slate-300"
          }`}
          title="Pull Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-white/15 mx-0.5" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-emerald-600 text-white"
              : "hover:bg-white/10 text-slate-300"
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-emerald-600 text-white"
              : "hover:bg-white/10 text-slate-300"
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setLinkUrl(editor.getAttributes("link").href || "");
            setLinkModalOpen(true);
          }}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            editor.isActive("link") ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
          }`}
          title="Link (Ctrl+K)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </BubbleMenu>

      {/* ── 2. EMPTY-LINE FLOATING MENU (+) ── */}
      <FloatingMenu
        editor={editor}
        className="flex items-center gap-1 z-30"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFloatingPlusMenu((prev) => !prev)}
            className="w-7 h-7 rounded-full bg-slate-900 dark:bg-[#103420] text-emerald-400 hover:text-white border border-slate-700 dark:border-[#00ffcc]/40 shadow-lg flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
            title="Add block on this line"
          >
            <Plus className="w-4 h-4" />
          </button>

          {showFloatingPlusMenu && (
            <div className="absolute left-9 -top-3 z-50 w-64 rounded-xl bg-white dark:bg-[#081e12] border border-slate-200 dark:border-[#163e26] p-2 shadow-2xl space-y-1 animate-in fade-in-50 zoom-in-95">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-500 dark:text-[#a098b0] border-b border-slate-100 dark:border-white/5 font-semibold">
                Insert Expedition Block
              </div>
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {slashCommands.slice(0, 11).map((cmd) => (
                  <button
                    key={cmd.title}
                    type="button"
                    onClick={() => {
                      cmd.action();
                      setShowFloatingPlusMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <span className="shrink-0">{cmd.icon}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc]">
                      {cmd.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </FloatingMenu>

      {/* ── 3. STICKY FORMATTING TOOLBAR ── */}
      <div className="sticky top-0 z-30 p-2 rounded-xl bg-white dark:bg-[#081e12] backdrop-blur-md border border-slate-200 dark:border-[#163e26] tiptap-toolbar flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center flex-wrap gap-1 flex-1 min-w-0">
          {/* History (Undo / Redo) */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#163e26] mx-0.5" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-label uppercase transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] font-bold border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Heading 2 (Ctrl+Alt+2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-label uppercase transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] font-bold border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Heading 3 (Ctrl+Alt+3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#163e26] mx-0.5" />

          {/* Inline Formats */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bold")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] font-bold border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("italic")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("strike")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("code")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#163e26] mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "left" })
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "center" })
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "right" })
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#163e26] mx-0.5" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bulletList")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("orderedList")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("blockquote")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Field Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50 transition-colors"
            title="Divider Line (---)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-[#163e26] mx-0.5" />

          {/* Link & Photos */}
          <button
            type="button"
            onClick={() => {
              setLinkUrl(editor.getAttributes("link").href || "");
              setLinkModalOpen(true);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("link")
                ? "bg-emerald-50 dark:bg-[#103420] text-emerald-600 dark:text-[#00ffcc] border border-emerald-300 dark:border-[#00ffcc]/30"
                : "text-slate-600 dark:text-[#a098b0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]/50"
            }`}
            title="Insert Hyperlink (Ctrl+K)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-slate-600 dark:text-[#a098b0] hover:text-emerald-600 dark:hover:text-[#00ffcc] hover:bg-slate-100 dark:hover:bg-[#103420]/50 transition-colors"
            title="Upload Photo File"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── RIGHT ACTION BUTTONS (Media Drawer & More Blocks) ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenMediaDrawer && (
            <button
              type="button"
              onClick={onOpenMediaDrawer}
              title="Open Media Drawer (Ctrl+M)"
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#0e2417] text-emerald-700 dark:text-[#00ffcc] hover:bg-emerald-100 dark:hover:bg-[#163e26] text-[11px] font-label uppercase tracking-wider border border-emerald-200 dark:border-[#00ffcc]/20 flex items-center gap-1.5 transition-all font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Media Drawer</span>
            </button>
          )}

          {/* ── "MORE BLOCKS" DROPDOWN MENU ── */}
          <div className="relative" ref={moreBlocksMenuRef}>
            <button
              id="more-blocks-button"
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={() => setShowMoreBlocksMenu((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#103420] text-slate-800 dark:text-[#e8e0f0] hover:bg-slate-200 dark:hover:bg-[#163e26] text-[11px] font-label uppercase tracking-wider border border-slate-200 dark:border-[#163e26] flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
              title="Insert cinematic blog block components"
            >
              <span>More Blocks</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showMoreBlocksMenu && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#081e12] border border-slate-200 dark:border-[#00ffcc]/40 shadow-2xl p-2.5 space-y-1 backdrop-blur-xl animate-in fade-in-50 zoom-in-95"
              >
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-[#00ffcc] font-bold border-b border-slate-100 dark:border-white/5">
                  Cinematic Field Components
                </div>
                <div className="max-h-80 overflow-y-auto space-y-0.5">
                  <button
                    id="insert-optics-button"
                    type="button"
                    onClick={() => insertCustomBlock("opticsBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4 text-[#ff2d78]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Optics &amp; Field Telemetry
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Nikon Z9, glass, focal &amp; EXIF metrics
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-stats-button"
                    type="button"
                    onClick={() => insertCustomBlock("fieldStatsBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Field Stats Ribbon
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        GPS Waypoint, elevation, temperature, sound
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-audio-button"
                    type="button"
                    onClick={() => insertCustomBlock("audioSoundscapeBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 text-[#00ffcc]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Binaural Field Audio
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Interactive 3D ambient waveform player
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-map-button"
                    type="button"
                    onClick={() => insertCustomBlock("mapSchematicBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4 text-[#ff2d78]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Topographic Map Schematic
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Vector river flow, hide waypoint, apex trajectory
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-shop-button"
                    type="button"
                    onClick={() => insertCustomBlock("shopPrintBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-[#eab308]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Shop Print &amp; RAW License
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Tiered print acquisition &amp; collector release
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-ethics-button"
                    type="button"
                    onClick={() => insertCustomBlock("ethicsProtocolBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Ethical Wildlife Protocol
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Zero infiltration, drone ban, 10% royalty
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-species-button"
                    type="button"
                    onClick={() => insertCustomBlock("speciesCardBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4 text-[#ff2d78]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Species Field Profile
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        IUCN Red List status, population, behavior
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-callout-button"
                    type="button"
                    onClick={() => insertCustomBlock("calloutBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Naturalist Callout Box
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Field caution, caution, or expedition note
                      </div>
                    </div>
                  </button>

                  <button
                    id="insert-gear-button"
                    type="button"
                    onClick={() => insertCustomBlock("gearListBlock")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-[#e8e0f0] group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] truncate">
                        Expedition Gear List
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-[#a098b0] leading-tight truncate">
                        Bodies, support rig, audio, power checklist
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. SLASH COMMAND AUTOCOMPLETE POPOVER ── */}
      {showSlashMenu && filteredCommands.length > 0 && (
        <div className="absolute left-4 top-20 z-40 w-80 rounded-2xl bg-white dark:bg-[#081e12] border border-slate-200 dark:border-[#00ffcc]/40 shadow-2xl p-2 space-y-1 backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-[#00ffcc] border-b border-slate-100 dark:border-[#163e26] font-bold">
            Insert Block (Type to filter)
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {filteredCommands.map((cmd) => (
              <button
                key={cmd.title}
                type="button"
                onClick={() => {
                  const { from } = editor.state.selection;
                  editor.commands.deleteRange({
                    from: Math.max(0, from - slashQuery.length - 1),
                    to: from,
                  });
                  cmd.action();
                  setShowSlashMenu(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#103420] text-left transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] group-hover:border-emerald-500 dark:group-hover:border-[#00ffcc]/40 flex items-center justify-center shrink-0">
                  {cmd.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc]">
                    {cmd.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-[#a098b0] leading-none mt-0.5">
                    {cmd.sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. MAIN EDITOR CANVAS BOX ── */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#081e12]/60 border border-slate-200 dark:border-[#163e26] tiptap-canvas-container min-h-[460px] focus-within:border-emerald-500 dark:focus-within:border-[#00ffcc]/40 transition-colors shadow-sm">
        <EditorContent editor={editor} />
      </div>

      {/* ── 6. BOTTOM STATUS BAR ── */}
      <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081e12] border border-slate-200 dark:border-[#163e26] flex items-center justify-between text-xs text-slate-500 dark:text-[#a098b0]">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            <strong className="text-slate-800 dark:text-white">{liveWordCount}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-800 dark:text-white">{liveReadingTime}</strong> min read
          </span>
          <span>•</span>
          {/* Relative save status */}
          <div className="inline-flex items-center gap-1.5">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                <span className="text-amber-500">Saving changes...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-[#00ffcc]" />
                <span className="text-emerald-600 dark:text-[#00ffcc]">
                  {secondsAgo !== null
                    ? secondsAgo < 5
                      ? "Saved just now"
                      : `Saved ${secondsAgo}s ago`
                    : lastSavedTime
                    ? `Saved at ${lastSavedTime}`
                    : "Saved"}
                </span>
              </>
            ) : saveStatus === "unsaved" ? (
              <>
                <Clock className="w-3 h-3 text-amber-500" />
                <span className="text-amber-500">Unsaved changes</span>
              </>
            ) : (
              <span>Ready</span>
            )}
          </div>
        </div>

        {/* Focus Mode Toggle */}
        {onToggleFocusMode && (
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-label uppercase tracking-wider transition-all font-semibold ${
              isFocusMode
                ? "bg-emerald-600 text-white shadow-sm"
                : "hover:bg-slate-200 dark:hover:bg-[#103420] text-slate-600 dark:text-[#a098b0]"
            }`}
            title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode (Distraction-Free Canvas)"}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Zen Mode</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Focus Mode</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ── 7. LINK MODAL ── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#081e12] border border-slate-200 dark:border-[#163e26] p-6 space-y-4 shadow-2xl">
            <h4 className="text-base font-headline font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-[#00ffcc]" />
              <span>Insert Web Hyperlink</span>
            </h4>
            <input
              type="url"
              placeholder="https://example.com/field-notes"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#04120a] border border-slate-200 dark:border-[#163e26] text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSetLink();
              }}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-label uppercase text-slate-500 hover:text-slate-900 dark:text-[#a098b0] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#103420]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSetLink}
                className="px-4 py-2 rounded-xl text-xs font-label uppercase font-bold bg-emerald-600 text-white dark:bg-[#00ffcc] dark:text-[#04120a] hover:bg-emerald-500 dark:hover:bg-[#c0fff4]"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for inline image insertion */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
});

export default TipTapEditor;
