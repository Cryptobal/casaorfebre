import { MercadoPagoConfig, Preference, Payment, PaymentRefund } from "mercadopago";
import { isSandbox } from "@/lib/config";

const accessToken = isSandbox()
  ? (process.env.MERCADOPAGO_TEST_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN!)
  : process.env.MERCADOPAGO_ACCESS_TOKEN!;

const client = new MercadoPagoConfig({ accessToken });

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);
export const refundClient = new PaymentRefund(client);

/**
 * Issues a full refund for a MercadoPago payment. Throws if the refund fails so
 * callers can avoid cancelling an order without returning the buyer's money.
 */
export async function refundPayment(paymentId: string | number): Promise<void> {
  await refundClient.create({
    payment_id: Number(paymentId),
    body: {},
  });
}
