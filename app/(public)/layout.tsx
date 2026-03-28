import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { EmailVerificationBanner } from "@/components/shared/email-verification-banner";
import { BuyerTour } from "@/components/guided-tour/BuyerTour";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCart, getCartTotal } from "@/lib/queries/cart";
import type { SerializedCartItem } from "@/components/cart/cart-item";


type CartRow = Awaited<ReturnType<typeof getCart>>[number];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let cartItems: SerializedCartItem[] = [];
  let cartTotal = 0;

  let showVerificationBanner = false;

  if (session?.user?.id) {
    const [items, total, dbUser] = await Promise.all([
      getCart(session.user.id),
      getCartTotal(session.user.id),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { emailVerified: true, hashedPassword: true },
      }),
    ]);

    // Show banner only for credentials users (have password) with unverified email
    if (dbUser?.hashedPassword && !dbUser.emailVerified) {
      showVerificationBanner = true;
    }
    cartTotal = total;
    // Serialize Prisma objects to plain data for client components
    cartItems = items.map((item: CartRow) => ({
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
        images: item.product.images.map((img) => ({
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
        cartItems={cartItems}
        cartTotal={cartTotal}
        isLoggedIn={!!session?.user?.id}
        user={session?.user ? { name: session.user.name, email: session.user.email, image: session.user.image, role: session.user.role } : null}
      />
      {showVerificationBanner && <EmailVerificationBanner />}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BuyerTour isLoggedIn={!!session?.user?.id} />
    </>
  );
}
