export const revalidate = 3600;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { ProductCard } from "@/components/products/product-card";
import {
  generateBreadcrumbJsonLd,
  generateDetailedLocalBusinessJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

/* ─── helpers ─── */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function capitalize(text: string): string {
  return text
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** City-specific SEO descriptions */
const CITY_DESCRIPTIONS: Record<string, string> = {
  santiago:
    "Santiago concentra una vibrante escena de orfebres contemporáneos que fusionan técnicas ancestrales con diseño moderno. Desde talleres en Lastarria hasta estudios en Providencia, la capital es el epicentro de la joyería artesanal chilena.",
  valparaiso:
    "Valparaíso, cuna de artistas y bohemios, alberga orfebres que transforman la identidad porteña en joyería. Los cerros del puerto inspiran piezas únicas con alma de mar y color.",
  "vina-del-mar":
    "Viña del Mar combina elegancia costera con artesanía de autor. Sus orfebres crean piezas sofisticadas inspiradas en la brisa marina y el refinamiento de la Ciudad Jardín.",
  concepcion:
    "Concepción es polo de diseño emergente en el sur de Chile. Sus orfebres aportan una visión fresca a la joyería artesanal, con influencias mapuche y materiales de la región del Biobío.",
  temuco:
    "Temuco y la Araucanía son tierra de platería mapuche, una tradición orfebre milenaria. Los orfebres de la zona preservan y reinventan técnicas ancestrales en plata.",
  "la-serena":
    "La Serena y el Norte Chico ofrecen joyería inspirada en el desierto, las estrellas y los minerales de los valles transversales. Lapislázuli y cobre son protagonistas.",
};

function getCityDescription(name: string, slug: string): string {
  return (
    CITY_DESCRIPTIONS[slug] ??
    `Descubre joyería artesanal hecha a mano por orfebres de ${name}. Piezas únicas con identidad local, creadas por artesanos verificados en Casa Orfebre.`
  );
}

/* ─── static params ─── */

export async function generateStaticParams() {
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", location: { not: "" } },
    select: { location: true },
  });

  const cities = new Set<string>();
  for (const a of artisans) {
    if (a.location) cities.add(slugify(a.location));
  }

  return Array.from(cities).map((city) => ({ city }));
}

/* ─── metadata ─── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;

  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", location: { not: "" } },
    select: { location: true },
  });

  const match = artisans.find((a) => slugify(a.location) === city);
  if (!match) return { title: "Ciudad no encontrada" };

  const name = capitalize(match.location);

  return {
    title: `Joyería Artesanal en ${name} | Casa Orfebre`,
    description: `Compra joyería artesanal de ${name}. Anillos, collares, aros y pulseras hechos a mano por orfebres verificados de ${name}.`,
    alternates: { canonical: `/joyeria-artesanal/${city}` },
  };
}

/* ─── page ─── */

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;

  // Find artisans in this city
  const allArtisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", location: { not: "" } },
    select: {
      id: true,
      displayName: true,
      slug: true,
      specialty: true,
      location: true,
      profileImage: true,
      region: true,
    },
  });

  const cityArtisans = allArtisans.filter((a) => slugify(a.location) === slug);
  if (cityArtisans.length === 0) notFound();

  const cityName = capitalize(cityArtisans[0].location);
  const artisanIds = cityArtisans.map((a) => a.id);

  // Authenticated user favorites
  // removed userFavIds (favorites are now client-side)

  // Products from artisans in this city
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      artisanId: { in: artisanIds },
    },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: {
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
      artisan: { select: { displayName: true, slug: true } },
      materials: { select: { id: true, name: true } },
    },
  });

  const description = getCityDescription(cityName, slug);
  const region = cityArtisans[0].region ?? "";

  // Schema.org
  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Joyería Artesanal", url: "/joyeria-artesanal" },
    { name: cityName, url: `/joyeria-artesanal/${slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);
  const localBusinessJsonLd = generateDetailedLocalBusinessJsonLd({
    name: `Casa Orfebre — Joyería Artesanal en ${cityName}`,
    description: `Marketplace de joyería artesanal en ${cityName}. ${cityArtisans.length} orfebres verificados.`,
    streetAddress: cityName,
    city: cityName,
    region: region || "Chile",
  });

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={localBusinessJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Breadcrumbs */}
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

        {/* Hero */}
        <div className="mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-6 text-text">
            Joyería Artesanal en {cityName}
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed max-w-2xl">
            {description}
          </p>
          <p className="mt-4 text-sm text-text-tertiary">
            {cityArtisans.length}{" "}
            {cityArtisans.length === 1
              ? "orfebre verificado"
              : "orfebres verificados"}{" "}
            en {cityName}
          </p>
        </div>

        {/* Products grid */}
        {products.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-light text-text mb-8">
              Piezas de {cityName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                />
              ))}
            </div>
          </div>
        )}

        {/* Artisans section */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-light text-text mb-8">
            Orfebres de {cityName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityArtisans.map((artisan) => (
              <Link
                key={artisan.id}
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
              </Link>
            ))}
          </div>
        </div>

        {/* Empty products state */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg mb-4">
              Los orfebres de {cityName} aún no tienen piezas publicadas.
            </p>
            <Link
              href="/coleccion"
              className="inline-flex items-center gap-2 text-accent hover:underline font-light"
            >
              Explorar toda la colección
            </Link>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-text-secondary mb-4">
            Descubre joyería artesanal de todo Chile
          </p>
          <Link
            href="/coleccion"
            className="inline-flex items-center gap-2 text-accent hover:underline font-light"
          >
            Ver toda la colección
          </Link>
        </div>
      </div>
    </>
  );
}
