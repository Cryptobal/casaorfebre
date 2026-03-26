import { notFound } from "next/navigation";
import { getArtisanBySlug } from "@/lib/queries/artisans";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { auth } from "@/lib/auth";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ProductCard } from "@/components/products/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisanBySlug(slug);
  if (!artisan) return { title: "Orfebre no encontrado" };
  return {
    title: artisan.displayName,
    description: artisan.bio.slice(0, 160),
    openGraph: {
      title: `${artisan.displayName} | Casa Orfebre`,
      description: artisan.bio.slice(0, 160),
    },
  };
}

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const artisan = await getArtisanBySlug(slug);

  if (!artisan) notFound();

  const favoriteIds = await getUserFavoriteIds(session?.user?.id);

  const initials = artisan.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      {/* Hero Section */}
      <FadeIn>
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-surface border border-border">
            <span className="font-serif text-4xl font-light text-text-secondary">
              {initials}
            </span>
          </div>

          {/* Name */}
          <h1 className="mt-6 font-serif text-3xl sm:text-4xl font-light text-text">
            {artisan.displayName}
          </h1>

          {/* Location + Specialty */}
          <p className="mt-2 text-text-secondary">
            {artisan.location} · {artisan.specialty}
          </p>

          {/* Materials */}
          {artisan.materials.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {artisan.materials.map((material: string) => (
                <MaterialBadge key={material} material={material} />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-5 flex items-center justify-center gap-6 text-sm text-text-tertiary">
            {artisan.rating > 0 && (
              <span>★ {artisan.rating.toFixed(1)}</span>
            )}
            {artisan._count.reviews > 0 && (
              <span>{artisan._count.reviews} opiniones</span>
            )}
            <span>{artisan._count.products} piezas</span>
          </div>
        </div>
      </FadeIn>

      {/* Bio Section */}
      {artisan.bio && (
        <FadeIn delay={100} className="mt-12">
          <p className="text-text-secondary font-light leading-relaxed max-w-3xl mx-auto text-center">
            {artisan.bio}
          </p>
        </FadeIn>
      )}

      {/* Story Section */}
      {artisan.story && (
        <FadeIn delay={150} className="mt-10">
          <blockquote className="max-w-2xl mx-auto border-l-2 border-accent/30 pl-6">
            <p className="font-serif italic text-text-secondary leading-relaxed">
              {artisan.story}
            </p>
          </blockquote>
        </FadeIn>
      )}

      {/* Products Grid */}
      <div className="mt-16">
        <SectionHeading title={`Piezas de ${artisan.displayName}`} />

        {artisan.products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {artisan.products.map((product, index) => (
              <FadeIn key={product.id} delay={index * 100}>
                <ProductCard product={product} isFavorited={favoriteIds.has(product.id)} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm font-light text-text-tertiary">
            Este orfebre aún no tiene piezas publicadas
          </p>
        )}
      </div>

      {/* Reviews Placeholder */}
      <div className="mt-16">
        <SectionHeading title={`Opiniones sobre ${artisan.displayName}`} />
        <div className="mt-6 rounded-lg border border-border bg-surface px-6 py-8 text-center">
          <p className="text-sm font-light text-text-tertiary">
            Las opiniones estarán disponibles próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
