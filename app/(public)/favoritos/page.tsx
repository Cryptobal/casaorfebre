import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FavoritesGrid } from "@/components/products/favorites-grid";

export const metadata: Metadata = {
  title: "Mis Favoritos · Casa Orfebre",
  // Página personal: no debe indexarse, pero sí seguir sus enlaces.
  robots: { index: false, follow: true },
};

function HeartIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default async function FavoritosPage() {
  const session = await auth();

  // Invitado sin sesión: no romper la navegación. Los favoritos requieren
  // sesión (provider + acción de servidor), así que mostramos un estado
  // vacío elegante con CTA en lugar de redirigir fuera de la tienda.
  if (!session?.user) {
    return (
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-light text-text">Mis Favoritos</h1>
        <div className="mt-16 flex flex-col items-center text-center">
          <HeartIcon />
          <p className="mt-6 max-w-sm text-sm text-text-secondary">
            Guarda tus piezas favoritas para volver a ellas cuando quieras.
          </p>
          <Link
            href="/login?next=/favoritos"
            className="mt-6 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/coleccion"
            className="mt-4 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            Explorar la colección &rarr;
          </Link>
        </div>
      </section>
    );
  }

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

  const products = favorites.map((fav) => fav.product);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <h1 className="font-serif text-2xl font-light text-text">Mis Favoritos</h1>

      {products.length > 0 ? (
        <FavoritesGrid products={products} />
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Aún no tienes piezas guardadas. Explora la colección y guarda las que más te gusten.
          </p>
          <Link
            href="/coleccion"
            className="mt-4 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            Explorar la colección &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
