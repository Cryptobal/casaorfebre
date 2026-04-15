"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCLP } from "@/lib/utils";
import { updateMaterialPrice, createMaterialPrice } from "@/lib/actions/artisan-materials";

interface Material {
  id: string;
  name: string;
  pricePerGram: number;
  unit: string;
  updatedAt: Date;
}

export function MaterialPriceEditor({ materials }: { materials: Material[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="mt-8">
      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {materials.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-border bg-surface p-4"
          >
            {editingId === m.id ? (
              <EditCard material={m} onDone={() => setEditingId(null)} />
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text">{m.name}</p>
                    <p className="mt-1 text-sm text-text">
                      {formatCLP(m.pricePerGram)}
                      <span className="text-text-tertiary">/{m.unit}</span>
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Actualizado {new Date(m.updatedAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingId(m.id)}
                  >
                    Editar
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background">
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Material</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Precio referencial</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Unidad</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Última actualización</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                {editingId === m.id ? (
                  <EditRow material={m} onDone={() => setEditingId(null)} />
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-text">{m.name}</td>
                    <td className="px-4 py-3 text-text">{formatCLP(m.pricePerGram)}/{m.unit}</td>
                    <td className="px-4 py-3 text-text-secondary">{m.unit}</td>
                    <td className="px-4 py-3 text-text-tertiary">
                      {new Date(m.updatedAt).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(m.id)}>
                        Editar
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew ? (
        <NewMaterialRow onDone={() => setShowNew(false)} />
      ) : (
        <Button variant="secondary" size="sm" className="mt-4 w-full sm:w-auto" onClick={() => setShowNew(true)}>
          + Agregar material de referencia
        </Button>
      )}
    </div>
  );
}

function EditCard({ material, onDone }: { material: Material; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateMaterialPrice, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={material.id} />
      <p className="font-medium text-text">{material.name}</p>
      <div className="space-y-1.5">
        <Label htmlFor={`price-${material.id}`}>
          Precio / {material.unit} (CLP)
        </Label>
        <Input
          id={`price-${material.id}`}
          name="pricePerGram"
          type="number"
          inputMode="numeric"
          defaultValue={material.pricePerGram}
          min={1}
        />
      </div>
      {state?.error && <p className="text-xs text-error">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" type="submit" loading={pending} className="flex-1 sm:flex-none">
          Guardar
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onDone} className="flex-1 sm:flex-none">
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function EditRow({ material, onDone }: { material: Material; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateMaterialPrice, null);

  return (
    <>
      <td className="px-4 py-3 font-medium text-text">{material.name}</td>
      <td className="px-4 py-3" colSpan={2}>
        <form action={action} id={`edit-${material.id}`}>
          <input type="hidden" name="id" value={material.id} />
          <Input
            name="pricePerGram"
            type="number"
            inputMode="numeric"
            defaultValue={material.pricePerGram}
            min={1}
            className="w-32"
          />
        </form>
        {state?.error && <p className="mt-1 text-xs text-error">{state.error}</p>}
      </td>
      <td className="px-4 py-3" />
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" form={`edit-${material.id}`} loading={pending}>
            Guardar
          </Button>
        </div>
      </td>
    </>
  );
}

function NewMaterialRow({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createMaterialPrice, null);

  return (
    <form
      action={action}
      className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex-1 space-y-1.5 sm:min-w-[160px]">
        <Label htmlFor="new-name">Nombre</Label>
        <Input id="new-name" name="name" placeholder="Ej: Titanio" required />
      </div>
      <div className="space-y-1.5 sm:w-40">
        <Label htmlFor="new-price">Precio/gramo (CLP)</Label>
        <Input
          id="new-price"
          name="pricePerGram"
          type="number"
          inputMode="numeric"
          min={1}
          required
        />
      </div>
      <div className="space-y-1.5 sm:w-28">
        <Label htmlFor="new-unit">Unidad</Label>
        <Input id="new-unit" name="unit" defaultValue="gramo" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" type="submit" loading={pending} className="flex-1 sm:flex-none">
          Agregar
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={onDone} className="flex-1 sm:flex-none">
          Cancelar
        </Button>
      </div>
      {state?.error && <p className="w-full text-xs text-error">{state.error}</p>}
    </form>
  );
}
