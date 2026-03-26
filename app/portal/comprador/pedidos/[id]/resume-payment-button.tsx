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
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        size="lg"
        loading={isPending}
        onClick={handleClick}
        className="w-full sm:w-auto"
      >
        Pagar con Mercado Pago
      </Button>
    </div>
  );
}
