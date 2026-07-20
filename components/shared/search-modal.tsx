"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn, formatCLP } from "@/lib/utils";
import { trackSearch } from "@/lib/analytics-events";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { openShoppingChat, AssistantAvatar } from "@/components/chat/shopping-chatbot";

/* ------------------------------------------------------------------ */
/*  Visual Search Types                                                */
/* ------------------------------------------------------------------ */

interface VisualSearchResult {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    artisanName: string;
  }[];
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductResult {
  slug: string;
  name: string;
  price: number;
  categories: { name: string }[];
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
  categories?: { name: string; slug: string }[];
}

/* ------------------------------------------------------------------ */
/*  Sugerencias, recientes y accesos rápidos                           */
/* ------------------------------------------------------------------ */

const POPULAR_SEARCHES = [
  "Anillos de plata",
  "Aros",
  "Colgantes",
  "Pulseras",
  "Plata 950",
  "Regalos",
];

const EXPLORE_LINKS: { name: string; slug: string }[] = [
  { name: "Anillos", slug: "anillos" },
  { name: "Aros", slug: "aros" },
  { name: "Collares", slug: "collares" },
  { name: "Pulseras", slug: "pulseras" },
];

const RECENT_KEY = "co-recent-searches";

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]").slice(0, 5);
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const cur = loadRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...cur].slice(0, 5)));
  } catch {
    /* ignore */
  }
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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
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
/*  Fila puente hacia el asistente IA (Aura)                           */
/* ------------------------------------------------------------------ */

function AiBridgeRow({
  query,
  onClick,
  highlighted,
}: {
  query: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  const q = query.trim();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-alt/60",
        highlighted
          ? "mt-2 rounded-xl border border-border bg-surface-alt/60"
          : "border-t border-border",
      )}
    >
      <AssistantAvatar size={26} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-text">
          {highlighted && q ? `Pregúntale a Aura por “${q}” ✦` : "Pregúntale a Aura ✦"}
        </span>
        <span className="block truncate text-xs text-text-tertiary">
          {q
            ? `Buscar con IA: “${q}”`
            : "Cuéntale qué buscas y te recomienda piezas"}
        </span>
      </span>
      <span className="text-text-tertiary">→</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Open API — pill móvil / ⌘K comparten el mismo modal               */
/* ------------------------------------------------------------------ */

export const OPEN_SEARCH_EVENT = "casaorfebre:open-search";

export function openSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
  }
}

interface SearchModalProps {
  /** Si false, no renderiza el trigger (el modal se abre vía openSearch / ⌘K). */
  showTrigger?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SearchModal({ showTrigger = true }: SearchModalProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualResults, setVisualResults] = useState<VisualSearchResult | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Trap focus within the search dialog + Escape + restore focus on close.
  useFocusTrap(open, panelRef, () => setOpen(false));

