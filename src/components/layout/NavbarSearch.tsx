"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Feather, Camera, FolderOpen, Loader2 } from "lucide-react";

interface NavbarSearchProps {
  onNavigate?: () => void;
  inline?: boolean;
}

export function NavbarSearch({
  onNavigate,
  inline = false,
}: NavbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    species: any[];
    products: any[];
    collections: any[];
  }>({ species: [], products: [], collections: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(inline);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown and collapse search on click outside (unless inline mode)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (!inline) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inline]);

  // Fetch search matches
  useEffect(() => {
    if (!query.trim()) {
      setResults({ species: [], products: [], collections: [] });
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && data.results) {
          setResults({
            species: data.results.species || [],
            products: data.results.products || [],
            collections: data.results.collections || [],
          });
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleLinkClick = () => {
    setIsOpen(false);
    setQuery("");
    if (!inline) setIsExpanded(false);
    if (onNavigate) onNavigate();
  };

  const handleSelect = (href: string) => {
    handleLinkClick();
    router.push(href);
  };

  const totalMatches =
    results.species.length + results.products.length + results.collections.length;

  return (
    <div ref={containerRef} className="relative">
      {!isExpanded && !inline ? (
        /* Only Lens Logo Icon Button */
        <button
          type="button"
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 80);
          }}
          className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-[#0e2818] dark:hover:bg-[#163d27] text-slate-700 dark:text-[#00ffcc] border-slate-200 dark:border-[#00ffcc]/20 hover:border-emerald-500/40 dark:hover:border-[#00ffcc]/50 shadow-xs group shrink-0"
          title="Search species, gallery & stories"
          aria-label="Search"
        >
          <Search className="w-4 h-4 text-slate-600 dark:text-[#00ffcc] group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        /* Expanded Search Input Box */
        <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-200">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#00ffcc] absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
                if (!inline) setIsExpanded(false);
              } else if (e.key === "Enter" && query.trim()) {
                if (results.species[0]) {
                  handleSelect(`/birds/${results.species[0].slug}`);
                } else if (results.products[0]) {
                  handleSelect(results.products[0].slug ? `/gallery/${results.products[0].slug}` : `/gallery`);
                } else {
                  handleSelect(`/birds?q=${encodeURIComponent(query.trim())}`);
                }
              }
            }}
            placeholder="Search..."
            className="w-52 sm:w-60 pl-8 pr-7 py-1.5 rounded-full bg-white dark:bg-[#061a0f] border border-slate-300 dark:border-[#00ffcc]/40 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-[#00ffcc] shadow-md transition-all"
          />
          {isLoading ? (
            <Loader2 className="w-3 h-3 text-[#00ffcc] animate-spin absolute right-2.5" />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (query) {
                  setQuery("");
                  setIsOpen(false);
                } else if (!inline) {
                  setIsExpanded(false);
                  setIsOpen(false);
                }
              }}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
              title={query ? "Clear search" : "Close search"}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Simple Dropdown List */}
      {isOpen && query.trim() && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute top-full left-0 md:left-auto md:right-0 mt-2 w-full md:w-80 bg-white dark:bg-[#05170d] border border-slate-200 dark:border-[#00ffcc]/30 rounded-2xl shadow-2xl overflow-hidden z-[999] max-h-80 overflow-y-auto"
        >
          {isLoading && totalMatches === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 font-mono">
              Searching...
            </div>
          ) : totalMatches === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No matches found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-1 divide-y divide-slate-100 dark:divide-white/5">
              {/* Species matches */}
              {results.species.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/birds/${sp.slug}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#0a2717] transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-emerald-50 dark:bg-[#04120a] border border-emerald-200 dark:border-[#00ffcc]/20 shrink-0 flex items-center justify-center">
                    {sp.heroImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sp.heroImageUrl}
                        alt={sp.commonName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Feather className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ffcc]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-[#00ffcc] transition-colors truncate">
                      {sp.commonName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic truncate">
                      {sp.scientificName}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-[#00ffcc]/15 text-emerald-700 dark:text-[#00ffcc]">
                    Bird
                  </span>
                </Link>
              ))}

              {/* Fine art plates matches */}
              {results.products.map((p) => (
                <Link
                  key={p.id}
                  href={p.slug ? `/gallery/${p.slug}` : `/gallery`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#0a2717] transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#04120a] border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                    {p.imageUrl || p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl || p.thumbnailUrl}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-[#ff2d78] transition-colors truncate">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {p.species || p.locationName || "Fine Art Plate"}
                    </p>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-pink-50 dark:bg-[#ff2d78]/15 text-pink-600 dark:text-[#ff2d78]">
                    Print
                  </span>
                </Link>
              ))}

              {/* Collections matches */}
              {results.collections.map((c) => (
                <Link
                  key={c.id}
                  href={`/collections/${c.slug}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-[#0a2717] transition-colors cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 shrink-0 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                      {c.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Collection
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
