export const revalidate = 60;

import Link from "next/link";
import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { ProductCard } from "@/components/products/product-card";
import { ArtisanCard } from "@/components/artisans/artisan-card";
import { Button } from "@/components/ui/button";
import { getLatestProducts, getCuratorPicks, getUserFavoriteIds } from "@/lib/queries/products";
import { getFeaturedArtisans, getMaestroArtisans } from "@/lib/queries/artisans";
import { MaestroCarousel } from "@/components/artisans/maestro-carousel";
import { HeroSection } from "@/components/home/hero-section";
import { BuyerTour } from "@/components/guided-tour/BuyerTour";
import { auth } from "@/lib/auth";
import { generateOrganizationJsonLd, generateLocalBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Casa Orfebre",
  url: BASE_URL,
};

export default async function HomePage() {
  const session = await auth();
  const [products, artisans, maestros, curatorPicks, favoriteIds] = await Promise.all([
    getLatestProducts(8),
    getFeaturedArtisans(3),
    getMaestroArtisans(),
    getCuratorPicks(4),
    getUserFavoriteIds(session?.user?.id),
  ]);

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={generateOrganizationJsonLd()} />
      <JsonLd data={generateLocalBusinessJsonLd()} />
      {/* ─── 1. Hero Section ─── */}
      <HeroSection />
      <BuyerTour isLoggedIn={!!session?.user?.id} />

      {/* ─── 2. Trust Bar ─── */}
      <section className="border-y border-border bg-surface" data-tour="hero-garantias">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_ITEMS.map((item, i) => (
            <FadeIn key={item.title} delay={i * 80}>
              <div className="flex flex-col items-center text-center">
                <div className="text-accent">{item.icon}</div>
                <p className="mt-3 text-sm font-medium text-text">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── 3. Why Casa Orfebre ─── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading
              title="¿Por qué comprar en Casa Orfebre?"
              subtitle="Una experiencia superior a comprar por redes sociales"
            />
          </FadeIn>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_PROPS.map((prop, index) => (
              <FadeIn key={prop.title} delay={index * 100}>
                <div className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center text-accent">
                    {prop.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-text">
                    {prop.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {prop.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Featured Artisans ─── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading title="Orfebres Destacados" />
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((artisan, i) => (
              <FadeIn key={artisan.id} delay={i * 120}>
                <ArtisanCard artisan={artisan} />
              </FadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/orfebres"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              Ver todos los orfebres &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4.5. Orfebres Maestros ─── */}
      {maestros.length > 0 && (
        <section className="border-y border-border bg-surface/50 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                title="Orfebres Maestros"
                subtitle="Los mejores artesanos de nuestra comunidad"
              />
            </FadeIn>

            <div className="mt-12">
              <FadeIn delay={120}>
                <MaestroCarousel artisans={maestros} />
              </FadeIn>
            </div>
          </div>
        </section>
      )}

      {/* ─── 4.7. Selección del Curador ─── */}
      {curatorPicks.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <SectionHeading
                title="Selección del Curador ✦"
                subtitle="Elegidas a mano por nuestro equipo"
              />
            </FadeIn>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {curatorPicks.map((product, i) => (
                <FadeIn key={product.id} delay={i * 100}>
                  <Link href={`/coleccion/${product.slug}`} className="group block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-background">
                      {product.images[0]?.url ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].altText ?? product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface text-text-tertiary">
                          {product.name}
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-[#8B7355]/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                        Selección ✦
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-light text-text-tertiary">
                        {product.artisan.displayName}
                      </p>
                      <h3 className="font-serif text-base font-medium text-text">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium text-text">
                        ${product.price.toLocaleString("es-CL")}
                      </p>
                    </div>
                    {product.curatorNote && (
                      <p className="mt-2 text-xs italic text-text-secondary line-clamp-2">
                        「{product.curatorNote}」
                      </p>
                    )}
                  </Link>
                </FadeIn>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/seleccion-del-curador"
                className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
              >
                Ver todas las selecciones &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5. Latest Products ─── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionHeading title="Últimas Piezas" />
          </FadeIn>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 80}>
                <ProductCard product={product} isFavorited={favoriteIds.has(product.id)} />
              </FadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/coleccion"
              className="text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              Ver toda la colección &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. CTA — Artisan Recruitment ─── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
              ¿Eres Orfebre?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-text-secondary">
              Únete a nuestra comunidad de artesanos verificados
            </p>
            <div className="mt-8">
              <Link href="/postular">
                <Button variant="secondary" size="lg">
                  Postular como Orfebre
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}

/* ─── Static Data ─── */

const TRUST_ITEMS = [
  {
    title: "Autenticidad Garantizada",
    description: "Cada pieza verificada",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Certificado Digital",
    description: "QR verificable incluido",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Envío a Todo Chile",
    description: "Seguimiento en tiempo real",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Orfebres Verificados",
    description: "Proceso de curaduría",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
];

const VALUE_PROPS = [
  {
    title: "Pago seguro con tarjeta",
    description: "No necesitas transferir a una cuenta desconocida",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: "Garantía de 14 días",
    description: "Algo que no existe comprando por Instagram",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Certificado de autenticidad",
    description: "QR verificable con cada pieza que compras",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" rx="0.5" />
        <path d="M22 14h-4v4" />
        <path d="M22 22h-8v-4" />
      </svg>
    ),
  },
  {
    title: "Tracking de envío real",
    description: "Sigue tu pedido en tiempo real, no promesas vagas",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: "Orfebres verificados",
    description: "Cada artesano pasa por nuestro proceso de curaduría",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <polyline points="16 11 18 13 22 9" />
      </svg>
    ),
  },
  {
    title: "Fotos y descripciones profesionales",
    description: "Sabes exactamente lo que estás comprando",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
];
