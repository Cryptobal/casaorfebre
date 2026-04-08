"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBuyerAccount } from "@/lib/actions/account-deletion-buyer";

interface Props {
  disabled: boolean;
}

export function DeleteBuyerAccountForm({ disabled }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isConfirmed = confirmation === "ELIMINAR";

  async function handleSubmit() {
    if (!isConfirmed || disabled) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteBuyerAccount();
      if (result.success) {
        router.push("/?cuenta=eliminada");
      } else {
        setError(result.error || "Error al eliminar la cuenta.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-800">
          Esta acción eliminará permanentemente tu cuenta y todos los datos
          asociados. No se puede deshacer.
        </p>
        <div className="mt-4">
          <label
            htmlFor="confirmation"
            className="block text-sm font-medium text-red-800"
          >
            Escribe <strong>ELIMINAR</strong> para confirmar:
          </label>
          <input
            id="confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="ELIMINAR"
            className="mt-2 w-full rounded-md border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            disabled={disabled || isPending}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isConfirmed || disabled || isPending}
        className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Eliminando cuenta..." : "Eliminar mi cuenta permanentemente"}
      </button>
    </div>
  );
}
