import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCart, getCartTotal } from "@/lib/queries/cart";
import type { SerializedCartItem } from "@/components/cart/cart-item";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { items: [], total: 0 },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  const [items, total] = await Promise.all([
    getCart(session.user.id),
    getCartTotal(session.user.id),
  ]);

  type CartRow = Awaited<ReturnType<typeof getCart>>[number];
  const serialized: SerializedCartItem[] = items.map((item: CartRow) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.price,
      stock: item.product.stock,
      productionType: item.product.productionType,
      artisan: {
        displayName: item.product.artisan.displayName,
        slug: item.product.artisan.slug,
      },
      images: item.product.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
      })),
    },
  }));

  return NextResponse.json(
    { items: serialized, total },
    { headers: { "cache-control": "private, no-store" } },
  );
}
