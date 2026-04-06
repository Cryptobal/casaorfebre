"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { resendVerificationEmail } from "@/lib/actions/auth";

export function EmailVerificationBanner() {
  const { status } = useSession();
  const [show, setShow] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "loading" | "sent">("idle");

  useEffect(() => {
    if (status !== "authenticated") {
      setShow(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me/verification-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { show: boolean };
        if (!cancelled) setShow(data.show);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleResend() {
    setSendStatus("loading");
    await resendVerificationEmail();
    setSendStatus("sent");
  }

  if (!show) return null;

  if (sendStatus === "sent") {
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
        disabled={sendStatus === "loading"}
        className="font-medium underline hover:no-underline disabled:opacity-50"
      >
        {sendStatus === "loading" ? "Enviando..." : "¿No recibiste el correo? Reenviar"}
      </button>
    </div>
  );
}
