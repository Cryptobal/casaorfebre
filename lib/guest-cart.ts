/** Carrito de invitado en localStorage (clave estable para el sitio). */

export const GUEST_CART_STORAGE_KEY = "casaorfebre_guest_cart_v1";

export type GuestCartLine = {
  productId: string;
  quantity: number;
};

export function parseGuestCart(raw: string | null): GuestCartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const lines: GuestCartLine[] = [];
    for (const row of data) {
      if (
        row &&
        typeof row === "object" &&
        "productId" in row &&
        "quantity" in row &&
        typeof (row as GuestCartLine).productId === "string" &&
        typeof (row as GuestCartLine).quantity === "number"
      ) {
        const q = Math.floor((row as GuestCartLine).quantity);
        if (q > 0) lines.push({ productId: (row as GuestCartLine).productId, quantity: q });
      }
    }
    return lines;
  } catch {
    return [];
  }
}

export function guestCartLineId(productId: string): string {
  return `guest_${productId}`;
}
