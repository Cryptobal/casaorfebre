"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { sendContactForm } from "@/lib/actions/contact";

const SUBJECTS = [
  "Consulta general",
  "Problema con un pedido",
  "Quiero vender en Casa Orfebre",
  "Prensa y colaboraciones",
  "Otro",
];

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldown, setCooldown] = useState(false);
  const [charCount, setCharCount] = useState(0);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");

    const result = await sendContactForm(formData);

    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
      return;
    }

    setStatus("success");
    formRef.current?.reset();
    setCharCount(0);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30_000);
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Tu nombre"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="tu@email.com"
        />
      </div>

      {/* Asunto */}
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-text">
          Asunto
        </label>
        <select
          id="subject"
          name="subject"
          required
          defaultValue=""
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="" disabled>
            Selecciona un asunto
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={1000}
          rows={5}
          onChange={(e) => setCharCount(e.target.value.length)}
          className="w-full resize-none rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="Escribe tu mensaje aquí..."
        />
        <p className="mt-1 text-right text-xs text-text-tertiary">
          {charCount}/1000
        </p>
      </div>

      {/* Feedback */}
      {status === "success" && (
        <div className="rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          Mensaje enviado. Te responderemos en 24-48 horas.
        </div>
      )}
      {status === "error" && errorMsg && (
        <div className="rounded-md border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={status === "loading"}
        disabled={cooldown}
      >
        {cooldown ? "Mensaje enviado" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
