"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resumeOrderPayment } from "@/lib/actions/checkout";

export function ResumePaymentButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await resumeOrderPayment(orderId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("redirectUrl" in result && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 flex-shrink-0 text-red-600"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        </div>
      )}
      <Button
        type="button"
        size="lg"
        loading={isPending}
        onClick={handleClick}
        className="w-full gap-2 sm:w-auto"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Pagar con Mercado Pago
      </Button>
      <p className="text-[11px] text-text-tertiary">
        Serás redirigido a Mercado Pago para completar el pago de forma segura.
      </p>
    </div>
  );
}
