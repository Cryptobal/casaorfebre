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
  /** True cuando el usuario llega desde /para-pionero con ?pionero=1 (sin código). */
  isPioneerApplication?: boolean;
}

/** CTA reutilizable que permite saltar a la postulación como Pionero
 *  desde cualquier punto del selector de planes. */
function PioneerCTA({ onClick }: { onClick: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#8B7355]/40 bg-gradient-to-br from-[#FAFAF8] to-[#f0ebe3] p-6 text-center sm:p-8">
      <p className="text-xs font-medium uppercase tracking-widest text-[#8B7355]">
        Programa Pioneros · Cupos limitados
      </p>
      <h3 className="mt-2 font-serif text-xl font-light text-[#1a1a18] sm:text-2xl">
        3 meses de Plan Maestro gratis + 0% comisión
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#1a1a18]/70">
        Postula como Pionero: si te aprobamos, activamos los beneficios
        automáticamente. Sin pagar plan, sin contratos.
      </p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-block bg-[#8B7355] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#7a6549]"
      >
        Quiero ser Pionero
      </button>
    </div>
  );
}

export function PostularFlow({
  plans,
  preselectedPlan,
  specialties,
  categories,
  materials,
  promoCode,
  promoData,
  isPioneerApplication: isPioneerApplicationProp = false,
}: PostularFlowProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    preselectedPlan
  );
  const [isPioneerApplication, setIsPioneerApplication] = useState(
    isPioneerApplicationProp
  );

  const hasValidPromo = promoData?.valid === true;

  const enterPioneerFlow = () => {
    setIsPioneerApplication(true);
    setSelectedPlan("maestro");
  };

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
        <div className="mb-10">
          <PioneerCTA onClick={enterPioneerFlow} />
        </div>
        <PricingPlans
          plans={plans}
          onSelectPlan={(planName) => setSelectedPlan(planName)}
          promoData={hasValidPromo ? promoData : undefined}
        />
        <div className="mt-12">
          <PioneerCTA onClick={enterPioneerFlow} />
        </div>
      </>
    );
  }

  const plan = plans.find((p) => p.name === selectedPlan);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Pioneer banner (code-based invitation) */}
      {hasValidPromo && promoData.benefits && (
        <PioneerBanner benefits={promoData.benefits} />
      )}

      {/* Pioneer banner (self-apply via /para-pionero) */}
      {!hasValidPromo && isPioneerApplication && <PioneerBanner />}

      {/* Plan indicator — hidden for self-apply pioneer flow to keep focus on the form */}
      {!isPioneerApplication && (
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
              onClick={() => {
                setIsPioneerApplication(false);
                setSelectedPlan(null);
              }}
              className="text-sm text-accent hover:text-accent-dark"
            >
              Cambiar plan
            </button>
          )}
        </div>
      )}

      <ApplicationForm
        specialties={specialties}
        categories={categories}
        materials={materials}
        selectedPlan={selectedPlan}
        promoCode={hasValidPromo ? promoCode! : undefined}
        isPioneerCandidate={isPioneerApplication}
      />
    </div>
  );
}
