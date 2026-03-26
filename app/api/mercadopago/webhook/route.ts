import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentClient } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // MercadoPago sends different notification formats
    const paymentId = body.data?.id;
    const topic = body.type || body.action;

    if (!paymentId || !topic?.includes("payment")) {
      return NextResponse.json({ received: true });
    }

    // Fetch payment details from MercadoPago
    const payment = await paymentClient.get({ id: paymentId });

    if (!payment || !payment.external_reference) {
      return NextResponse.json({ received: true });
    }

    const orderId = payment.external_reference;

    if (payment.status === "approved") {
      // Update order to PAID
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order || order.status !== "PENDING_PAYMENT") {
        return NextResponse.json({ received: true });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          mpPaymentId: String(paymentId),
        },
      });

      // Destock products
      for (const item of order.items) {
        const product = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        // If stock reaches 0, mark as sold out
        if (product.stock <= 0) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { status: "SOLD_OUT" },
          });
        }
      }

      // Clear cart for the buyer
      await prisma.cartItem.deleteMany({
        where: { userId: order.userId },
      });

      // TODO Phase 7: Send confirmation emails via Resend
    } else if (payment.status === "rejected") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to prevent MercadoPago retries on server errors
    return NextResponse.json({ received: true });
  }
}

// MercadoPago also sends GET requests for verification
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
