import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, getCartTotal } from "@/lib/queries/cart";
import { formatCLP } from "@/lib/utils";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [cartItems, cartTotal] = await Promise.all([
    getCart(session.user.id),
    getCartTotal(session.user.id),
  ]);

  if (cartItems.length === 0) redirect("/coleccion");

  const hasCustomMade = cartItems.some((item) => item.product.isCustomMade);

  const serializedItems = cartItems.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      images: item.product.images.map((img) => ({
        url: img.url,
        altText: img.altText,
      })),
    },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-serif text-text">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CheckoutForm
            items={serializedItems}
            total={cartTotal}
            hasCustomMade={hasCustomMade}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 text-lg font-medium text-text">
              Resumen del pedido
            </h2>
            <ul className="divide-y divide-border">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-text">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Cant: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm text-text">
                    {formatCLP(item.product.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCLP(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Envío</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between text-base font-medium text-text">
                <span>Total</span>
                <span>{formatCLP(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
