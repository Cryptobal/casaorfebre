"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";
import type { SerializedCartItem } from "@/components/cart/cart-item";
import { resolveGuestCartLines } from "@/lib/actions/guest-cart";
import { GUEST_CART_UPDATED_EVENT, readGuestCartLines } from "@/lib/guest-cart-storage";

export const CART_UPDATED_EVENT = "casaorfebre:cart-updated";

export function CartButton() {
  const pathname = usePathname();
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  const [isOpen, setIsOpen] = useState(false);
  const [userItems, setUserItems] = useState<SerializedCartItem[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [guestItems, setGuestItems] = useState<SerializedCartItem[]>([]);
  const [guestTotal, setGuestTotal] = useState(0);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onCloseCart() {
      setIsOpen(false);
    }
    window.addEventListener("casaorfebre:close-cart", onCloseCart);
    return () => window.removeEventListener("casaorfebre:close-cart", onCloseCart);
  }, []);

  const hydrateUser = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: SerializedCartItem[]; total: number };
      setUserItems(data.items ?? []);
      setUserTotal(data.total ?? 0);
    } catch {
      // silent — UI degrades a carrito vacío
    }
  }, []);

  const hydrateGuest = useCallback(async () => {
    const lines = readGuestCartLines();
    if (lines.length === 0) {
      setGuestItems([]);
      setGuestTotal(0);
      return;
    }
    const { items } = await resolveGuestCartLines(lines);
    setGuestItems([...items]);
    setGuestTotal(
      items.reduce((s, i) => s + i.product.price * i.quantity, 0)
    );
  }, []);

  // Hidrata carrito del usuario autenticado al loguearse y al cambiar de ruta.
  useEffect(() => {
    if (!loggedIn) {
      setUserItems([]);
      setUserTotal(0);
      return;
    }
    void hydrateUser();
  }, [loggedIn, hydrateUser, pathname]);

  // Re-hidrata cuando otra parte de la app dispara cart-updated.
  useEffect(() => {
    if (!loggedIn) return;
    const onUpdate = () => void hydrateUser();
    window.addEventListener(CART_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpdate);
  }, [loggedIn, hydrateUser]);

  useEffect(() => {
    if (loggedIn) return;
    const id = requestAnimationFrame(() => {
      void hydrateGuest();
    });
    return () => cancelAnimationFrame(id);
  }, [loggedIn, hydrateGuest]);

  useEffect(() => {
    if (loggedIn) return;
    const onUpdate = () => void hydrateGuest();
    window.addEventListener(GUEST_CART_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(GUEST_CART_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [loggedIn, hydrateGuest]);

  const displayItems = loggedIn ? userItems : guestItems;
  const displayTotal = loggedIn ? userTotal : guestTotal;
  const displayCount = useMemo(
    () => displayItems.reduce((s, i) => s + i.quantity, 0),
    [displayItems]
  );

  return (
    <>
      <button
        type="button"
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
        {displayCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white">
            {displayCount > 9 ? "9+" : displayCount}
          </span>
        )}
      </button>
      <CartDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        items={displayItems}
        total={displayTotal}
        isGuest={!loggedIn}
      />
    </>
  );
}
