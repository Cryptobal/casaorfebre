"use client";

import { useState } from "react";
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
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newPlan = e.target.value;
    if (newPlan === currentPlan) return;

    setSaving(true);
    await changeArtisanPlan(artisanId, newPlan);
    setSaving(false);
  }

  return (
    <select
      defaultValue={currentPlan}
      onChange={handleChange}
      disabled={saving}
      className="rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-text transition-colors hover:border-accent/50 focus:border-accent focus:outline-none disabled:opacity-50"
    >
      {PLANS.map((p) => (
        <option key={p.name} value={p.name}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
