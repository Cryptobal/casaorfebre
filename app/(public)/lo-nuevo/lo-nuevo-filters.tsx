"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { Button } from "@/components/ui/button";

const PRICE_RANGES = [
  { label: "Todos", value: "" },
  { label: "Hasta $50.000", value: "50000" },
  { label: "$50.000 - $100.000", value: "50000-100000" },
  { label: "$100.000 - $200.000", value: "100000-200000" },
  { label: "Más de $200.000", value: "200000" },
] as const;

interface LoNuevoFiltersProps {
  categories: { name: string; slug: string }[];
  materials: string[];
}

export function LoNuevoFilters({ categories, materials }: LoNuevoFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const category = searchParams.get("category") ?? "";
  const material = searchParams.get("material") ?? "";
  const price = searchParams.get("price") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `/lo-nuevo?${qs}` : "/lo-nuevo", { scroll: false });
    },
    [searchParams, router],
  );

  const clearAll = useCallback(() => {
    router.push("/lo-nuevo", { scroll: false });
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

  const filterCount = activeFilters.length;

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-accent/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="16" y2="18" />
          </svg>
          <span>Filtros</span>
          {filterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-white">
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
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

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex items-center gap-3">
            <Button onClick={() => setDrawerOpen(false)} className="flex-1">
              Ver resultados
            </Button>
            {filterCount > 0 && (
              <button
                onClick={() => { clearAll(); setDrawerOpen(false); }}
                className="text-sm text-text-tertiary underline hover:text-text-secondary"
              >
                Limpiar
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-5">
          <FilterField label="Categoría">
            <SelectDropdown
              value={category}
              onChange={(v) => updateParam("category", v)}
              placeholder="Todas las categorías"
              className="w-full"
              options={[
                { value: "", label: "Todas las categorías" },
                ...categories.map((c) => ({ value: c.name.toUpperCase(), label: c.name })),
              ]}
            />
          </FilterField>

          <FilterField label="Material">
            <SelectDropdown
              value={material}
              onChange={(v) => updateParam("material", v)}
              placeholder="Todos los materiales"
              className="w-full"
              options={[
                { value: "", label: "Todos los materiales" },
                ...materials.map((m) => ({ value: m, label: m })),
              ]}
            />
          </FilterField>

          <FilterField label="Precio">
            <SelectDropdown
              value={price}
              onChange={(v) => updateParam("price", v)}
              placeholder="Todos los precios"
              className="w-full"
              options={PRICE_RANGES.map((r) => ({
                value: r.value,
                label: r.label === "Todos" ? "Todos los precios" : r.label,
              }))}
            />
          </FilterField>
        </div>
      </FilterDrawer>
    </>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </label>
      {children}
    </div>
  );
}
