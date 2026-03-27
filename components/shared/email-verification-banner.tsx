"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/actions/auth";

export function EmailVerificationBanner() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleResend() {
    setStatus("loading");
    await resendVerificationEmail();
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="bg-green-50 px-4 py-2.5 text-center text-sm text-green-800">
        Email de verificación reenviado. Revisa tu bandeja de entrada.
      </div>
    );
  }

  return (
    <div className="bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
      Verifica tu email para completar tu registro.{" "}
      <button
        onClick={handleResend}
        disabled={status === "loading"}
        className="font-medium underline hover:no-underline disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "¿No recibiste el correo? Reenviar"}
      </button>
    </div>
  );
}
