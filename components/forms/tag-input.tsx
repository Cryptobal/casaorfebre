"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Escribe y presiona Enter...",
  label,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onTagsChange([...tags, val]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs text-text-secondary">{label}</p>
      )}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="text-sm"
        />
        <button
          type="button"
          onClick={addTag}
          className="shrink-0 rounded-md border border-border bg-surface px-2.5 py-1.5 text-text-secondary transition-colors hover:bg-background hover:text-text"
          aria-label="Agregar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-medium text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => onTagsChange(tags.filter((t) => t !== tag))}
                className="ml-0.5 text-accent/60 hover:text-accent"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
