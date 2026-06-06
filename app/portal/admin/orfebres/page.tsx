import Link from "next/link";
import { getAllArtisans } from "@/lib/queries/admin";
import { OverrideEditor } from "./override-editor";
import { HighlightToggle } from "./highlight-toggle";
import { PioneerToggle } from "./pioneer-toggle";
import { ArtisanAccountActions } from "./artisan-account-actions";
import { PlanChanger } from "./plan-changer";
import { OnboardingActions } from "./onboarding-actions";

const statusStyles: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  SUSPENDED: "bg-red-100 text-red-800",
  REJECTED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  APPROVED: "Aprobado",
  PENDING: "Pendiente",
  SUSPENDED: "Suspendido",
  REJECTED: "Rechazado",
};

const onboardingStepLabels: Record<string, string> = {
  WELCOME: "Esperando 1ra pieza",
  FIRST_PRODUCT: "Primera pieza subida",
  ACTIVE: "Activo",
  NEEDS_ATTENTION: "Requiere atención",
};

const onboardingStepStyles: Record<string, string> = {
  WELCOME: "bg-orange-100 text-orange-800",
  FIRST_PRODUCT: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  NEEDS_ATTENTION: "bg-red-100 text-red-800",
};

const emailLabels = ["—", "Bienvenida", "Ayuda", "Personal"];

function instagramHref(value: string): string {
  if (value.includes("http")) return value;
  if (value.startsWith("@")) return `https://instagram.com/${value.slice(1)}`;
  return `https://instagram.com/${value}`;
}

interface PageProps {
  searchParams: Promise<{ filtro?: string }>;
}