  // Portal needs document.body — only available after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K + openSearch() event
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleOpenEvent);
    };
  }, []);

  // Autofocus input when modal opens + cargar recientes
  useEffect(() => {
    if (open) {
      setRecent(loadRecent());
      // Small delay so the portal has rendered
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
    // Reset state when closing
    setQuery("");
    setResults(null);
    setLoading(false);
    setVisualResults(null);
    setVisualPreview(null);
    setVisualLoading(false);
  }, [open]);

  // Visual search handler
  const handleVisualSearch = useCallback(async (file: File) => {
    setVisualLoading(true);
    setVisualResults(null);
    setResults(null);
    setQuery("");

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setVisualPreview(previewUrl);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          resolve(result.split(",")[1]);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      const res = await fetch("/api/search/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error");
      }

      const data: VisualSearchResult = await res.json();
      setVisualResults(data);
    } catch (e) {
      console.error("Visual search error:", e);
      setVisualResults({ products: [], description: "No se pudo analizar la imagen." });
    } finally {
      setVisualLoading(false);
    }
  }, []);

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

  const commitRecent = useCallback((term: string) => {
    const t = term.trim();
    if (t.length < 2) return;
    saveRecent(t);
    setRecent(loadRecent());
  }, []);

  const openAura = useCallback(() => {
    setOpen(false);
    openShoppingChat(query.trim() || undefined);
  }, [query]);

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.artisans.length > 0 ||
      (results.categories?.length ?? 0) > 0);
  const hasQuery = query.trim().length >= 2;

  /* ---- Trigger button ---- */
  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-11 min-w-11 items-center justify-center gap-2 text-text-secondary transition-colors hover:text-text md:min-w-0 md:justify-start"
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
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] md:pt-[16vh]"
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
            ref={panelRef}
            tabIndex={-1}
            className={cn(
              "relative w-full max-w-xl bg-surface rounded-xl shadow-2xl border border-border focus:outline-none",
              "flex flex-col overflow-hidden",
              // Mobile: fullscreen
              "max-md:fixed max-md:inset-0 max-md:rounded-none max-md:border-0 max-md:max-w-none max-md:pt-0",
            )}
          >
            {/* Search input bar */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <SearchIcon className="shrink-0 text-text-tertiary" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué joya buscas hoy?"
                aria-label="Buscar productos, orfebres y materiales"
                className="flex-1 bg-transparent py-1 text-base text-text placeholder:text-text-tertiary outline-none"
              />
              {loading && <Spinner />}
              {/* Visual search (camera) button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 text-text-tertiary hover:text-accent transition-colors"
                aria-label="Buscar por imagen"
                title="Buscar por imagen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVisualSearch(file);
                  e.target.value = "";
                }}
              />
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
            <div className="max-h-[62vh] max-md:flex-1 overflow-y-auto overscroll-contain">
              {/* Visual search results */}
              {(visualLoading || visualResults) && (
                <div className="px-4 pt-4 pb-2">
                  {visualPreview && (
                    <div className="mb-3 flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border">
                        <Image src={visualPreview} alt="Imagen subida" fill className="object-cover" sizes="48px" />
                      </div>
                      <p className="text-xs text-text-secondary">
                        {visualLoading ? "Buscando piezas similares..." : visualResults?.description}
                      </p>
                    </div>
                  )}
                  {visualLoading && (
                    <div className="flex items-center justify-center py-6">
                      <Spinner />
                    </div>
                  )}
                  {visualResults && !visualLoading && (
                    <>
                      {visualResults.products.length > 0 ? (
                        <>
                          <p className="pb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                            Piezas similares encontradas
                          </p>
                          <ul>
                            {visualResults.products.map((product) => (
                              <li key={product.slug}>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/coleccion/${product.slug}`)}
                                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.04] transition-colors"
                                >
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black/[0.03]">
                                    {product.image ? (
                                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-text-tertiary text-xs">--</div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-serif text-text">{product.name}</p>
                                    <p className="truncate text-xs text-text-secondary font-light">{product.artisanName}</p>
                                  </div>
                                  <span className="shrink-0 text-sm text-accent font-medium">{formatCLP(product.price)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="py-6 text-center text-sm text-text-tertiary">
                          No encontramos piezas similares a tu imagen
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => { setVisualResults(null); setVisualPreview(null); }}
                        className="mt-2 w-full text-center text-xs text-accent hover:underline"
                      >
                        Limpiar búsqueda visual
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Empty state — no query yet */}
              {!hasQuery && !loading && !visualResults && !visualLoading && (
                <div className="px-4 py-5">
                  {recent.length > 0 && (
                    <div className="mb-5">
                      <p className="pb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                        Recientes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setQuery(term)}
                            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M3 3v5h5" />
                              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                              <path d="M12 7v5l3 2" />
                            </svg>
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <p className="pb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                      Búsquedas populares
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setQuery(term)}
                          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-1">
                    <p className="pb-2 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                      Explorar
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {EXPLORE_LINKS.map((link) => (
                        <button
                          key={link.slug}
                          type="button"
                          onClick={() => navigate(`/coleccion/${link.slug}`)}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-text transition-colors hover:bg-surface-alt/60"
                        >
                          <span>{link.name}</span>
                          <ChevronRight className="text-text-tertiary" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <AiBridgeRow query="" onClick={openAura} />
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
                <div className="px-4 py-6">
                  <p className="text-center text-sm text-text-secondary">
                    No encontramos «{query.trim()}» — prueba con otro término
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <AiBridgeRow query={query} onClick={openAura} highlighted />
                </div>
              )}

              {/* Results with content */}
              {hasQuery && !loading && results && hasResults && (
                <>
                  {/* Categorías */}
                  {results.categories && results.categories.length > 0 && (
                    <div className="px-2 pt-3 pb-1">
                      <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                        Categorías
                      </p>
                      <ul>
                        {results.categories.map((cat) => (
                          <li key={cat.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                commitRecent(query);
                                navigate(`/coleccion/${cat.slug}`);
                              }}
                              className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.04] transition-colors"
                            >
                              <span className="text-sm font-serif text-text">{cat.name}</span>
                              <ChevronRight className="text-text-tertiary" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Products */}
                  {results.products.length > 0 && (
                    <div className="px-2 pt-3 pb-1">
                      <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                        Productos
                      </p>
                      <ul>
                        {results.products.map((product) => (
                          <li key={product.slug}>
                            <button
                              type="button"
                              onClick={() => {
                                commitRecent(query);
                                navigate(`/coleccion/${product.slug}`);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-black/[0.04] transition-colors"
                            >
                              {/* Thumbnail */}
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/[0.03]">
                                {product.images[0] ? (
                                  <Image
                                    src={product.images[0].url}
                                    alt={product.images[0].altText ?? product.name}
                                    fill
                                    className="object-cover"
                                    sizes="56px"
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
                                <p className="truncate text-xs text-text-tertiary font-light">
                                  {product.artisan.displayName}
                                  {product.categories[0]
                                    ? ` · ${product.categories[0].name}`
                                    : ""}
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

                      {/* Footer: ver todos en la colección */}
                      <button
                        type="button"
                        onClick={() => {
                          commitRecent(query);
                          navigate(`/coleccion?q=${encodeURIComponent(query.trim())}`);
                        }}
                        className="mt-1 w-full border-t border-border py-3 text-sm text-accent transition-colors hover:bg-surface-alt/60"
                      >
                        Ver todos los resultados en la colección →
                      </button>
                    </div>
                  )}

                  {/* Artisans */}
                  {results.artisans.length > 0 && (
                    <div className="px-2 pt-3 pb-1">
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
                                onClick={() => {
                                  commitRecent(query);
                                  navigate(`/orfebres/${artisan.slug}`);
                                }}
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

                  {/* Fila puente IA */}
                  <AiBridgeRow query={query} onClick={openAura} />
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  if (!mounted) {
    // SSR / first render — just show the trigger without portal
    return showTrigger ? trigger : null;
  }

  return (
    <>
      {showTrigger ? trigger : null}
      {modal}
    </>
  );
}
