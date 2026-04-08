export const revalidate = 300;
export const dynamic = "force-static";

import { Suspense } from "react";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveSpecialties, getActiveMaterials } from "@/lib/queries/catalog";
import { CHILEAN_REGIONS } from "@/lib/chile-cities";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { OrfebresFilters } from "./orfebres-filters";

export const metadata = {
  title: "Nuestros Orfebres",
  description:
    "Conoce a los orfebres independientes de Chile que crean joyas artesanales únicas. Cada pieza tiene una historia.",
  alternates: { canonical: "https://casaorfebre.cl/orfebres" },
  openGraph: {
    type: "website" as const,
    title: "Orfebres Artesanales de Chile | Casa Orfebre",
    description:
      "Conoce a los orfebres independientes de Chile que crean joyas artesanales únicas.",
    url: "https://casaorfebre.cl/orfebres",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Orfebres Artesanales de Chile | Casa Orfebre",
    description:
      "Conoce a los orfebres independientes de Chile.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function OrfebresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const specialtySlug = typeof params.specialty === "string" ? params.specialty : undefined;
  const region = typeof params.region === "string" ? params.region : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;

  const [artisans, specialties, materials] = await Promise.all([
    getApprovedArtisans({ specialtySlug, region, material }),
    getActiveSpecialties(),
    getActiveMaterials(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Orfebres", url: "/orfebres" },
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Orfebres Chilenos Verificados",
    description: "Directorio de orfebres chilenos verificados que crean piezas únicas de joyería artesanal.",
    url: `${baseUrl}/orfebres`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: artisans.length,
      itemListElement: artisans.slice(0, 30).map((a: any, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: a.displayName,
          url: `${baseUrl}/orfebres/${a.slug}`,
          ...(a.profileImage ? { image: a.profileImage } : {}),
          ...(a.location ? { address: { "@type": "PostalAddress", addressLocality: a.location, addressCountry: "CL" } } : {}),
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      <SectionHeading
        title="Nuestros Orfebres"
        subtitle="Artesanos verificados que dan vida a piezas únicas"
        as="h1"
      />

      <div className="mt-8">
        <Suspense>
          <OrfebresFilters
            specialties={specialties}
            materials={materials}
            regions={CHILEAN_REGIONS}
          />
        </Suspense>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artisans.map((artisan, index) => (
          <FadeIn key={artisan.id} delay={index * 100} className="h-full">
            <ArtisanCard artisan={artisan} />
          </FadeIn>
        ))}
      </div>

      {artisans.length === 0 && (
        <p className="mt-8 text-center text-sm font-light text-text-tertiary">
          No se encontraron orfebres con los filtros seleccionados.
        </p>
      )}
    </div>
    </>
  );
}