export default async function OrfebresPage({ searchParams }: PageProps) {
  const { filtro } = await searchParams;
  const allArtisans = await getAllArtisans();

  const artisans = filtro
    ? allArtisans.filter((a) => {
        if (filtro === "sin-productos") return a._count.products === 0 && a.status === "APPROVED";
        if (filtro === "needs-attention") return a.onboardingStep === "NEEDS_ATTENTION";
        if (filtro === "onboarding") return a.onboardingStep === "WELCOME" || a.onboardingStep === "FIRST_PRODUCT";
        return true;
      })
    : allArtisans;

  const sinProductos = allArtisans.filter((a) => a._count.products === 0 && a.status === "APPROVED").length;
  const needsAttention = allArtisans.filter((a) => a.onboardingStep === "NEEDS_ATTENTION").length;
  const enOnboarding = allArtisans.filter((a) => a.onboardingStep === "WELCOME" || a.onboardingStep === "FIRST_PRODUCT").length;

  return (
    <div className="max-w-full min-w-0">
      <h1 className="font-serif text-3xl font-light">
        Gestión de Orfebres
      </h1>

      {/* Filtros */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/portal/admin/orfebres"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${!filtro ? "bg-accent text-white" : "bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80"}`}
        >
          Todos ({allArtisans.length})
        </Link>
        <Link
          href="/portal/admin/orfebres?filtro=sin-productos"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${filtro === "sin-productos" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
        >
          Sin productos ({sinProductos})
        </Link>
        <Link
          href="/portal/admin/orfebres?filtro=onboarding"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${filtro === "onboarding" ? "bg-orange-600 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"}`}
        >
          En onboarding ({enOnboarding})
        </Link>
        <Link
          href="/portal/admin/orfebres?filtro=needs-attention"
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${filtro === "needs-attention" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
        >
          Requieren atención ({needsAttention})
        </Link>
      </div>

      {artisans.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          {filtro ? "No hay orfebres con este filtro" : "No hay orfebres registrados"}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {artisans.map((artisan) => {
            const planName = artisan.subscriptions?.[0]?.plan?.name;
            const hasOverrides =
              artisan.commissionOverride !== null ||
              artisan.maxProductsOverride !== null ||
              artisan.maxPhotosOverride !== null;

            return (
              <div
                key={artisan.id}
                className="relative rounded-lg border border-border bg-surface"
              >
                {/* Línea 1: identidad + métricas */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-4 pb-2 sm:pb-3">
                  {/* Nombre + estado */}
                  <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/portal/admin/orfebres/${artisan.id}`}
                        className="truncate font-medium text-accent hover:underline"
                        title={artisan.displayName}
                      >
                        {artisan.displayName}
                      </Link>
                      {hasOverrides && (
                        <span className="shrink-0 rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-600">
                          override
                        </span>
                      )}
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          statusStyles[artisan.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[artisan.status] ?? artisan.status}
                      </span>
                      {artisan.bankAccountNumber ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-800">
                          Banco ✓
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                          Sin banco
                        </span>
                      )}
                      {/* Onboarding step badge */}
                      {artisan.onboardingStep && artisan.onboardingStep !== "ACTIVE" && (
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            onboardingStepStyles[artisan.onboardingStep] ?? "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {onboardingStepLabels[artisan.onboardingStep] ?? artisan.onboardingStep}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <p
                        className="truncate font-mono text-[11px] text-text-secondary"
                        title={artisan.user.email}
                      >
                        {artisan.user.email}
                      </p>
                      {artisan.instagram && (
                        <a
                          href={instagramHref(artisan.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-accent hover:text-accent/80"
                          title={artisan.instagram}
                          aria-label={`Instagram de ${artisan.displayName}`}
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Métricas en fila */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span title="Ubicación">{artisan.location}</span>
                    <span className="hidden text-border sm:inline">|</span>
                    <span>
                      <PlanChanger
                        artisanId={artisan.id}
                        currentPlan={planName || "esencial"}
                      />
                    </span>
                    <span className="hidden text-border sm:inline">|</span>
                    <span title="Rating">
                      {artisan.rating > 0 ? `★ ${artisan.rating.toFixed(1)}` : "— rating"}
                    </span>
                    <span title="Ventas">{artisan._count.orderItems} ventas</span>
                    <span title="Productos">
                      {artisan._count.products === 0 ? (
                        <span className="font-medium text-red-600">0 prod.</span>
                      ) : (
                        <>{artisan._count.products} prod.</>
                      )}
                    </span>
                    {artisan.onboardingEmailsSent > 0 && (
                      <span title={`Último email: ${emailLabels[artisan.onboardingEmailsSent] ?? artisan.onboardingEmailsSent}`}>
                        {artisan.onboardingEmailsSent}/3 emails
                      </span>
                    )}
                    <span title="Comisión">
                      {artisan.commissionOverride !== null
                        ? `${Math.round(artisan.commissionOverride * 100)}% com. *`
                        : `${Math.round(artisan.commissionRate * 100)}% com.`}
                    </span>
                  </div>
                </div>

                {/* Línea 2: controles + acciones */}
                <div className="flex flex-wrap items-center gap-3 border-t border-border/50 bg-surface-secondary/30 px-4 py-2.5">
                  {artisan.subscriptions?.[0]?.plan?.homeHighlight && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-text-tertiary">Destaque</span>
                      <HighlightToggle
                        artisanId={artisan.id}
                        initialValue={artisan.homeHighlight}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-text-tertiary">Pionero</span>
                    <PioneerToggle
                      artisanId={artisan.id}
                      initialValue={artisan.isPioneer}
                      pioneerUntil={artisan.pioneerUntil?.toISOString() ?? null}
                    />
                  </div>

                  {/* Onboarding actions: email + WhatsApp */}
                  {artisan.onboardingStep && artisan.onboardingStep !== "ACTIVE" && (
                    <OnboardingActions
                      artisanId={artisan.id}
                      artisanName={artisan.displayName}
                      phone={artisan.phone}
                      emailsSent={artisan.onboardingEmailsSent}
                    />
                  )}

                  <div className="ml-auto flex items-center gap-1.5">
                    <OverrideEditor
                      artisanId={artisan.id}
                      artisanName={artisan.displayName}
                      commissionOverride={artisan.commissionOverride}
                      maxProductsOverride={artisan.maxProductsOverride}
                      maxPhotosOverride={artisan.maxPhotosOverride}
                    />
                    <ArtisanAccountActions artisanId={artisan.id} status={artisan.status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
