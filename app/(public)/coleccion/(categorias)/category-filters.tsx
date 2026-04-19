"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const GENDER_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Mujer", value: "mujer" },
  { label: "Hombre", value: "hombre" },
  { label: "Unisex", value: "unisex" },
] as const;

const MATERIAL_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Plata 925", value: "Plata 925" },
  { label: "Plata 950", value: "Plata 950" },
] as const;

const PRICE_RANGES = [
  { label: "Todos", value: "" },
  { label: "Hasta $50.000", value: "0-50000" },
  { label: "$50.000 - $100.000", value: "50000-100000" },
  { label: "$100.000 - $200.000", value: "100000-200000" },
  { label: "Más de $200.000", value: "200000-999999" },
] as const;

// Alineado con /coleccion (8 opciones). "" = default "Recomendadas".
const SORT_OPTIONS = [
  { label: "Recomendadas", value: "" },
  { label: "Nuevas", value: "newest" },
  { label: "Más valoradas", value: "rating" },
  { label: "Más visitadas", value: "most_viewed" },
  { label: "Más guardadas", value: "popular" },
  { label: "A – Z", value: "az" },
  { label: "Precio ↑", value: "price_asc" },
  { label: "Precio ↓", value: "price_desc" },
] as const;

interface CategoryFiltersProps {
  basePath: string;
}

export function CategoryFilters({ basePath }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [searchParams, router, basePath],
  );

  const gender = searchParams.get("genero") ?? "";
  const material = searchParams.get("material") ?? "";
  const price = searchParams.get("precio") ?? "";
  const sort = searchParams.get("orden") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterSelect
        label="Género"
        value={gender}
        options={GENDER_OPTIONS}
        onChange={(v) => updateParam("genero", v)}
      />
      <FilterSelect
        label="Material"
        value={material}
        options={MATERIAL_OPTIONS}
        onChange={(v) => updateParam("material", v)}
      />
      <FilterSelect
        label="Precio"
        value={price}
        options={PRICE_RANGES}
        onChange={(v) => updateParam("precio", v)}
      />
      <FilterSelect
        label="Ordenar"
        value={sort}
        options={SORT_OPTIONS}
        onChange={(v) => updateParam("orden", v)}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-md border border-border bg-surface px-3 py-2 font-sans text-sm text-text transition-colors hover:border-accent/50 focus:border-accent focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.value ? opt.label : label}
        </option>
      ))}
    </select>
  );
}
