import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { getCart, getCartCount, getCartTotal } from "@/lib/queries/cart";
import type { SerializedCartItem } from "@/components/cart/cart-item";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let cartCount = 0;
  let cartItems: SerializedCartItem[] = [];
  let cartTotal = 0;

  if (session?.user?.id) {
    const [count, items, total] = await Promise.all([
      getCartCount(session.user.id),
      getCart(session.user.id),
      getCartTotal(session.user.id),
    ]);
    cartCount = count;
    cartTotal = total;
    // Serialize Prisma objects to plain data for client components
    cartItems = items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        stock: item.product.stock,
        isUnique: item.product.isUnique,
        artisan: {
          displayName: item.product.artisan.displayName,
          slug: item.product.artisan.slug,
        },
        images: item.product.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
        })),
      },
    }));
  }

  return (
    <>
      <Navbar
        cartCount={cartCount}
        cartItems={cartItems}
        cartTotal={cartTotal}
      />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}
