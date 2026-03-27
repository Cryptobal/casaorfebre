"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { curateProduct } from "@/lib/actions/admin";

interface CuratorPickButtonProps {
  productId: string;
  isCuratorPick: boolean;
  curatorNote?: string | null;
}

export function CuratorPickButton({ productId, isCuratorPick, curatorNote }: CuratorPickButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState(curatorNote ?? "");

  function handleToggle() {
    if (isCuratorPick) {
      // Remove curator pick
      const fd = new FormData();
      fd.set("isCuratorPick", "false");
      startTransition(async () => {
        await curateProduct(productId, fd);
        router.refresh();
      });
    } else {
      setShowForm(true);
    }
  }

  function handleSubmit() {
    const fd = new FormData();
    fd.set("isCuratorPick", "true");
    fd.set("curatorNote", note);
    startTransition(async () => {
      await curateProduct(productId, fd);
      router.refresh();
      setShowForm(false);
    });
  }

  if (showForm) {
    return (
      <div className="space-y-2">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Nota editorial (opcional, max 300 caracteres)"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-md bg-[#8B7355] px-3 py-1 text-xs font-medium text-white hover:bg-[#7a6549] disabled:opacity-50"
          >
            ✦ Marcar como Selección
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        isCuratorPick
          ? "bg-[#8B7355]/10 text-[#8B7355] hover:bg-red-50 hover:text-red-700"
          : "border border-border text-text-secondary hover:border-[#8B7355]/50 hover:text-[#8B7355]"
      }`}
    >
      ✦ {isCuratorPick ? "Quitar Curador" : "Curador"}
    </button>
  );
}
