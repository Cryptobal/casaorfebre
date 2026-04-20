"use server";

import { prisma } from "@/lib/prisma";
import type { GuestCartLine } from "@/lib/guest-cart";

/** Valida stock y disponibilidad antes de añadir al carrito local del invitado. */
export async function validateGuestAddToCart(productId: string, quantity = 1, size?: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: true,
    },
  });
  if (!product) return { error: "Producto no disponible" as const };

  if (size) {
    const variant = product.variants.find((v) => v.size === size);
    if (variant) {
      if (variant.stock < quantity) return { error: "Stock insuficiente para esta talla" as const };
    } else if (product.stock < quantity) {
      return { error: "Stock insuficiente" as const };
    }
  } else if (product.stock < quantity) {
    return { error: "Stock insuficiente" as const };
  }

  return {
    success: true as const,
    line: { productId, quantity, ...(size ? { size } : {}) },
    productSnapshot: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
      productionType: product.productionType,
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
      variants: true,
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: {
    id: string;
    quantity: number;
    size?: string;
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
  }[] = [];

  let dropped = 0;
  const keyFor = (productId: string, size?: string) => `${productId}__${size ?? ""}`;
  const qtyByKey = new Map<string, { productId: string; size?: string; quantity: number }>();
  for (const line of lines) {
    const key = keyFor(line.productId, line.size);
    const prev = qtyByKey.get(key);
    qtyByKey.set(key, {
      productId: line.productId,
      size: line.size,
      quantity: (prev?.quantity ?? 0) + line.quantity,
    });
  }

  for (const { productId, size, quantity: rawQty } of qtyByKey.values()) {
    const product = byId.get(productId);
    if (!product) {
      dropped += 1;
      continue;
    }
    const variantStock = size ? product.variants.find((v) => v.size === size)?.stock : undefined;
    const maxStock = variantStock ?? product.stock;
    let quantity = Math.min(rawQty, maxStock);
    if (product.productionType === "UNIQUE" || product.productionType === "MADE_TO_ORDER") quantity = Math.min(quantity, 1);
    if (quantity < 1) {
      dropped += 1;
      continue;
    }

    items.push({
      id: size ? `guest_${productId}__${size}` : `guest_${productId}`,
      quantity,
      ...(size ? { size } : {}),
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        productionType: product.productionType,
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

export async function validateGuestLineQuantity(productId: string, quantity: number, size?: string) {
  if (quantity < 1) return { error: "Cantidad no válida" as const };
  const product = await prisma.product.findUnique({
    where: { id: productId, status: "APPROVED" },
    include: { variants: true },
  });
  if (!product) return { error: "Producto no disponible" as const };
  if ((product.productionType === "UNIQUE" || product.productionType === "MADE_TO_ORDER") && quantity > 1) return { error: "Cantidad no válida" as const };

  if (size) {
    const variant = product.variants.find((v) => v.size === size);
    if (variant) {
      if (quantity > variant.stock) return { error: "Stock insuficiente" as const };
    } else if (quantity > product.stock) {
      return { error: "Stock insuficiente" as const };
    }
  } else if (quantity > product.stock) {
    return { error: "Stock insuficiente" as const };
  }

  return { success: true as const };
}
