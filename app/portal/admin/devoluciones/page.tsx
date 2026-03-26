import { getPendingReturns } from "@/lib/queries/admin";
import { Card } from "@/components/ui/card";
import { ReturnActions } from "./return-actions";

const reasonLabels: Record<string, string> = {
  NOT_AS_DESCRIBED: "No coincide",
  DAMAGED_ON_ARRIVAL: "Llego danado",
  WRONG_ITEM: "Equivocado",
  BUYER_REGRET: "Arrepentimiento",
  DEFECTIVE: "Defecto",
  OTHER: "Otro",
};

const statusStyles: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  SHIPPED_BACK: "bg-indigo-100 text-indigo-800",
  RECEIVED_BY_ARTISAN: "bg-green-100 text-green-800",
  REFUNDED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  REQUESTED: "Solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  SHIPPED_BACK: "Enviada de vuelta",
  RECEIVED_BY_ARTISAN: "Recibida por orfebre",
  REFUNDED: "Reembolsada",
  CLOSED: "Cerrada",
};

const shippingPayerStyles: Record<string, string> = {
  PLATFORM: "bg-blue-100 text-blue-800",
  BUYER: "bg-gray-100 text-gray-800",
};

export default async function DevolucionesPage() {
  const returns = await getPendingReturns();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Devoluciones</h1>

      {returns.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay devoluciones pendientes
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {returns.map((ret) => (
            <Card key={ret.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-medium">
                    Item: {ret.orderItemId.slice(0, 8)}...
                  </h2>
                </div>
                <div className="flex shrink-0 gap-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      shippingPayerStyles[ret.shippingPaidBy] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Envio: {ret.shippingPaidBy === "PLATFORM" ? "Plataforma" : "Comprador"}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[ret.status] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[ret.status] ?? ret.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-text-tertiary">Razon: </span>
                  <span>{reasonLabels[ret.reason] ?? ret.reason}</span>
                </div>
              </div>

              {ret.description && (
                <p className="text-sm text-text-secondary">
                  {ret.description}
                </p>
              )}

              <div className="border-t border-border pt-4">
                <ReturnActions
                  returnRequestId={ret.id}
                  currentStatus={ret.status}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
