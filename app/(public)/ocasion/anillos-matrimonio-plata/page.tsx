export const revalidate = 60;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProducts } from "@/lib/queries/products";
import { generateItemListJsonLd, generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Argollas de Matrimonio en Plata — Plata 925 y 950 | Casa Orfebre",
  description: "Argollas de matrimonio en plata artesanal. Plata 925 y 950 con opciones de grabado personalizado. Hechas a mano por orfebres chilenos verificados.",
  alternates: { canonical: "/ocasion/anillos-matrimonio-plata" },
  openGraph: {
    title: "Argollas de Matrimonio en Plata — Plata 925 y 950 | Casa Orfebre",
    description: "Argollas de matrimonio en plata artesanal. Plata 925 y 950 con opciones de grabado personalizado.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué plata es mejor para argollas de matrimonio?",
    answer: "Ambas son excelentes opciones. La plata 950 ofrece mayor pureza (95% de plata pura) lo que le da un brillo blanco más intenso y duradero, además de ser más blanda, permitiendo grabados más detallados. La plata 925 (92.5% de plata pura) es ligeramente más dura y resistente al desgaste cotidiano, con una durabilidad excepcional. La elección depende de tu preferencia: elige 950 si buscas máximo brillo y pureza, o 925 si prefieres mayor dureza para un uso intenso.",
  },
  {
    question: "¿Se pueden grabar las argollas?",
    answer: "Sí, absolutamente. Ofrecemos grabado personalizado en todas nuestras argollas. Puedes grabar iniciales de ambos cónyuges, la fecha del matrimonio, una frase corta significativa, o símbolos especiales. El grabado agrega un toque profundamente personal a estas piezas tan importantes, haciendo cada par único y memorable.",
  },
  {
    question: "¿Cuál es la diferencia entre plata 925 y 950?",
    answer: "La diferencia radica en la pureza: la plata 950 contiene 95% de plata pura y 5% de otros metales, mientras que la 925 contiene 92.5% de plata pura y 7.5% de otros metales. La 950 es más pura, lo que le da un brillo blanco superior, pero es más blanda. La 925 es más dura y duradera para el uso diario. En términos de precio, la 950 es ligeramente más cara. Ambas son hipoalergénicas y excelentes para argollas de matrimonio.",
  },
  {
    question: "¿Cuánto cuestan argollas de matrimonio en plata?",
    answer: "El precio varía según el ancho, diseño, tipo de plata y personalizaciones. En Casa Orfebre, nuestras argollas de matrimonio en plata comienzan desde aproximadamente $30.000 el par para diseños clásicos en plata 925, y pueden alcanzar $150.000 o más para piezas más elaboradas o en plata 950. Cada par es hecho a mano, lo que garantiza calidad artesanal en cada detalle.",
  },
];

export default async function WeddingRingsPage() {

  // Fetch products - try occasion filter first, fallback to rings category
  let products = await getApprovedProducts({ occasionSlug: "matrimonio" });
  if (products.length === 0) {
    products = await getApprovedProducts({ categorySlug: "anillo" });
  }

  // Generate JSON-LD
  const itemListJsonLd = generateItemListJsonLd(products);
  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Ocasiones", href: "/ocasion" },
            { label: "Matrimonio" },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-16 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Argollas de Matrimonio en Plata
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-6 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Dos anillos que representan una vida juntos, forjados a mano con la dedicación que ese compromiso merece.
          </p>
        </div>

        {/* Educational Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Argollas de Matrimonio Artesanales
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-6 font-sans text-sm leading-relaxed text-text-secondary space-y-4">
            <p>
              Las argollas de matrimonio son símbolos del compromiso eterno entre dos personas. En Casa Orfebre, cada par es forjado a mano por orfebres chilenos especializados, garantizando que cada anillo sea una pieza única que represente la singularidad de vuestra relación.
            </p>
            <p>
              Ofrecemos argollas en plata 925 y plata 950, ambas opciones excelentes según vuestras preferencias. Disponibles en diferentes anchos que permiten adaptarse a distintos estilos personales. Todas nuestras argollas incluyen la opción de grabado personalizado, permitiendo grabar iniciales, fechas o frases significativas que hagan de cada par una reliquia familiar.
            </p>
            <p>
              La artesanía detrás de cada par garantiza no solo belleza, sino durabilidad para que estas piezas sean portadas con orgullo todos los días de vuestra vida juntos. Cada argolla incluye certificado de autenticidad y garantía de calidad.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="mb-16">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {products.map((product: (typeof products)[number], i: number) => (
                <FadeIn key={product.id} delay={i * 60}>
                  <ProductCard
                    product={product}
                    listName="Argollas de Matrimonio"
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-16 text-center">
            <p className="font-sans text-sm text-text-secondary">
              Próximamente nuevas piezas en esta categoría.
            </p>
          </div>
        )}

        {/* 925 vs 950 Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            925 vs 950 para Argollas
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-6 font-sans text-sm leading-relaxed text-text-secondary">
            <p>
              Ambos tipos de plata son excelentes para argollas de matrimonio, cada una con sus propias ventajas. La plata 950 destaca por su mayor pureza, brindando un brillo blanco más intenso que resalta la elegancia de cualquier diseño. Es ideal si deseas el máximo en pureza y brillo. La plata 925, siendo más dura, ofrece una resistencia superior al desgarre cotidiano, siendo perfecta si buscas una joya para usar intensamente todos los días. Muchas parejas optan por la 925 para mayor durabilidad, mientras que otras eligen la 950 por su superior brillo y pureza. Ambas son hipoalergénicas y construidas para durar toda una vida.
            </p>
          </div>
        </div>

        {/* Personalization Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Personaliza tus Argollas
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-6 font-sans text-sm leading-relaxed text-text-secondary">
            <p>
              El grabado personalizado transforma cada argolla en una pieza única que cuenta vuestra historia. Puedes grabar iniciales de ambos cónyuges en orden tradicional, la fecha exacta de vuestro matrimonio en diferentes formatos, una frase corta pero significativa que represente vuestro amor, o incluso coordenadas del lugar donde os conocisteis. Nuestros orfebres especializados aseguran que cada grabado sea perfecto, duradero y hermoso. Esta personalización hace que las argollas sean verdaderamente vuestras, un regalo que trasciende lo material.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Preguntas Frecuentes
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <dl className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-sans text-base font-medium text-text">
                  {faq.question}
                </dt>
                <dd className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Trust Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              {
                icon: "✏️",
                title: "Grabado personalizado",
                subtitle: "Iniciales, fechas o frases",
              },
              {
                icon: "✓",
                title: "Certificado de autenticidad",
                subtitle: "Cada pareja certificada",
              },
              {
                icon: "📦",
                title: "Envío seguro",
                subtitle: "Embalaje de lujo",
              },
              {
                icon: "⏱",
                title: "Garantía 14 días",
                subtitle: "Cambio sin preguntas",
              },
            ].map((badge) => (
              <div key={badge.title} className="text-center">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h3 className="font-sans text-sm font-medium text-text">
                  {badge.title}
                </h3>
                <p className="mt-1 font-sans text-xs text-text-secondary">
                  {badge.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Links Section */}
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text">
            Explora más
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Otras ocasiones
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/ocasion"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Todas las ocasiones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/coleccion/anillos"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Todos los anillos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orfebres"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Conocer a los orfebres
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Información útil
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link
                    href="/preguntas-frecuentes"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Preguntas frecuentes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/garantia"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Garantía y devoluciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
