"use client";

import { cn } from "@/lib/utils";

interface TagSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  name?: string;
  required?: boolean;
  className?: string;
}

export function TagSelect({
  options,
  selected,
  onChange,
  name,
  required,
  className,
}: TagSelectProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className={cn("space-y-0", className)}>
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selected.join(",")}
        required={required && selected.length === 0 ? true : undefined}
      />
      {required && selected.length === 0 && (
        <input
          tabIndex={-1}
          className="absolute h-0 w-0 opacity-0"
          required
          value=""
          onChange={() => {}}
        />
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-all duration-150",
                isSelected
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-surface text-text-secondary hover:border-accent/50 hover:text-text"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
