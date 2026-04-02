"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExpandableProductRow } from "./expandable-product-row";
import { Button } from "@/components/ui/button";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";
import { adminDeleteProductsBatch } from "@/lib/actions/admin";

type Product = Parameters<typeof ExpandableProductRow>[0]["product"];

interface ProductListManagerProps {
  products: Product[];
  showBulkActions?: boolean;
}

export function ProductListManager({ products, showBulkActions = false }: ProductListManagerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  }

  const selectedProducts = products.filter((p) => selected.has(p.id));
  const selectedWithSales = selectedProducts.filter((p) => p._count.orderItems > 0);
  const selectedDeletable = selectedProducts.filter((p) => p._count.orderItems === 0);

  function handleBatchDelete() {
    const formData = new FormData();
    formData.set("productIds", JSON.stringify(selectedDeletable.map((p) => p.id)));
    startTransition(async () => {
      const result = await adminDeleteProductsBatch(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({
          type: "success",
          message: `${result.deleted} producto${result.deleted !== 1 ? "s" : ""} eliminado${result.deleted !== 1 ? "s" : ""}${result.skipped > 0 ? ` (${result.skipped} omitido${result.skipped !== 1 ? "s" : ""} por tener ventas)` : ""}`,
        });
        setSelected(new Set());
      }
      setDeleteModalOpen(false);
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-text-tertiary">
        No hay productos en esta categoria
      </p>
    );
  }

  return (
    <>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          {products.length} producto{products.length !== 1 ? "s" : ""}
        </p>
        {showBulkActions && (
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-secondary hover:text-text">
            <input
              type="checkbox"
              checked={selected.size === products.length && products.length > 0}
              onChange={toggleSelectAll}
              className="h-3.5 w-3.5 accent-accent"
            />
            Seleccionar todo
          </label>
        )}
      </div>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <span className="text-sm text-red-900">
            {selected.size} seleccionado{selected.size > 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            className="bg-red-700 text-white hover:bg-red-800"
            onClick={() => setDeleteModalOpen(true)}
            disabled={isPending}
          >
            Eliminar seleccionados
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            disabled={isPending}
          >
            Deseleccionar
          </Button>
          {feedback && (
            <span className={`text-sm ${feedback.type === "error" ? "text-red-700" : "text-green-700"}`}>
              {feedback.message}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-start gap-2">
            {showBulkActions && (
              <label className="mt-4 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected.has(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  className="h-3.5 w-3.5 accent-accent"
                />
              </label>
            )}
            <div className="min-w-0 flex-1">
              <ExpandableProductRow product={product} />
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDestructiveModal
        open={deleteModalOpen}
        title={`Eliminar ${selected.size} producto${selected.size !== 1 ? "s" : ""}`}
        description={
          selectedWithSales.length > 0
            ? `Se eliminarán ${selectedDeletable.length} producto${selectedDeletable.length !== 1 ? "s" : ""}. ${selectedWithSales.length} producto${selectedWithSales.length !== 1 ? "s" : ""} con ventas NO se puede${selectedWithSales.length !== 1 ? "n" : ""} eliminar (${selectedWithSales.map((p) => p.name).join(", ")}). Esta acción es irreversible.`
            : `Se eliminarán ${selected.size} producto${selected.size !== 1 ? "s" : ""} de forma permanente. Se borrarán sus fotos, reseñas y certificados asociados. Esta acción es irreversible.`
        }
        confirmLabel={`Eliminar ${selectedDeletable.length} producto${selectedDeletable.length !== 1 ? "s" : ""}`}
        onConfirm={handleBatchDelete}
        onCancel={() => setDeleteModalOpen(false)}
        pending={isPending}
      />
    </>
  );
}
