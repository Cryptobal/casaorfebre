"use client";

import { useState, useTransition } from "react";
import { saveProductSelection } from "@/lib/actions/product-selection";
import Link from "next/link";

interface ProductItem {
  id: string;
  name: string;
  price: number;
  status: string;
  viewCount: number;
  imageUrl: string | null;
  createdAt: string;
}

interface Props {
  products: ProductItem[];
  maxProducts: number;
  isGracePeriod: boolean;
}

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductSelectionClient({
  products,
  maxProducts,
  isGracePeriod,
}: Props) {
  // Pre-select APPROVED products first (up to the limit), ordered by viewCount desc
  const approvedIds = products
    .filter((p) => p.status === "APPROVED")
    .slice(0, maxProducts)
    .map((p) => p.id);

  const [selected, setSelected] = useState<Set<string>>(new Set(approvedIds));
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null);

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxProducts) {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await saveProductSelection(Array.from(selected));
      setResult(res);
    });
  };

  if (result?.success) {
    return (
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-serif text-lg font-medium text-green-900">
          Selección guardada
        </h2>
        <p className="mt-2 text-sm text-green-700">
          {isGracePeriod
            ? "Tu plan ha sido actualizado a Esencial. Los productos no seleccionados han sido pausados."
            : "Tus productos han sido actualizados."}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            href="/portal/orfebre/productos"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-background"
          >
            Ver mis productos
          </Link>
          <Link
            href="/portal/orfebre/plan"
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark"
          >
            Actualizar plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {result?.error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </p>
      )}

      <p className="text-sm text-text-secondary">
        {isGracePeriod
          ? `Selecciona hasta ${maxProducts} productos para mantener activos. Los de mejor rendimiento están pre-seleccionados.`
          : `Tienes ${products.filter((p) => p.status === "APPROVED").length} de ${maxProducts} productos activos.`}
      </p>

      {/* Product grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const isSelected = selected.has(product.id);
          const isDisabled = !isSelected && selected.size >= maxProducts;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggleProduct(product.id)}
              disabled={isDisabled && !isSelected}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                  : isDisabled
                    ? "cursor-not-allowed border-border bg-surface opacity-50"
                    : "border-border bg-surface hover:border-accent/40"
              }`}
            >
              {/* Thumbnail */}
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-background">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {product.name}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatCLP(product.price)} · {product.viewCount} visitas
                </p>
                {product.status === "PAUSED" && (
                  <span className="mt-0.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    Pausado
                  </span>
                )}
              </div>

              {/* Checkbox indicator */}
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border ${
                  isSelected
                    ? "border-accent bg-accent text-white"
                    : "border-border"
                }`}
              >
                {isSelected && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <div className="text-sm">
          <span className={`font-medium ${selected.size > maxProducts ? "text-red-600" : "text-text"}`}>
            {selected.size}
          </span>
          <span className="text-text-tertiary"> de {maxProducts} seleccionados</span>
          {/* Progress bar */}
          <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${Math.min((selected.size / maxProducts) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/portal/orfebre/plan"
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-background"
          >
            Actualizar plan
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || selected.size === 0}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Confirmar selección"}
          </button>
        </div>
      </div>
    </div>
  );
}
