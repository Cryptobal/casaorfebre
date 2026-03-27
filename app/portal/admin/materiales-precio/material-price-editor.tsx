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
      <div className="overflow-hidden rounded-lg border border-border">
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
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowNew(true)}>
          + Agregar material de referencia
        </Button>
      )}
    </div>
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
    <form action={action} className="mt-4 flex items-end gap-3 rounded-lg border border-border bg-background p-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-name">Nombre</Label>
        <Input id="new-name" name="name" placeholder="Ej: Titanio" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-price">Precio/gramo (CLP)</Label>
        <Input id="new-price" name="pricePerGram" type="number" min={1} required className="w-32" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-unit">Unidad</Label>
        <Input id="new-unit" name="unit" defaultValue="gramo" className="w-24" />
      </div>
      <Button size="sm" type="submit" loading={pending}>Agregar</Button>
      <Button size="sm" variant="ghost" type="button" onClick={onDone}>Cancelar</Button>
      {state?.error && <p className="text-xs text-error">{state.error}</p>}
    </form>
  );
}
