"use client";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { submitQuestion } from "@/lib/actions/questions";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  answer: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  user: { name: string | null };
  artisan: { displayName: string };
}

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export function ProductQuestions({
  productId,
  artisanId,
  questions,
}: {
  productId: string;
  artisanId: string;
  questions: Question[];
}) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || isPending) return;
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const fd = new FormData();
      fd.set("productId", productId);
      fd.set("artisanId", artisanId);
      fd.set("question", text.trim());
      const result = await submitQuestion(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setText("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border p-6">
      <h2 className="mb-4 font-serif text-lg">Preguntas y Respuestas</h2>

      {/* Form */}
      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pregunta al orfebre sobre esta pieza..."
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            disabled={isPending}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-1 text-sm text-green-600">Pregunta enviada. El orfebre será notificado.</p>}
          <button
            type="submit"
            disabled={isPending || !text.trim()}
            className="mt-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50 min-h-[44px]"
          >
            {isPending ? "Enviando..." : "Enviar pregunta"}
          </button>
        </form>
      ) : (
        <div className="mb-6 rounded-md bg-background px-4 py-3 text-sm text-text-secondary">
          <Link href="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>{" "}
          para hacer una pregunta.
        </div>
      )}

      {/* Question list */}
      {questions.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          Aún no hay preguntas sobre esta pieza. ¡Sé el primero!
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
              {/* Question */}
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                  {(q.user.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <span className="font-medium text-text-secondary">{q.user.name || "Comprador"}</span>
                    <span>&middot;</span>
                    <span>{timeAgo(q.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-text">{q.question}</p>
                </div>
              </div>

              {/* Answer */}
              {q.answer && (
                <div className="ml-11 mt-3 flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                    {q.artisan.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-text-tertiary">
                      <span className="font-medium text-accent">{q.artisan.displayName}</span>
                      <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                        Orfebre
                      </span>
                      {q.answeredAt && (
                        <>
                          <span>&middot;</span>
                          <span>{timeAgo(q.answeredAt)}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{q.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
