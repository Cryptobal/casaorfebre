import { getAllArtisans } from "@/lib/queries/admin";
import { suspendArtisan } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { OverrideEditor } from "./override-editor";
import { HighlightToggle } from "./highlight-toggle";

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
    <div>
      <h1 className="font-serif text-3xl font-light">
        Gestión de Orfebres
      </h1>

      {artisans.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay orfebres registrados
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-text-tertiary">
                <th className="pb-3 pr-4 font-medium">Orfebre</th>
                <th className="pb-3 pr-4 font-medium">Ubicación</th>
                <th className="pb-3 pr-4 font-medium">Plan</th>
                <th className="pb-3 pr-4 font-medium">Rating</th>
                <th className="pb-3 pr-4 font-medium">Ventas</th>
                <th className="pb-3 pr-4 font-medium">Productos</th>
                <th className="pb-3 pr-4 font-medium">Comisión</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Destacar</th>
                <th className="pb-3 font-medium">Acciones</th>
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
                    <td className="py-3 pr-4 font-medium">
                      {artisan.displayName}
                      {hasOverrides && (
                        <span className="ml-1.5 inline-block rounded bg-amber-50 px-1 py-0.5 text-[10px] text-amber-600">
                          override
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {artisan.location}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {planName ? PLAN_LABELS[planName] || planName : "Esencial"}
                    </td>
                    <td className="py-3 pr-4">
                      {artisan.rating > 0
                        ? `★ ${artisan.rating.toFixed(1)}`
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">{artisan._count.orderItems}</td>
                    <td className="py-3 pr-4">{artisan._count.products}</td>
                    <td className="py-3 pr-4">
                      {artisan.commissionOverride !== null
                        ? `${Math.round(artisan.commissionOverride * 100)}% *`
                        : `${Math.round(artisan.commissionRate * 100)}%`}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusStyles[artisan.status] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusLabels[artisan.status] ?? artisan.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {artisan.subscriptions?.[0]?.plan?.homeHighlight ? (
                        <HighlightToggle
                          artisanId={artisan.id}
                          initialValue={artisan.homeHighlight}
                        />
                      ) : (
                        <span className="text-xs text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <OverrideEditor
                          artisanId={artisan.id}
                          artisanName={artisan.displayName}
                          commissionOverride={artisan.commissionOverride}
                          maxProductsOverride={artisan.maxProductsOverride}
                          maxPhotosOverride={artisan.maxPhotosOverride}
                        />
                        {artisan.status === "APPROVED" && (
                          <form
                            action={async () => {
                              "use server";
                              await suspendArtisan(artisan.id);
                            }}
                          >
                            <Button
                              type="submit"
                              size="sm"
                              variant="secondary"
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Suspender
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
