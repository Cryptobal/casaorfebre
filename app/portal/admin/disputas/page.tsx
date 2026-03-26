import { getOpenDisputes } from "@/lib/queries/admin";
import { Card } from "@/components/ui/card";
import { DisputeResolution } from "./dispute-resolution";

const reasonLabels: Record<string, string> = {
  NOT_AS_DESCRIBED: "No coincide con descripcion",
  NOT_RECEIVED: "No recibido",
  DAMAGED: "Danado",
  WRONG_ITEM: "Producto equivocado",
  OTHER: "Otro",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  RESOLVED_REFUND: "bg-green-100 text-green-800",
  RESOLVED_PARTIAL_REFUND: "bg-green-100 text-green-800",
  RESOLVED_NO_REFUND: "bg-gray-100 text-gray-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierta",
  UNDER_REVIEW: "En revision",
  RESOLVED_REFUND: "Reembolsada",
  RESOLVED_PARTIAL_REFUND: "Reembolso parcial",
  RESOLVED_NO_REFUND: "Sin reembolso",
  CLOSED: "Cerrada",
};

export default async function DisputasPage() {
  const disputes = await getOpenDisputes();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Disputas</h1>

      {disputes.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay disputas abiertas
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {disputes.map((dispute) => (
            <Card key={dispute.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-medium">
                    Pedido #{dispute.order.orderNumber}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {dispute.user.name ?? dispute.user.email}
                  </p>
                </div>
                <span
                  className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[dispute.status] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabels[dispute.status] ?? dispute.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-text-tertiary">Razon: </span>
                  <span>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                </div>
              </div>

              <p className="text-sm text-text-secondary">
                {dispute.description}
              </p>

              <div className="border-t border-border pt-4">
                <DisputeResolution disputeId={dispute.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
