"use client";

import { useState } from "react";
import type { MembershipPlan } from "@prisma/client";
import { PricingPlans } from "./pricing-plans";
import { ApplicationForm } from "./application-form";

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
};

interface PostularFlowProps {
  plans: MembershipPlan[];
  preselectedPlan: string | null;
  specialties: string[];
  categories: string[];
  materials: string[];
}

export function PostularFlow({
  plans,
  preselectedPlan,
  specialties,
  categories,
  materials,
}: PostularFlowProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    preselectedPlan
  );

  if (!selectedPlan) {
    return (
      <PricingPlans
        plans={plans}
        onSelectPlan={(planName) => setSelectedPlan(planName)}
      />
    );
  }

  const plan = plans.find((p) => p.name === selectedPlan);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Plan indicator */}
      <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-tertiary">Plan elegido:</span>
          <span className="font-serif font-medium text-text">
            {PLAN_LABELS[selectedPlan] || selectedPlan}
          </span>
          {plan && plan.price > 0 && (
            <span className="text-xs text-text-tertiary">
              (el cobro se realiza después de la aprobación)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSelectedPlan(null)}
          className="text-sm text-accent hover:text-accent-dark"
        >
          Cambiar plan
        </button>
      </div>

      <ApplicationForm
        specialties={specialties}
        categories={categories}
        materials={materials}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
