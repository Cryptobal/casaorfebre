export const revalidate = 300;
export const dynamic = "force-static";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getArtisanBySlug } from "@/lib/queries/artisans";
import { buildBreadcrumbJsonLd, generateJewelerPersonJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { EditorialBreadcrumb } from "@/components/shared/editorial-breadcrumb";
import { ProductCard } from "@/components/products/product-card";
import { ShareButtons } from "@/components/shared/share-buttons";
import { FadeIn } from "@/components/shared/fade-in";
import { prisma } from "@/lib/prisma";
import type { Artisan } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisanBySlug(slug);
  if (!artisan) return { title: "Orfebre no encontrado" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const url = `${baseUrl}/orfebres/${slug}`;
  const description =
    artisan.bio?.slice(0, 160) ??
    `${artisan.displayName}, ${tierLabel(artisan.tier).toLowerCase()} en Casa Orfebre.`;
  const title = `${artisan.displayName} — ${tierLabel(artisan.tier)} | Casa Orfebre`;

  const ogImage =
    artisan.portraitUrl ||
    `${baseUrl}/api/og/artisan?name=${encodeURIComponent(artisan.displayName)}&region=${encodeURIComponent(artisan.region || "")}&products=${artisan.products.length}${artisan.profileImage ? `&image=${encodeURIComponent(artisan.profileImage)}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "profile" as const,
      title,
      description,
      url,
      siteName: "Casa Orfebre",
      locale: "es_CL",
      images: [
        { url: ogImage, width: 1200, height: 1500, alt: artisan.displayName },
        ...(artisan.profileImage
          ? [{ url: artisan.profileImage, width: 800, height: 800, alt: artisan.displayName }]
          : []),
      ],
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
      creator: "@casaorfebre",
      site: "@casaorfebre",
    },
  };
}

