"use client";

import { useState, useEffect, useCallback, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCLP } from "@/lib/utils";
import {
  importReferencePrices,
  saveArtisanMaterial,
  deleteArtisanMaterial,
} from "@/lib/actions/artisan-materials";

interface Material {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
  isCustom: boolean;
}

interface LineItem {
  materialId: string;
  quantity: number;
}

interface CalculadoraClientProps {
  initialMaterials: Material[];
  commissionRate: number;
}

// ─── Main Component ───

export function CalculadoraClient({ initialMaterials, commissionRate }: CalculadoraClientProps) {
  const [materials, setMaterials] = useState(initialMaterials);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    setMaterials(initialMaterials);
  }, [initialMaterials]);
  const [lines, setLines] = useState<LineItem[]>([{ materialId: "", quantity: 0 }]);
  const [otherCosts, setOtherCosts] = useState(0);
  const [hours, setHours] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("co_hourly_rate") || "0", 10);
    }
    return 0;
  });
  const [copiedPrice, setCopiedPrice] = useState<number | null>(null);
  const [customMult, setCustomMult] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestedMin: number;
    suggestedMax: number;
    reasoning: string;
    tips: string[];
  } | null>(null);
  const [marketData, setMarketData] = useState<{
    min: number;
    max: number;
    median: number;
    count: number;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (hourlyRate > 0) {
      localStorage.setItem("co_hourly_rate", String(hourlyRate));
    }
  }, [hourlyRate]);

  // Sync from server after import/save/delete
  const refreshMaterials = useCallback((newMaterials: Material[]) => {
    setMaterials(newMaterials);
  }, []);

  // ─── Calculations ───
  const materialCost = lines.reduce((sum, line) => {
    const mat = materials.find((m) => m.id === line.materialId);
    if (!mat) return sum;
    return sum + mat.pricePerUnit * line.quantity;
  }, 0);

  const laborCost = hours * hourlyRate;
  const subtotal = materialCost + otherCosts;
  const totalCost = subtotal + laborCost;
  const overhead = Math.round(totalCost * 0.1);
  const costWithOverhead = totalCost + overhead;

  const fixedMultipliers = [
    { label: "Conservador", mult: 2.0 },
    { label: "Recomendado", mult: 2.5 },
    { label: "Premium", mult: 3.0 },
  ];
  const multipliers = customMult > 0
    ? [...fixedMultipliers, { label: "Personalizado", mult: customMult }]
    : fixedMultipliers;

  const commissionPct = Math.round(commissionRate * 100);

  async function handleAiSuggestion() {
    if (costWithOverhead <= 0) return;
    setAiLoading(true);
    try {
      const materialNames = lines
        .map(l => materials.find(m => m.id === l.materialId)?.name)
        .filter(Boolean);

      const res = await fetch("/api/ai/price-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialCost: subtotal,
          laborCost,
          totalCost: costWithOverhead,
          materials: materialNames,
          hours,
        }),
      });
      const data = await res.json();
      setAiSuggestion(data.suggestion);
      setMarketData(data.marketData);
    } catch {
      // silently fail
    } finally {
      setAiLoading(false);
    }
  }

  function handleCopyPrice(price: number) {
    navigator.clipboard.writeText(String(price));
    setCopiedPrice(price);
    setTimeout(() => setCopiedPrice(null), 2000);
  }

  // ─── No materials: show import ───
  if (materials.length === 0 && !showAdmin) {
    return (
      <EmptyState
        onImported={(newMats) => {
          refreshMaterials(newMats);
        }}
      />
    );
  }

  return (
    <div className="mt-6 space-y-8">
      {/* ─── Section 1: My Materials ─── */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-text">Mis Materiales</h2>
          <Button size="sm" variant="secondary" onClick={() => setShowAdmin(!showAdmin)}>
            {showAdmin ? "Cerrar" : "Administrar"}
          </Button>
        </div>

        {showAdmin ? (
          <MaterialAdmin
            materials={materials}
            onUpdate={refreshMaterials}
          />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="pb-2 pr-4 font-medium">Material</th>
                    <th className="pb-2 pr-4 font-medium">$/unidad</th>
                    <th className="pb-2 font-medium">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-4 text-text">{m.name}</td>
                      <td className="py-2 pr-4 text-text">{formatCLP(m.pricePerUnit)}/{m.unit === "gramo" ? "g" : m.unit}</td>
                      <td className="py-2 text-text-secondary">{m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-text-tertiary">
              Estos son TUS precios de costo. Los puedes actualizar cuando
              cambien tus proveedores.
            </p>
          </>
        )}
      </section>

      {/* ─── Section 2: Calculate Piece ─── */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-medium text-text">Calcular Pieza</h2>

        <div className="space-y-3">
          {lines.map((line, i) => {
            const mat = materials.find((m) => m.id === line.materialId);
            const lineTotal = mat ? mat.pricePerUnit * line.quantity : 0;
            const unitLabel = mat?.unit === "gramo" ? "g" : mat?.unit || "";
            const step = mat?.unit === "gramo" || mat?.unit === "quilate" ? 0.1 : 1;

            return (
              <div key={i} className="flex items-center gap-3">
                <select
                  className="w-48 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  value={line.materialId}
                  onChange={(e) => {
                    const next = [...lines];
                    next[i] = { ...next[i], materialId: e.target.value };
                    setLines(next);
                  }}
                >
                  <option value="">Seleccionar...</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  min={0}
                  step={step}
                  value={line.quantity || ""}
                  onChange={(e) => {
                    const next = [...lines];
                    next[i] = { ...next[i], quantity: parseFloat(e.target.value) || 0 };
                    setLines(next);
                  }}
                  className="w-24"
                  placeholder={unitLabel || "cant."}
                />

                {unitLabel && (
                  <span className="text-xs text-text-tertiary">{unitLabel}</span>
                )}

                <span className="min-w-[80px] text-right text-sm font-medium text-text">
                  {lineTotal > 0 ? formatCLP(Math.round(lineTotal)) : "—"}
                </span>

                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLines(lines.filter((_, j) => j !== i))}
                    className="text-text-tertiary hover:text-error"
                    title="Eliminar línea"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="mt-3"
          onClick={() => setLines([...lines, { materialId: "", quantity: 0 }])}
        >
          + Agregar línea
        </Button>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="otherCosts">Otros costos (empaque, herramientas, etc.)</Label>
          <Input
            id="otherCosts"
            type="number"
            min={0}
            value={otherCosts || ""}
            onChange={(e) => setOtherCosts(parseInt(e.target.value) || 0)}
            className="w-40"
            placeholder="0"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-text-secondary">Total materiales + insumos:</span>
          <span className="text-base font-semibold text-text">{formatCLP(subtotal)}</span>
        </div>
      </section>

      {/* ─── Section 3: Labor ─── */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-medium text-text">Mano de Obra</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="hours">Horas de trabajo</Label>
            <Input
              id="hours"
              type="number"
              min={0.5}
              step={0.5}
              value={hours || ""}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              placeholder="8"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rate">Mi tarifa por hora (CLP)</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              step={500}
              value={hourlyRate || ""}
              onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
              placeholder="8000"
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-text-tertiary">
          Referencia: Principiante $5.000-$7.000 / Intermedio $7.000-$10.000 /
          Experto $10.000+
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm font-medium text-text-secondary">Total mano de obra:</span>
          <span className="text-base font-semibold text-text">{formatCLP(laborCost)}</span>
        </div>
      </section>

      {/* ─── Section 4: Results ─── */}
      {costWithOverhead > 0 && (
        <section className="rounded-lg border-2 border-accent/30 bg-surface p-5">
          <h2 className="mb-4 text-lg font-medium text-text">Resumen de Costos</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Materiales e insumos:</span>
              <span className="text-text">{formatCLP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Mano de obra:</span>
              <span className="text-text">{formatCLP(laborCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Overhead (10%):</span>
              <span className="text-text">{formatCLP(overhead)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-text">Costo total:</span>
              <span className="text-text">{formatCLP(costWithOverhead)}</span>
            </div>
          </div>

          {/* Custom multiplier input */}
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
            <span className="text-sm text-text-secondary">Multiplicador personalizado:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-text-tertiary">×</span>
              <Input
                type="number"
                min={0.5}
                max={10}
                step={0.1}
                value={customMult || ""}
                onChange={(e) => setCustomMult(parseFloat(e.target.value) || 0)}
                placeholder="ej: 1.5"
                className="w-24"
              />
            </div>
            {customMult > 0 && (
              <span className="text-sm font-medium text-accent">
                = {formatCLP(Math.round(costWithOverhead * customMult))}
              </span>
            )}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-secondary">
                    <th className="pb-2 text-left font-medium" />
                    {multipliers.map((m) => (
                      <th
                        key={m.label}
                        className={`pb-2 text-center font-medium ${m.label === "Recomendado" ? "text-accent" : ""}`}
                      >
                        {m.label}
                        <span className="block text-xs font-normal text-text-tertiary">(×{m.mult})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-2 text-text-secondary">Precio</td>
                    {multipliers.map((m) => {
                      const price = Math.round(costWithOverhead * m.mult);
                      return (
                        <td key={m.label} className="py-2 text-center font-medium text-text">
                          {formatCLP(price)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 text-text-secondary">Comisión ({commissionPct}%)</td>
                    {multipliers.map((m) => {
                      const price = Math.round(costWithOverhead * m.mult);
                      const commission = Math.round(price * commissionRate);
                      return (
                        <td key={m.label} className="py-2 text-center text-error/80">
                          -{formatCLP(commission)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 text-text-secondary">Neto orfebre</td>
                    {multipliers.map((m) => {
                      const price = Math.round(costWithOverhead * m.mult);
                      const net = price - Math.round(price * commissionRate);
                      return (
                        <td key={m.label} className="py-2 text-center font-semibold text-text">
                          {formatCLP(net)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2 text-text-secondary">Margen</td>
                    {multipliers.map((m) => {
                      const price = Math.round(costWithOverhead * m.mult);
                      const net = price - Math.round(price * commissionRate);
                      const margin = Math.round(((net - costWithOverhead) / price) * 100);
                      return (
                        <td key={m.label} className="py-2 text-center text-text-secondary">
                          {margin}%
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 sm:hidden">
              {multipliers.map((m) => {
                const price = Math.round(costWithOverhead * m.mult);
                const commission = Math.round(price * commissionRate);
                const net = price - commission;
                const margin = Math.round(((net - costWithOverhead) / price) * 100);
                const isRecommended = m.label === "Recomendado";

                return (
                  <div
                    key={m.label}
                    className={`rounded-lg border p-4 ${
                      isRecommended ? "border-accent/50 bg-accent/5" : "border-border"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`font-medium ${isRecommended ? "text-accent" : "text-text"}`}>
                        {m.label} (×{m.mult})
                      </span>
                      <span className="text-lg font-semibold text-text">{formatCLP(price)}</span>
                    </div>
                    <div className="space-y-1 text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span>Comisión ({commissionPct}%):</span>
                        <span className="text-error/80">-{formatCLP(commission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Neto:</span>
                        <span className="font-medium text-text">{formatCLP(net)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Margen:</span>
                        <span>{margin}%</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isRecommended ? "primary" : "secondary"}
                      className="mt-3 w-full"
                      onClick={() => handleCopyPrice(price)}
                    >
                      {copiedPrice === price ? "Copiado ✓" : `Usar ${formatCLP(price)}`}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Desktop action buttons */}
            <div className="mt-6 hidden items-center justify-center gap-3 sm:flex">
              {multipliers.map((m) => {
                const price = Math.round(costWithOverhead * m.mult);
                const isRecommended = m.label === "Recomendado";

                return (
                  <Button
                    key={m.label}
                    size={isRecommended ? "md" : "sm"}
                    variant={isRecommended ? "primary" : "secondary"}
                    className={isRecommended ? "ring-2 ring-accent/30 ring-offset-2 ring-offset-surface" : ""}
                    onClick={() => handleCopyPrice(price)}
                  >
                    {copiedPrice === price ? "Copiado ✓" : `Usar ${formatCLP(price)}`}
                  </Button>
                );
              })}
            </div>

            <p className="mt-4 text-center text-xs text-text-tertiary">
              Precio copiado al portapapeles. Pégalo en tu nuevo producto.
            </p>
          </div>
        </section>
      )}

      {/* ─── Section 5: AI Price Suggestion ─── */}
      {costWithOverhead > 0 && (
        <section className="rounded-lg border-2 border-accent/30 bg-accent/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-accent">Sugerencia IA</h2>
            <Button
              size="sm"
              variant="primary"
              onClick={handleAiSuggestion}
              loading={aiLoading}
              disabled={aiLoading}
            >
              {aiSuggestion ? "Recalcular" : "Sugerir precio con IA"}
            </Button>
          </div>

          {marketData && (
            <div className="mt-4 rounded-md bg-background p-3">
              <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-2">
                Datos del mercado ({marketData.count} piezas similares)
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-text-tertiary">Minimo</p>
                  <p className="font-medium text-text">{formatCLP(marketData.min)}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Mediana</p>
                  <p className="font-medium text-text">{formatCLP(marketData.median)}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">Maximo</p>
                  <p className="font-medium text-text">{formatCLP(marketData.max)}</p>
                </div>
              </div>
            </div>
          )}

          {aiSuggestion && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-tertiary">Precio sugerido</p>
                  <p className="text-xl font-semibold text-accent">
                    {formatCLP(aiSuggestion.suggestedMin)} — {formatCLP(aiSuggestion.suggestedMax)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">{aiSuggestion.reasoning}</p>
              {aiSuggestion.tips?.length > 0 && (
                <ul className="space-y-1">
                  {aiSuggestion.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent mt-0.5">&#8226;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!aiSuggestion && !aiLoading && (
            <p className="mt-3 text-sm text-text-tertiary">
              La IA analiza productos similares en el marketplace y sugiere un precio competitivo basado en tus costos.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

// ─── Empty State ───

function EmptyState({ onImported }: { onImported: (materials: Material[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleImport() {
    setLoading(true);
    setError(null);
    const result = await importReferencePrices();
    if (result.success) {
      if (result.count === 0) {
        setError("No hay precios de referencia configurados aún. Contacta al administrador.");
      } else {
        router.refresh();
      }
    } else {
      setError(result.error || "Error al importar precios de referencia");
    }
    setLoading(false);
  }

  return (
    <div className="mt-12 flex flex-col items-center text-center">
      <div className="rounded-full bg-accent/10 p-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
          <path d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-medium text-text">¿Primera vez?</h2>
      <p className="mt-1 max-w-md text-sm text-text-tertiary">
        Puedes empezar con nuestros precios de referencia y ajustarlos a
        tus costos reales.
      </p>
      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <Button className="mt-4" onClick={handleImport} loading={loading}>
        Importar precios de referencia
      </Button>
    </div>
  );
}

// ─── Material Admin Panel ───

function MaterialAdmin({
  materials,
  onUpdate,
}: {
  materials: Material[];
  onUpdate: (materials: Material[]) => void;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteArtisanMaterial(id);
    router.refresh();
    setDeleting(null);
  }

  async function handleReimport() {
    if (!confirm("Esto sobreescribirá los materiales que tengan el mismo nombre que los de referencia. ¿Continuar?")) return;
    await importReferencePrices();
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {materials.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded border border-border/50 px-3 py-2">
            {editingId === m.id ? (
              <EditMaterialForm
                material={m}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <>
                <span className="flex-1 text-sm text-text">{m.name}</span>
                <span className="text-sm text-text-secondary">
                  {formatCLP(m.pricePerUnit)}/{m.unit === "gramo" ? "g" : m.unit}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-text-tertiary hover:text-accent"
                  title="Editar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  disabled={deleting === m.id}
                  className="text-text-tertiary hover:text-error disabled:opacity-50"
                  title="Eliminar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {showNew ? (
        <NewMaterialForm
          onDone={() => {
            setShowNew(false);
            router.refresh();
          }}
        />
      ) : (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowNew(true)}>
            + Agregar material
          </Button>
          <Button size="sm" variant="ghost" onClick={handleReimport}>
            Re-importar referencia
          </Button>
        </div>
      )}
    </div>
  );
}

function EditMaterialForm({ material, onDone }: { material: Material; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveArtisanMaterial, null);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state?.success, onDone]);

  return (
    <form action={action} className="flex flex-1 items-center gap-2">
      <input type="hidden" name="id" value={material.id} />
      <Input name="name" defaultValue={material.name} className="flex-1" required />
      <Input name="pricePerUnit" type="number" defaultValue={material.pricePerUnit} min={1} className="w-24" required />
      <select
        name="unit"
        defaultValue={material.unit}
        className="rounded-md border border-border bg-surface px-2 py-2 text-sm text-text"
      >
        <option value="gramo">gramo</option>
        <option value="unidad">unidad</option>
        <option value="cm">cm</option>
        <option value="quilate">quilate</option>
      </select>
      <Button size="sm" type="submit" loading={pending}>OK</Button>
      <Button size="sm" variant="ghost" type="button" onClick={onDone}>✕</Button>
      {state?.error && <span className="text-xs text-error">{state.error}</span>}
    </form>
  );
}

function NewMaterialForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(saveArtisanMaterial, null);

  useEffect(() => {
    if (state?.success) onDone();
  }, [state?.success, onDone]);

  return (
    <form action={action} className="mt-3 flex items-end gap-2 rounded border border-border bg-background p-3">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Nombre</Label>
        <Input name="name" placeholder="Ej: Hilo de cobre 0.8mm" required />
      </div>
      <div className="w-24 space-y-1">
        <Label className="text-xs">Precio</Label>
        <Input name="pricePerUnit" type="number" min={1} placeholder="850" required />
      </div>
      <div className="w-24 space-y-1">
        <Label className="text-xs">Unidad</Label>
        <select
          name="unit"
          defaultValue="gramo"
          className="w-full rounded-md border border-border bg-surface px-2 py-2 text-sm text-text"
        >
          <option value="gramo">gramo</option>
          <option value="unidad">unidad</option>
          <option value="cm">cm</option>
          <option value="quilate">quilate</option>
        </select>
      </div>
      <Button size="sm" type="submit" loading={pending}>Agregar</Button>
      <Button size="sm" variant="ghost" type="button" onClick={onDone}>✕</Button>
      {state?.error && <span className="text-xs text-error">{state.error}</span>}
    </form>
  );
}
