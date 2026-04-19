"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { SORT_OPTIONS } from "./catalog-filters";

interface CatalogSortProps {
  resultsCount: number;
}

/**
 * Barra superior del grid: contador editorial "X piezas" + select de orden.
 * El select es un <select> nativo estilizado para ser tipográfico y minimal,
 * por accesibilidad y peso de bundle.
 */
export function CatalogSort({ resultsCount }: CatalogSortProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = searchParams.get("sort") ?? "recommended";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "recommended") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/coleccion", { scroll: false });
  };

  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-[color:var(--color-border-soft)] pb-4">
      <p className="font-serif text-sm font-light italic text-text-secondary">
        {resultsCount === 0
          ? "Sin piezas"
          : resultsCount === 1
            ? "1 pieza"
            : `${resultsCount} piezas`}
      </p>

      <label className="flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
        Orden
        <div className="relative">
          <select
            value={current}
            onChange={(e) => handleChange(e.target.value)}
            className="appearance-none border-0 bg-transparent pr-6 text-xs font-light uppercase tracking-[0.15em] text-text focus:outline-none focus:ring-0"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="normal-case">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            strokeWidth={1}
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
            aria-hidden
          />
        </div>
      </label>
    </div>
  );
}
