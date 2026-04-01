"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PresetSelectorProps {
  label: string;
  presets: readonly string[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  customTags: string[];
  onCustomTagsChange: (tags: string[]) => void;
  customPlaceholder?: string;
  customLabel?: string;
}

export function PresetSelector({
  label,
  presets,
  selected,
  onSelectedChange,
  customTags,
  onCustomTagsChange,
  customPlaceholder = "Agregar otro...",
  customLabel = "Agregar personalizado",
}: PresetSelectorProps) {
  const [input, setInput] = useState("");

  const togglePreset = (preset: string) => {
    if (selected.includes(preset)) {
      onSelectedChange(selected.filter((s) => s !== preset));
    } else {
      onSelectedChange([...selected, preset]);
    }
  };

  const addCustomTag = () => {
    const val = input.trim();
    if (val && !customTags.includes(val) && !presets.includes(val)) {
      onCustomTagsChange([...customTags, val]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const isSelected = selected.includes(preset);
          return (
            <button
              key={preset}
              type="button"
              onClick={() => togglePreset(preset)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition ${
                isSelected
                  ? "bg-accent/10 border-accent text-accent"
                  : "border-border text-text-secondary hover:border-accent/50"
              }`}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {preset}
            </button>
          );
        })}
      </div>

      {/* Custom tags display */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-medium text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => onCustomTagsChange(customTags.filter((t) => t !== tag))}
                className="ml-0.5 text-accent/60 hover:text-accent"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom tag input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={customPlaceholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustomTag();
            }
          }}
          className="text-sm"
        />
        <button
          type="button"
          onClick={addCustomTag}
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
    </div>
  );
}
