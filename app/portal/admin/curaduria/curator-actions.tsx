"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { curateProduct } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

interface CuratorActionsProps {
  productId: string;
  curatorNote: string;
}

export function CuratorActions({ productId, curatorNote }: CuratorActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(curatorNote);

  function handleRemove() {
    const fd = new FormData();
    fd.set("isCuratorPick", "false");
    startTransition(async () => {
      await curateProduct(productId, fd);
      router.refresh();
    });
  }

  function handleSaveNote() {
    const fd = new FormData();
    fd.set("isCuratorPick", "true");
    fd.set("curatorNote", note);
    startTransition(async () => {
      await curateProduct(productId, fd);
      router.refresh();
      setEditing(false);
    });
  }

  return (
    <div className="flex items-center gap-2 pt-1">
      {editing ? (
        <div className="flex-1 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Nota editorial del curador (max 300 caracteres)"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveNote} disabled={isPending}>
              Guardar nota
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-accent hover:text-accent-dark"
          >
            Editar nota
          </button>
          <span className="text-text-tertiary">·</span>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Quitar de selección
          </button>
        </>
      )}
    </div>
  );
}
