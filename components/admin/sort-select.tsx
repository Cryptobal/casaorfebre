"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  options: SortOption[];
  current: string;
  /** Query param to write. Defaults to "sort". */
  paramKey?: string;
}

export function SortSelect({ options, current, paramKey = "sort" }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set(paramKey, value);
    sp.delete("page"); // a new sort resets to page 1
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-xs text-text-tertiary">
      <span className="whitespace-nowrap">Ordenar por</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
