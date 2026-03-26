import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getBuyerOrderDetail } from "@/lib/queries/buyer-orders";
import { DisputeForm } from "./dispute-form";

export default async function DisputaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const order = await getBuyerOrderDetail(orderId, session.user.id);
  if (!order) notFound();

  // Verify order has at least one delivered item
  const hasDeliveredItems = order.items.some(
    (item) => item.fulfillmentStatus === "DELIVERED"
  );
  if (!hasDeliveredItems) redirect(`/portal/comprador/pedidos/${orderId}`);

  // Check no open dispute
  const hasOpenDispute = order.disputes.some((d) => d.status !== "CLOSED");
  if (hasOpenDispute) redirect(`/portal/comprador/pedidos/${orderId}`);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-text">
        Abrir Disputa
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Pedido #{order.orderNumber}
      </p>

      <DisputeForm orderId={orderId} />
    </div>
  );
}
