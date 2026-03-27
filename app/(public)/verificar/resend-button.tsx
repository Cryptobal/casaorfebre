"use client";

import { useState } from "react";
import { resendVerificationEmail } from "@/lib/actions/auth";

export function ResendVerificationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleResend() {
    setStatus("loading");
    const result = await resendVerificationEmail();
    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("sent");
      setMessage("Email de verificación reenviado. Revisa tu bandeja de entrada.");
    }
  }

  if (status === "sent") {
    return (
      <p className="text-sm text-success">{message}</p>
    );
  }

  return (
    <div>
      <button
        onClick={handleResend}
        disabled={status === "loading"}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "Reenviar email de verificación"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-error">{message}</p>
      )}
    </div>
  );
}
