import {
  GUEST_CART_STORAGE_KEY,
  parseGuestCart,
  type GuestCartLine,
} from "@/lib/guest-cart";

export const GUEST_CART_UPDATED_EVENT = "casaorfebre:guest-cart-updated";

export function dispatchGuestCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GUEST_CART_UPDATED_EVENT));
}

export function readGuestCartLines(): GuestCartLine[] {
  if (typeof window === "undefined") return [];
  return parseGuestCart(localStorage.getItem(GUEST_CART_STORAGE_KEY));
}

export function writeGuestCartLines(lines: GuestCartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
}

function sameLine(a: { productId: string; size?: string }, b: { productId: string; size?: string }) {
  return a.productId === b.productId && (a.size ?? "") === (b.size ?? "");
}

export function addGuestCartLine(productId: string, quantity: number, size?: string) {
  const lines = readGuestCartLines();
  const idx = lines.findIndex((l) => sameLine(l, { productId, size }));
  if (idx >= 0) {
    lines[idx] = {
      ...lines[idx],
      productId,
      quantity: lines[idx].quantity + quantity,
      ...(size ? { size } : {}),
    };
  } else {
    lines.push({ productId, quantity, ...(size ? { size } : {}) });
  }
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}

export function setGuestLineQuantity(productId: string, quantity: number, size?: string) {
  const lines = readGuestCartLines().filter((l) => !sameLine(l, { productId, size }));
  if (quantity > 0) lines.push({ productId, quantity, ...(size ? { size } : {}) });
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}

export function removeGuestCartLine(productId: string, size?: string) {
  const lines = readGuestCartLines().filter((l) => !sameLine(l, { productId, size }));
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}
