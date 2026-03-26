"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { formatCLP } from "@/lib/utils";

interface AddToCartProps {
  productId: string;
  price: number;
  isUnique: boolean;
  stock: number;
}

export function AddToCart({ productId, price, isUnique, stock }: AddToCartProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      const result = await addToCart(productId, quantity);
      if (result?.error) {
        setErrorMsg(result.error);
      } else {
        setSuccessMsg("¡Agregado al carrito!");
        router.refresh();
        setTimeout(() => setSuccessMsg(null), 2000);
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector — only for non-unique products with stock > 1 */}
      {!isUnique && stock > 1 && (
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
        loading={isPending}
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
