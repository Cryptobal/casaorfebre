export const revalidate = 300;
// No usamos force-static: leemos searchParams (?include=all, ?tier=…, etc.)
// y queremos que el renderizado los respete.

import { Suspense } from "react";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveSpecialties, getActiveMaterials } from "@/lib/queries/catalog";
import { CHILEAN_REGIONS } from "@/lib/chile-cities";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { FadeIn } from "@/components/shared/fade-in";
import { EditorialBreadcrumb } from "@/components/shared/editorial-breadcrumb";
import { EditorialHero } from "@/components/shared/editorial-hero";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { OrfebresFilters } from "./orfebres-filters";

export const metadata = {
  title: "Orfebres — Las manos detrás de cada pieza",
  description:
    "Conoce a los orfebres chilenos que integran Casa Orfebre. Maestros verificados, piezas firmadas, técnicas tradicionales y contemporáneas.",
  alternates: { canonical: "https://casaorfebre.cl/orfebres" },
  openGraph: {
    type: "website" as const,
    title: "Orfebres — Las manos detrás de cada pieza",
    description:
      "Conoce a los orfebres chilenos que integran Casa Orfebre. Maestros verificados, piezas firmadas.",
    url: "https://casaorfebre.cl/orfebres",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Orfebres — Casa Orfebre",
    description: "Conoce a los orfebres chilenos que integran Casa Orfebre.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

function parseTier(value: string | undefined): "EMERGENTE" | "ORFEBRE" | "MAESTRO" | undefined {
  if (value === "EMERGENTE" || value === "ORFEBRE" || value === "MAESTRO") return value;
  return undefined;
}

export default async function OrfebresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const specialtySlug = typeof params.specialty === "string" ? params.specialty : undefined;
  const region = typeof params.region === "string" ? params.region : undefined;
  const material = typeof params.material === "string" ? params.material : undefined;
  const tier = parseTier(typeof params.tier === "string" ? params.tier : undefined);
  // ?include=all muestra también orfebres sin piezas APPROVED (uso editorial / debug).
  const includeEmpty = params.include === "all";

  const [artisans, specialties, materials] = await Promise.all([
    getApprovedArtisans({ specialtySlug, region, material, tier, includeEmpty }),
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
    description:
      "Directorio editorial de orfebres chilenos verificados que crean piezas únicas de joyería artesanal.",
    url: `${baseUrl}/orfebres`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: artisans.length,
      itemListElement: artisans.slice(0, 30).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: a.displayName,
          jobTitle: a.tier === "MAESTRO" ? "Maestro Orfebre" : "Orfebre",
          url: `${baseUrl}/orfebres/${a.slug}`,
          ...(a.portraitUrl ? { image: a.portraitUrl } : a.profileImage ? { image: a.profileImage } : {}),
          ...(a.location
            ? {
                homeLocation: {
                  "@type": "Place",
                  name: a.location,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: a.location,
                    addressCountry: "CL",
                  },
                },
              }
            : {}),
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <EditorialBreadcrumb
          items={[
            { label: "Casa Orfebre", href: "/" },
            { label: "Orfebres" },
          ]}
        />

        <div className="mt-10 lg:mt-16 lg:max-w-4xl">
          <EditorialHero
            heading="Nuestros Orfebres"
            subheading="Las <em>manos</em> detrás de cada pieza."
            paragraph="Cada orfebre en Casa Orfebre pasa por una curaduría pieza por pieza. Buscamos autoría, dominio técnico, lenguaje propio y honestidad de materiales. Lo que reúne este directorio no es el catálogo más grande — es el que firmamos."
          />
        </div>

        <div className="mt-12 flex items-baseline justify-between gap-6 border-b border-[color:var(--color-border-soft)] pb-4">
          <p className="font-serif text-sm font-light italic text-text-secondary">
            {artisans.length === 0
              ? "Sin orfebres"
              : artisans.length === 1
                ? "1 orfebre"
                : `${artisans.length} orfebres`}
          </p>
          <Suspense fallback={null}>
            <OrfebresFilters
              specialties={specialties}
              materials={materials}
              regions={CHILEAN_REGIONS}
            />
          </Suspense>
        </div>

        {artisans.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-y-20 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-24">
            {artisans.map((artisan, i) => {
              const isFeatured = i > 0 && (i + 1) % 7 === 0;
              return (
                <FadeIn
                  key={artisan.id}
                  delay={Math.min(i, 8) * 80}
                  className={isFeatured ? "lg:col-span-2" : undefined}
                >
                  <ArtisanCard artisan={artisan} featured={isFeatured} />
                </FadeIn>
              );
            })}
          </div>
        ) : (
          <div className="mt-20 border-t border-[color:var(--color-border-soft)] pt-20 text-center">
            <p className="font-serif text-xl font-light italic text-text-secondary">
              No encontramos orfebres con esos filtros.
            </p>
            <p className="mt-3 text-xs font-light uppercase tracking-[0.2em] text-text-tertiary">
              Prueba con otra región, otro material o limpia los filtros.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
