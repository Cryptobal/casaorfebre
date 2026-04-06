export const revalidate = 300;
export const dynamic = "force-static";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { buildCollectionWithItemsJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string) {
  return prisma.curatedCollection.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { status: "APPROVED" },
        include: {
          artisan: { select: { displayName: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
          materials: { select: { id: true, name: true } },
        },
        orderBy: { publishedAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) return { title: "Colección no encontrada" };

  const title = collection.metaTitle || `${collection.name} | Casa Orfebre`;
  const description = collection.metaDescription || collection.description?.slice(0, 160) || "";

  return {
    title: collection.name,
    description,
    alternates: { canonical: `/colecciones/${slug}` },
    openGraph: {
      title,
      description,
      images: collection.coverImage
        ? [{ url: collection.coverImage, width: 1200, height: 630 }]
        : [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CuratedCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);
  if (!collection) notFound();

  const jsonLd = buildCollectionWithItemsJsonLd({
    name: collection.name,
    description: collection.description || "",
    url: `/colecciones/${slug}`,
    products: collection.products,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Colecciones", url: "/colecciones" },
    { name: collection.name, url: `/colecciones/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-4 text-text-secondary leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>

        {collection.products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {collection.products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 60}>
                <ProductCard
                  product={product}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center">
            <p className="text-text-secondary">
              Esta colección aún no tiene piezas disponibles.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
