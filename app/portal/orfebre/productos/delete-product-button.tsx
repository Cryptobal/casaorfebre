"use client";

import { useState, useTransition } from "react";
import { archiveProduct, deleteProduct } from "@/lib/actions/products";
import { useRouter } from "next/navigation";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  hasSales: boolean;
  className?: string;
}

export function DeleteProductButton({
  productId,
  productName,
  hasSales,
  className,
}: DeleteProductButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Productos con ventas no se pueden borrar físicamente (rompería el historial
  // de órdenes y certificados). En su lugar se archivan: dejan de mostrarse en
  // el catálogo y en el listado activo, pero conservan su historial.
  const action = hasSales ? "archive" : "delete";
  const label = hasSales ? "Archivar" : "Eliminar";
  const shortName =
    productName.length > 20 ? productName.slice(0, 20) + "…" : productName;

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result =
        action === "archive"
          ? await archiveProduct(productId)
          : await deleteProduct(productId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      } else {
        router.refresh();
      }
    });
  }

  if (confirming) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
        <span className="text-xs text-red-600">
          {action === "archive"
            ? `¿Archivar “${shortName}”?`
            : `¿Eliminar “${shortName}”?`}
        </span>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "…" : "Sí"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-text-secondary hover:text-text"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        title={
          hasSales
            ? "Este producto tiene ventas: se archivará para conservar su historial."
            : undefined
        }
        className={`text-xs text-red-500 hover:text-red-700 ${className ?? ""}`}
      >
        {label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </>
  );
}
