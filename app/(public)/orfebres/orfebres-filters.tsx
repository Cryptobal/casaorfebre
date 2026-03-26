"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { SelectDropdown } from "@/components/ui/select-dropdown";

interface OrfebresFiltersProps {
  specialties: { name: string; slug: string }[];
  materials: { name: string }[];
  regions: readonly string[];
}

export function OrfebresFilters({ specialties, materials, regions }: OrfebresFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const hasFilters = specialty || region || material;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <SelectDropdown
          value={specialty}
          onChange={(v) => updateParam("specialty", v)}
          placeholder="Todas las especialidades"
          options={[
            { value: "", label: "Todas las especialidades" },
            ...specialties.map((s) => ({ value: s.slug, label: s.name })),
          ]}
        />
        <SelectDropdown
          value={region}
          onChange={(v) => updateParam("region", v)}
          placeholder="Todas las regiones"
          options={[
            { value: "", label: "Todas las regiones" },
            ...regions.map((r) => ({ value: r, label: r })),
          ]}
        />
        <SelectDropdown
          value={material}
          onChange={(v) => updateParam("material", v)}
          placeholder="Todos los materiales"
          options={[
            { value: "", label: "Todos los materiales" },
            ...materials.map((m) => ({ value: m.name, label: m.name })),
          ]}
        />
      </div>
      {hasFilters && (
        <button
          onClick={() => router.push("/orfebres", { scroll: false })}
          className="text-xs text-text-tertiary underline hover:text-text-secondary"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
