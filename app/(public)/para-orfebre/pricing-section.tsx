'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Esencial',
    description: 'Para empezar a vender tus piezas',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualTotal: 0,
    commission: 18,
    features: [
      '10 productos activos',
      '3 fotos por pieza',
      'Soporte email',
      'Pago a 14 días de entrega confirmada',
    ],
    cta: 'Empezar gratis',
    style: 'outline' as const,
  },
  {
    name: 'Artesano',
    description: 'Para orfebres que buscan crecer',
    monthlyPrice: 19990,
    annualMonthlyPrice: 16666,
    annualTotal: 199990,
    commission: 12,
    popular: true,
    features: [
      '40 productos activos',
      '6 fotos por pieza',
      'Badge Artesano Verificado',
      'Estadísticas básicas',
      'Certificado de autenticidad',
      'Prioridad en búsqueda (1.5x)',
      'Soporte chat',
      'Pago a 7 días de entrega confirmada',
      '1 post redes sociales/mes',
    ],
    cta: 'Elegir Artesano',
    style: 'gold' as const,
  },
  {
    name: 'Maestro',
    description: 'Para orfebres establecidos',
    monthlyPrice: 49990,
    annualMonthlyPrice: 41666,
    annualTotal: 499990,
    commission: 9,
    features: [
      'Productos ilimitados',
      'Fotos ilimitadas por pieza',
      'Video por pieza',
      'Badge Maestro Orfebre',
      'Estadísticas avanzadas',
      'Certificado de autenticidad',
      'Destaque en home',
      'Máxima prioridad búsqueda (2x)',
      'Soporte dedicado',
      'Pago a 48h de entrega confirmada',
      '4 posts redes sociales/mes',
    ],
    cta: 'Elegir Maestro',
    style: 'dark' as const,
  },
];

const COMPARISON_ROWS = [
  { label: 'Comisión', values: ['18%', '12%', '9%'] },
  { label: 'Productos activos', values: ['10', '40', 'Ilimitados'] },
  { label: 'Fotos por pieza', values: ['3', '6', 'Ilimitadas'] },
  { label: 'Video por pieza', values: [false, false, true] },
  { label: 'Badge de perfil', values: ['—', 'Artesano Verificado', 'Maestro Orfebre'] },
  { label: 'Certificado de autenticidad', values: [false, true, true] },
  { label: 'Estadísticas', values: ['—', 'Básicas', 'Avanzadas'] },
  { label: 'Destaque en home', values: [false, false, true] },
  { label: 'Prioridad en búsqueda', values: ['Normal', '1.5x', '2x'] },
  {
    label: 'Liberación de pago',
    values: ['14 días post-entrega', '7 días post-entrega', '48h post-entrega'],
  },
  { label: 'Posts redes sociales', values: ['—', '1/mes', '4/mes'] },
  { label: 'Soporte', values: ['Email', 'Email + Chat', 'Dedicado'] },
];

function formatCLP(n: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);
}

export function PricingSection({ pioneerMode = false }: { pioneerMode?: boolean } = {}) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span
          className={`text-sm ${!annual ? 'font-medium text-text' : 'text-text-tertiary'}`}
        >
          Mensual
        </span>
        <button
          type="button"
          onClick={() => setAnnual(!annual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            annual ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              annual ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span
          className={`text-sm ${annual ? 'font-medium text-text' : 'text-text-tertiary'}`}
        >
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
        {PLANS.map((plan) => {
          const price =
            plan.monthlyPrice === 0
              ? 0
              : annual
                ? plan.annualMonthlyPrice
                : plan.monthlyPrice;

          const isPioneerPlan = pioneerMode && plan.name === 'Maestro';

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col border p-6 transition-shadow hover:shadow-md ${
                isPioneerPlan
                  ? 'border-[#8B7355] shadow-md ring-1 ring-[#8B7355]/20'
                  : plan.popular
                    ? 'border-accent shadow-sm'
                    : 'border-border'
              }`}
            >
              {isPioneerPlan ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#8B7355] px-3 py-0.5 text-xs font-medium text-white">
                  GRATIS 3 MESES COMO PIONERO
                </div>
              ) : (
                plan.popular &&
                !pioneerMode && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
                    Más popular
                  </div>
                )
              )}

              <div className="text-center">
                <h3 className="font-serif text-xl font-medium text-text">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-text-tertiary">
                  {plan.description}
                </p>

                <div className="mt-4">
                  {isPioneerPlan ? (
                    <>
                      <p className="font-serif text-3xl font-light text-green-700">
                        Gratis
                      </p>
                      <p className="mt-1 text-sm text-text-tertiary line-through">
                        {formatCLP(plan.monthlyPrice)}/mes
                      </p>
                    </>
                  ) : price === 0 ? (
                    <p className="font-serif text-3xl font-light text-text">
                      Gratis
                    </p>
                  ) : (
                    <>
                      <p className="font-serif text-3xl font-light text-text">
                        {formatCLP(price)}
                        <span className="text-base font-normal text-text-tertiary">
                          /mes
                        </span>
                      </p>
                      {annual && plan.annualTotal > 0 && (
                        <p className="mt-1 text-xs text-text-tertiary">
                          {formatCLP(plan.annualTotal)} facturado anualmente
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-1 text-sm text-text-secondary">
                  {isPioneerPlan
                    ? '0% de comisión durante 3 meses'
                    : `Comisión: ${plan.commission}%`}
                </div>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <svg
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.style === 'dark'
                          ? 'text-amber-500'
                          : plan.style === 'gold'
                            ? 'text-accent'
                            : 'text-green-600'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Link
                  href={
                    pioneerMode
                      ? '/postular?pionero=1'
                      : `/postular?plan=${plan.name.toLowerCase()}`
                  }
                  className={`block w-full px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    isPioneerPlan
                      ? 'bg-[#8B7355] text-white hover:bg-[#7a6549]'
                      : plan.style === 'gold'
                        ? 'bg-accent text-white hover:bg-accent-dark'
                        : plan.style === 'dark'
                          ? 'bg-text text-background hover:bg-text/90'
                          : 'border border-border bg-surface text-text hover:bg-background'
                  }`}
                >
                  {pioneerMode ? 'Quiero ser Pionero' : plan.cta}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mt-16">
        <h3 className="text-center font-serif text-2xl font-light text-text">
          Compara los planes
        </h3>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-widest text-text-tertiary">
                  Beneficio
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.name}
                    className="px-4 pb-3 text-center text-xs font-medium uppercase tracking-widest text-text-tertiary"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label}>
                  <td className="py-3 pr-4 text-text-secondary">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <svg
                            className="mx-auto h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="text-text-tertiary">—</span>
                        )
                      ) : (
                        <span className="text-text">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
