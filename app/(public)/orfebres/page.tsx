export const revalidate = 300;

import { Suspense } from "react";
import { getApprovedArtisans } from "@/lib/queries/artisans";
import { getActiveSpecialties, getActiveMaterials } from "@/lib/queries/catalog";
import { CHILEAN_REGIONS } from "@/lib/chile-cities";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { OrfebresFilters } from "./orfebres-filters";

export const metadata = {
  title: "Orfebres",
  description:
    "Conoce a los orfebres chilenos verificados de Casa Orfebre. Artesanos que crean piezas únicas de joyería artesanal.",
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

  return (
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
          <FadeIn key={artisan.id} delay={index * 100}>
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
  );
}
