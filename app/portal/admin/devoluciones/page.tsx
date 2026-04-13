import { getPendingReturns } from "@/lib/queries/admin";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";
import Link from "next/link";
import { ReturnActions } from "./return-actions";

const reasonLabels: Record<string, string> = {
  NOT_AS_DESCRIBED: "No coincide con la descripción",
  DAMAGED_ON_ARRIVAL: "Llegó dañado",
  WRONG_ITEM: "Producto equivocado",
  BUYER_REGRET: "Arrepentimiento de compra",
  DEFECTIVE: "Defecto de fabricación",
  OTHER: "Otro",
};

const statusStyles: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  SHIPPED_BACK: "bg-indigo-100 text-indigo-800",
  RECEIVED_BY_ARTISAN: "bg-green-100 text-green-800",
  REFUNDED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  REQUESTED: "Solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
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

  // Batch-lookup conversations for all returns
  const convPairs = returns.map((r) => ({
    buyerId: r.orderItem.order.userId,
    artisanId: r.orderItem.artisanId,
  }));
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: convPairs.map((p) => ({
        buyerId: p.buyerId,
        artisanId: p.artisanId,
      })),
    },
    select: { id: true, buyerId: true, artisanId: true },
  });
  const convMap = new Map(
    conversations.map((c) => [`${c.buyerId}:${c.artisanId}`, c.id]),
  );

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Devoluciones</h1>

      {returns.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay devoluciones pendientes
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {returns.map((ret) => {
            const item = ret.orderItem;
            const buyer = item.order.user;
            const convId = convMap.get(`${item.order.userId}:${item.artisanId}`);
            return (
            <Card key={ret.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-medium">
                    {item.productName}
                  </h2>
                  <p className="mt-1 text-sm text-text-tertiary">
                    Pedido #{item.order.orderNumber} · {formatCLP(item.productPrice)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      shippingPayerStyles[ret.shippingPaidBy] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Envío: {ret.shippingPaidBy === "PLATFORM" ? "Plataforma" : "Comprador"}
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
                  <span className="text-text-tertiary">Comprador: </span>
                  <span>{buyer.name || buyer.email}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Orfebre: </span>
                  <span>{item.artisan.displayName}</span>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-text-tertiary">Motivo: </span>
                <span>{reasonLabels[ret.reason] ?? ret.reason}</span>
              </div>

              {ret.description && (
                <div className="rounded-md bg-background-secondary p-3 text-sm text-text-secondary">
                  <span className="font-medium text-text-tertiary">Descripción del comprador: </span>
                  {ret.description}
                </div>
              )}

              {/* Evidence photos */}
              {ret.images.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-text-tertiary">
                    Fotos de evidencia ({ret.images.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ret.images.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-16 w-16 overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
                      >
                        <img
                          src={url}
                          alt={`Evidencia ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation link */}
              {convId && (
                <div>
                  <Link
                    href={`/portal/admin/mensajes/${convId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-text"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Ver conversación comprador-orfebre
                  </Link>
                </div>
              )}

              <div className="border-t border-border pt-4">
                <ReturnActions
                  returnRequestId={ret.id}
                  currentStatus={ret.status}
                />
              </div>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
