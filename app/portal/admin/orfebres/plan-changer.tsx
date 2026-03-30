"use client";

import { useState, useRef, useEffect } from "react";
import { changeArtisanPlan } from "@/lib/actions/admin";

const PLANS = [
  { name: "esencial", label: "Esencial" },
  { name: "artesano", label: "Artesano" },
  { name: "maestro", label: "Maestro" },
];

interface PlanChangerProps {
  artisanId: string;
  currentPlan: string;
}

export function PlanChanger({ artisanId, currentPlan }: PlanChangerProps) {
  const [selected, setSelected] = useState(currentPlan);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleSelect(planName: string) {
    if (planName === selected) {
      setOpen(false);
      return;
    }
    setOpen(false);
    setSaving(true);
    setSelected(planName);
    await changeArtisanPlan(artisanId, planName);
    setSaving(false);
  }

  const selectedLabel = PLANS.find((p) => p.name === selected)?.label || selected;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text transition-colors hover:border-accent/50 disabled:opacity-50"
      >
        <span>{saving ? "..." : selectedLabel}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-border bg-surface py-1 shadow-lg">
          {PLANS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelect(p.name)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-background ${
                p.name === selected ? "font-medium text-accent" : "text-text-secondary"
              }`}
            >
              {p.name === selected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {p.name !== selected && <span className="w-3" />}
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
