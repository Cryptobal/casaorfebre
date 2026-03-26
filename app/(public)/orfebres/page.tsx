import { getApprovedArtisans } from "@/lib/queries/artisans";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata = {
  title: "Orfebres",
  description:
    "Conoce a los orfebres chilenos verificados de Casa Orfebre. Artesanos que crean piezas únicas de joyería artesanal.",
};

export default async function OrfebresPage() {
  const artisans = await getApprovedArtisans();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      <SectionHeading
        title="Nuestros Orfebres"
        subtitle="Artesanos verificados que dan vida a piezas únicas"
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artisans.map((artisan, index) => (
          <FadeIn key={artisan.id} delay={index * 100}>
            <ArtisanCard artisan={artisan} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
