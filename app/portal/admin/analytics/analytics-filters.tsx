"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PERIODS = [
  { label: "7 días", value: "7d" },
  { label: "14 días", value: "14d" },
  { label: "30 días", value: "30d" },
  { label: "90 días", value: "90d" },
] as const;

interface AnalyticsFiltersProps {
  currentPeriod: string;
  currentSource: string;
  sources: string[];
}

export function AnalyticsFilters({
  currentPeriod,
  currentSource,
  sources,
}: AnalyticsFiltersProps) {
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
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period pills */}
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => updateParam("periodo", p.value === "30d" ? "" : p.value)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            currentPeriod === p.value
              ? "bg-accent text-white"
              : "border border-border bg-surface text-text-secondary hover:border-accent/30"
          }`}
        >
          {p.label}
        </button>
      ))}

      {/* Source filter */}
      {sources.length > 0 && (
        <>
          <span className="text-text-tertiary text-xs mx-1">|</span>
          <button
            onClick={() => updateParam("fuente", "")}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              !currentSource
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-secondary hover:border-accent/30"
            }`}
          >
            Todas
          </button>
          {sources.map((s) => (
            <button
              key={s}
              onClick={() => updateParam("fuente", s)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                currentSource === s
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-text-secondary hover:border-accent/30"
              }`}
            >
              {s}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
