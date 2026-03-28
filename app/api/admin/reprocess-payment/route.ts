import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/reprocess-payment
 *
 * Manually reprocesses a MercadoPago payment or merchant_order.
 * Admin-only. Use when webhooks fail and a paid order is stuck in PENDING_PAYMENT.
 *
 * Body: { paymentId?: string, merchantOrderId?: string }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { paymentId, merchantOrderId } = await req.json();
  if (!paymentId && !merchantOrderId) {
    return NextResponse.json({ error: "paymentId or merchantOrderId required" }, { status: 400 });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN not set" }, { status: 500 });
  }

  try {
    let paymentIds: string[] = [];

    if (merchantOrderId) {
      const moRes = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!moRes.ok) {
        return NextResponse.json({
          error: "Failed to fetch merchant_order",
          status: moRes.status,
        }, { status: 500 });
      }
      const mo = await moRes.json();
      console.log("[Reprocess] Merchant order:", {
        id: mo.id,
        status: mo.status,
        external_reference: mo.external_reference,
        payments: mo.payments?.map((p: any) => ({ id: p.id, status: p.status })),
      });
      paymentIds = (mo.payments || [])
        .filter((p: any) => p.status === "approved")
        .map((p: any) => String(p.id));
    } else {
      paymentIds = [paymentId];
    }

    if (paymentIds.length === 0) {
      return NextResponse.json({ error: "No approved payments found" }, { status: 404 });
    }

    const results = [];

    for (const pId of paymentIds) {
      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${pId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!payRes.ok) {
        results.push({ paymentId: pId, error: `Failed to fetch: ${payRes.status}` });
        continue;
      }

      const payment = await payRes.json();
      console.log("[Reprocess] Payment:", {
        id: payment.id,
        status: payment.status,
        amount: payment.transaction_amount,
        external_reference: payment.external_reference,
      });

      if (payment.status !== "approved") {
        results.push({ paymentId: pId, error: `Not approved: ${payment.status}` });
        continue;
      }

      const order = await prisma.order.findUnique({
        where: { id: payment.external_reference },
        include: { items: true },
      });

      if (!order) {
        results.push({ paymentId: pId, error: `Order not found: ${payment.external_reference}` });
        continue;
      }

      if (order.status === "PAID") {
        results.push({ paymentId: pId, status: "already_paid", orderId: order.id });
        continue;
      }

      // Update order to PAID
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          mpPaymentId: String(payment.id),
          mpMerchantOrderId: merchantOrderId || payment.order?.id?.toString() || null,
        },
      });

      await prisma.orderItem.updateMany({
        where: { orderId: order.id },
        data: { mpTransactionId: String(payment.id) },
      });

      // Destock
      for (const item of order.items) {
        const product = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        if (product.stock <= 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: "SOLD_OUT" },
          });
        }
      }

      // Clear cart
      await prisma.cartItem.deleteMany({ where: { userId: order.userId } });

      results.push({
        paymentId: pId,
        status: "processed",
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: payment.transaction_amount,
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("[Reprocess] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
