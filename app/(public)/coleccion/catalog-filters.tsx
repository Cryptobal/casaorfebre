"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDown, SlidersHorizontal, X as CloseIcon } from "lucide-react";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { Button } from "@/components/ui/button";

const PRICE_RANGES = [
  { label: "Hasta $50.000", value: "50000" },
  { label: "$50.000 — $100.000", value: "50000-100000" },
  { label: "$100.000 — $200.000", value: "100000-200000" },
  { label: "Más de $200.000", value: "200000" },
] as const;

const EDITION_OPTIONS = [
  { label: "Pieza única", value: "UNIQUE" },
  { label: "Edición limitada", value: "LIMITED" },
  { label: "Hecha por encargo", value: "MADE_TO_ORDER" },
] as const;

export const SORT_OPTIONS = [
  { label: "Selección del Curador", value: "curated" },
  { label: "Nuevas", value: "newest" },
  { label: "Precio ascendente", value: "price_asc" },
  { label: "Precio descendente", value: "price_desc" },
] as const;

interface CatalogFiltersProps {
  categories: { name: string; slug: string }[];
  materials: string[];
  artisans: { slug: string; displayName: string }[];
  occasions: { name: string; slug: string }[];
  specialties: { name: string; slug: string }[];
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Conteo de filtros activos (sin contar sort).
  const activeCount = ["category", "material", "artisan", "edition", "price", "occasion", "specialty", "audiencia"]
    .filter((k) => searchParams.get(k))
    .length;

  return (
    <>
      {/* Trigger: solo visible en mobile. En desktop la sidebar vive aparte. */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 text-xs font-light uppercase tracking-[0.2em] text-text-secondary transition-colors hover:text-text"
        >
          <SlidersHorizontal size={14} strokeWidth={1} aria-hidden />
          Filtros
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-accent px-1.5 text-[10px] font-medium text-accent">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer mobile */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex items-center gap-4">
            <Button onClick={() => setDrawerOpen(false)} className="flex-1">
              Ver resultados
            </Button>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearAll();
                  setDrawerOpen(false);
                }}
                className="text-xs font-light uppercase tracking-[0.2em] text-text-tertiary hover:text-text"
              >
                Limpiar
              </button>
            )}
          </div>
        }
      >
        <FiltersBody
          {...props}
          searchParams={searchParams}
          onChange={updateParam}
        />
      </FilterDrawer>
    </>
  );
}

/**
 * Sidebar desktop. Fija 240px, siempre visible. Se monta aparte de CatalogFilters.
 */
export function CatalogFiltersSidebar(props: CatalogFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const activeCount = ["category", "material", "artisan", "edition", "price", "occasion", "specialty", "audiencia"]
    .filter((k) => searchParams.get(k))
    .length;

  return (
    <aside className="hidden lg:block lg:w-[240px] lg:flex-shrink-0">
      <div className="sticky top-28 space-y-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-light uppercase tracking-[0.2em] text-text-tertiary">
            Filtros
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-light uppercase tracking-[0.15em] text-text-tertiary transition-colors hover:text-text"
            >
              Limpiar
            </button>
          )}
        </div>
        <FiltersBody
          {...props}
          searchParams={searchParams}
          onChange={updateParam}
        />
      </div>
    </aside>
  );
}

/**
 * Cuerpo de filtros — compartido entre sidebar desktop y drawer mobile.
 * Cada grupo es un <details> tipográfico con chevron minimal.
 * Opciones como radios estilizados (single-select) con accent-color dorado.
 */
function FiltersBody({
  categories,
  materials,
  artisans,
  occasions,
  specialties,
  searchParams,
  onChange,
}: CatalogFiltersProps & {
  searchParams: URLSearchParams;
  onChange: (key: string, value: string) => void;
}) {
  const category = searchParams.get("category") ?? "";
  const material = searchParams.get("material") ?? "";
  const artisan = searchParams.get("artisan") ?? "";
  const edition = searchParams.get("edition") ?? "";
  const price = searchParams.get("price") ?? "";
  const occasion = searchParams.get("occasion") ?? "";
  const specialty = searchParams.get("specialty") ?? "";
  const audiencia = searchParams.get("audiencia") ?? "";

  return (
    <div className="divide-y divide-[color:var(--color-border-soft)]">
      <FilterGroup label="Categoría" open={!!category}>
        <RadioList
          name="category"
          value={category}
          onChange={(v) => onChange("category", v)}
          options={categories.map((c) => ({ value: c.slug, label: c.name }))}
        />
      </FilterGroup>

      <FilterGroup label="Material" open={!!material}>
        <RadioList
          name="material"
          value={material}
          onChange={(v) => onChange("material", v)}
          options={materials.map((m) => ({ value: m, label: m }))}
        />
      </FilterGroup>

      <FilterGroup label="Orfebre" open={!!artisan}>
        <RadioList
          name="artisan"
          value={artisan}
          onChange={(v) => onChange("artisan", v)}
          options={artisans.map((a) => ({ value: a.slug, label: a.displayName }))}
        />
      </FilterGroup>

      <FilterGroup label="Edición" open={!!edition}>
        <RadioList
          name="edition"
          value={edition}
          onChange={(v) => onChange("edition", v)}
          options={EDITION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
      </FilterGroup>

      <FilterGroup label="Rango de precio" open={!!price}>
        <RadioList
          name="price"
          value={price}
          onChange={(v) => onChange("price", v)}
          options={PRICE_RANGES.map((r) => ({ value: r.value, label: r.label }))}
        />
      </FilterGroup>

      <FilterGroup label="Ocasión" open={!!occasion}>
        <RadioList
          name="occasion"
          value={occasion}
          onChange={(v) => onChange("occasion", v)}
          options={occasions.map((o) => ({ value: o.slug, label: o.name }))}
        />
      </FilterGroup>

      <FilterGroup label="Especialidad" open={!!specialty}>
        <RadioList
          name="specialty"
          value={specialty}
          onChange={(v) => onChange("specialty", v)}
          options={specialties.map((s) => ({ value: s.slug, label: s.name }))}
        />
      </FilterGroup>

      <FilterGroup label="Público" open={!!audiencia}>
        <RadioList
          name="audiencia"
          value={audiencia}
          onChange={(v) => onChange("audiencia", v)}
          options={[
            { value: "MUJER", label: "Mujer" },
            { value: "HOMBRE", label: "Hombre" },
            { value: "UNISEX", label: "Unisex" },
            { value: "NINOS", label: "Niños" },
          ]}
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  label,
  open = false,
  children,
}: {
  label: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-text">
        {label}
        <ChevronDown
          size={14}
          strokeWidth={1}
          className="transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function RadioList({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <li key={opt.value}>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-light text-text transition-colors hover:text-accent">
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span className="flex-1">{opt.label}</span>
              {checked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange("");
                  }}
                  className="text-text-tertiary transition-colors hover:text-text"
                  aria-label={`Quitar filtro ${opt.label}`}
                >
                  <CloseIcon size={12} strokeWidth={1} />
                </button>
              )}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
