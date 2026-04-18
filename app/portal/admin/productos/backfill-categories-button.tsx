"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { backfillProductCategories } from "@/lib/actions/admin";

type RunResult = Awaited<ReturnType<typeof backfillProductCategories>>;

/**
 * Botón admin para backfill de Product.categories.
 * Una sola ejecución suele ser suficiente; idempotente (sólo toca productos
 * sin categoría vinculada).
 */
export function BackfillCategoriesButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RunResult | null>(null);

  function handleRun() {
    if (!confirm("¿Correr backfill de categorías en todos los productos sin Category vinculada? Es seguro y idempotente.")) {
      return;
    }
    startTransition(async () => {
      const res = await backfillProductCategories();
      setResult(res);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-accent/40 bg-accent/[0.04] p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
            ✦ Backfill de categorías
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            Asigna Category a productos viejos que no la tienen — inferido por nombre.
            Hace que las páginas /coleccion/anillos, /aros, etc. muestren piezas.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={isPending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
        >
          {isPending ? "Corriendo…" : "Correr backfill"}
        </button>
      </div>

      {result?.error && (
        <p className="text-sm font-medium text-red-700">{result.error}</p>
      )}

      {result && !result.error && (
        <div className="space-y-2 text-xs">
          <p className="text-text-secondary">
            <strong className="text-text">Productos sin categoría antes:</strong>{" "}
            {result.totalWithoutCategory}
            {" · "}
            <strong className="text-text">Actualizados:</strong>{" "}
            {result.updated}
            {" · "}
            <strong className="text-text">No inferibles:</strong>{" "}
            {result.unmatched?.length ?? 0}
          </p>
          {result.byCategory && Object.keys(result.byCategory).length > 0 && (
            <div>
              <p className="font-medium text-text-secondary">Por categoría:</p>
              <ul className="ml-4 list-disc">
                {Object.entries(result.byCategory).map(([slug, n]) => (
                  <li key={slug}>
                    {slug}: {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.unmatched && result.unmatched.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer font-medium text-text-secondary hover:text-text">
                Ver productos no inferibles ({result.unmatched.length})
              </summary>
              <ul className="ml-4 mt-2 list-disc text-text-tertiary">
                {result.unmatched.slice(0, 50).map((p) => (
                  <li key={p.slug}>
                    {p.name}{" "}
                    <span className="text-text-tertiary/70">({p.slug})</span>
                  </li>
                ))}
                {result.unmatched.length > 50 && (
                  <li>… y {result.unmatched.length - 50} más</li>
                )}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
