"use client";

import { useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SuggestAnswerButton } from "./suggest-answer-button";

interface AnswerFormProps {
  questionId: string;
  answerAction: (formData: FormData) => Promise<void>;
}

export function AnswerForm({ questionId, answerAction }: AnswerFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestion = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (textarea.value.trim()) {
      if (!window.confirm("¿Reemplazar tu texto con la sugerencia?")) return;
    }

    textarea.value = text;
    textarea.focus();
  }, []);

  return (
    <form action={answerAction} className="mt-4">
      <textarea
        ref={textareaRef}
        name="answer"
        required
        rows={3}
        placeholder="Escribe tu respuesta..."
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
      />
      <div className="mt-2 flex items-center justify-between">
        <SuggestAnswerButton
          questionId={questionId}
          onSuggestion={handleSuggestion}
        />
        <Button type="submit" size="sm">
          Responder
        </Button>
      </div>
    </form>
  );
}
