"use client";

import { useState } from "react";
import { changePlan } from "@/lib/actions/membership";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArtisanBadge } from "@/components/artisans/artisan-badge";

interface Plan {
  id: string;
  name: string;
  price: number;
  annualPrice: number | null;
  commissionRate: number;
  maxProducts: number;
  maxPhotosPerProduct: number;
  videoEnabled: boolean;
  features: string[];
  badgeText: string | null;
  badgeType: string | null;
  homeHighlight: boolean;
  hasCertificate: boolean;
  hasBasicStats: boolean;
  hasAdvancedStats: boolean;
  payoutFrequency: string;
  socialPostsPerMonth: number;
  supportLevel: string;
}

interface PlanSelectorProps {
  currentPlanId: string | null;
  plans: Plan[];
  activeProductCount: number;
}

const PLAN_ORDER: Record<string, number> = {
  esencial: 0,
  artesano: 1,
  maestro: 2,
};

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

const PAYOUT_LABELS: Record<string, string> = {
  quincenal: "Quincenal",
  semanal: "Semanal",
};

const SUPPORT_LABELS: Record<string, string> = {
  email: "Email",
  prioritario: "Prioritario",
  dedicado: "Dedicado",
};

export function PlanSelector({
  currentPlanId,
  plans,
  activeProductCount,
}: PlanSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [confirmPlanId, setConfirmPlanId] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const sortedPlans = [...plans].sort(
    (a, b) => (PLAN_ORDER[a.name] ?? 99) - (PLAN_ORDER[b.name] ?? 99)
  );

  async function handleChangePlan(planId: string) {
    setLoading(planId);
    setResult(null);
    setConfirmPlanId(null);

    const res = await changePlan(planId, billingPeriod);
    setLoading(null);

    if (res.error) {
      setResult({ type: "error", message: res.error });
    } else if (res.redirectUrl) {
      // Redirect to MercadoPago for payment
      window.location.href = res.redirectUrl;
    } else {
      setResult({
        type: "success",
        message: res.summary || "Plan actualizado exitosamente",
      });
    }
  }

  function getButtonForPlan(plan: Plan) {
    if (plan.id === currentPlanId) {
      return (
        <span className="inline-block rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          Plan Actual
        </span>
      );
    }

    const isUpgrade =
      (PLAN_ORDER[plan.name] ?? 99) >
      (PLAN_ORDER[currentPlan?.name ?? ""] ?? -1);
    const isDowngrade = !isUpgrade;
    const willPause =
      isDowngrade &&
      plan.maxProducts > 0 &&
      activeProductCount > plan.maxProducts;

    if (confirmPlanId === plan.id) {
      return (
        <div className="space-y-2">
          {willPause && (
            <p className="text-xs text-amber-600">
              Se pausarán {activeProductCount - plan.maxProducts} producto
              {activeProductCount - plan.maxProducts > 1 ? "s" : ""} que exceden
              el límite.
            </p>
          )}
          <p className="text-xs text-text-secondary">
            {isDowngrade ? "¿Confirmar cambio de plan?" : "¿Confirmar upgrade?"}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              loading={loading === plan.id}
              onClick={() => handleChangePlan(plan.id)}
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setConfirmPlanId(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Button
        size="sm"
        variant={isUpgrade ? "primary" : "secondary"}
        onClick={() => setConfirmPlanId(plan.id)}
        disabled={loading !== null}
      >
        {isUpgrade ? `Subir a ${PLAN_LABELS[plan.name] || plan.name}` : `Cambiar a ${PLAN_LABELS[plan.name] || plan.name}`}
      </Button>
    );
  }

  return (
    <div>
      {result && (
        <div
          className={`mb-6 rounded-md border px-4 py-3 text-sm ${
            result.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {result.message}
        </div>
      )}

      {/* Billing period toggle */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            billingPeriod === "monthly"
              ? "bg-accent text-white"
              : "bg-surface-secondary text-text-secondary hover:text-text"
          }`}
          onClick={() => setBillingPeriod("monthly")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            billingPeriod === "annual"
              ? "bg-accent text-white"
              : "bg-surface-secondary text-text-secondary hover:text-text"
          }`}
          onClick={() => setBillingPeriod("annual")}
        >
          Anual
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sortedPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                isCurrent
                  ? "border-accent ring-1 ring-accent/20"
                  : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl font-medium text-text">
                  {PLAN_LABELS[plan.name] || plan.name}
                </h3>
                {plan.badgeType && (
                  <ArtisanBadge
                    badgeType={plan.badgeType}
                    badgeText={plan.badgeText}
                  />
                )}
              </div>

              {/* Price */}
              <div className="mt-3">
                {plan.price === 0 ? (
                  <span className="text-2xl font-semibold text-text">
                    Gratis
                  </span>
                ) : (
                  <div>
                    <span className="text-2xl font-semibold text-text">
                      ${(billingPeriod === "annual" && plan.annualPrice
                        ? plan.annualPrice
                        : plan.price
                      ).toLocaleString("es-CL")}
                    </span>
                    <span className="text-sm text-text-tertiary">
                      {billingPeriod === "annual" ? " /año" : " /mes"}
                    </span>
                    {billingPeriod === "annual" && plan.annualPrice && (
                      <p className="mt-1 text-xs text-green-600">
                        Ahorras ${(plan.price * 12 - plan.annualPrice).toLocaleString("es-CL")} al año
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Commission */}
              <p className="mt-2 text-sm text-text-secondary">
                Comisión: {Math.round(plan.commissionRate * 100)}%
              </p>

              {/* Features list */}
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    {plan.maxProducts === 0
                      ? "Productos ilimitados"
                      : `Hasta ${plan.maxProducts} productos`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>{plan.maxPhotosPerProduct} fotos por producto</span>
                </li>
                <li className="flex items-start gap-2">
                  {plan.videoEnabled ? <CheckIcon /> : <XIcon />}
                  <span
                    className={
                      plan.videoEnabled ? "" : "text-text-tertiary"
                    }
                  >
                    Video de producto
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  {plan.hasCertificate ? <CheckIcon /> : <XIcon />}
                  <span
                    className={
                      plan.hasCertificate ? "" : "text-text-tertiary"
                    }
                  >
                    Certificado digital
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  {plan.homeHighlight ? <CheckIcon /> : <XIcon />}
                  <span
                    className={
                      plan.homeHighlight ? "" : "text-text-tertiary"
                    }
                  >
                    Destaque en home
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  {plan.hasAdvancedStats ? (
                    <CheckIcon />
                  ) : plan.hasBasicStats ? (
                    <CheckIcon />
                  ) : (
                    <XIcon />
                  )}
                  <span
                    className={
                      plan.hasBasicStats || plan.hasAdvancedStats
                        ? ""
                        : "text-text-tertiary"
                    }
                  >
                    {plan.hasAdvancedStats
                      ? "Estadísticas avanzadas"
                      : plan.hasBasicStats
                        ? "Estadísticas básicas"
                        : "Sin estadísticas"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Pagos{" "}
                    {PAYOUT_LABELS[plan.payoutFrequency] ||
                      plan.payoutFrequency}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon />
                  <span>
                    Soporte{" "}
                    {SUPPORT_LABELS[plan.supportLevel] || plan.supportLevel}
                  </span>
                </li>
                {plan.socialPostsPerMonth > 0 && (
                  <li className="flex items-start gap-2">
                    <CheckIcon />
                    <span>
                      {plan.socialPostsPerMonth} post
                      {plan.socialPostsPerMonth > 1 ? "s" : ""} en RRSS/mes
                    </span>
                  </li>
                )}
              </ul>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-border">
                {getButtonForPlan(plan)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-tertiary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
