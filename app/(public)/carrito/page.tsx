import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart, getCartTotal } from "@/lib/queries/cart";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";
import { CartPageItems } from "./cart-page-items";
import type { SerializedCartItem } from "@/components/cart/cart-item";

export const metadata = {
  title: "Carrito",
  description: "Revisa tu carrito de compras en Casa Orfebre.",
  alternates: { canonical: "/carrito" },
  twitter: {
    card: "summary" as const,
    title: "Carrito | Casa Orfebre",
    description: "Revisa tu carrito de compras en Casa Orfebre.",
  },
};

type CartRow = Awaited<ReturnType<typeof getCart>>[number];

export default async function CarritoPage() {
  const session = await auth();
  let cartItems: SerializedCartItem[] = [];
  let cartTotal = 0;

  if (session?.user?.id) {
    const [items, total] = await Promise.all([
      getCart(session.user.id),
      getCartTotal(session.user.id),
    ]);
    cartTotal = total;
    cartItems = items.map((item: CartRow) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        stock: item.product.stock,
        productionType: item.product.productionType,
        artisan: {
          displayName: item.product.artisan.displayName,
          slug: item.product.artisan.slug,
        },
        images: item.product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
        })),
      },
    }));
  }

  const isGuest = !session?.user?.id;
  const count = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <section className="mx-auto max-w-3xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <SectionHeading
        title="Tu Carrito"
        subtitle={count > 0 ? `${count} ${count === 1 ? "pieza" : "piezas"}` : undefined}
        as="h1"
      />

      {cartItems.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          {isGuest ? (
            <>
              <p className="text-text-secondary">
                Inicia sesión para ver tu carrito guardado.
              </p>
              <Link href="/login?callbackUrl=%2Fcarrito">
                <Button variant="secondary">Iniciar Sesión</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-text-secondary">Tu carrito está vacío</p>
              <Link href="/coleccion">
                <Button variant="secondary">Explorar colección</Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-10">
          <CartPageItems items={cartItems} isGuest={isGuest} />

          {/* Footer */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-4 text-xs text-text-tertiary">
              Tu pedido puede llegar en envíos separados si incluye piezas de
              distintos orfebres
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Subtotal</span>
              <span className="text-xl font-medium text-text">
                {formatCLP(cartTotal)}
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link href="/coleccion">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Seguir comprando
                </Button>
              </Link>
              <Link href="/checkout">
                <Button className="w-full sm:w-auto">Ir al Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
