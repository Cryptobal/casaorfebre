"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ReturnReason } from "@prisma/client";
import { sendReturnRequestedEmail } from "@/lib/emails/templates";

export async function createReturnRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const orderItemId = formData.get("orderItemId") as string;
  const reason = formData.get("reason") as ReturnReason;
  const description = (formData.get("description") as string) || null;
  const imageUrls = JSON.parse((formData.get("imageUrls") as string) || "[]");

  if (!orderItemId || !reason) return { error: "Razón es requerida" };

  // Verify ownership and eligibility
  const item = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { userId: session.user.id } },
    include: { product: { select: { productionType: true } }, order: true },
  });
  if (!item) return { error: "Pedido no encontrado" };
  if (item.product.productionType === "MADE_TO_ORDER") return { error: "Las piezas hechas por encargo no admiten devolución" };
  if (item.fulfillmentStatus !== "DELIVERED") return { error: "El producto debe estar entregado" };
  if (item.deliveredAt) {
    const daysSince = (Date.now() - item.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 14) return { error: "El plazo para solicitar devolución ha expirado (14 días)" };
  }

  const shippingPaidBy = reason === "BUYER_REGRET" ? "BUYER" : "PLATFORM";

  await prisma.returnRequest.create({
    data: {
      orderItemId,
      userId: session.user.id,
      reason,
      description: description?.trim() || null,
      images: imageUrls,
      shippingPaidBy,
      status: "REQUESTED",
    },
  });

  // Send notification to artisan
  const artisan = await prisma.artisan.findUnique({
    where: { id: item.artisanId },
    include: { user: { select: { email: true } } },
  });
  if (artisan?.user?.email) {
    try {
      await sendReturnRequestedEmail(artisan.user.email, {
        name: artisan.displayName,
        productName: item.productName,
        reason: description?.trim() || reason,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath(`/portal/comprador/pedidos/${item.order.id}`);
  return { success: true };
}
