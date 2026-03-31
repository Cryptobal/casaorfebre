"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getPayoutDaysForArtisan,
  calculatePayoutEligibleDate,
} from "@/lib/payout-schedule";
import { sendReceiptConfirmedToArtisanEmail } from "@/lib/emails/templates";
import { getAdminEmails } from "@/lib/config";

export async function confirmReceipt(orderItemId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  // Fetch item with order (must belong to buyer) and artisan subscription
  const item = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      fulfillmentStatus: "SHIPPED",
      receivedAt: null,
      order: { userId: session.user.id },
    },
    include: {
      order: { select: { id: true, orderNumber: true, items: true } },
      artisan: {
        include: {
          user: { select: { email: true } },
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { payoutFrequency: true } } },
            take: 1,
          },
        },
      },
    },
  });

  if (!item) return { error: "Item no encontrado o no puede ser confirmado" };

  const now = new Date();
  const payoutDays = getPayoutDaysForArtisan(item.artisan);
  const payoutEligibleAt = calculatePayoutEligibleDate(now, payoutDays);

  // Update the item
  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      fulfillmentStatus: "DELIVERED",
      receivedAt: now,
      deliveredAt: now,
      payoutEligibleAt,
    },
  });

  // If ALL items in this order are now DELIVERED, update order status
  const allItems = await prisma.orderItem.findMany({
    where: { orderId: item.order.id },
    select: { fulfillmentStatus: true },
  });
  const allDelivered = allItems.every((i) => i.fulfillmentStatus === "DELIVERED");
  if (allDelivered) {
    await prisma.order.update({
      where: { id: item.order.id },
      data: { status: "DELIVERED" },
    });
  }

  // Send email to artisan
  const artisanEmail = item.artisan.user?.email;
  if (artisanEmail) {
    try {
      await sendReceiptConfirmedToArtisanEmail(artisanEmail, {
        artisanName: item.artisan.displayName,
        productName: item.productName,
        orderNumber: item.order.orderNumber,
        artisanPayout: item.artisanPayout,
        payoutEligibleAt,
        payoutDays,
      });
    } catch (e) {
      console.error("[confirmReceipt] Artisan email failed:", e);
    }
  }

  // Send email to admins
  try {
    const adminEmails = getAdminEmails();
    for (const adminEmail of adminEmails) {
      await sendReceiptConfirmedToArtisanEmail(adminEmail, {
        artisanName: `[Admin] ${item.artisan.displayName}`,
        productName: item.productName,
        orderNumber: item.order.orderNumber,
        artisanPayout: item.artisanPayout,
        payoutEligibleAt,
        payoutDays,
      });
    }
  } catch (e) {
    console.error("[confirmReceipt] Admin email failed:", e);
  }

  revalidatePath(`/portal/comprador/pedidos/${item.order.id}`);
  revalidatePath("/portal/comprador/pedidos");
  revalidatePath("/portal/orfebre/pedidos");
  revalidatePath("/portal/admin/pedidos");
  return { success: true };
}
