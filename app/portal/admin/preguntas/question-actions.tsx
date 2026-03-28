"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminQuestionActions({
  questionId,
  isBlocked,
  isPublic,
}: {
  questionId: string;
  isBlocked: boolean;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggleBlock() {
    startTransition(async () => {
      await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action: isBlocked ? "unblock" : "block" }),
      });
      router.refresh();
    });
  }

  async function toggleVisibility() {
    startTransition(async () => {
      await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, action: isPublic ? "hide" : "show" }),
      });
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta pregunta definitivamente?")) return;
    startTransition(async () => {
      await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      router.refresh();
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/50 pt-3">
      <button
        onClick={toggleBlock}
        disabled={isPending}
        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
          isBlocked
            ? "text-green-700 hover:bg-green-50"
            : "text-amber-700 hover:bg-amber-50"
        }`}
      >
        {isBlocked ? "Desbloquear" : "Bloquear"}
      </button>
      <button
        onClick={toggleVisibility}
        disabled={isPending}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-background disabled:opacity-50"
      >
        {isPublic ? "Ocultar" : "Hacer pública"}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
