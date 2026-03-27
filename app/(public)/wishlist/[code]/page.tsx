import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const wishlist = await prisma.wishlist.findUnique({
    where: { code },
    select: { name: true, user: { select: { name: true } } },
  });

  if (!wishlist) return { title: "Lista no encontrada" };

  return {
    title: `Lista de Deseos: ${wishlist.name} | Casa Orfebre`,
    description: `Lista de deseos "${wishlist.name}" creada por ${wishlist.user.name ?? "un usuario"} en Casa Orfebre.`,
    alternates: { canonical: `/wishlist/${code}` },
    twitter: {
      card: "summary" as const,
      title: `Lista de Deseos: ${wishlist.name} | Casa Orfebre`,
      description: `Lista de deseos "${wishlist.name}" creada por ${wishlist.user.name ?? "un usuario"} en Casa Orfebre.`,
    },
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
}

export default async function PublicWishlistPage({ params }: Props) {
  const { code } = await params;

  const wishlist = await prisma.wishlist.findUnique({
    where: { code },
    include: {
      user: { select: { name: true, image: true } },
      items: {
        include: {
          product: {
            include: {
              artisan: { select: { displayName: true, slug: true } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!wishlist || !wishlist.isPublic) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Lista de Deseos
        </p>
        <h1 className="mt-2 font-serif text-3xl font-light text-text">
          {wishlist.name}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          por {wishlist.user.name ?? "Usuario"}
        </p>
      </div>

      {wishlist.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {wishlist.items.map((item) => (
            <Link
              key={item.id}
              href={`/coleccion/${item.product.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
                {item.product.images[0]?.url ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={
                      item.product.images[0].altText ?? item.product.name
                    }
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-tertiary">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs font-light text-text-tertiary">
                  {item.product.artisan.displayName}
                </p>
                <h3 className="font-serif text-base font-medium text-text">
                  {item.product.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {formatPrice(item.product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-secondary">
            Esta lista aun no tiene piezas.
          </p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/coleccion"
          className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
        >
          Explorar coleccion &rarr;
        </Link>
      </div>
    </div>
  );
}
