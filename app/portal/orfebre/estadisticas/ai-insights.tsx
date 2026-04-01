"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";

export function AiInsights() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/ai/orfebre-insights");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInsights(data.insights ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const icons = ["💡", "📊", "🎯", "✨", "📈"];

  if (loading) {
    return (
      <Card>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-text-secondary">Generando insights con IA...</p>
        </div>
      </Card>
    );
  }

  if (error || insights.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-text">
          Insights de esta semana
        </h2>
        <button
          type="button"
          onClick={fetchInsights}
          className="text-xs text-accent hover:underline"
        >
          Actualizar insights
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {insights.map((insight, i) => (
          <Card key={i}>
            <div className="flex gap-3">
              <span className="text-lg">{icons[i % icons.length]}</span>
              <p className="text-sm text-text leading-relaxed">{insight}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
