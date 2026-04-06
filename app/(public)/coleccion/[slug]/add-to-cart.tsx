"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { validateGuestAddToCart } from "@/lib/actions/guest-cart";
import { addGuestCartLine, readGuestCartLines } from "@/lib/guest-cart-storage";
import { formatCLP } from "@/lib/utils";
import { trackAddToCart, type GA4Item } from "@/lib/analytics-events";

interface AddToCartProps {
  productId: string;
  price: number;
  productionType: string;
  stock: number;
  ga4Item?: Omit<GA4Item, "quantity">;
}

export function AddToCart({ productId, price, productionType, stock, ga4Item }: AddToCartProps) {
  const router = useRouter();
  const { status } = useSession();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sessionLoading = status === "loading";
  const isGuestMode = status === "unauthenticated";

  function decrement() {
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQuantity((q) => Math.min(stock, q + 1));
  }

  function handleAddToCart() {
    setSuccessMsg(null);
    setErrorMsg(null);
    startTransition(async () => {
      if (!isGuestMode) {
        const result = await addToCart(productId, quantity);
        if (result?.error) {
          setErrorMsg(result.error);
        } else {
          if (ga4Item) trackAddToCart({ ...ga4Item, quantity });
          setSuccessMsg("¡Agregado al carrito!");
          window.dispatchEvent(new Event("casaorfebre:cart-updated"));
          router.refresh();
          setTimeout(() => setSuccessMsg(null), 2000);
        }
        return;
      }

      if (productionType === "UNIQUE" && readGuestCartLines().some((l) => l.productId === productId)) {
        setErrorMsg("Esta pieza única ya está en tu carrito");
        return;
      }
      const check = await validateGuestAddToCart(productId, quantity);
      if (check && "error" in check && check.error) {
        setErrorMsg(check.error);
        return;
      }
      addGuestCartLine(productId, quantity);
      if (ga4Item) trackAddToCart({ ...ga4Item, quantity });
      setSuccessMsg("¡Agregado al carrito!");
      setTimeout(() => setSuccessMsg(null), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector — only for LIMITED products with stock > 1 */}
      {productionType === "LIMITED" && stock > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">Cantidad:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={decrement}
              disabled={quantity <= 1 || isPending}
              className="flex h-8 w-8 items-center justify-center rounded border border-border text-text transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40"
              aria-label="Disminuir cantidad"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm font-medium tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increment}
              disabled={quantity >= stock || isPending}
              className="flex h-8 w-8 items-center justify-center rounded border border-border text-text transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-40"
              aria-label="Aumentar cantidad"
            >
              &#43;
            </button>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <Button
        size="lg"
        className="w-full"
        loading={isPending || sessionLoading}
        disabled={sessionLoading}
        onClick={handleAddToCart}
      >
        A&ntilde;adir al Carrito &mdash; {formatCLP(price * quantity)}
      </Button>

      {/* Success message */}
      {successMsg && (
        <p className="text-center text-sm font-medium text-green-600 transition-opacity">
          {successMsg}
        </p>
      )}

      {/* Error message */}
      {errorMsg && (
        <p className="text-center text-sm font-medium text-red-600">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
