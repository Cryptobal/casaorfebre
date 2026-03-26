"use server";

import { prisma } from "@/lib/prisma";
import type { GuestCartLine } from "@/lib/guest-cart";

/** Valida stock y disponibilidad antes de añadir al carrito local del invitado. */
export async function validateGuestAddToCart(productId: string, quantity = 1) {
  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
  if (!product) return { error: "Producto no disponible" as const };
  if (product.stock < quantity) return { error: "Stock insuficiente" as const };

  return {
    success: true as const,
    line: { productId, quantity },
    productSnapshot: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      isUnique: product.isUnique,
      artisan: {
        displayName: product.artisan.displayName,
        slug: product.artisan.slug,
      },
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
      })),
    },
  };
}

/** Hidrata líneas guardadas comprobando que los productos sigan disponibles. */
export async function resolveGuestCartLines(lines: GuestCartLine[]) {
  if (lines.length === 0) return { items: [] as const, dropped: 0 };

  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "APPROVED" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: {
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
  }[] = [];

  let dropped = 0;
  const qtyByProduct = new Map<string, number>();
  for (const line of lines) {
    const prev = qtyByProduct.get(line.productId) ?? 0;
    qtyByProduct.set(line.productId, prev + line.quantity);
  }

  for (const [productId, rawQty] of qtyByProduct) {
    const product = byId.get(productId);
    if (!product) {
      dropped += 1;
      continue;
    }
    let quantity = Math.min(rawQty, product.stock);
    if (product.isUnique) quantity = Math.min(quantity, 1);
    if (quantity < 1) {
      dropped += 1;
      continue;
    }

    items.push({
      id: `guest_${productId}`,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        isUnique: product.isUnique,
        artisan: {
          displayName: product.artisan.displayName,
          slug: product.artisan.slug,
        },
        images: product.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
        })),
      },
    });
  }

  return { items, dropped };
}

export async function validateGuestLineQuantity(productId: string, quantity: number) {
  if (quantity < 1) return { error: "Cantidad no válida" as const };
  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
  });
  if (!product) return { error: "Producto no disponible" as const };
  if (product.isUnique && quantity > 1) return { error: "Cantidad no válida" as const };
  if (quantity > product.stock) return { error: "Stock insuficiente" as const };
  return { success: true as const };
}
