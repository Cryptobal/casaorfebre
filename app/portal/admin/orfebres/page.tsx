import Link from "next/link";
import { getAllArtisans } from "@/lib/queries/admin";
import { OverrideEditor } from "./override-editor";
import { HighlightToggle } from "./highlight-toggle";
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

const PLAN_LABELS: Record<string, string> = {
  esencial: "Esencial",
  artesano: "Artesano",
  maestro: "Maestro",
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
        <>
          {/* Tabla: desde xl (sidebar + ancho suficiente); debajo, tarjetas sin scroll horizontal */}
          <div className="mt-6 hidden w-full min-w-0 xl:block">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[7%]" />
                <col className="w-[6%]" />
                <col className="w-[7%]" />
                <col className="w-[8%]" />
                <col className="w-[9%]" />
                <col className="w-[7%]" />
                <col className="w-[11%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-widest text-text-tertiary">
                  <th className="pb-3 pr-2 font-medium">Orfebre</th>
                  <th className="pb-3 pr-2 font-medium">Email</th>
                  <th className="pb-3 pr-2 font-medium">Ubicación</th>
                  <th className="pb-3 pr-2 font-medium">Plan</th>
                  <th className="pb-3 pr-2 font-medium">Rating</th>
                  <th className="pb-3 pr-2 font-medium">Ventas</th>
                  <th className="pb-3 pr-2 font-medium">Prod.</th>
                  <th className="pb-3 pr-2 font-medium">Com.</th>
                  <th className="pb-3 pr-2 font-medium">Estado</th>
                  <th
                    className="pb-3 pr-2 font-medium leading-tight"
                    title="Si el plan lo permite: mostrar este orfebre destacado en la página de inicio del sitio."
                  >
                    Destaque home
                  </th>
                  <th className="pb-3 pl-1 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {artisans.map((artisan) => {
                  const planName = artisan.subscriptions?.[0]?.plan?.name;
                  const hasOverrides =
                    artisan.commissionOverride !== null ||
                    artisan.maxProductsOverride !== null ||
                    artisan.maxPhotosOverride !== null;

                  return (
                    <tr key={artisan.id}>
                      <td className="min-w-0 py-3 pr-2 align-middle font-medium">
                        <div className="min-w-0">
                          <Link
                            href={`/portal/admin/orfebres/${artisan.id}`}
                            className="block truncate text-accent hover:underline"
                            title={artisan.displayName}
                          >
                            {artisan.displayName}
                          </Link>
                          {hasOverrides && (
                            <span className="mt-0.5 inline-block rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-600">
                              override
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="min-w-0 py-3 pr-2 align-middle text-text-secondary">
                        <span
                          className="block truncate font-mono text-[11px] leading-snug"
                          title={artisan.user.email}
                        >
                          {artisan.user.email}
                        </span>
                      </td>
                      <td className="min-w-0 py-3 pr-2 align-middle text-text-secondary">
                        <span className="block truncate text-xs" title={artisan.location ?? ""}>
                          {artisan.location}
                        </span>
                      </td>
                      <td className="min-w-0 py-3 pr-2 text-text-secondary">
                        <PlanChanger
                          artisanId={artisan.id}
                          currentPlan={planName || "esencial"}
                        />
                      </td>
                      <td className="min-w-0 py-3 pr-2">
                        {artisan.rating > 0
                          ? `★ ${artisan.rating.toFixed(1)}`
                          : "—"}
                      </td>
                      <td className="min-w-0 py-3 pr-2">{artisan._count.orderItems}</td>
                      <td className="min-w-0 py-3 pr-2">{artisan._count.products}</td>
                      <td className="min-w-0 py-3 pr-2">
                        {artisan.commissionOverride !== null
                          ? `${Math.round(artisan.commissionOverride * 100)}% *`
                          : `${Math.round(artisan.commissionRate * 100)}%`}
                      </td>
                      <td className="min-w-0 py-3 pr-2">
                        <span
                          className={`inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            statusStyles[artisan.status] ?? "bg-gray-100 text-gray-800"
                          }`}
                          title={statusLabels[artisan.status] ?? artisan.status}
                        >
                          {statusLabels[artisan.status] ?? artisan.status}
                        </span>
                      </td>
                      <td className="min-w-0 py-3 pr-2">
                        {artisan.subscriptions?.[0]?.plan?.homeHighlight ? (
                          <HighlightToggle
                            artisanId={artisan.id}
                            initialValue={artisan.homeHighlight}
                          />
                        ) : (
                          <span className="text-xs text-text-tertiary">—</span>
                        )}
                      </td>
                      <td className="min-w-0 py-3 pl-1 align-top">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <OverrideEditor
                            artisanId={artisan.id}
                            artisanName={artisan.displayName}
                            commissionOverride={artisan.commissionOverride}
                            maxProductsOverride={artisan.maxProductsOverride}
                            maxPhotosOverride={artisan.maxPhotosOverride}
                          />
                          <ArtisanAccountActions artisanId={artisan.id} status={artisan.status} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas: mobile-first hasta pantallas muy anchas (evita scroll horizontal) */}
          <div className="mt-6 space-y-3 xl:hidden">
            {artisans.map((artisan) => {
              const planName = artisan.subscriptions?.[0]?.plan?.name;
              const hasOverrides =
                artisan.commissionOverride !== null ||
                artisan.maxProductsOverride !== null ||
                artisan.maxPhotosOverride !== null;

              return (
                <div
                  key={artisan.id}
                  className="w-full max-w-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text">
                        {artisan.displayName}
                        {hasOverrides && (
                          <span className="ml-1.5 inline-block rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-600">
                            override
                          </span>
                        )}
                      </p>
                      <p className="break-all font-mono text-xs text-text-secondary">{artisan.user.email}</p>
                      <p className="text-sm text-text-secondary">{artisan.location}</p>
                    </div>
                    <span
                      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusStyles[artisan.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[artisan.status] ?? artisan.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="text-text-tertiary">Plan</div>
                    <div className="text-text">
                      <PlanChanger
                        artisanId={artisan.id}
                        currentPlan={planName || "esencial"}
                      />
                    </div>
                    <div className="text-text-tertiary">Rating</div>
                    <div className="text-text">{artisan.rating > 0 ? `★ ${artisan.rating.toFixed(1)}` : "—"}</div>
                    <div className="text-text-tertiary">Ventas</div>
                    <div className="text-text">{artisan._count.orderItems}</div>
                    <div className="text-text-tertiary">Productos</div>
                    <div className="text-text">{artisan._count.products}</div>
                    <div className="text-text-tertiary">Comisión</div>
                    <div className="text-text">
                      {artisan.commissionOverride !== null
                        ? `${Math.round(artisan.commissionOverride * 100)}% *`
                        : `${Math.round(artisan.commissionRate * 100)}%`}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3">
                    {artisan.subscriptions?.[0]?.plan?.homeHighlight && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">Destaque en inicio</span>
                        <HighlightToggle
                          artisanId={artisan.id}
                          initialValue={artisan.homeHighlight}
                        />
                      </div>
                    )}
                    <OverrideEditor
                      artisanId={artisan.id}
                      artisanName={artisan.displayName}
                      commissionOverride={artisan.commissionOverride}
                      maxProductsOverride={artisan.maxProductsOverride}
                      maxPhotosOverride={artisan.maxPhotosOverride}
                    />
                    <ArtisanAccountActions
                      artisanId={artisan.id}
                      status={artisan.status}
                      className="min-w-0 flex-1 basis-full sm:flex-none sm:basis-auto"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
