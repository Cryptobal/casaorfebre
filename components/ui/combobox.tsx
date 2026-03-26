"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  name,
  required,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered =
    query.length > 0
      ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
      : options;

  function select(option: string) {
    onChange(option);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value}
        placeholder={placeholder}
        required={required && !value}
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onBlur={() => {
          // Delay to allow click on option
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
          if (e.key === "Enter" && filtered.length > 0) {
            e.preventDefault();
            select(filtered[0]);
          }
        }}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
        autoComplete="off"
      />
      {/* Chevron */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
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
      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-sm"
        >
          {filtered.map((option) => (
            <li
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                select(option);
              }}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-accent/10",
                option === value && "text-accent font-medium"
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
