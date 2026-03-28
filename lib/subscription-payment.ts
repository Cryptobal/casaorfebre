import { preferenceClient } from "@/lib/mercadopago";
import { isSandbox } from "@/lib/config";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

/**
 * Creates a MercadoPago preference for a subscription payment.
 * Uses the platform's access token (not the artisan's OAuth token)
 * since subscription fees go to the platform, not to the artisan.
 */
export async function createSubscriptionPreference({
  artisanId,
  subscriptionId,
  planName,
  amount,
  billingPeriod,
}: {
  artisanId: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  billingPeriod: "monthly" | "annual";
}) {
  const sandbox = isSandbox();

  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: `sub-${subscriptionId}`,
          title: `Suscripción Plan ${planName} (${billingPeriod === "annual" ? "Anual" : "Mensual"})`,
          quantity: 1,
          unit_price: amount,
          currency_id: "CLP",
        },
      ],
      back_urls: {
        success: `${BASE_URL}/portal/orfebre/plan?sub_payment=success`,
        failure: `${BASE_URL}/portal/orfebre/plan?sub_payment=failure`,
        pending: `${BASE_URL}/portal/orfebre/plan?sub_payment=pending`,
      },
      auto_return: "approved",
      external_reference: subscriptionId,
      notification_url: `${BASE_URL}/api/mercadopago/webhook`,
      metadata: {
        type: "subscription",
        artisan_id: artisanId,
        subscription_id: subscriptionId,
        plan_name: planName,
        billing_period: billingPeriod,
      },
    },
  });

  const redirectUrl = sandbox
    ? preference.sandbox_init_point
    : preference.init_point;

  if (!redirectUrl) {
    throw new Error("No se pudo obtener la URL de pago de MercadoPago");
  }

  return { redirectUrl, preferenceId: preference.id };
}
