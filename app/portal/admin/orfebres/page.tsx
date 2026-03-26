import { getAllArtisans } from "@/lib/queries/admin";
import { suspendArtisan } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div>
      <h1 className="font-serif text-3xl font-light">
        Gestion de Orfebres
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
                <th className="pb-3 pr-4 font-medium">Ubicacion</th>
                <th className="pb-3 pr-4 font-medium">Rating</th>
                <th className="pb-3 pr-4 font-medium">Resenas</th>
                <th className="pb-3 pr-4 font-medium">Ventas</th>
                <th className="pb-3 pr-4 font-medium">Productos</th>
                <th className="pb-3 pr-4 font-medium">Comision</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {artisans.map((artisan) => (
                <tr key={artisan.id}>
                  <td className="py-3 pr-4 font-medium">
                    {artisan.displayName}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {artisan.location}
                  </td>
                  <td className="py-3 pr-4">
                    {artisan.rating > 0
                      ? `★ ${artisan.rating.toFixed(1)}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-4">{artisan._count.reviews}</td>
                  <td className="py-3 pr-4">{artisan._count.orderItems}</td>
                  <td className="py-3 pr-4">{artisan._count.products}</td>
                  <td className="py-3 pr-4">
                    {Math.round(artisan.commissionRate * 100)}%
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
                  <td className="py-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
