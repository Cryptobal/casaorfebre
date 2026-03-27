"use client";

import { CartItem, type SerializedCartItem } from "@/components/cart/cart-item";

interface CartPageItemsProps {
  items: SerializedCartItem[];
  isGuest?: boolean;
}

function groupByArtisan(items: SerializedCartItem[]) {
  const groups: Record<string, SerializedCartItem[]> = {};
  for (const item of items) {
    const name = item.product.artisan.displayName;
    if (!groups[name]) groups[name] = [];
    groups[name].push(item);
  }
  return groups;
}

export function CartPageItems({ items, isGuest = false }: CartPageItemsProps) {
  const grouped = groupByArtisan(items);

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(grouped).map(([artisanName, artisanItems]) => (
        <div key={artisanName}>
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-text-tertiary">
            {artisanName}
          </p>
          <div className="flex flex-col gap-5">
            {artisanItems.map((item) => (
              <CartItem key={item.id} item={item} isGuest={isGuest} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
