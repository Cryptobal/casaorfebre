"use client";

import { useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { SerializedCartItem } from "@/components/cart/cart-item";

interface CartButtonProps {
  initialCount: number;
  initialItems: SerializedCartItem[];
  initialTotal: number;
}

export function CartButton({
  initialCount,
  initialItems,
  initialTotal,
}: CartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Carrito"
        className="relative text-text-secondary transition-colors hover:text-text"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        {initialCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white">
            {initialCount > 9 ? "9+" : initialCount}
          </span>
        )}
      </button>
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={initialItems}
        total={initialTotal}
      />
    </>
  );
}
