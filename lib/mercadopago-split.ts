/**
 * Creates a MercadoPago Checkout Pro preference using an artisan's OAuth access token.
 * This enables split payments where the payment goes to the artisan's account
 * and the marketplace_fee is retained by Casa Orfebre.
 */
export async function createArtisanPreference(
  artisanAccessToken: string,
  body: {
    items: {
      id: string;
      title: string;
      quantity: number;
      unit_price: number;
      currency_id: "CLP";
    }[];
    payer: { email: string };
    back_urls: {
      success: string;
      failure: string;
      pending: string;
    };
    auto_return: string;
    external_reference: string;
    notification_url: string;
    marketplace_fee: number;
  }
): Promise<{ init_point: string; sandbox_init_point?: string }> {
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${artisanAccessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[mp-split] Preference creation failed:", response.status, errorBody);
    throw new Error(`MercadoPago split preference failed: ${response.status}`);
  }

  return response.json();
}
