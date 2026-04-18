"use client";

import { useState } from "react";

/**
 * Newsletter editorial — sección oscura, input minimal con border-bottom.
 * Copy del brief editorial v1 §2.5.
 *
 * TODO: integrar con Resend Audiences (o similar) en una task futura.
 * Por ahora registra la suscripción en un endpoint placeholder que siempre
 * devuelve éxito — cuando se wire a provider real, reemplazar el fetch.
 */
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok && res.status !== 404) {
        throw new Error("submit_failed");
      }
      // Optimistic success — el endpoint puede no existir aún.
      setStatus("success");
      setMessage("Gracias. Te escribimos pronto.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("No pudimos suscribirte. Intenta de nuevo.");
    }
  }

  return (
    <section className="bg-text text-background">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8 sm:py-32">
        <h2 className="font-serif text-2xl font-light leading-relaxed text-background sm:text-3xl">
          Piezas nuevas, historias, y la primera invitación
          <br className="hidden sm:inline" />{" "}
          a las <span className="italic">ediciones limitadas</span>.
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 flex max-w-xl flex-col items-stretch gap-4 sm:flex-row sm:items-end"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Tu correo
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="flex-1 border-0 border-b border-[#FAFAF8] bg-transparent py-3 text-sm font-light text-background placeholder:text-text-tertiary focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="border border-[#FAFAF8] px-8 py-3 text-sm font-light tracking-wide text-background transition-colors hover:bg-[#FAFAF8] hover:text-text disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-background"
          >
            {status === "loading" ? "Enviando…" : "Suscribirse →"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className="mt-6 text-xs font-light italic text-text-tertiary"
          >
            {message}
          </p>
        )}

        <p className="mt-10 text-[11px] font-light italic text-text-tertiary">
          Solo correo editorial. Baja intensidad. Podés salirte en un click.
        </p>
      </div>
    </section>
  );
}
