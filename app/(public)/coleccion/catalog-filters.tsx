"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

const CATEGORY_MAP: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collar",
  ANILLO: "Anillo",
  PULSERA: "Pulsera",
  BROCHE: "Broche",
  COLGANTE: "Colgante",
  OTRO: "Otro",
};

const PRICE_RANGES = [
  { label: "Todos", value: "" },
  { label: "Hasta $50.000", value: "50000" },
  { label: "$50.000 - $100.000", value: "50000-100000" },
  { label: "$100.000 - $200.000", value: "100000-200000" },
  { label: "Más de $200.000", value: "200000" },
] as const;

const SORT_OPTIONS = [
  { label: "Más recientes", value: "" },
  { label: "Precio ↑", value: "price_asc" },
  { label: "Precio ↓", value: "price_desc" },
] as const;

interface CatalogFiltersProps {
  materials: string[];
  artisans: { slug: string; displayName: string }[];
}

export function CatalogFilters({ materials, artisans }: CatalogFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") ?? "";
  const material = searchParams.get("material") ?? "";
  const price = searchParams.get("price") ?? "";
  const artisan = searchParams.get("artisan") ?? "";
  const sort = searchParams.get("sort") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `?${qs}` : "/coleccion", { scroll: false });
    },
    [searchParams, router],
  );

  const clearAll = useCallback(() => {
    router.push("/coleccion", { scroll: false });
  }, [router]);

  const activeFilters: { key: string; label: string }[] = [];
  if (category) activeFilters.push({ key: "category", label: CATEGORY_MAP[category] ?? category });
  if (material) activeFilters.push({ key: "material", label: material });
  if (price) {
    const found = PRICE_RANGES.find((r) => r.value === price);
    activeFilters.push({ key: "price", label: found?.label ?? price });
  }
  if (artisan) {
    const found = artisans.find((a) => a.slug === artisan);
    activeFilters.push({ key: "artisan", label: found?.displayName ?? artisan });
  }
  if (sort) {
    const found = SORT_OPTIONS.find((s) => s.value === sort);
    activeFilters.push({ key: "sort", label: found?.label ?? sort });
  }

  const selectClass =
    "border border-border rounded-md bg-surface text-sm text-text px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_MAP).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Material */}
        <select
          value={material}
          onChange={(e) => updateParam("material", e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los materiales</option>
          {materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Price */}
        <select
          value={price}
          onChange={(e) => updateParam("price", e.target.value)}
          className={selectClass}
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label === "Todos" ? "Todos los precios" : r.label}
            </option>
          ))}
        </select>

        {/* Artisan */}
        <select
          value={artisan}
          onChange={(e) => updateParam("artisan", e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los orfebres</option>
          {artisans.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.displayName}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className={selectClass}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary"
            >
              {f.label}
              <button
                onClick={() => updateParam(f.key, "")}
                className="ml-0.5 text-text-tertiary hover:text-text"
                aria-label={`Quitar filtro ${f.label}`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-text-tertiary underline hover:text-text-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
