import Link from "next/link";
import { getAllArtisans } from "@/lib/queries/admin";
import { OverrideEditor } from "./override-editor";
import { HighlightToggle } from "./highlight-toggle";
import { PioneerToggle } from "./pioneer-toggle";
import { ArtisanAccountActions } from "./artisan-account-actions";
import { PlanChanger } from "./plan-changer";

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

export default async function OrfebresPage() {
  const artisans = await getAllArtisans();

  return (
    <div className="max-w-full min-w-0">
      <h1 className="font-serif text-3xl font-light">
        Gestión de Orfebres
      </h1>

      {artisans.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay orfebres registrados
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
                className="overflow-hidden rounded-lg border border-border bg-surface"
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
                    </div>
                    <p
                      className="truncate font-mono text-[11px] text-text-secondary"
                      title={artisan.user.email}
                    >
                      {artisan.user.email}
                    </p>
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
                    <span title="Productos">{artisan._count.products} prod.</span>
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
