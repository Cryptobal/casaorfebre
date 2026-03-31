"use client";

import { useState } from "react";
import { deleteCollection } from "@/lib/actions/collections";
import { useRouter } from "next/navigation";

export function DeleteCollectionButton({
  collectionId,
  collectionName,
  productCount,
}: {
  collectionId: string;
  collectionName: string;
  productCount: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collectionId);
    setDeleting(false);
    if (result.success) {
      router.refresh();
    }
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-lg">
          <h3 className="font-medium text-text">
            ¿Eliminar &ldquo;{collectionName}&rdquo;?
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {productCount > 0
              ? `Los ${productCount} producto${productCount === 1 ? "" : "s"} de esta coleccion no se eliminaran, solo se desvincularan.`
              : "Esta coleccion no tiene productos vinculados."}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background"
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
    >
      Eliminar
    </button>
  );
}
