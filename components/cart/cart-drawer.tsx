"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatCLP } from "@/lib/utils";
import { CartItem, type SerializedCartItem } from "./cart-item";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SerializedCartItem[];
  total: number;
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

export function CartDrawer({ isOpen, onClose, items, total }: CartDrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const grouped = groupByArtisan(items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-surface shadow-xl transition-transform duration-300 ease-in-out sm:w-96 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="font-serif text-lg font-light text-text">
            Tu Carrito ({count})
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="text-text-secondary transition-colors hover:text-text"
          >
            <svg
              width="20"
              height="20"
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

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <p className="text-text-secondary">Tu carrito está vacío</p>
            <Link
              href="/coleccion"
              onClick={onClose}
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              Explorar colección
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {Object.entries(grouped).map(([artisanName, artisanItems]) => (
                <div key={artisanName} className="mb-6 last:mb-0">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    {artisanName}
                  </p>
                  <div className="flex flex-col gap-4">
                    {artisanItems.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-4">
              <p className="mb-3 text-xs text-text-tertiary">
                Tu pedido puede llegar en envíos separados si incluye piezas de
                distintos orfebres
              </p>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Subtotal</span>
                <span className="text-lg font-medium text-text">
                  {formatCLP(total)}
                </span>
              </div>
              <Link href="/checkout" onClick={onClose}>
                <Button className="w-full">Ir al Checkout</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
