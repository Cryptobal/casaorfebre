"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn, formatCLP } from "@/lib/utils";
import { trackSearch } from "@/lib/analytics-events";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductResult {
  slug: string;
  name: string;
  price: number;
  category: string;
  images: { url: string; altText: string | null }[];
  artisan: { displayName: string };
}

interface ArtisanResult {
  slug: string;
  displayName: string;
  location: string;
  specialty: string;
  profileImage: string | null;
}

interface SearchResults {
  products: ProductResult[];
  artisans: ArtisanResult[];
}

/* ------------------------------------------------------------------ */
/*  Search icon SVG                                                    */
/* ------------------------------------------------------------------ */

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-text-tertiary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Portal needs document.body — only available after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Autofocus input when modal opens
  useEffect(() => {
    if (open) {
      // Small delay so the portal has rendered
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    // Reset state when closing
    setQuery("");
    setResults(null);
    setLoading(false);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: SearchResults) => {
          setResults(data);
          setLoading(false);
          trackSearch(query.trim());
        })
        .catch((err) => {
          if (err.name !== "AbortError") setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  const hasResults =
    results &&
    (results.products.length > 0 || results.artisans.length > 0);
  const hasQuery = query.trim().length >= 2;

  /* ---- Trigger button ---- */
  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
      aria-label="Buscar"
    >
      <SearchIcon />
      <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </button>
  );

  /* ---- Modal overlay ---- */
  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] md:pt-[20vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={cn(
              "relative w-full max-w-lg bg-surface rounded-xl shadow-2xl border border-border",
              "flex flex-col overflow-hidden",
              // Mobile: fullscreen
              "max-md:fixed max-md:inset-0 max-md:rounded-none max-md:border-0 max-md:max-w-none max-md:pt-0",
            )}
          >
            {/* Search input bar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <SearchIcon className="shrink-0 text-text-tertiary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca productos, orfebres, materiales..."
                className="flex-1 bg-transparent text-text placeholder:text-text-tertiary outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              />
              {loading && <Spinner />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-text-tertiary hover:text-text transition-colors md:border md:border-border md:rounded md:px-1.5 md:py-0.5 md:text-[10px] md:font-medium"
                aria-label="Cerrar búsqueda"
              >
                <svg className="h-5 w-5 md:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span className="hidden md:inline">ESC</span>
              </button>
            </div>

            {/* Results area */}
            <div className="max-h-[60vh] max-md:flex-1 overflow-y-auto overscroll-contain">
              {/* Empty state — no query yet */}
              {!hasQuery && !loading && (
                <div className="px-4 py-10 text-center text-sm text-text-tertiary font-light">
                  Busca productos, orfebres, materiales...
                </div>
              )}

              {/* Loading with no prior results */}
              {loading && !results && hasQuery && (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              )}

              {/* No results */}
              {hasQuery && !loading && results && !hasResults && (
                <div className="px-4 py-10 text-center text-sm text-text-tertiary font-light">
                  No encontramos resultados para &lsquo;{query.trim()}&rsquo;
                </div>
              )}

              {/* Products */}
              {results && results.products.length > 0 && (
                <div className="px-2 pt-3 pb-1">
                  <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Productos
                  </p>
                  <ul>
                    {results.products.map((product) => (
                      <li key={product.slug}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/coleccion/${product.slug}`)
                          }
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.04] transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black/[0.03]">
                            {product.images[0] ? (
                              <Image
                                src={product.images[0].url}
                                alt={
                                  product.images[0].altText ?? product.name
                                }
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-tertiary text-xs">
                                --
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-serif text-text">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-text-secondary font-light">
                              {product.artisan.displayName}
                            </p>
                          </div>

                          {/* Price */}
                          <span className="shrink-0 text-sm text-accent font-medium">
                            {formatCLP(product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Artisans */}
              {results && results.artisans.length > 0 && (
                <div className="px-2 pt-3 pb-3">
                  <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Orfebres
                  </p>
                  <ul>
                    {results.artisans.map((artisan) => {
                      const initials = artisan.displayName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <li key={artisan.slug}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/orfebres/${artisan.slug}`)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.04] transition-colors"
                          >
                            {/* Avatar */}
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent/10">
                              {artisan.profileImage ? (
                                <Image
                                  src={artisan.profileImage}
                                  alt={artisan.displayName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-accent text-xs font-medium">
                                  {initials}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-serif text-text">
                                {artisan.displayName}
                              </p>
                              <p className="truncate text-xs text-text-secondary font-light">
                                {artisan.specialty} &middot; {artisan.location}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  if (!mounted) {
    // SSR / first render — just show the trigger without portal
    return trigger;
  }

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}
