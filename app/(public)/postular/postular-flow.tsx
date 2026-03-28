"use client";

import { useState } from "react";
import type { MembershipPlan } from "@prisma/client";
import { PricingPlans } from "./pricing-plans";
import { ApplicationForm } from "./application-form";
import { PioneerBanner } from "./pioneer-banner";

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

interface PromoData {
  valid: boolean;
  planName?: string;
  durationDays?: number;
  campaign?: string;
  reason?: string;
  benefits?: {
    planDisplayName: string;
    price: string;
    freeMonths: number;
    totalValue: string;
  };
}

interface PostularFlowProps {
  plans: MembershipPlan[];
  preselectedPlan: string | null;
  specialties: string[];
  categories: string[];
  materials: string[];
  promoCode?: string | null;
  promoData?: PromoData | null;
}

export function PostularFlow({
  plans,
  preselectedPlan,
  specialties,
  categories,
  materials,
  promoCode,
  promoData,
}: PostularFlowProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    preselectedPlan
  );

  const hasValidPromo = promoData?.valid === true;

  if (!selectedPlan) {
    return (
      <>
        {promoData && !promoData.valid && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {promoData.reason === "expired"
              ? "El código promocional ha expirado."
              : promoData.reason === "used"
                ? "Este código promocional ya fue utilizado."
                : "El código promocional ingresado no es válido."}
          </div>
        )}
        <PricingPlans
          plans={plans}
          onSelectPlan={(planName) => setSelectedPlan(planName)}
          promoData={hasValidPromo ? promoData : undefined}
        />
      </>
    );
  }

  const plan = plans.find((p) => p.name === selectedPlan);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Pioneer banner */}
      {hasValidPromo && promoData.benefits && (
        <PioneerBanner benefits={promoData.benefits} />
      )}

      {/* Plan indicator */}
      <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-tertiary">Plan elegido:</span>
          <span className="font-serif font-medium text-text">
            {PLAN_LABELS[selectedPlan] || selectedPlan}
          </span>
          {hasValidPromo ? (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              GRATIS {promoData.benefits!.freeMonths} MESES
            </span>
          ) : (
            plan &&
            plan.price > 0 && (
              <span className="text-xs text-text-tertiary">
                (el cobro se realiza después de la aprobación)
              </span>
            )
          )}
        </div>
        {!hasValidPromo && (
          <button
            type="button"
            onClick={() => setSelectedPlan(null)}
            className="text-sm text-accent hover:text-accent-dark"
          >
            Cambiar plan
          </button>
        )}
      </div>

      <ApplicationForm
        specialties={specialties}
        categories={categories}
        materials={materials}
        selectedPlan={selectedPlan}
        promoCode={hasValidPromo ? promoCode! : undefined}
      />
    </div>
  );
}
