"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import { Button } from "@/components/ui/button";

interface OrfebresFiltersProps {
  specialties: { name: string; slug: string }[];
  materials: { name: string }[];
  regions: readonly string[];
}

export function OrfebresFilters({ specialties, materials, regions }: OrfebresFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const specialty = searchParams.get("specialty") ?? "";
  const region = searchParams.get("region") ?? "";
  const material = searchParams.get("material") ?? "";

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

  const activeFilters: { key: string; label: string }[] = [];
  if (specialty) {
    const found = specialties.find((s) => s.slug === specialty);
    activeFilters.push({ key: "specialty", label: found?.name ?? specialty });
  }
  if (region) activeFilters.push({ key: "region", label: region });
  if (material) {
    const found = materials.find((m) => m.name === material);
    activeFilters.push({ key: "material", label: found?.name ?? material });
  }

  const filterCount = activeFilters.length;

  return (
    <>
      {/* Compact bar */}
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

      {/* Active filter chips */}
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

      {/* Filter drawer */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setDrawerOpen(false)}
              className="flex-1"
            >
              Ver resultados
            </Button>
            {filterCount > 0 && (
              <button
                onClick={() => {
                  clearAll();
                  setDrawerOpen(false);
                }}
                className="text-sm text-text-tertiary underline hover:text-text-secondary"
              >
                Limpiar
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-5">
          <FilterField label="Especialidad">
            <SelectDropdown
              value={specialty}
              onChange={(v) => updateParam("specialty", v)}
              placeholder="Todas las especialidades"
              className="w-full"
              options={[
                { value: "", label: "Todas las especialidades" },
                ...specialties.map((s) => ({ value: s.slug, label: s.name })),
              ]}
            />
          </FilterField>

          <FilterField label="Región">
            <SelectDropdown
              value={region}
              onChange={(v) => updateParam("region", v)}
              placeholder="Todas las regiones"
              className="w-full"
              options={[
                { value: "", label: "Todas las regiones" },
                ...regions.map((r) => ({ value: r, label: r })),
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
                ...materials.map((m) => ({ value: m.name, label: m.name })),
              ]}
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
