"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";
import { CartPageItems } from "./cart-page-items";
import type { SerializedCartItem } from "@/components/cart/cart-item";
import { resolveGuestCartLines } from "@/lib/actions/guest-cart";
import {
  GUEST_CART_UPDATED_EVENT,
  readGuestCartLines,
} from "@/lib/guest-cart-storage";

/**
 * Renders the guest (not-logged-in) cart on /carrito by hydrating the lines
 * stored in localStorage — the same flow the header cart drawer uses. Without
 * this, guests saw an "inicia sesión" message even with items in their cart.
 */
export function GuestCart() {
  const [items, setItems] = useState<SerializedCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const hydrate = useCallback(async () => {
    const lines = readGuestCartLines();
    if (lines.length === 0) {
      setItems([]);
      setHydrated(true);
      return;
    }
    const resolved = await resolveGuestCartLines(lines);
    setItems([...resolved.items]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onUpdate = () => void hydrate();
    window.addEventListener(GUEST_CART_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(GUEST_CART_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [hydrate]);

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  if (!hydrated) {
    return (
      <div className="mt-16 text-center text-sm text-text-tertiary">
        Cargando tu carrito…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-text-secondary">Tu carrito está vacío</p>
        <Link href="/coleccion">
          <Button variant="secondary">Explorar colección</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <CartPageItems items={items} isGuest />

      <div className="mt-8 border-t border-border pt-6">
        <p className="mb-4 text-xs text-text-tertiary">
          Tu pedido puede llegar en envíos separados si incluye piezas de
          distintos orfebres
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Subtotal</span>
          <span className="text-xl font-medium text-text">
            {formatCLP(total)}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Link href="/coleccion">
            <Button variant="secondary" className="w-full sm:w-auto">
              Seguir comprando
            </Button>
          </Link>
          <Link href="/login?callbackUrl=%2Fcheckout">
            <Button className="w-full sm:w-auto">
              Iniciar sesión para comprar
            </Button>
          </Link>
        </div>
        <p className="mt-2 text-center text-xs text-text-tertiary sm:text-right">
          Debes iniciar sesión para completar la compra
        </p>
      </div>
    </div>
  );
}
