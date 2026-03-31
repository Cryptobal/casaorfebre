"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";
import { updateShippingZone, createShippingZone, deleteShippingZone, updateShippingSettings } from "@/lib/actions/shipping";
import { CHILEAN_REGIONS } from "@/lib/chile-cities";

interface Zone {
  id: string;
  name: string;
  slug: string;
  regions: string[];
  price: number;
  estimatedDays: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface Settings {
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
}

export function ShippingAdmin({ initialZones, initialSettings }: { initialZones: Zone[]; initialSettings: Settings }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState(initialSettings);
  const [showNewZone, setShowNewZone] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Settings
  function handleSaveSettings() {
    startTransition(async () => {
      await updateShippingSettings(settings);
      router.refresh();
    });
  }

  // Zone actions
  function handleToggleZone(zone: Zone) {
    startTransition(async () => {
      await updateShippingZone(zone.id, { isActive: !zone.isActive });
      router.refresh();
    });
  }

  function handleDeleteZone(zone: Zone) {
    if (!confirm(`¿Eliminar la zona "${zone.name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteShippingZone(zone.id);
      router.refresh();
    });
  }

  // All regions already assigned to zones
  const assignedRegions = new Set(initialZones.flatMap((z) => z.regions));

  return (
    <div className="space-y-8">
      {/* Settings section */}
      <Card className="!p-5">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">Configuración general</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.freeShippingEnabled}
              onChange={(e) => setSettings({ ...settings, freeShippingEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm font-medium text-text">Envío gratis habilitado</span>
          </label>
          {settings.freeShippingEnabled && (
            <div className="space-y-1.5">
              <Label>Monto mínimo para envío gratis (CLP)</Label>
              <Input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value, 10) || 0 })}
                className="w-48"
              />
              <p className="text-xs text-text-tertiary">Compras sobre {formatCLP(settings.freeShippingThreshold)} tendrán envío gratis.</p>
            </div>
          )}
          <Button onClick={handleSaveSettings} loading={isPending} variant="secondary" size="sm">
            Guardar configuración
          </Button>
        </div>
      </Card>

      {/* Zones section */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">Zonas de envío</h2>
          <Button onClick={() => setShowNewZone(true)} variant="secondary" size="sm">
            + Agregar zona
          </Button>
        </div>

        {showNewZone && (
          <div className="mt-4">
            <ZoneForm
              availableRegions={CHILEAN_REGIONS.filter((r) => !assignedRegions.has(r))}
              onSave={(data) => {
                startTransition(async () => {
                  await createShippingZone(data);
                  setShowNewZone(false);
                  router.refresh();
                });
              }}
              onCancel={() => setShowNewZone(false)}
              isPending={isPending}
            />
          </div>
        )}

        <div className="mt-4 space-y-3">
          {initialZones.map((zone) => (
            <Card key={zone.id} className={`!p-4 ${!zone.isActive ? "opacity-60" : ""}`}>
              {editingId === zone.id ? (
                <ZoneForm
                  initial={zone}
                  availableRegions={[...zone.regions, ...CHILEAN_REGIONS.filter((r) => !assignedRegions.has(r) || zone.regions.includes(r))]}
                  onSave={(data) => {
                    startTransition(async () => {
                      await updateShippingZone(zone.id, data);
                      setEditingId(null);
                      router.refresh();
                    });
                  }}
                  onCancel={() => setEditingId(null)}
                  isPending={isPending}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-text">{zone.name}</h3>
                      <span className="text-lg font-semibold text-accent">{formatCLP(zone.price)}</span>
                      <span className="text-xs text-text-tertiary">{zone.estimatedDays}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {zone.regions.map((r) => (
                        <span key={r} className="rounded-full bg-background px-2 py-0.5 text-[11px] text-text-secondary">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => handleToggleZone(zone)}
                      disabled={isPending}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${zone.isActive ? "bg-green-500" : "bg-border"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${zone.isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                    </button>
                    <button
                      onClick={() => setEditingId(zone.id)}
                      className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteZone(zone)}
                      disabled={isPending}
                      className="rounded-md border border-border px-2 py-1 text-xs text-red-600 hover:border-red-300 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ZoneForm({
  initial,
  availableRegions,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: { name: string; price: number; estimatedDays: string; regions: string[] };
  availableRegions: readonly string[] | string[];
  onSave: (data: { name: string; price: number; estimatedDays: string; regions: string[] }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [estimatedDays, setEstimatedDays] = useState(initial?.estimatedDays ?? "");
  const [regions, setRegions] = useState<string[]>(initial?.regions ?? []);

  function handleSubmit() {
    if (!name || !price || !estimatedDays || regions.length === 0) return;
    onSave({ name, price: parseInt(price, 10), estimatedDays, regions });
  }

  return (
    <Card className="!p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Santiago" />
        </div>
        <div className="space-y-1.5">
          <Label>Precio (CLP)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="3990" />
        </div>
        <div className="space-y-1.5">
          <Label>Días estimados</Label>
          <Input value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} placeholder="1-2 días hábiles" />
        </div>
      </div>
      <div className="mt-4">
        <Label>Regiones</Label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {(availableRegions as string[]).map((r) => {
            const selected = regions.includes(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRegions(selected ? regions.filter((x) => x !== r) : [...regions, r])}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  selected ? "border-accent bg-accent/10 text-accent" : "border-border text-text-secondary hover:border-accent/50"
                }`}
              >
                {selected && "✓ "}{r}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={handleSubmit} loading={isPending} size="sm">
          {initial ? "Guardar" : "Crear zona"}
        </Button>
        <Button onClick={onCancel} variant="secondary" size="sm">Cancelar</Button>
      </div>
    </Card>
  );
}
