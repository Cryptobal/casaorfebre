"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ChevronDown, SlidersHorizontal, X as CloseIcon } from "lucide-react";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { Button } from "@/components/ui/button";

const TIER_OPTIONS = [
  { value: "MAESTRO", label: "Maestro Orfebre" },
  { value: "ORFEBRE", label: "Orfebre" },
  { value: "EMERGENTE", label: "Orfebre emergente" },
] as const;

interface OrfebresFiltersProps {
  specialties: { name: string; slug: string }[];
  materials: { name: string }[];
  regions: readonly string[];
}

export function OrfebresFilters({ specialties, materials, regions }: OrfebresFiltersProps) {
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
      router.push(qs ? `?${qs}` : "/orfebres", { scroll: false });
    },
    [searchParams, router],
  );

  const clearAll = useCallback(() => {
    router.push("/orfebres", { scroll: false });
  }, [router]);

  const activeCount = ["specialty", "region", "material", "tier"]
    .filter((k) => searchParams.get(k))
    .length;

  return (
    <>
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

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex items-center gap-4">
            <Button onClick={() => setDrawerOpen(false)} className="flex-1">
              Ver orfebres
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
          specialties={specialties}
          materials={materials}
          regions={regions}
          searchParams={searchParams}
          onChange={updateParam}
        />
      </FilterDrawer>
    </>
  );
}

function FiltersBody({
  specialties,
  materials,
  regions,
  searchParams,
  onChange,
}: OrfebresFiltersProps & {
  searchParams: URLSearchParams;
  onChange: (key: string, value: string) => void;
}) {
  const specialty = searchParams.get("specialty") ?? "";
  const region = searchParams.get("region") ?? "";
  const material = searchParams.get("material") ?? "";
  const tier = searchParams.get("tier") ?? "";

  return (
    <div className="divide-y divide-[color:var(--color-border-soft)]">
      <FilterGroup label="Región" open={!!region}>
        <RadioList
          name="region"
          value={region}
          onChange={(v) => onChange("region", v)}
          options={regions.map((r) => ({ value: r, label: r }))}
        />
      </FilterGroup>

      <FilterGroup label="Material signature" open={!!material}>
        <RadioList
          name="material"
          value={material}
          onChange={(v) => onChange("material", v)}
          options={materials.map((m) => ({ value: m.name, label: m.name }))}
        />
      </FilterGroup>

      <FilterGroup label="Técnica / Especialidad" open={!!specialty}>
        <RadioList
          name="specialty"
          value={specialty}
          onChange={(v) => onChange("specialty", v)}
          options={specialties.map((s) => ({ value: s.slug, label: s.name }))}
        />
      </FilterGroup>

      {/* Tier curatorial: oculto por defecto, se revela con "Más filtros". */}
      <details className="group py-4" open={!!tier}>
        <summary className="flex cursor-pointer list-none items-center justify-between py-1 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary transition-colors hover:text-text">
          Más filtros — tier
          <ChevronDown
            size={14}
            strokeWidth={1}
            className="transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3">
          <RadioList
            name="tier"
            value={tier}
            onChange={(v) => onChange("tier", v)}
            options={TIER_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
          />
        </div>
      </details>
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
