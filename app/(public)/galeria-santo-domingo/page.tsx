export const revalidate = 3600;

import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getUserFavoriteIds } from "@/lib/queries/products";
import { getArtisansByRegion } from "@/lib/queries/artisans";
import {
  generateFAQJsonLd,
  generateDetailedLocalBusinessJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

export const generateMetadata = (): Metadata => {
  return {
    title:
      "Galería Santo Domingo | Joyería Artesanal Santiago | Casa Orfebre",
    description:
      "Descubre la icónica Galería Santo Domingo en Santiago. Accede a joyería artesanal de plata de orfebres verificados en el corazón de la capital chilena.",
    alternates: { canonical: "/galeria-santo-domingo" },
    openGraph: {
      title: "Galería Santo Domingo | Joyería Artesanal Santiago",
      description:
        "Explora la legendaria Galería Santo Domingo, epicentro de la joyería artesanal chilena con décadas de tradición.",
      images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Galería Santo Domingo | Casa Orfebre",
      description: "La icónica galería de joyería artesanal en Santiago",
      images: ["/casaorfebre-og-image.png"],
    },
  };
};

export default async function GaleriaSantoDomingoPage() {
  const session = await auth();
  const userFavIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : [];

  // Get artisans from Metropolitana region
  const artisans = await getArtisansByRegion("Metropolitana");

  // Get latest products from these artisans
  let products: any[] = [];
  if (artisans.length > 0) {
    products = await prisma.product.findMany({
      where: {
        status: "APPROVED",
        artisanId: { in: artisans.map((a: any) => a.id) },
      },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        artisan: { select: { displayName: true, slug: true } },
      },
    });
  } else {
    products = await prisma.product.findMany({
      where: { status: "APPROVED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
      include: {
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        artisan: { select: { displayName: true, slug: true } },
      },
    });
  }

  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Joyerías", url: "/joyerias" },
    { name: "Galería Santo Domingo", url: "/galeria-santo-domingo" },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  const faqs = [
    {
      question: "¿Dónde está ubicada la Galería Santo Domingo?",
      answer:
        "La Galería Santo Domingo se encuentra en Santo Domingo 1061, Santiago Centro, a pasos de la Estación Plaza de Armas del Metro. Es el edificio histórico más importante para la joyería artesanal en Chile.",
    },
    {
      question: "¿Cómo llegar a Galería Santo Domingo?",
      answer:
        "Puedes llegar en Metro usando la Línea 5 (Verde) hasta la estación Plaza de Armas, luego camina dos cuadras hacia el norte en dirección a Santo Domingo. También hay estacionamiento disponible en la zona. Casa Orfebre ofrece envío a tu domicilio como alternativa.",
    },
    {
      question: "¿Cuál es el horario de la Galería Santo Domingo?",
      answer:
        "La mayoría de los locales en Galería Santo Domingo funcionan de lunes a viernes desde las 9:30 AM hasta las 6:00 PM, y sábados desde las 10:00 AM hasta las 3:00 PM. Algunos negocios tienen horarios extendidos. Se recomienda confirmar directamente con el orfebre antes de visitar.",
    },
    {
      question: "¿Puedo comprar joyería de Galería Santo Domingo en línea?",
      answer:
        "Sí, en Casa Orfebre disponemos de orfebres de la Galería Santo Domingo que venden en línea. Filtra por región Metropolitana y encontrarás sus creaciones con envío seguro a todo el país con seguimiento incluido.",
    },
    {
      question: "¿Las joyas de Galería Santo Domingo incluyen certificado?",
      answer:
        "Todas las joyas de orfebres verificados en Casa Orfebre, incluidos los de Galería Santo Domingo, incluyen certificado de autenticidad que verifica la pureza de la plata (925 o 950) y garantiza la procedencia artesanal.",
    },
    {
      question: "¿Cuál es la historia de la Galería Santo Domingo?",
      answer:
        "Galería Santo Domingo es un ícono de la joyería chilena con más de 40 años de historia. Surgió como centro de concentración de maestros joyeros que perpétúan técnicas ancestrales de platería y orfebrería. Hoy alberga a más de 60 negocios de joyería, desde talleres artesanales hasta tiendas especializadas, consolidándose como destino obligado para coleccionistas y amantes del arte joyero.",
    },
  ];

  const faqJsonLd = generateFAQJsonLd(faqs);
  const localBusinessJsonLd = generateDetailedLocalBusinessJsonLd({
    name: "Galería Santo Domingo",
    description:
      "Ícono histórico de la joyería artesanal chilena. Centro de concentración de más de 60 maestros joyeros y orfebres verificados en el corazón de Santiago.",
    streetAddress: "Santo Domingo 1061",
    city: "Santiago",
    region: "Metropolitana de Santiago",
    postalCode: "8320000",
    lat: -33.6371,
    lng: -70.6643,
  });

  const favSet = new Set(userFavIds);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={localBusinessJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <nav className="mb-8 text-sm">
          <ol className="flex gap-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && <span className="text-text-tertiary">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-text font-medium">{item.name}</span>
                ) : (
                  <Link href={item.url} className="text-accent hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mb-16">
          <div className="mb-4 flex items-center gap-2 text-accent">
            <span>📍</span>
            <span className="text-sm font-light">
              Santiago Centro, Metropolitana
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-6 text-text">
            Galería Santo Domingo
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed max-w-2xl">
            El epicentro histórico de la joyería artesanal chilena. Desde 1980,
            Galería Santo Domingo alberga a más de 60 maestros joyeros que
            perpetúan las más refinadas tradiciones de orfebrería en plata,
            creando piezas de autor que trascienden generaciones.
          </p>
        </div>

        <div className="mb-16 bg-surface rounded-lg p-8">
          <h2 className="font-serif text-2xl font-light text-text mb-6">
            Historia y Tradición
          </h2>
          <div className="space-y-4 text-text-secondary font-light leading-relaxed">
            <p>
              La Galería Santo Domingo representa el alma viva de la artesanía
              joyera chilena. Inaugurada en 1980, se ha consolidado como el
              destino obligado para quienes buscan joyería de autor, donde
              maestros orfebres transmiten técnicas ancestrales de generación en
              generación. En sus pasillos convergen estilos que van desde la
              platería tradicional mapuche hasta el diseño contemporáneo más
              vanguardista.
            </p>
            <p>
              Los orfebres de Galería Santo Domingo trabajan exclusivamente con
              plata 925 y 950, rechazando compromisos en la calidad. Cada pieza
              es resultado de horas de trabajo manual utilizando herramentales
              especializados y técnicas como el martillado, repujado, filigrana
              y fundición a mano. La galería ha sido escenario de la evolución
              artística de familias de joyeros que han contribuido
              significativamente a posicionar la joyería chilena en mercados
              internacionales.
            </p>
            <p>
              Hoy, Galería Santo Domingo es más que un destino comercial: es un
              museo viviente de la orfebrería chilena donde se pueden adquirir
              piezas únicas, personalizadas o de edición limitada. Es un espacio
              donde la pasión por la belleza, la calidad y la autenticidad se
              manifiesta en cada anillo, collar, arete o pulsera. Casa Orfebre
              se enorgullece de conectar a coleccionistas y amantes del arte con
              estos maestros artesanos verificados.
            </p>
          </div>
        </div>

        {artisans.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              title="Orfebres de Galería Santo Domingo"
              subtitle="Maestros artesanos verificados de Santiago"
              as="h2"
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artisans.map((artisan: any, index: number) => (
                <FadeIn key={artisan.id} delay={index * 100}>
                  <Link
                    href={`/orfebres/${artisan.slug}`}
                    className="group block rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="font-serif text-lg font-light text-text group-hover:text-accent">
                      {artisan.displayName}
                    </div>
                    {artisan.specialty && (
                      <p className="mt-1 text-sm text-text-secondary">
                        {artisan.specialty}
                      </p>
                    )}
                    {artisan.location && (
                      <p className="mt-1 text-xs text-text-tertiary">
                        📍 {artisan.location}
                      </p>
                    )}
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              title="Joyas Destacadas"
              subtitle="Creaciones de Galería Santo Domingo"
              as="h2"
            />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <FadeIn key={product.id} delay={index * 100}>
                  <ProductCard
                    product={product as any}
                    isFavorited={favSet.has(product.id)}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16 bg-surface-secondary rounded-lg p-8">
          <h2 className="font-serif text-2xl font-light text-text mb-6">
            Información Práctica
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Ubicación
              </h3>
              <p className="text-text-secondary font-light">
                Santo Domingo 1061, Santiago Centro
                <br />
                Región Metropolitana, Chile
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Cómo Llegar
              </h3>
              <p className="text-text-secondary font-light">
                Metro Línea 5 (Verde) - Estación Plaza de Armas. Camina 2
                cuadras hacia el norte.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Horarios Usuales
              </h3>
              <p className="text-text-secondary font-light">
                Lunes a Viernes: 9:30 AM - 6:00 PM
                <br />
                Sábados: 10:00 AM - 3:00 PM
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text mb-3">
                Alternativa en Línea
              </h3>
              <p className="text-text-secondary font-light">
                Compra desde casa con envío seguro. Casa Orfebre ofrece todas
                las creaciones de Galería Santo Domingo con certificado.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 prose prose-invert max-w-none">
          <h2 className="font-serif text-2xl font-light text-text mb-6">
            Por Qué Galería Santo Domingo es Única
          </h2>
          <p className="text-text-secondary leading-relaxed whitespace-pre-wrap font-light">
            Galería Santo Domingo destaca por ser el único espacio en Chile
            donde se concentran más de 60 orfebres bajo un mismo techo, creando
            una experiencia inmersiva en el mundo de la joyería artesanal. No es
            un centro comercial convencional, sino una institución cultural que
            ha evolucionado con la demanda local e internacional de joyería de
            autor.

Cada local dentro de la galería es un taller-tienda donde se
            puede ver a maestros joyeros trabajando en vivo, explicando técnicas
            y personalizando piezas según los deseos del cliente. Esta
            interacción directa entre artesano y comprador es invaluable,
            permitiendo comprender el valor real de la joyería artesanal más
            allá del precio.

La galería también es epicentro de innovación joyera. Mientras
            algunos maestros preservan técnicas ancestrales de la platería
            chilena, otros experimentan con fusiones entre plata, acero,
            maderas nobles y piedras semipreciosas. Esta diversidad de estilos
            garantiza que, sin importar tus preferencias estéticas, encontrarás
            la pieza perfecta.

En términos de calidad, Galería Santo Domingo es sinónimo de
            garantía. Décadas de reputación aseguran que cada joya cumple con
            estándares rigurosos de pureza en plata, acabados impecables y
            diseño audaz. Muchos orfebres de la galería participan en
            exposiciones internacionales y han ganado premios que avalan su
            talento.

Casa Orfebre se enorgullece de ser el primer marketplace digital
            de joyería artesanal chilena que conecta directamente con los
            maestros de Galería Santo Domingo, llevando sus creaciones a
            compradores en todo el país sin intermediarios innecesarios.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="font-serif text-2xl font-light text-text mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-border pb-6 last:border-0"
              >
                <h3 className="font-serif text-lg font-light text-text mb-3">
                  {faq.question}
                </h3>
                <p className="text-text-secondary font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border">
          <p className="text-text-secondary mb-4">
            Explora otras joyerías artesanales en Santiago
          </p>
          <Link
            href="/joyerias/santiago"
            className="inline-flex items-center gap-2 text-accent hover:underline font-light"
          >
            Ver más joyerías en Santiago →
          </Link>
        </div>
      </div>
    </>
  );
}
