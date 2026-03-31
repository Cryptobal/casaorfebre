export const revalidate = 300;

import { notFound } from "next/navigation";
import { getArtisanBySlug } from "@/lib/queries/artisans";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { auth } from "@/lib/auth";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ArtisanBadge } from "@/components/artisans/artisan-badge";
import { ProductCard } from "@/components/products/product-card";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisanBySlug(slug);
  if (!artisan) return { title: "Orfebre no encontrado" };
  const desc = artisan.bio.slice(0, 160);
  return {
    title: artisan.displayName,
    description: desc,
    alternates: { canonical: `/orfebres/${slug}` },
    openGraph: {
      title: `${artisan.displayName} | Casa Orfebre`,
      description: desc,
      images: artisan.profileImage ? [{ url: artisan.profileImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${artisan.displayName} | Casa Orfebre`,
      description: desc,
      images: artisan.profileImage ? [artisan.profileImage] : undefined,
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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Orfebres", url: "/orfebres" },
    { name: artisan.displayName, url: `/orfebres/${slug}` },
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: artisan.displayName,
    description: artisan.bio,
    image: artisan.profileImage || `${baseUrl}/casaorfebre-og-image.png`,
    url: `${baseUrl}/orfebres/${slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: artisan.location,
      ...(artisan.region ? { addressRegion: artisan.region } : {}),
      addressCountry: "CL",
    },
    ...(artisan.rating > 0 && artisan._count.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: artisan.rating,
            reviewCount: artisan._count.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(artisan.products.length > 0
      ? {
          makesOffer: artisan.products.slice(0, 10).map((p: any) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: p.name,
              url: `${process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"}/coleccion/${p.slug}`,
            },
          })),
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
      {/* Hero Section */}
      <FadeIn>
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative h-32 w-32 overflow-hidden rounded-full border border-border bg-surface">
            {artisan.profileImage ? (
              <Image
                src={artisan.profileImage}
                alt={artisan.displayName}
                fill
                className="object-cover"
                priority
                sizes="128px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-serif text-4xl font-light text-text-secondary">
                {initials}
              </span>
            )}
          </div>

          {/* Name + Badge */}
          <h1 className="mt-6 font-serif text-3xl sm:text-4xl font-light text-text">
            {artisan.displayName}
          </h1>
          {artisan.subscriptions?.[0]?.plan && (
            <div className="mt-2">
              <ArtisanBadge
                badgeType={artisan.subscriptions[0].plan.badgeType}
                badgeText={artisan.subscriptions[0].plan.badgeText}
                size="md"
              />
            </div>
          )}

          {/* Location + Region + Experience */}
          <p className="mt-2 text-text-secondary">
            {artisan.region ? `${artisan.location}, ${artisan.region}` : artisan.location}
            {artisan.yearsExperience != null && (
              <span> · {artisan.yearsExperience} {artisan.yearsExperience === 1 ? "año" : "años"} de experiencia</span>
            )}
          </p>

          {/* Specialties */}
          {artisan.specialties.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {artisan.specialties.map((s: { id: string; name: string; slug: string }) => (
                <span
                  key={s.id}
                  className="inline-block rounded-full bg-accent/5 border border-accent/20 px-3 py-1 text-xs font-medium text-accent"
                >
                  {s.name}
                </span>
              ))}
            </div>
          ) : artisan.specialty ? (
            <p className="mt-2 text-sm text-text-tertiary">{artisan.specialty}</p>
          ) : null}

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
            <span>{artisan.products.length} {artisan.products.length === 1 ? "pieza" : "piezas"}</span>
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

      {/* Awards Section */}
      {artisan.awards && artisan.awards.length > 0 && (
        <FadeIn delay={200} className="mt-10">
          <h2 className="text-center font-serif text-lg font-light text-text">
            Premios y reconocimientos
          </h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {artisan.awards.map((award: string) => (
              <span
                key={award}
                className="inline-block rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 text-xs font-medium text-accent"
              >
                {award}
              </span>
            ))}
          </div>
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

      {/* Reviews */}
      <ArtisanReviews artisanId={artisan.id} displayName={artisan.displayName} />
    </div>
    </>
  );
}

async function ArtisanReviews({
  artisanId,
  displayName,
}: {
  artisanId: string;
  displayName: string;
}) {
  const reviews = await prisma.review.findMany({
    where: { artisanId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  return (
    <div className="mt-16">
      <SectionHeading title={`Opiniones sobre ${displayName}`} />

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-surface px-6 py-8 text-center">
          <p className="text-sm font-light text-text-tertiary">
            Este orfebre a&uacute;n no tiene opiniones.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border rounded-lg border border-border">
          {reviews.map((review) => {
            const userName = review.user.name
              ? formatReviewerName(review.user.name)
              : "Cliente";

            return (
              <div key={review.id} className="px-6 py-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className={
                            star <= review.rating
                              ? "text-[#f59e0b]"
                              : "text-[#d1d5db]"
                          }
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-text">
                      {userName}
                    </span>
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Compra verificada
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-text-tertiary">
                    {review.createdAt.toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <p className="mt-2 text-xs text-text-tertiary">
                  sobre{" "}
                  <a
                    href={`/coleccion/${review.product.slug}`}
                    className="text-accent hover:underline"
                  >
                    {review.product.name}
                  </a>
                </p>

                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {review.comment}
                </p>

                {review.images.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {review.images.map((url, index) => (
                      <div
                        key={url}
                        className="relative h-[60px] w-[60px] overflow-hidden rounded-lg border border-border"
                      >
                        <Image
                          src={url}
                          alt={`Foto de opinion ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="60px"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {review.response && (
                  <div className="ml-4 mt-4 border-l-2 border-accent/20 pl-4 sm:ml-8">
                    <p className="text-xs font-medium text-text-tertiary">
                      Respuesta del orfebre:
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {review.response}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "Cliente";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
