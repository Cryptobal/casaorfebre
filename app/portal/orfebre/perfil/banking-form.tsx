"use client";

import { useState, useTransition } from "react";
import { updateBankingData } from "@/lib/actions/profile";

const BANKS = [
  "Banco Santander",
  "Banco de Chile",
  "BancoEstado",
  "Banco BCI",
  "Banco Itau",
  "Scotiabank",
  "Banco Falabella",
  "Banco Ripley",
  "Banco Security",
  "Banco BICE",
  "Banco Consorcio",
  "Banco Internacional",
  "HSBC",
  "Otro",
];

const ACCOUNT_TYPES = [
  "Cuenta Corriente",
  "Cuenta Vista/RUT",
  "Cuenta de Ahorro",
];

interface BankingFormProps {
  initialData: {
    bankRut: string | null;
    bankHolderName: string | null;
    bankName: string | null;
    bankAccountType: string | null;
    bankAccountNumber: string | null;
  };
}

export function BankingForm({ initialData }: BankingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateBankingData(formData);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Datos bancarios guardados" });
      }
    });
  }

  const isComplete =
    initialData.bankRut &&
    initialData.bankHolderName &&
    initialData.bankName &&
    initialData.bankAccountType &&
    initialData.bankAccountNumber;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        {isComplete ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Datos bancarios completos
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Datos bancarios pendientes
          </span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text">
          RUT del titular
        </label>
        <input
          name="bankRut"
          type="text"
          placeholder="12.345.678-9"
          defaultValue={initialData.bankRut ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text">
          Nombre del titular
        </label>
        <input
          name="bankHolderName"
          type="text"
          defaultValue={initialData.bankHolderName ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text">Banco</label>
        <select
          name="bankName"
          defaultValue={initialData.bankName ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Selecciona un banco</option>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text">
          Tipo de cuenta
        </label>
        <select
          name="bankAccountType"
          defaultValue={initialData.bankAccountType ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">Selecciona tipo de cuenta</option>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text">
          Numero de cuenta
        </label>
        <input
          name="bankAccountNumber"
          type="text"
          defaultValue={initialData.bankAccountNumber ?? ""}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar datos bancarios"}
      </button>

      {feedback && (
        <p
          className={`text-sm ${feedback.type === "success" ? "text-green-700" : "text-red-600"}`}
        >
          {feedback.message}
        </p>
      )}
    </form>
  );
}
