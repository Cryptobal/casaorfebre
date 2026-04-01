import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";

interface RelatedProductsProps {
  tags: string[];
  maxProducts?: number;
}

export async function RelatedProducts({
  tags,
  maxProducts = 4,
}: RelatedProductsProps) {
  if (tags.length === 0) return null;

  // Match products by category name, material name, or occasion name
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { categories: { some: { name: { in: tags, mode: "insensitive" } } } },
        { categories: { some: { slug: { in: tags, mode: "insensitive" } } } },
        { materials: { some: { name: { in: tags, mode: "insensitive" } } } },
        { occasions: { some: { name: { in: tags, mode: "insensitive" } } } },
        { specialties: { some: { name: { in: tags, mode: "insensitive" } } } },
      ],
    },
    include: {
      artisan: { select: { displayName: true, slug: true } },
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
      materials: { select: { id: true, name: true } },
    },
    take: maxProducts,
    orderBy: { publishedAt: "desc" },
  });

  if (products.length === 0) return null;

  return (
    <div className="my-12 rounded-xl border border-border bg-background p-6 sm:p-8">
      <h3 className="font-serif text-xl font-light text-text">
        Piezas que podrían interesarte
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/coleccion"
          className="text-sm text-accent hover:underline"
        >
          Ver toda la colección →
        </Link>
      </div>
    </div>
  );
}
