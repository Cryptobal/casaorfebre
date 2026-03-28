"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/lib/actions/products";
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

  if (hasSales) return null;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProduct(productId);
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
          ¿Eliminar &ldquo;{productName.length > 20 ? productName.slice(0, 20) + "…" : productName}&rdquo;?
        </span>
        <button
          type="button"
          onClick={handleDelete}
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
        className={`text-xs text-red-500 hover:text-red-700 ${className ?? ""}`}
      >
        Eliminar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </>
  );
}
