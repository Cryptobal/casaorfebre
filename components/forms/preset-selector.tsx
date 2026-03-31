"use client";

import { Label } from "@/components/ui/label";

interface PresetSelectorProps {
  label: string;
  presets: readonly string[];
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
  customText: string;
  onCustomTextChange: (text: string) => void;
  textareaPlaceholder: string;
  textareaLabel?: string;
}

export function PresetSelector({
  label,
  presets,
  selected,
  onSelectedChange,
  customText,
  onCustomTextChange,
  textareaPlaceholder,
  textareaLabel = "Indicaciones adicionales (opcional)",
}: PresetSelectorProps) {
  const togglePreset = (preset: string) => {
    if (selected.includes(preset)) {
      onSelectedChange(selected.filter((s) => s !== preset));
    } else {
      onSelectedChange([...selected, preset]);
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
      <div className="space-y-1">
        <Label className="text-xs font-normal text-text-secondary">{textareaLabel}</Label>
        <textarea
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder={textareaPlaceholder}
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 resize-none"
        />
      </div>
    </div>
  );
}
