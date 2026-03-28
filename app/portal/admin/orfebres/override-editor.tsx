"use client";

import { useState } from "react";
import { updateArtisanOverrides } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OverrideEditorProps {
  artisanId: string;
  artisanName: string;
  commissionOverride: number | null;
  maxProductsOverride: number | null;
  maxPhotosOverride: number | null;
}

export function OverrideEditor({
  artisanId,
  artisanName,
  commissionOverride,
  maxProductsOverride,
  maxPhotosOverride,
}: OverrideEditorProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setMessage(null);
    const result = await updateArtisanOverrides(artisanId, formData);
    setSaving(false);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Overrides actualizados");
      setTimeout(() => {
        setOpen(false);
        setMessage(null);
      }, 1200);
    }
  }

  return (
    <>
      <button
        type="button"
        title="Overrides de plan"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:bg-background hover:text-text"
        onClick={() => setOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-lg">
            <h3 className="font-serif text-lg font-medium text-text">
              Overrides: {artisanName}
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Deja vacío para usar los valores del plan. Estos valores tienen
              prioridad sobre el plan.
            </p>

            {message && (
              <p
                className={`mt-3 rounded-md px-3 py-2 text-sm ${
                  message.includes("actualizados")
                    ? "bg-green-50 text-green-700"
                    : "bg-error/10 text-error"
                }`}
              >
                {message}
              </p>
            )}

            <form action={handleSubmit} className="mt-4 space-y-4">
              <div>
                <Label className="text-xs">
                  Comisión override (decimal, ej: 0.15)
                </Label>
                <Input
                  name="commissionOverride"
                  type="number"
                  step="0.01"
                  min="0"
                  max="0.99"
                  defaultValue={commissionOverride ?? ""}
                  placeholder="Vacío = usar plan"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">
                  Max productos override (0=ilimitado)
                </Label>
                <Input
                  name="maxProductsOverride"
                  type="number"
                  min="0"
                  defaultValue={maxProductsOverride ?? ""}
                  placeholder="Vacío = usar plan"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">
                  Max fotos/pieza override (0=ilimitado)
                </Label>
                <Input
                  name="maxPhotosOverride"
                  type="number"
                  min="0"
                  defaultValue={maxPhotosOverride ?? ""}
                  placeholder="Vacío = usar plan"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" size="sm" loading={saving}>
                  Guardar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    setMessage(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
