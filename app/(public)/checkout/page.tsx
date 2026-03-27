import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart, getCartTotal } from "@/lib/queries/cart";
import { getUserShippingAddress } from "@/lib/queries/users";
import { formatCLP } from "@/lib/utils";
import { CheckoutForm } from "./checkout-form";
import { CheckoutTracker } from "./checkout-tracker";
import Image from "next/image";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [cartItems, cartTotal, savedAddress] = await Promise.all([
    getCart(session.user.id),
    getCartTotal(session.user.id),
    getUserShippingAddress(session.user.id),
  ]);

  if (cartItems.length === 0) redirect("/coleccion");

  const hasCustomMade = cartItems.some(
    (item: any) => item.product.isCustomMade
  );

  const serializedItems = cartItems.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      images: item.product.images.map((img: any) => ({
        url: img.url,
        altText: img.altText,
      })),
    },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb steps */}
      <nav className="mb-8" aria-label="Progreso del checkout">
        <ol className="flex items-center gap-2 text-sm">
          <li className="text-text-tertiary">Carrito</li>
          <li aria-hidden className="text-text-tertiary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </li>
          <li className="font-medium text-text">Datos y Pago</li>
          <li aria-hidden className="text-text-tertiary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </li>
          <li className="text-text-tertiary">Confirmación</li>
        </ol>
      </nav>

      <CheckoutTracker
        items={cartItems.map((item: any) => ({
          item_id: item.product.id,
          item_name: item.product.name,
          item_category: "",
          item_brand: item.product.artisan?.displayName ?? "",
          price: item.product.price,
          quantity: item.quantity,
        }))}
        value={cartTotal}
      />

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <CheckoutForm
            items={serializedItems}
            total={cartTotal}
            hasCustomMade={hasCustomMade}
            savedAddress={savedAddress}
          />
        </div>

        {/* Order summary — sticky sidebar */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-4 text-lg font-medium text-text">
                Resumen del pedido
              </h2>
              <ul className="divide-y divide-border">
                {cartItems.map((item: any) => {
                  const img = item.product.images?.[0];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3"
                    >
                      {img ? (
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border bg-background">
                          <Image
                            src={img.url}
                            alt={img.altText || item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                          {item.quantity > 1 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                              {item.quantity}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-text-tertiary">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                            />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          Cant: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-text tabular-nums">
                        {formatCLP(item.product.price * item.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatCLP(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Envío</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Gratis
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-text">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatCLP(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-surface/60 px-5 py-4 text-xs text-text-secondary">
              <div className="flex items-center gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-green-600"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Pago seguro con Mercado Pago
              </div>
              <div className="flex items-center gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-green-600"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                Certificado de autenticidad incluido
              </div>
              <div className="flex items-center gap-2.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 text-green-600"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Envío gratis a todo Chile
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
