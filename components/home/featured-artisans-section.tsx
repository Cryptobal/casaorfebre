import Link from "next/link";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { FadeIn } from "@/components/shared/fade-in";
import type { Artisan } from "@prisma/client";

type ArtisanForCard = Pick<
  Artisan,
  | "id"
  | "slug"
  | "displayName"
  | "location"
  | "profileImage"
  | "portraitUrl"
  | "quote"
  | "signatureTechniques"
  | "materials"
  | "tier"
> & {
  _count?: { products: number };
};

interface FeaturedArtisansSectionProps {
  artisans: ArtisanForCard[];
}

/**
 * Orfebres destacados — 3 máximo, sólo los que tienen retrato editorial
 * (portraitUrl) y al menos 3 piezas. Si no hay 3 calificados, muestra 2.
 * Si no hay ninguno, omite la sección (no iniciales en círculo, nunca).
 */
export function FeaturedArtisansSection({ artisans }: FeaturedArtisansSectionProps) {
  const qualified = artisans.filter(
    (a) => a.portraitUrl && (a._count?.products ?? 0) >= 3,
  );
  const visible = qualified.slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 border-b border-[color:var(--color-border-soft)] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-4xl font-light text-text sm:text-5xl">
              Orfebres
            </h2>
            <p className="mt-3 font-serif text-base font-light italic text-text-secondary">
              Las manos detrás de cada pieza.
            </p>
          </div>
          <Link
            href="/orfebres"
            className="text-xs font-light uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-dark"
          >
            Ver todos los orfebres →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-20 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24">
          {visible.map((artisan, i) => (
            <FadeIn key={artisan.id} delay={Math.min(i, 2) * 100}>
              <ArtisanCard artisan={artisan} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
