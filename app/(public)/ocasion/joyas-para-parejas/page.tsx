export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getApprovedProducts, getUserFavoriteIds } from "@/lib/queries/products";
import { generateItemListJsonLd, generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Joyas para Parejas — Anillos, Collares y Pulseras | Casa Orfebre",
  description: "Joyas de plata artesanales para parejas. Anillos, collares y pulseras a juego. Diseños únicos con opción de grabado personalizado.",
  alternates: { canonical: "/ocasion/joyas-para-parejas" },
  openGraph: {
    title: "Joyas para Parejas — Anillos, Collares y Pulseras | Casa Orfebre",
    description: "Joyas de plata artesanales para parejas. Anillos, collares y pulseras a juego. Diseños únicos con opción de grabado personalizado.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué joya regalar a mi pareja?",
    answer: "La joya perfecta depende del estilo personal de tu pareja y el tipo de relación. Los anillos son ideales para compromisos significativos o para parejas que buscan algo duradero. Los collares y colgantes son perfectos para uso cotidiano, ofreciendo elegancia sutil. Las pulseras son versátiles, ideales como regalos de aniversario o para parejas que disfrutan de piezas que puedan usar diariamente. Considera el estilo de vida de tu pareja: si es minimalista, busca diseños limpios; si es más osada, explora piezas con grabados o detalles especiales.",
  },
  {
    question: "¿Existen diseños iguales para parejas?",
    answer: "Sí, absolutamente. Muchas de nuestras colecciones incluyen sets diseñados especialmente para parejas, con versiones complementarias para ambos miembros. Estos sets son diseñados para que cada pieza sea hermosa por sí sola, pero juntas cuentan una historia más profunda. Algunos conjuntos son exactamente iguales, mientras que otros son diseños complementarios que se complementan entre sí. Esto permite que ambos miembros de la pareja expresen su amor de manera única.",
  },
  {
    question: "¿Se pueden personalizar?",
    answer: "Sí, todas nuestras joyas pueden ser personalizadas. Ofrecemos grabado con iniciales de ambos, fechas especiales, coordenadas del lugar donde os conocisteis, frases cortas significativas, o símbolos que representen vuestra relación. El grabado no solo agrega valor sentimental, sino que también hace que cada joya sea verdaderamente única. Puedes personalizar una pieza o ambas dentro de un set de pareja.",
  },
  {
    question: "¿Ofrecen envío sorpresa?",
    answer: "Sí, podemos enviar el regalo directamente a tu pareja con empaque especial de regalo. Incluimos un mensaje personalizado o una tarjeta donde puedes escribir tus sentimientos. Contacta con nuestro equipo antes de comprar para coordinar los detalles del envío sorpresa. También ofrecemos servicio de envío a domicilio durante momentos especiales como Día de Enamorados, aniversarios o cualquier fecha importante para ustedes.",
  },
];

