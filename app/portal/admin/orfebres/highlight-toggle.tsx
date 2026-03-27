"use client";

import { useState } from "react";
import { toggleHomeHighlight } from "@/lib/actions/admin";

interface HighlightToggleProps {
  artisanId: string;
  initialValue: boolean;
}

export function HighlightToggle({
  artisanId,
  initialValue,
}: HighlightToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleHomeHighlight(artisanId);
    setLoading(false);
    if (result.success) {
      setEnabled((prev) => !prev);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        enabled ? "bg-amber-500" : "bg-border"
      } ${loading ? "opacity-50" : ""}`}
      title={enabled ? "Quitar de home" : "Destacar en home"}
      aria-label={enabled ? "Quitar de home" : "Destacar en home"}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
