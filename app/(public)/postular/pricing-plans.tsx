"use client";

import { useState } from "react";
import type { MembershipPlan } from "@prisma/client";

const PLAN_ORDER = ["esencial", "artesano", "maestro"] as const;

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  esencial: "Para empezar a vender tus piezas",
  artesano: "Para orfebres que buscan crecer",
  maestro: "Para orfebres establecidos",
};

interface ComparisonRow {
  label: string;
  values: Record<string, string | boolean>;
}

function buildComparisonRows(plans: MembershipPlan[]): ComparisonRow[] {
  const byName: Record<string, MembershipPlan> = {};
  for (const p of plans) byName[p.name] = p;

  const fmt = (v: number) =>
    v === 0 ? "Ilimitados" : String(v);

  return [
    {
      label: "Comisión por venta",
      values: Object.fromEntries(plans.map((p) => [p.name, `${Math.round(p.commissionRate * 100)}%`])),
    },
    {
      label: "Productos activos",
      values: Object.fromEntries(plans.map((p) => [p.name, fmt(p.maxProducts)])),
    },
    {
      label: "Fotos por pieza",
      values: Object.fromEntries(plans.map((p) => [p.name, fmt(p.maxPhotosPerProduct)])),
    },
    {
      label: "Video por pieza",
      values: Object.fromEntries(plans.map((p) => [p.name, p.videoEnabled])),
    },
    {
      label: "Badge de perfil",
      values: Object.fromEntries(plans.map((p) => [p.name, p.badgeText || "—"])),
    },
    {
      label: "Certificado de autenticidad",
      values: Object.fromEntries(plans.map((p) => [p.name, p.hasCertificate])),
    },
    {
      label: "Estadísticas",
      values: Object.fromEntries(
        plans.map((p) => [
          p.name,
          p.hasAdvancedStats ? "Avanzadas" : p.hasBasicStats ? "Básicas" : "—",
        ])
      ),
    },
    {
      label: "Destaque en home",
      values: Object.fromEntries(plans.map((p) => [p.name, p.homeHighlight])),
    },
    {
      label: "Prioridad en búsqueda",
      values: Object.fromEntries(
        plans.map((p) => [
          p.name,
          p.searchWeight === 1 ? "Normal" : `${p.searchWeight}x`,
        ])
      ),
    },
    {
      label: "Frecuencia de pago",
      values: Object.fromEntries(
        plans.map((p) => [
          p.name,
          p.payoutFrequency === "48h" ? "48 horas" : p.payoutFrequency.charAt(0).toUpperCase() + p.payoutFrequency.slice(1),
        ])
      ),
    },
    {
      label: "Posts redes sociales",
      values: Object.fromEntries(
        plans.map((p) => [p.name, p.socialPostsPerMonth === 0 ? "—" : `${p.socialPostsPerMonth}/mes`])
      ),
    },
    {
      label: "Soporte",
      values: Object.fromEntries(
        plans.map((p) => [
          p.name,
          p.supportLevel === "dedicado"
            ? "Dedicado"
            : p.supportLevel === "chat"
              ? "Email + Chat"
              : "Email",
        ])
      ),
    },
  ];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

interface PricingPlansProps {
  plans: MembershipPlan[];
  onSelectPlan: (planName: string) => void;
}

export function PricingPlans({ plans, onSelectPlan }: PricingPlansProps) {
  const [annual, setAnnual] = useState(false);

  const sortedPlans = [...plans].sort(
    (a, b) => PLAN_ORDER.indexOf(a.name as typeof PLAN_ORDER[number]) - PLAN_ORDER.indexOf(b.name as typeof PLAN_ORDER[number])
  );

  const rows = buildComparisonRows(sortedPlans);

  return (
    <div>
      {/* Toggle mensual/anual */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm ${!annual ? "font-medium text-text" : "text-text-tertiary"}`}>
          Mensual
        </span>
        <button
          type="button"
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            annual ? "bg-accent" : "bg-border"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${annual ? "font-medium text-text" : "text-text-tertiary"}`}>
          Anual
        </span>
        {annual && (
          <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Ahorra 17%
          </span>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {sortedPlans.map((plan) => {
          const isPopular = plan.name === "artesano";
          const isMaestro = plan.name === "maestro";
          const price = plan.price === 0
            ? 0
            : annual && plan.annualPrice
              ? Math.round(plan.annualPrice / 12)
              : plan.price;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-shadow hover:shadow-md ${
                isPopular
                  ? "border-accent shadow-sm"
                  : "border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
                  Más popular
                </div>
              )}

              <div className="text-center">
                <h3 className="font-serif text-xl font-medium text-text">
                  {PLAN_LABELS[plan.name] || plan.name}
                </h3>
                <p className="mt-1 text-sm text-text-tertiary">
                  {PLAN_DESCRIPTIONS[plan.name] || ""}
                </p>

                <div className="mt-4">
                  {price === 0 ? (
                    <p className="font-serif text-3xl font-light text-text">Gratis</p>
                  ) : (
                    <>
                      <p className="font-serif text-3xl font-light text-text">
                        {formatPrice(price)}
                        <span className="text-base font-normal text-text-tertiary">/mes</span>
                      </p>
                      {annual && plan.annualPrice ? (
                        <p className="mt-1 text-xs text-text-tertiary">
                          {formatPrice(plan.annualPrice)} facturado anualmente
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="mt-1 text-sm text-text-secondary">
                  Comisión: {Math.round(plan.commissionRate * 100)}%
                </div>
              </div>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <svg
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isMaestro ? "text-amber-500" : isPopular ? "text-accent" : "text-green-600"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => onSelectPlan(plan.name)}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isPopular
                    ? "bg-accent text-white hover:bg-accent-dark"
                    : isMaestro
                      ? "bg-text text-background hover:bg-text/90"
                      : "border border-border bg-surface text-text hover:bg-background"
                }`}
              >
                {plan.price === 0 ? "Empezar gratis" : `Elegir ${PLAN_LABELS[plan.name]}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mt-16">
        <h2 className="text-center font-serif text-2xl font-light text-text">
          Compara los planes
        </h2>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-widest text-text-tertiary">
                  Beneficio
                </th>
                {sortedPlans.map((plan) => (
                  <th
                    key={plan.id}
                    className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-widest text-text-tertiary"
                  >
                    {PLAN_LABELS[plan.name] || plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="py-3 pr-4 text-text-secondary">{row.label}</td>
                  {sortedPlans.map((plan) => {
                    const val = row.values[plan.name];
                    return (
                      <td key={plan.id} className="py-3 px-4 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <svg className="mx-auto h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )
                        ) : (
                          <span className="text-text">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
