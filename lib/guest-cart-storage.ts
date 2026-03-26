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

export function addGuestCartLine(productId: string, quantity: number) {
  const lines = readGuestCartLines();
  const idx = lines.findIndex((l) => l.productId === productId);
  if (idx >= 0) {
    lines[idx] = {
      productId,
      quantity: lines[idx].quantity + quantity,
    };
  } else {
    lines.push({ productId, quantity });
  }
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}

export function setGuestLineQuantity(productId: string, quantity: number) {
  const lines = readGuestCartLines().filter((l) => l.productId !== productId);
  if (quantity > 0) lines.push({ productId, quantity });
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}

export function removeGuestCartLine(productId: string) {
  const lines = readGuestCartLines().filter((l) => l.productId !== productId);
  writeGuestCartLines(lines);
  dispatchGuestCartUpdated();
}
