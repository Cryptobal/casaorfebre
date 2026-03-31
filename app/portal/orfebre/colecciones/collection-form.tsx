"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollection, updateCollection } from "@/lib/actions/collections";

interface CollectionFormProps {
  collection?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const isEditing = !!collection;

  const action = isEditing
    ? updateCollection.bind(null, collection.id)
    : createCollection;

  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      router.push("/portal/orfebre/colecciones");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre de la coleccion</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={collection?.name ?? ""}
          placeholder='Ej: "Linea Mar", "Raices"'
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripcion (opcional)</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={collection?.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
          placeholder="Describe la inspiracion o concepto de esta coleccion..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear coleccion"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/portal/orfebre/colecciones")}
          className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
