"use client";

import { useState, useCallback } from "react";

interface SuggestAnswerButtonProps {
  questionId: string;
  onSuggestion: (text: string) => void;
}

export function SuggestAnswerButton({ questionId, onSuggestion }: SuggestAnswerButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/suggest-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error al generar" }));
        throw new Error(data.error || "No se pudo generar sugerencia");
      }

      const data = await res.json();
      onSuggestion(data.suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar sugerencia");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  }, [questionId, onSuggestion]);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-[0.8rem] text-[#8B7355] transition-colors hover:underline disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Pensando...
          </>
        ) : (
          "Sugerir respuesta"
        )}
      </button>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
