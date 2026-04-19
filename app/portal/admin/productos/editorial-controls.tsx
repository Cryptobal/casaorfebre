"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductEditorial } from "@/lib/actions/admin";
import { CuratorPickButton } from "@/app/portal/admin/curaduria/curator-pick-button";

interface EditorialControlsProps {
  productId: string;
  isCuratorPick: boolean;
  curatorNote: string | null;
  editorialRank: number | null;
  featuredOfMonth: boolean;
  /** true si el producto está APPROVED (los toggles sólo tienen sentido ahí). */
  isApproved: boolean;
}

/**
 * Panel editorial del admin en la ficha de producto:
 * - Curador: toggle con nota (reusa CuratorPickButton).
 * - Ranking editorial: input numérico (menor = más arriba, vacío = sin ranking).
 * - Pieza del mes: toggle exclusivo (activar desactiva cualquier otra).
 */
export function EditorialControls({
  productId,
  isCuratorPick,
  curatorNote,
  editorialRank,
  featuredOfMonth,
  isApproved,
}: EditorialControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rankValue, setRankValue] = useState(
    editorialRank != null ? String(editorialRank) : "",
  );
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  if (!isApproved) {
    return (
      <div className="rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs text-text-tertiary">
        ✦ Los controles editoriales se habilitan cuando el producto está publicado.
      </div>
    );
  }

  function flash(kind: "ok" | "err", msg: string) {
    setFeedback({ kind, msg });
    setTimeout(() => setFeedback(null), 2500);
  }

  function saveRank() {
    const fd = new FormData();
    fd.set("editorialRank", rankValue.trim());
    startTransition(async () => {
      const res = await setProductEditorial(productId, fd);
      if (res?.error) flash("err", res.error);
      else {
        flash("ok", rankValue.trim() === "" ? "Ranking eliminado" : "Ranking guardado");
        router.refresh();
      }
    });
  }

  function toggleFeaturedOfMonth() {
    const next = !featuredOfMonth;
    if (
      next &&
      !confirm(
        "¿Marcar esta pieza como Pieza del Mes? Se quitará la marca de cualquier otra pieza.",
      )
    ) {
      return;
    }
    const fd = new FormData();
    fd.set("featuredOfMonth", next ? "true" : "false");
    startTransition(async () => {
      const res = await setProductEditorial(productId, fd);
      if (res?.error) flash("err", res.error);
      else {
        flash("ok", next ? "Marcada como Pieza del Mes" : "Quitada del Mes");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-[#8B7355]/30 bg-[#8B7355]/[0.03] p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8B7355]">
          ✦ Panel Editorial
        </h4>
        {feedback && (
          <span
            className={`text-[11px] font-medium ${
              feedback.kind === "ok" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {feedback.msg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. Curador */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
            Selección del Curador
          </label>
          <CuratorPickButton
            productId={productId}
            isCuratorPick={isCuratorPick}
            curatorNote={curatorNote}
          />
        </div>

        {/* 2. Ranking editorial */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
            Ranking editorial
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={99999}
              step={1}
              value={rankValue}
              onChange={(e) => setRankValue(e.target.value)}
              placeholder="Sin ranking"
              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-xs"
            />
            <button
              type="button"
              onClick={saveRank}
              disabled={
                isPending ||
                (rankValue.trim() === "" && editorialRank == null) ||
                (rankValue.trim() !== "" && Number(rankValue) === editorialRank)
              }
              className="rounded-md bg-[#8B7355] px-3 py-1 text-xs font-medium text-white hover:bg-[#7a6549] disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
          <p className="text-[10px] leading-snug text-text-tertiary">
            Menor = más arriba. Vacío = sin ranking (cae por señales de popularidad).
          </p>
        </div>

        {/* 3. Pieza del Mes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary">
            Pieza del Mes
          </label>
          <button
            type="button"
            onClick={toggleFeaturedOfMonth}
            disabled={isPending}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              featuredOfMonth
                ? "bg-[#8B7355]/10 text-[#8B7355] hover:bg-red-50 hover:text-red-700"
                : "border border-border text-text-secondary hover:border-[#8B7355]/50 hover:text-[#8B7355]"
            }`}
          >
            {featuredOfMonth ? "Quitar del Mes" : "Marcar del Mes"}
          </button>
          <p className="text-[10px] leading-snug text-text-tertiary">
            Exclusivo. Activar esta quita cualquier otra.
          </p>
        </div>
      </div>
    </div>
  );
}