function tierLabel(tier: Artisan["tier"]): string {
  switch (tier) {
    case "MAESTRO":
      return "Maestro Orfebre";
    case "EMERGENTE":
      return "Orfebre emergente";
    case "ORFEBRE":
    default:
      return "Orfebre";
  }
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default async function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artisan = await getArtisanBySlug(slug);
  if (!artisan) notFound();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: "/" },
    { name: "Orfebres", url: "/orfebres" },
    { name: artisan.displayName, url: `/orfebres/${slug}` },
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artisan.displayName,
    jobTitle: tierLabel(artisan.tier),
    description: artisan.bio,
    image: artisan.portraitUrl || artisan.profileImage || `${baseUrl}/casaorfebre-og-image.png`,
    url: `${baseUrl}/orfebres/${slug}`,
    ...(artisan.location
      ? {
          homeLocation: {
            "@type": "Place",
            name: artisan.location,
            address: {
              "@type": "PostalAddress",
              addressLocality: artisan.location,
              ...(artisan.region ? { addressRegion: artisan.region } : {}),
              addressCountry: "CL",
            },
          },
        }
      : {}),
    memberOf: {
      "@type": "Organization",
      name: "Casa Orfebre",
      url: "https://casaorfebre.cl",
    },
  };

  const portrait = artisan.portraitUrl || artisan.profileImage;
  const displayedProducts = artisan.products.slice(0, 9);
  const hasMoreProducts = artisan.products.length > 9;

  // Lista de técnicas combinando signatureTechniques (nuevo) + specialties + specialty (legacy).
  const techniquesList = Array.from(
    new Set(
      [
        ...(artisan.signatureTechniques ?? []),
        ...(artisan.specialties ?? []).map((s) => s.name),
        ...(artisan.specialty ? [artisan.specialty] : []),
      ].filter(Boolean),
    ),
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd
        data={generateJewelerPersonJsonLd({
          name: artisan.displayName,
          slug,
          bio: artisan.bio || undefined,
          image: artisan.portraitUrl || artisan.profileImage || undefined,
          location: artisan.location || undefined,
          region: artisan.region || undefined,
          rating: artisan.rating,
          reviewCount: artisan._count.reviews,
          specialties: techniquesList.length > 0 ? techniquesList : undefined,
        })}
      />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <EditorialBreadcrumb
          items={[
            { label: "Casa Orfebre", href: "/" },
            { label: "Orfebres", href: "/orfebres" },
            { label: artisan.displayName },
          ]}
        />

        {/* ─── Hero diptych ─── */}
        <FadeIn>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
            {/* Retrato */}
            <div className="relative aspect-[4/5] overflow-hidden bg-background">
              {portrait ? (
                <Image
                  src={portrait}
                  alt={`Retrato de ${artisan.displayName}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span
                    aria-hidden
                    className="font-serif text-[16rem] font-light italic leading-none text-text-tertiary"
                  >
                    {monogram(artisan.displayName)}
                  </span>
                </div>
              )}
            </div>

            {/* Texto */}
            <div className="flex flex-col justify-center">
              <p className="text-sm font-light uppercase tracking-[0.2em] text-accent">
                {artisan.displayName}
              </p>
              <p className="mt-2 font-serif text-lg font-light italic text-text-secondary">
                {tierLabel(artisan.tier)}
              </p>

              <span aria-hidden className="my-8 block h-px w-[48px] bg-accent" />

              {artisan.quote ? (
                <blockquote className="font-serif text-4xl font-light leading-[1.1] text-text sm:text-5xl">
                  <span className="italic">{artisan.quote}</span>
                </blockquote>
              ) : (
                <h1 className="font-serif text-4xl font-light leading-[1.1] text-text sm:text-5xl">
                  Obra de <span className="italic">{artisan.displayName}</span>
                </h1>
              )}

              <div className="mt-8 space-y-1 text-sm font-light text-text-tertiary">
                <p>
                  {artisan.location}
                  {artisan.region ? `, ${artisan.region}` : ""}.
                </p>
                {artisan.yearsExperience != null && (
                  <p>
                    {artisan.yearsExperience}{" "}
                    {artisan.yearsExperience === 1 ? "año" : "años"} de práctica.
                  </p>
                )}
              </div>

              <div className="mt-8">
                <ShareButtons
                  url={`${baseUrl}/orfebres/${slug}`}
                  title={artisan.displayName}
                  description={
                    artisan.quote ??
                    artisan.bio?.slice(0, 120) ??
                    "Orfebre en Casa Orfebre"
                  }
                  imageUrl={artisan.portraitUrl ?? artisan.profileImage ?? undefined}
                  type="artisan"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ─── Sobre ─── */}
        {artisan.bio ? (
          <FadeIn delay={80} className="mt-24 lg:mt-32">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <h2 className="col-span-12 text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary lg:col-span-3">
                Sobre
              </h2>
              <div className="col-span-12 lg:col-span-9">
                <p className="max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                  {artisan.bio}
                </p>
                {artisan.story && (
                  <p className="mt-6 max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                    {artisan.story}
                  </p>
                )}
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={80} className="mt-24 lg:mt-32">
            {/* TODO CONTENIDO: bio editorial pendiente de Camila. */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <h2 className="col-span-12 text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary lg:col-span-3">
                Sobre
              </h2>
              <p className="col-span-12 max-w-prose font-serif text-lg italic font-light text-text-tertiary lg:col-span-9">
                Bio editorial pendiente. Si eres el orfebre y quieres completar
                tu perfil, escríbenos a editorial@casaorfebre.cl.
              </p>
            </div>
          </FadeIn>
        )}

        {/* ─── Técnicas / Materiales / Años ─── */}
        {(techniquesList.length > 0 ||
          (artisan.materials?.length ?? 0) > 0 ||
          artisan.yearsExperience != null) && (
          <FadeIn delay={120} className="mt-16 border-t border-[color:var(--color-border-soft)] pt-10">
            <dl className="grid grid-cols-1 gap-4 text-sm font-light text-text">
              {techniquesList.length > 0 && (
                <SpecRow label="Técnicas" values={techniquesList} />
              )}
              {(artisan.materials?.length ?? 0) > 0 && (
                <SpecRow label="Materiales" values={artisan.materials} />
              )}
              {artisan.yearsExperience != null && (
                <SpecRow
                  label="Año de inicio"
                  values={[
                    String(new Date().getFullYear() - artisan.yearsExperience),
                  ]}
                />
              )}
              {artisan.awards?.length > 0 && (
                <SpecRow label="Reconocimientos" values={artisan.awards} />
              )}
            </dl>
          </FadeIn>
        )}

        {/* ─── Obra disponible ─── */}
        <div className="mt-24 lg:mt-32">
          <div className="flex items-baseline justify-between gap-6 border-b border-[color:var(--color-border-soft)] pb-6">
            <h2 className="font-serif text-3xl font-light text-text sm:text-4xl">
              Obra disponible
            </h2>
            <p className="font-serif text-sm font-light italic text-text-secondary">
              {artisan.products.length === 0
                ? "Sin piezas publicadas"
                : artisan.products.length === 1
                  ? "1 pieza"
                  : `${artisan.products.length} piezas`}
            </p>
          </div>

          {displayedProducts.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-24">
                {displayedProducts.map((product, i) => (
                  <FadeIn key={product.id} delay={Math.min(i, 8) * 60}>
                    <ProductCard product={product} listName={`Orfebre: ${artisan.displayName}`} />
                  </FadeIn>
                ))}
              </div>
              {hasMoreProducts && (
                <div className="mt-16 text-center">
                  <Link
                    href={`/coleccion?artisan=${artisan.slug}`}
                    className="inline-block border-b border-accent pb-1 font-serif text-lg font-light italic text-accent transition-colors hover:text-accent-dark"
                  >
                    Ver toda la obra →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <p className="mt-10 font-serif text-lg font-light italic text-text-tertiary">
              Este orfebre aún no tiene piezas publicadas.
            </p>
          )}
        </div>

        {/* ─── Taller (imágenes del workshop) ─── */}
        {artisan.workshopImages && artisan.workshopImages.length > 0 && (
          <FadeIn delay={80} className="mt-24 lg:mt-32">
            <h2 className="text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
              Taller
            </h2>
            <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 sm:-mx-6 lg:mx-0 lg:gap-8">
              {artisan.workshopImages.map((url, i) => (
                <div
                  key={url}
                  className="relative aspect-[3/4] w-[70vw] flex-shrink-0 snap-center overflow-hidden bg-background first:ml-4 last:mr-4 sm:first:ml-6 sm:last:mr-6 lg:w-[30vw] lg:first:ml-0 lg:last:mr-0"
                >
                  <Image
                    src={url}
                    alt={`Taller de ${artisan.displayName}, foto ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 70vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* ─── Encargo ─── */}
        {artisan.acceptsCommissions && (
          <FadeIn delay={80} className="mt-24 border-t border-[color:var(--color-border-soft)] pt-16 lg:mt-32">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="col-span-12 lg:col-span-8">
                <h2 className="font-serif text-3xl font-light text-text sm:text-4xl">
                  ¿Una pieza <span className="italic">hecha para ti</span>?
                </h2>
                <p className="mt-4 max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                  {artisan.displayName.split(" ")[0]} acepta encargos
                  personalizados. Cuéntanos qué pieza imaginas y coordinamos
                  una conversación.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-4 lg:text-right">
                <Link
                  href={`/contacto?orfebre=${artisan.slug}&motivo=encargo`}
                  className="inline-block border border-text px-8 py-3 text-sm font-light tracking-wide text-text transition-colors hover:bg-text hover:text-background"
                >
                  Consultar un encargo →
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ─── Reviews ─── */}
        <ArtisanReviews artisanId={artisan.id} displayName={artisan.displayName} />
      </section>
    </>
  );
}

function SpecRow({ label, values }: { label: string; values: readonly string[] }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-12 sm:gap-4">
      <dt className="col-span-3 text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
        {label}
      </dt>
      <dd className="col-span-9 text-sm font-light text-text">
        {values.map((v, i) => (
          <span key={`${v}-${i}`}>
            {i > 0 && <span className="mx-2 text-text-tertiary">·</span>}
            {v}
          </span>
        ))}
      </dd>
    </div>
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

  if (reviews.length === 0) return null;

  return (
    <div className="mt-24 border-t border-[color:var(--color-border-soft)] pt-16 lg:mt-32">
      <h2 className="font-serif text-3xl font-light text-text sm:text-4xl">
        Opiniones sobre <span className="italic">{displayName}</span>
      </h2>

      <div className="mt-10 space-y-10">
        {reviews.map((review) => {
          const userName = review.user.name
            ? formatReviewerName(review.user.name)
            : "Cliente";
          return (
            <article
              key={review.id}
              className="border-b border-[color:var(--color-border-soft)] pb-10 last:border-0"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5 text-accent" aria-label={`${review.rating} de 5 estrellas`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill={s <= review.rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-light uppercase tracking-[0.1em] text-text">
                    {userName}
                  </span>
                  {review.isVerified && (
                    <span className="text-[11px] font-light uppercase tracking-[0.15em] text-text-tertiary">
                      · Compra verificada
                    </span>
                  )}
                </div>
                <time className="text-[11px] font-light uppercase tracking-[0.15em] text-text-tertiary">
                  {review.createdAt.toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>

              <p className="mt-2 text-[11px] font-light uppercase tracking-[0.15em] text-text-tertiary">
                Sobre{" "}
                <Link
                  href={`/coleccion/${review.product.slug}`}
                  className="text-accent transition-colors hover:text-accent-dark"
                >
                  {review.product.name}
                </Link>
              </p>

              <p className="mt-4 max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                {review.comment}
              </p>

              {review.response && (
                <div className="mt-6 border-l border-accent/30 pl-6">
                  <p className="text-[11px] font-light uppercase tracking-[0.2em] text-text-tertiary">
                    Respuesta del orfebre
                  </p>
                  <p className="mt-2 max-w-prose font-serif text-base font-light italic leading-relaxed text-text-secondary">
                    {review.response}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function formatReviewerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || "Cliente";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