export default async function CouplesJewelryPage() {
  const session = await auth();

  // Fetch products by category
  const rings = (await getApprovedProducts({ categorySlug: "anillo" })).slice(0, 4);
  const necklaces = (await getApprovedProducts({ categorySlug: "collar" })).slice(0, 4);
  const bracelets = (await getApprovedProducts({ categorySlug: "pulsera" })).slice(0, 4);

  const favoriteIds = await getUserFavoriteIds(session?.user?.id);

  // Combine all products for JSON-LD
  const allProducts = [...rings, ...necklaces, ...bracelets];

  // Generate JSON-LD
  const itemListJsonLd = generateItemListJsonLd(allProducts);
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
            { label: "Joyas para Parejas" },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-16 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Joyas para Parejas
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-6 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Piezas que conectan dos historias. Diseños artesanales pensados para compartir, con la posibilidad de personalizarlos con grabado.
          </p>
        </div>

        {/* Anillos Section */}
        {rings.length > 0 && (
          <div className="mx-auto mb-16 max-w-7xl">
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl mb-2">
              Anillos para Parejas
            </h2>
            <div className="h-px w-12 bg-accent mb-6" />
            <p className="mb-8 font-sans text-sm text-text-secondary max-w-3xl">
              Los anillos a juego son símbolos tangibles del compromiso compartido. Ya sea como promesa de futuro o celebración del amor presente, nuestros anillos para parejas son diseñados para que cada uno brille con identidad propia, pero juntos completen una historia única. Muchos pueden grabarse con iniciales o fechas especiales.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {rings.map((product: (typeof rings)[number], i: number) => (
                <FadeIn key={product.id} delay={i * 60}>
                  <ProductCard
                    product={product}
                    isFavorited={favoriteIds.has(product.id)}
                    listName="Anillos para Parejas"
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Collares Section */}
        {necklaces.length > 0 && (
          <div className="mx-auto mb-16 max-w-7xl">
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl mb-2">
              Collares para Parejas
            </h2>
            <div className="h-px w-12 bg-accent mb-6" />
            <p className="mb-8 font-sans text-sm text-text-secondary max-w-3xl">
              Los collares complementarios permiten que ambos miembros de la pareja lleven una joya que los conecta día a día. Desde colgantes que se complementan visualmente hasta cadenas delicadas que pueden usarse en cualquier contexto, nuestros collares para parejas combina elegancia con versatilidad. Perfectos para uso cotidiano o como piezas especiales.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {necklaces.map((product: (typeof necklaces)[number], i: number) => (
                <FadeIn key={product.id} delay={i * 60}>
                  <ProductCard
                    product={product}
                    isFavorited={favoriteIds.has(product.id)}
                    listName="Collares para Parejas"
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Pulseras Section */}
        {bracelets.length > 0 && (
          <div className="mx-auto mb-16 max-w-7xl">
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl mb-2">
              Pulseras para Parejas
            </h2>
            <div className="h-px w-12 bg-accent mb-6" />
            <p className="mb-8 font-sans text-sm text-text-secondary max-w-3xl">
              Las pulseras son la opción ideal para parejas activas que desean llevar su compromiso en la muñeca. Desde diseños minimalistas hasta piezas más elaboradas, las pulseras para parejas pueden usarse juntas o por separado, permitiendo flexibilidad en cómo expresan su conexión. Son perfectas como regalos de aniversario o simplemente para celebrar el amor cotidiano.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {bracelets.map((product: (typeof bracelets)[number], i: number) => (
                <FadeIn key={product.id} delay={i * 60}>
                  <ProductCard
                    product={product}
                    isFavorited={favoriteIds.has(product.id)}
                    listName="Pulseras para Parejas"
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Gift Ideas by Occasion */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Ideas de regalo por ocasión
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                San Valentín
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Celebra el amor en su día más especial con joyas que expresan vuestro compromiso. Ya sea un anillo de promesa, un collar personalizado o una pulsera delicada, cada pieza es un recordatorio del amor que compartís día a día. Ofrecemos envío sorpresa y empaque especial para hacer este día aún más memorable.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                Aniversario
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Marcar cada año juntos con una pieza nueva es una tradición especial. Regala joyas que celebren el tiempo compartido y las muchas historias que han vivido como pareja. Los diseños personalizados con fechas o iniciales hacen que cada pieza sea un testimonio duradero de vuestro amor.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                Navidad
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Las joyas artesanales son el regalo perfecto para la temporada navideña. Bajo el árbol, una pieza de joyería para parejas es un regalo que trasciende lo material, simbolizando la importancia de la persona amada en vuestras vidas. Empaque de regalo elegante incluido.
              </p>
            </div>
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
                subtitle: "Cada pieza certificada",
              },
              {
                icon: "📦",
                title: "Envío sorpresa",
                subtitle: "Directo a tu pareja",
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
                    href="/coleccion"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Explorar colección
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
