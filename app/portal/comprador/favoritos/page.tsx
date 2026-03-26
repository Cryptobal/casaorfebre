import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";

export const metadata = {
  title: "Mis Favoritos",
};

export default async function FavoritosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-light text-text">Mis Favoritos</h1>

      {favorites.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {favorites.map((fav) => (
            <ProductCard
              key={fav.id}
              product={fav.product}
              isFavorited={true}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Aún no tienes piezas guardadas. Explora la colección y guarda las que más te gusten.
          </p>
          <Link
            href="/coleccion"
            className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            Explorar colección &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
