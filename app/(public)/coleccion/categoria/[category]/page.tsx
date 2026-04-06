import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { JsonLd } from "@/components/seo/json-ld";

import type { Metadata } from "next";

export const revalidate = 300;
export const dynamic = "force-static";

const CATEGORY_SEO: Record<
  string,
  { h1: string; description: string; faqs: { q: string; a: string }[] }
> = {
  anillos: {
    h1: "Anillos Artesanales de Chile",
    description:
      "Descubre anillos únicos hechos a mano por orfebres chilenos. Plata 950, oro 18k, piedras naturales y diseños de autor con certificado de autenticidad.",
    faqs: [
      {
        q: "¿Los anillos artesanales se pueden ajustar de talla?",
        a: "Sí, la mayoría de nuestros orfebres ofrecen ajuste de talla. Cada ficha de producto indica las tallas disponibles y si se puede ajustar arriba o abajo.",
      },
      {
        q: "¿Qué materiales usan los orfebres para anillos?",
        a: "Los materiales más comunes son plata 950 y oro 18k. Algunos orfebres trabajan también con cobre, bronce y aleaciones experimentales.",
      },
      {
        q: "¿Puedo pedir un anillo personalizado?",
        a: "Sí, muchos de nuestros orfebres aceptan encargos personalizados. Busca productos marcados como 'Personalizable' o contacta al orfebre directamente.",
      },
    ],
  },
  aros: {
    h1: "Aros de Autor Hechos a Mano",
    description:
      "Aros artesanales únicos de orfebres chilenos verificados. Desde argollas minimalistas hasta diseños con piedras naturales.",
    faqs: [
      {
        q: "¿Los aros artesanales son hipoalergénicos?",
        a: "Los aros de plata 950 y oro 18k son generalmente hipoalergénicos. Recomendamos verificar los materiales en la descripción de cada pieza.",
      },
      {
        q: "¿Cómo cuidar aros de plata artesanales?",
        a: "Guárdalos en un lugar seco, evita el contacto con perfumes y cloro. Límpialos con un paño suave cuando pierdan brillo.",
      },
      {
        q: "¿Se pueden hacer aros a pedido?",
        a: "Sí, los productos marcados como 'Hecha por Encargo' se fabrican tras la compra según tus especificaciones.",
      },
    ],
  },
  collares: {
    h1: "Collares Artesanales Únicos",
    description:
      "Collares hechos a mano por orfebres independientes de Chile. Cadenas de plata, gargantillas con piedras y diseños contemporáneos.",
    faqs: [
      {
        q: "¿Los collares incluyen cadena?",
        a: "Depende del producto. Los colgantes y dijes pueden venderse con o sin cadena — revisa la ficha del producto para confirmar.",
      },
      {
        q: "¿Qué largo de cadena es el más común?",
        a: "Los largos más populares son 40cm (gargantilla), 45cm (estándar) y 60cm (largo). Cada ficha indica el largo exacto.",
      },
      {
        q: "¿Puedo elegir el largo de cadena?",
        a: "Muchos orfebres ofrecen opciones de largo. Contacta al orfebre a través de la ficha del producto para consultar.",
      },
    ],
  },
  pulseras: {
    h1: "Pulseras Artesanales de Plata",
    description:
      "Pulseras únicas de orfebres chilenos. Brazaletes, cadenas y esclavas en plata 950 y oro con diseños de autor.",
    faqs: [
      {
        q: "¿Las pulseras artesanales se ajustan?",
        a: "Las pulseras de eslabones tienen cierre ajustable. Los brazaletes rígidos vienen en tallas específicas indicadas en la ficha.",
      },
      {
        q: "¿Puedo usar la pulsera todos los días?",
        a: "Sí, la plata 950 y el oro 18k son resistentes al uso diario. Evita sumergirlas en agua con cloro o exponerlas a químicos.",
      },
      {
        q: "¿Se pueden personalizar las pulseras?",
        a: "Sí, muchos orfebres ofrecen grabado o personalización en pulseras. Busca productos marcados como 'Personalizable'.",
      },
    ],
  },
  colgantes: {
    h1: "Colgantes y Dijes Artesanales",
    description:
      "Colgantes y dijes hechos a mano en Chile. Piezas únicas en plata, oro y piedras naturales con certificado de autenticidad.",
    faqs: [
      {
        q: "¿Cuál es la diferencia entre colgante y dije?",
        a: "Un colgante es una pieza más grande diseñada como foco del collar. Un dije es más pequeño y puede combinarse con otros en una cadena.",
      },
      {
        q: "¿Los colgantes vienen con cadena?",
        a: "Varía por producto. Algunos incluyen cadena y otros se venden por separado. La ficha del producto lo especifica claramente.",
      },
      {
        q: "¿Puedo elegir la piedra del colgante?",
        a: "En muchos casos sí. Los productos personalizables permiten elegir la piedra específica en coordinación con el orfebre.",
      },
    ],
  },
};

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const cat = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });
  if (!cat) return { title: "Categoría no encontrada" };

  const seo = CATEGORY_SEO[slug];
  const title = seo?.h1 || `${cat.name} Artesanales`;
  const description =
    seo?.description ||
    `Explora ${cat.name.toLowerCase()} artesanales hechos a mano por orfebres chilenos verificados.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://casaorfebre.cl/coleccion/categoria/${slug}`,
    },
    openGraph: {
      title: `${title} | Casa Orfebre`,
      description,
      siteName: "Casa Orfebre",
      locale: "es_CL",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Casa Orfebre`,
      description,
      creator: "@casaorfebre",
      site: "@casaorfebre",
    },
  };
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!category) notFound();

  const [products, artisans] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        categories: { some: { slug } },
      },
      include: {
        artisan: { select: { displayName: true, slug: true } },
        images: {
          where: { status: "APPROVED" },
          orderBy: { position: "asc" },
          take: 1,
        },
        materials: { select: { id: true, name: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 48,
    }),
    prisma.artisan.findMany({
      where: {
        status: "APPROVED",
        products: { some: { status: "APPROVED", categories: { some: { slug } } } },
      },
      select: {
        displayName: true,
        slug: true,
        profileImage: true,
        specialty: true,
      },
      take: 6,
    }),
  ]);

  const seo = CATEGORY_SEO[slug];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: seo?.h1 || `${category.name} Artesanales`,
      url: `${baseUrl}/coleccion/categoria/${slug}`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: products.length,
        itemListElement: products.slice(0, 20).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            url: `${baseUrl}/coleccion/${p.slug}`,
            ...(p.images[0]?.url ? { image: p.images[0].url } : {}),
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: "CLP",
              availability:
                p.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          },
        })),
      },
    },
  ];

  // FAQ schema
  if (seo?.faqs) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
  }

  return (
    <>
      {jsonLd.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          title={seo?.h1 || `${category.name} Artesanales`}
          subtitle={
            seo?.description ||
            `Piezas de ${category.name.toLowerCase()} hechas a mano por orfebres chilenos`
          }
          as="h1"
        />

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 50}>
                <ProductCard
                  product={product}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <p className="mt-16 text-center text-sm text-text-secondary">
            No hay piezas en esta categoría todavía.
          </p>
        )}

        {/* Artisans who create this category */}
        {artisans.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-xl font-light text-text">
              Orfebres que crean {category.name.toLowerCase()}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {artisans.map((a) => (
                <Link
                  key={a.slug}
                  href={`/orfebres/${a.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 transition-colors hover:border-accent/30"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-accent/10">
                    {a.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.profileImage}
                        alt={a.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-serif text-sm text-accent">
                        {a.displayName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary text-center group-hover:text-accent transition-colors">
                    {a.displayName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        {seo?.faqs && (
          <div className="mt-20">
            <h2 className="font-serif text-xl font-light text-text mb-8">
              Preguntas frecuentes
            </h2>
            <div className="space-y-6">
              {seo.faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-lg border border-border p-6"
                >
                  <h3 className="font-medium text-text">{faq.q}</h3>
                  <p className="mt-2 text-sm font-light text-text-secondary">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
