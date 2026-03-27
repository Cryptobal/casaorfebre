"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";

interface SelectDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Permite escribir para filtrar opciones (útil para listas largas como regiones/ciudades). */
  searchable?: boolean;
}

export function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className,
  searchable = true,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const q = norm(filter.trim());
    if (!q) return options;
    return options.filter((o) => norm(o.label).includes(q));
  }, [options, filter]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setFilter("");
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      setFilter("");
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open, searchable]);

  const selected = options.find((o) => o.value === value);
  const displayText = selected ? selected.label : placeholder;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-left text-sm transition-colors duration-150 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
          selected ? "text-text" : "text-text-tertiary"
        )}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className="pointer-events-none h-4 w-4 shrink-0 text-text-tertiary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-[180px] overflow-hidden rounded-md border border-border bg-surface py-1 shadow-lg">
          {searchable && (
            <div className="border-b border-border px-2 pb-2 pt-1">
              <input
                ref={searchInputRef}
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredOptions.length === 1) {
                    e.preventDefault();
                    onChange(filteredOptions[0].value);
                    setOpen(false);
                    setFilter("");
                  }
                }}
                placeholder="Buscar..."
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="max-h-60 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-tertiary">Sin coincidencias</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(option.value);
                    setOpen(false);
                    setFilter("");
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent/10",
                    option.value === value && "font-medium text-accent"
                  )}
                >
                  {option.value === value && (
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                  {option.value !== value && (
                    <span className="inline-block h-3.5 w-3.5 shrink-0" />
                  )}
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
