"use client";

import { useTransition } from "react";
import { formatCLP } from "@/lib/utils";
import { updateCartQuantity, removeFromCart } from "@/lib/actions/cart";
import { validateGuestLineQuantity } from "@/lib/actions/guest-cart";
import {
  removeGuestCartLine,
  setGuestLineQuantity,
} from "@/lib/guest-cart-storage";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { trackRemoveFromCart } from "@/lib/analytics-events";
import Image from "next/image";

export interface SerializedCartItem {
  id: string;
  quantity: number;
  size?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    productionType: string;
    artisan: { displayName: string; slug: string };
    images: { id: string; url: string; altText: string | null }[];
  };
}

interface CartItemProps {
  item: SerializedCartItem;
  isGuest?: boolean;
}

export function CartItem({ item, isGuest = false }: CartItemProps) {
  const [isPending, startTransition] = useTransition();
  const { product } = item;
  const image = product.images[0];

  function handleUpdateQty(newQty: number) {
    if (isGuest) {
      startTransition(async () => {
        const check = await validateGuestLineQuantity(product.id, newQty);
        if (check && "error" in check) return;
        setGuestLineQuantity(product.id, newQty);
      });
      return;
    }
    startTransition(async () => {
      await updateCartQuantity(item.id, newQty);
      window.dispatchEvent(new Event("casaorfebre:cart-updated"));
    });
  }

  function handleRemove() {
    trackRemoveFromCart({
      item_id: product.id,
      item_name: product.name,
      item_category: "",
      item_brand: product.artisan.displayName,
      price: product.price,
      quantity: item.quantity,
    });
    if (isGuest) {
      startTransition(async () => {
        removeGuestCartLine(product.id);
      });
      return;
    }
    startTransition(async () => {
      await removeFromCart(item.id);
      window.dispatchEvent(new Event("casaorfebre:cart-updated"));
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
            {item.size && (
              <p className="text-xs text-text-tertiary">Talla: {item.size}</p>
            )}
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
          {product.productionType === "UNIQUE" || product.productionType === "MADE_TO_ORDER" ? (
            <span className="text-xs text-text-tertiary">
              {product.productionType === "UNIQUE" ? "Pieza única" : "Hecha por encargo"}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQty(item.quantity - 1)}
                disabled={isPending || item.quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded border border-border text-xs text-text-secondary transition-colors hover:bg-background disabled:opacity-40 sm:h-6 sm:w-6"
              >
                -
              </button>
              <span className="min-w-[1.25rem] text-center text-sm text-text">
                {item.quantity}
              </span>
              <button
                onClick={() => handleUpdateQty(item.quantity + 1)}
                disabled={isPending || item.quantity >= product.stock}
                className="flex h-9 w-9 items-center justify-center rounded border border-border text-xs text-text-secondary transition-colors hover:bg-background disabled:opacity-40 sm:h-6 sm:w-6"
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
