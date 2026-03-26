"use client";

import { useTransition } from "react";
import { formatCLP } from "@/lib/utils";
import { updateCartQuantity, removeFromCart } from "@/lib/actions/cart";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import Image from "next/image";

export interface SerializedCartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    isUnique: boolean;
    artisan: { displayName: string; slug: string };
    images: { id: string; url: string; altText: string | null }[];
  };
}

interface CartItemProps {
  item: SerializedCartItem;
}

export function CartItem({ item }: CartItemProps) {
  const [isPending, startTransition] = useTransition();
  const { product } = item;
  const image = product.images[0];

  function handleUpdateQty(newQty: number) {
    startTransition(async () => {
      await updateCartQuantity(item.id, newQty);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(item.id);
    });
  }

  return (
    <div className={`flex gap-3 ${isPending ? "opacity-50" : ""}`}>
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImagePlaceholder name={product.name} className="h-full w-full text-xs" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium leading-tight text-text">
              {product.name}
            </p>
            <p className="text-xs text-text-tertiary">
              {product.artisan.displayName}
            </p>
          </div>
          <button
            onClick={handleRemove}
            disabled={isPending}
            aria-label="Eliminar del carrito"
            className="ml-2 text-text-tertiary transition-colors hover:text-text"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          {product.isUnique ? (
            <span className="text-xs text-text-tertiary">Pieza única</span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQty(item.quantity - 1)}
                disabled={isPending || item.quantity <= 1}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs text-text-secondary transition-colors hover:bg-background disabled:opacity-40"
              >
                -
              </button>
              <span className="min-w-[1.25rem] text-center text-sm text-text">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQty(item.quantity + 1)}
                disabled={isPending || item.quantity >= product.stock}
                className="flex h-6 w-6 items-center justify-center rounded border border-border text-xs text-text-secondary transition-colors hover:bg-background disabled:opacity-40"
              >
                +
              </button>
            </div>
          )}
          <span className="text-sm font-medium text-text">
            {formatCLP(product.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
