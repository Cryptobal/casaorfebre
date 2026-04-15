import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CollectionProductsManager } from "./collection-products-manager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCollectionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const collection = await prisma.curatedCollection.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          status: true,
          images: {
            take: 1,
            orderBy: { position: "asc" },
            select: { url: true },
          },
          artisan: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!collection) notFound();

  return (
    <div>
      <Link
        href="/portal/admin/colecciones"
        className="text-xs text-text-tertiary hover:text-text-secondary"
      >
        ← Volver a colecciones
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-light sm:text-3xl">
            {collection.name}
          </h1>
          <p className="mt-1 text-xs text-text-tertiary">
            /{collection.slug}{" "}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                collection.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {collection.isActive ? "Publicada" : "Oculta"}
            </span>
          </p>
          {collection.description && (
            <p className="mt-3 max-w-2xl text-sm text-text-secondary">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <CollectionProductsManager
          collectionId={collection.id}
          initialProducts={JSON.parse(JSON.stringify(collection.products))}
        />
      </div>
    </div>
  );
}
