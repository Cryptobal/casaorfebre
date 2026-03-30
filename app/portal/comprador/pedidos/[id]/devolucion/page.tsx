import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReturnForm } from "./return-form";

export default async function DevolucionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const { id: orderId } = await params;
  const { item: orderItemId } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!orderItemId) redirect(`/portal/comprador/pedidos/${orderId}`);

  // Verify ownership and eligibility
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: { id: orderId, userId: session.user.id },
    },
    include: {
      product: { select: { name: true, productionType: true } },
      order: { select: { orderNumber: true } },
    },
  });

  if (!orderItem) notFound();

  // Custom-made products cannot be returned
  if (orderItem.product.productionType === "MADE_TO_ORDER") {
    redirect(`/portal/comprador/pedidos/${orderId}`);
  }

  // Must be delivered
  if (orderItem.fulfillmentStatus !== "DELIVERED") {
    redirect(`/portal/comprador/pedidos/${orderId}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold text-text">
        Solicitar Devolucion
      </h1>
      <p className="mt-1 text-sm text-text-secondary">
        Pedido #{orderItem.order.orderNumber} &middot;{" "}
        {orderItem.product.name}
      </p>

      <ReturnForm orderItemId={orderItemId} orderId={orderId} />
    </div>
  );
}
