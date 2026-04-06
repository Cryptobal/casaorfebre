export const revalidate = 3600;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { getArtisansByRegion } from "@/lib/queries/artisans";
import { generateFAQJsonLd, generateLocalBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { CITIES } from "@/lib/data/cities";

export const generateStaticParams = () => {
  return CITIES.map((city) => ({
    ciudad: city.slug,
  }));
};

export const generateMetadata = ({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}): Metadata => {
  const ciudad = (params as any).ciudad;
  const cityData = CITIES.find((c) => c.slug === ciudad);

  if (!cityData) {
    return {
      title: "Ciudad no encontrada",
    };
  }

  return {
    title: cityData.metaTitle,
    description: cityData.metaDescription,
    alternates: { canonical: `/joyerias/${cityData.slug}` },
    openGraph: {
      title: cityData.metaTitle,
      description: cityData.metaDescription,
      images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: cityData.metaTitle,
      description: cityData.metaDescription,
      images: ["/casaorfebre-og-image.png"],
    },
  };
};

export default async function CityPage({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}) {
  const { ciudad } = await params;
  const cityData = CITIES.find((c) => c.slug === ciudad);

  if (!cityData) {
    notFound();
  }
  // removed userFavIds (favorites are now client-side)

  const artisans = await getArtisansByRegion(cityData.region);

  let products: any[] = [];
  if (artisans.length > 0) {
    products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        artisanId: { in: artisans.map((a: any) => a.id) },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        artisan: { select: { displayName: true, slug: true } },
      },
    });
  } else {
    products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        artisan: { select: { displayName: true, slug: true } },
      },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Joyerías en Chile", url: "/joyerias" },
    { name: cityData.name, url: `/joyerias/${cityData.slug}` },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  const faqJsonLd = generateFAQJsonLd(cityData.faqs);
  const localBusinessJsonLd = generateLocalBusinessJsonLd();


  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={localBusinessJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <nav className="mb-8 text-sm">
          <ol className="flex gap-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && <span className="text-text-tertiary">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-text font-medium">{item.name}</span>
                ) : (
                  <Link href={item.url} className="text-accent hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mb-16">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <span>📍</span>
            <span className="text-sm font-light">{cityData.region}</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-6 text-text">
            {cityData.h1}
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed max-w-2xl">
            {cityData.heroText}
          </p>
        </div>

        {artisans.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              title={`Orfebres en ${cityData.name}`}
              subtitle="Maestros artesanos verificados"
              as="h2"
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artisans.map((artisan: any, index: number) => (
                <FadeIn key={artisan.id} delay={index * 100}>
                  <Link
                    href={`/orfebres/${artisan.slug}`}
                    className="group block rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="font-serif text-lg font-light text-text group-hover:text-accent">
                      {artisan.displayName}
                    </div>
                    {artisan.specialty && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {artisan.specialty}
                      </p>
                    )}
                    {artisan.location && (
                      <p className="mt-1 text-xs text-text-tertiary">
                        📍 {artisan.location}
                      </p>
                    )}
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              title="Joyas Destacadas"
              subtitle="Últimas creaciones"
              as="h2"
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <FadeIn key={product.id} delay={index * 100}>
                  <ProductCard
                    product={product as any}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16 prose prose-invert max-w-none">
          <h2 className="font-serif text-2xl font-light text-text mb-6">
            Joyería Artesanal en {cityData.name}
          </h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
            {cityData.seoContent}
          </p>
        </div>

        <div className="mb-16 bg-surface-secondary rounded-lg p-8">
          <h2 className="font-serif text-2xl font-light text-text mb-8">
            ¿Por qué comprar online?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Catálogo más amplio
              </h3>
              <p className="text-text-secondary font-light">
                Accede a joyería de múltiples orfebres verificados en un solo lugar, sin limitaciones de inventario físico.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Precios transparentes
              </h3>
              <p className="text-text-secondary font-light">
                Compara precios directo con el artesano sin intermediarios, asegurando valor justo.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Certificado de autenticidad
              </h3>
              <p className="text-text-secondary font-light">
                Cada joya incluye certificado que verifica plata de ley y procedencia artesanal.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Envío seguro
              </h3>
              <p className="text-text-secondary font-light">
                Recibe tu joya empaquetada profesionalmente con seguimiento y seguro incluido.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-light text-text mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {cityData.faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-border pb-6 last:border-0"
              >
                <h3 className="font-serif text-lg font-light text-text mb-3">
                  {faq.question}
                </h3>
                <p className="text-text-secondary font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border">
          <p className="text-text-secondary mb-4">
            Descubre más sobre joyería artesanal en Chile
          </p>
          <Link
            href="/blog/mejores-joyerias-chile"
            className="inline-flex items-center gap-2 text-accent hover:underline font-light"
          >
            Conoce más sobre joyerías en Chile →
          </Link>
        </div>
      </div>
    </>
  );
}
