"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { mergeGuestCartAfterLogin } from "@/lib/actions/cart";
import { GUEST_CART_STORAGE_KEY, parseGuestCart } from "@/lib/guest-cart";
import { GUEST_CART_UPDATED_EVENT } from "@/lib/guest-cart-storage";

/** Tras iniciar sesión, fusiona el carrito local con CartItem y vacía localStorage. */
export function GuestCartMerge() {
  const { status } = useSession();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") ran.current = false;
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || ran.current) return;
    const raw = typeof window !== "undefined" ? localStorage.getItem(GUEST_CART_STORAGE_KEY) : null;
    const lines = parseGuestCart(raw);
    if (lines.length === 0) return;
    ran.current = true;

    (async () => {
      const result = await mergeGuestCartAfterLogin(lines);
      if (result && "success" in result && result.success) {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent(GUEST_CART_UPDATED_EVENT));
        router.refresh();
      } else {
        ran.current = false;
      }
    })();
  }, [status, router]);

  return null;
}
