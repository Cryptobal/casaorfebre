"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { SelectDropdown } from "@/components/ui/select-dropdown";

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
  categories: { name: string; slug: string }[];
  materials: string[];
  artisans: { slug: string; displayName: string }[];
}

export function CatalogFilters({ categories, materials, artisans }: CatalogFiltersProps) {
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
  if (category) {
    const cat = categories.find((c) => c.slug.toUpperCase() === category || c.name.toUpperCase() === category);
    activeFilters.push({ key: "category", label: cat?.name ?? category });
  }
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Category */}
        <SelectDropdown
          value={category}
          onChange={(v) => updateParam("category", v)}
          placeholder="Todas las categorías"
          options={[
            { value: "", label: "Todas las categorías" },
            ...categories.map((c) => ({
              value: c.name.toUpperCase(),
              label: c.name,
            })),
          ]}
        />

        {/* Material */}
        <SelectDropdown
          value={material}
          onChange={(v) => updateParam("material", v)}
          placeholder="Todos los materiales"
          options={[
            { value: "", label: "Todos los materiales" },
            ...materials.map((m) => ({ value: m, label: m })),
          ]}
        />

        {/* Price */}
        <SelectDropdown
          value={price}
          onChange={(v) => updateParam("price", v)}
          placeholder="Todos los precios"
          options={PRICE_RANGES.map((r) => ({
            value: r.value,
            label: r.label === "Todos" ? "Todos los precios" : r.label,
          }))}
        />

        {/* Artisan */}
        <SelectDropdown
          value={artisan}
          onChange={(v) => updateParam("artisan", v)}
          placeholder="Todos los orfebres"
          options={[
            { value: "", label: "Todos los orfebres" },
            ...artisans.map((a) => ({
              value: a.slug,
              label: a.displayName,
            })),
          ]}
        />

        {/* Sort */}
        <SelectDropdown
          value={sort}
          onChange={(v) => updateParam("sort", v)}
          placeholder="Más recientes"
          options={SORT_OPTIONS.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
        />
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
