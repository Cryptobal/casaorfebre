import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { CHILEAN_REGIONS } from "@/lib/chile-cities";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { JsonLd } from "@/components/seo/json-ld";
import type { Metadata } from "next";

export const revalidate = 300;

function findRegion(slug: string): string | undefined {
  return CHILEAN_REGIONS.find((r) => slugify(r) === slug);
}

export async function generateStaticParams() {
  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", region: { not: null } },
    select: { region: true },
    distinct: ["region"],
  });
  return artisans
    .filter((a) => a.region)
    .map((a) => ({ region: slugify(a.region!) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region: slug } = await params;
  const regionName = findRegion(slug) || slug;

  return {
    title: `Orfebres en ${regionName}`,
    description: `Conoce a los orfebres artesanales de la Región de ${regionName}. Joyas únicas hechas a mano por artesanos verificados de Casa Orfebre.`,
    alternates: { canonical: `https://casaorfebre.cl/orfebres/region/${slug}` },
    openGraph: {
      title: `Orfebres Artesanales en ${regionName} | Casa Orfebre`,
      description: `Descubre orfebres verificados de la Región de ${regionName} que crean joyas artesanales únicas.`,
      siteName: "Casa Orfebre",
      locale: "es_CL",
    },
    twitter: {
      card: "summary_large_image",
      title: `Orfebres en ${regionName} | Casa Orfebre`,
      description: `Descubre orfebres verificados de ${regionName}.`,
      creator: "@casaorfebre",
      site: "@casaorfebre",
    },
  };
}

export default async function RegionOrfebresPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const regionName = findRegion(slug);
  if (!regionName) notFound();

  const artisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", region: regionName },
    orderBy: { totalSales: "desc" },
    include: {
      specialties: { select: { id: true, name: true, slug: true } },
      subscriptions: {
        where: { status: "ACTIVE" },
        take: 1,
        orderBy: { startDate: "desc" },
        include: { plan: { select: { badgeType: true, badgeText: true, name: true } } },
      },
      _count: { select: { products: true, reviews: true } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Orfebres Artesanales en ${regionName}`,
    description: `Directorio de orfebres verificados en la Región de ${regionName}.`,
    url: `${baseUrl}/orfebres/region/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: artisans.length,
      itemListElement: artisans.slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: a.displayName,
          url: `${baseUrl}/orfebres/${a.slug}`,
          ...(a.profileImage ? { image: a.profileImage } : {}),
          address: {
            "@type": "PostalAddress",
            addressLocality: a.location,
            addressRegion: regionName,
            addressCountry: "CL",
          },
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <SectionHeading
          title={`Orfebres en ${regionName}`}
          subtitle={`${artisans.length} ${artisans.length === 1 ? "orfebre verificado" : "orfebres verificados"} en esta región`}
          as="h1"
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.map((artisan, index) => (
            <FadeIn key={artisan.id} delay={index * 100}>
              <ArtisanCard artisan={artisan} />
            </FadeIn>
          ))}
        </div>

        {artisans.length === 0 && (
          <p className="mt-8 text-center text-sm font-light text-text-tertiary">
            No se encontraron orfebres en esta región todavía.
          </p>
        )}
      </div>
    </>
  );
}
