"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  getPayoutDaysForArtisan,
  calculatePayoutEligibleDate,
} from "@/lib/payout-schedule";
import { sendPayoutReleasedEmail } from "@/lib/emails/templates";
import type { OrderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  await requireAdmin();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { error: "Pedido no encontrado" };

  const now = new Date();

  // Apply side effects based on transition
  if (newStatus === "CANCELLED") {
    // Restore stock
    await Promise.all(
      order.items.map(async (item) => {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      })
    );
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { payoutStatus: "REFUNDED" },
    });
  }

  if (newStatus === "DELIVERED") {
    // Force deliver all items
    for (const item of order.items) {
      if (item.fulfillmentStatus !== "DELIVERED") {
        const artisan = await prisma.artisan.findUnique({
          where: { id: item.artisanId },
          include: {
            subscriptions: {
              where: { status: "ACTIVE" },
              include: { plan: { select: { payoutFrequency: true } } },
              take: 1,
            },
          },
        });
        const payoutDays = artisan ? getPayoutDaysForArtisan(artisan) : 14;
        const payoutEligibleAt = calculatePayoutEligibleDate(now, payoutDays);

        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            fulfillmentStatus: "DELIVERED",
            deliveredAt: now,
            receivedAt: now,
            payoutEligibleAt,
          },
        });
      }
    }
  }

  if (newStatus === "REFUNDED") {
    // Restore stock + mark payouts as refunded
    await Promise.all(
      order.items.map(async (item) => {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      })
    );
    await prisma.orderItem.updateMany({
      where: { orderId },
      data: { payoutStatus: "REFUNDED" },
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  revalidatePath("/portal/admin/pedidos");
  revalidatePath(`/portal/admin/pedidos/${orderId}`);
  return { success: true };
}

export async function releasePayoutManually(orderItemId: string) {
  await requireAdmin();

  const item = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      artisan: { include: { user: { select: { email: true } } } },
      order: { select: { orderNumber: true } },
    },
  });

  if (!item) return { error: "Item no encontrado" };
  if (item.payoutStatus !== "HELD") return { error: "El pago ya no está retenido" };

  await prisma.orderItem.update({
    where: { id: orderItemId },
    data: {
      payoutStatus: "RELEASED",
      payoutAt: new Date(),
    },
  });

  if (item.artisan.user?.email) {
    try {
      await sendPayoutReleasedEmail(item.artisan.user.email, {
        artisanName: item.artisan.displayName,
        amount: item.artisanPayout,
      });
    } catch (e) {
      console.error("[admin] Payout email failed:", e);
    }
  }

  revalidatePath("/portal/admin/pedidos");
  revalidatePath(`/portal/admin/pedidos/${item.orderId}`);
  return { success: true };
}
