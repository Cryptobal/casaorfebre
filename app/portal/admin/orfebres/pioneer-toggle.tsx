"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PioneerToggleProps {
  artisanId: string;
  initialValue: boolean;
  pioneerUntil: string | null;
}

export function PioneerToggle({ artisanId, initialValue, pioneerUntil }: PioneerToggleProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [months, setMonths] = useState("3");

  async function handleToggle() {
    if (!enabled) {
      // Turning ON — show duration picker
      setShowDuration(true);
      return;
    }
    // Turning OFF
    setLoading(true);
    const res = await fetch("/api/admin/pioneer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId, enable: false }),
    });
    setLoading(false);
    if (res.ok) {
      setEnabled(false);
      router.refresh();
    }
  }

  async function handleConfirm() {
    setLoading(true);
    const res = await fetch("/api/admin/pioneer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId, enable: true, months: parseInt(months, 10) }),
    });
    setLoading(false);
    if (res.ok) {
      setEnabled(true);
      setShowDuration(false);
      router.refresh();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? "bg-accent" : "bg-border"
        } ${loading ? "opacity-50" : ""}`}
        title={enabled ? "Quitar condición de pionero" : "Marcar como pionero (sin comisión de suscripción)"}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
      {enabled && pioneerUntil && (
        <p className="mt-0.5 text-[10px] text-text-tertiary">
          hasta {new Date(pioneerUntil).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      )}
      {enabled && !pioneerUntil && (
        <p className="mt-0.5 text-[10px] text-accent">indefinido</p>
      )}

      {showDuration && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-xs font-medium text-text">¿Por cuánto tiempo?</p>
          <select
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="1">1 mes</option>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
            <option value="0">Indefinido</option>
          </select>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/90 disabled:opacity-50"
            >
              Confirmar
            </button>
            <button
              onClick={() => setShowDuration(false)}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
