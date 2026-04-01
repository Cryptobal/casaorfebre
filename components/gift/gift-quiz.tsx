"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

interface QuizAnswers {
  forWhom: string;
  occasion: string;
  style: string;
  budget: string;
}

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  artisanName: string;
  materials: string[];
  reason: string;
}

interface QuizResults {
  products: ProductResult[];
  giftNote: string;
}

const STEPS = [
  {
    key: "forWhom" as const,
    title: "¿Para quién es?",
    options: [
      { value: "mi pareja", label: "Para mi pareja", icon: "💝" },
      { value: "mi mamá", label: "Para mi mamá", icon: "🌸" },
      { value: "una amiga", label: "Para una amiga", icon: "👯" },
      { value: "mí", label: "Para mí", icon: "✨" },
      { value: "él", label: "Para él", icon: "🎩" },
      { value: "otro", label: "Otro", icon: "🎁" },
    ],
  },
  {
    key: "occasion" as const,
    title: "¿Qué ocasión?",
    options: [
      { value: "cumpleaños", label: "Cumpleaños", icon: "🎂" },
      { value: "aniversario", label: "Aniversario", icon: "💍" },
      { value: "día de la madre", label: "Día de la Madre", icon: "🌷" },
      { value: "navidad", label: "Navidad", icon: "🎄" },
      { value: "sin ocasión especial", label: "Sin ocasión especial", icon: "🌟" },
      { value: "graduación", label: "Graduación", icon: "🎓" },
      { value: "compromiso", label: "Compromiso", icon: "💎" },
    ],
  },
  {
    key: "style" as const,
    title: "¿Qué estilo prefiere?",
    options: [
      { value: "minimalista", label: "Minimalista", icon: "◯" },
      { value: "bohemio y natural", label: "Bohemio / Natural", icon: "🍃" },
      { value: "clásico y elegante", label: "Clásico / Elegante", icon: "👑" },
      { value: "llamativo y statement", label: "Llamativo / Statement", icon: "🔥" },
      { value: "no estoy seguro", label: "No estoy seguro/a", icon: "🤔" },
    ],
  },
  {
    key: "budget" as const,
    title: "¿Presupuesto?",
    options: [
      { value: "hasta-30000", label: "Hasta $30.000", icon: "💰" },
      { value: "30000-60000", label: "$30.000 — $60.000", icon: "💰💰" },
      { value: "60000-100000", label: "$60.000 — $100.000", icon: "💰💰💰" },
      { value: "mas-100000", label: "Más de $100.000", icon: "💎" },
      { value: "sin-limite", label: "Sin límite", icon: "🌟" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Quiz Step Component                                                */
/* ------------------------------------------------------------------ */

function QuizStep({
  step,
  onSelect,
}: {
  step: (typeof STEPS)[number];
  onSelect: (value: string) => void;
}) {
  return (
    <div className="animate-fadeIn">
      <h2 className="font-serif text-2xl font-semibold text-[#1a1a18] text-center">
        {step.title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {step.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#e8e5df] bg-white p-4 text-center transition-all hover:border-[#8B7355] hover:shadow-md active:scale-[0.98]"
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-sm font-medium text-[#1a1a18]">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results Component                                                  */
/* ------------------------------------------------------------------ */

function QuizResultsView({
  results,
  answers,
  onReset,
}: {
  results: QuizResults;
  answers: QuizAnswers;
  onReset: () => void;
}) {
  const [showNote, setShowNote] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyNote = () => {
    navigator.clipboard.writeText(results.giftNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="font-serif text-2xl font-semibold text-[#1a1a18] text-center">
        Estas piezas son perfectas para {answers.forWhom} en {answers.occasion}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.products.map((p) => (
          <a
            key={p.id}
            href={`/coleccion/${p.slug}`}
            className="flex gap-3 rounded-xl border border-[#e8e5df] bg-white p-3 transition-all hover:border-[#8B7355] hover:shadow-md"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f5f3ef]">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#9e9a90]">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-sm font-medium text-[#1a1a18] line-clamp-1">
                {p.name}
              </p>
              <p className="text-xs text-[#9e9a90]">{p.artisanName}</p>
              <p className="mt-1 text-sm font-medium text-[#8B7355]">
                {formatCLP(p.price)}
              </p>
              <p className="mt-1 text-xs text-[#6b6860] italic line-clamp-2">
                {p.reason}
              </p>
            </div>
          </a>
        ))}
      </div>

      {results.products.length === 0 && (
        <p className="mt-8 text-center text-sm text-[#9e9a90]">
          No encontramos productos que coincidan exactamente. Explora nuestra{" "}
          <a href="/coleccion" className="text-[#8B7355] underline">
            colección completa
          </a>
          .
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className="rounded-lg border border-[#8B7355] px-6 py-2.5 text-sm font-medium text-[#8B7355] transition-colors hover:bg-[#8B7355] hover:text-white"
        >
          {showNote ? "Ocultar nota de regalo" : "Generar nota de regalo"}
        </button>

        {showNote && (
          <div className="w-full max-w-md rounded-xl border border-[#e8e5df] bg-[#FAFAF8] p-4">
            <p className="text-sm text-[#1a1a18] italic leading-relaxed">
              &ldquo;{results.giftNote}&rdquo;
            </p>
            <button
              type="button"
              onClick={copyNote}
              className="mt-3 text-xs font-medium text-[#8B7355] hover:underline"
            >
              {copied ? "¡Copiado!" : "Copiar nota"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          className="text-sm text-[#9e9a90] hover:text-[#1a1a18] transition-colors"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Quiz Component                                                */
/* ------------------------------------------------------------------ */

export function GiftQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const handleSelect = useCallback(
    async (value: string) => {
      const currentStep = STEPS[step];
      const newAnswers = { ...answers, [currentStep.key]: value };
      setAnswers(newAnswers);

      if (step < STEPS.length - 1) {
        setStep(step + 1);
      } else {
        // Last step — fetch results
        setLoading(true);
        try {
          const res = await fetch("/api/ai/gift-guide", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAnswers),
          });
          const data = await res.json();
          setResults(data);
        } catch {
          setResults({ products: [], giftNote: "Error al generar recomendaciones." });
        } finally {
          setLoading(false);
        }
      }
    },
    [step, answers],
  );

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      {!results && !loading && (
        <div className="mb-8 flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#8B7355]" : "bg-[#e8e5df]"
              }`}
            />
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8e5df] border-t-[#8B7355]" />
          <p className="text-sm text-[#9e9a90]">
            Buscando las piezas perfectas...
          </p>
        </div>
      ) : results ? (
        <QuizResultsView
          results={results}
          answers={answers as QuizAnswers}
          onReset={handleReset}
        />
      ) : (
        <QuizStep step={STEPS[step]} onSelect={handleSelect} />
      )}
    </div>
  );
}
