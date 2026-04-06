export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProducts } from "@/lib/queries/products";
import { generateItemListJsonLd, generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Joyas para el Día de la Madre — Regalos Artesanales | Casa Orfebre",
  description: "Joyas de plata artesanales para el Día de la Madre. Regalos únicos hechos a mano: collares, aros, pulseras y anillos. Envío a todo Chile.",
  alternates: { canonical: "/ocasion/joyas-dia-de-la-madre" },
  openGraph: {
    title: "Joyas para el Día de la Madre — Regalos Artesanales | Casa Orfebre",
    description: "Joyas de plata artesanales para el Día de la Madre. Regalos únicos hechos a mano: collares, aros, pulseras y anillos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué joya regalar para el Día de la Madre?",
    answer: "Los aros y collares son las joyas más populares para regalar en el Día de la Madre. Los aros son versátiles, elegantes y pueden usarse en múltiples ocasiones. Los collares, especialmente con colgantes significativos, son perfectos porque se usan cerca del corazón. Las pulseras son ideales para madres activas que desean llevar elegancia en la vida cotidiana. Los anillos son especiales para madres que buscan piezas más elaboradas. La elección ideal depende del estilo personal de tu madre y cómo le gusta expresar su elegancia.",
  },
  {
    question: "¿Puedo enviar el regalo directamente?",
    answer: "Sí, absolutamente. Ofrecemos envío directo a domicilio con empaque especial de regalo. Puedes incluir una tarjeta personalizada con un mensaje de amor para tu madre. Contacta con nuestro equipo para coordinar los detalles del envío y asegurar que llegue en la fecha exacta que deseas. También ofrecemos envío express para compras de último minuto.",
  },
  {
    question: "¿Llega a tiempo para el Día de la Madre?",
    answer: "Recomendamos hacer tu compra con al menos 5 a 7 días de anticipación para garantizar que la joya llegue a tiempo. Si compras con menor tiempo, ofrecemos opciones de envío express. El Día de la Madre es una fecha especial que planificamos cuidadosamente para asegurar que cada regalo llegue en perfectas condiciones y en el momento exacto. Contacta con nosotros si tienes dudas sobre disponibilidad de envío.",
  },
  {
    question: "¿Incluye certificado de autenticidad?",
    answer: "Sí, todas nuestras piezas de joyería incluyen certificado digital de autenticidad que verifica la pureza de la plata, el diseño artesanal y la calidad de la confección. Este certificado es importante para documentar el valor y la autenticidad del regalo. Puedes compartir este certificado con tu madre como parte del regalo, añadiendo aún más valor sentimental a la joya.",
  },
];

export default async function MothersDayJewelryPage() {

  // Fetch products - latest 8 items across all categories
  let allProducts = await getApprovedProducts({});
  const featuredProducts = allProducts.slice(0, 8);

  // Generate JSON-LD
  const itemListJsonLd = generateItemListJsonLd(featuredProducts);
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
            { label: "Día de la Madre" },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-16 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Joyas para el Día de la Madre
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-6 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Un regalo hecho a mano dice más que mil palabras. Encuentra la pieza perfecta para la persona más importante.
          </p>
        </div>

        {/* Budget Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Regalos por Presupuesto
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-8 space-y-6">
            <div className="border-l-4 border-accent pl-4">
              <h3 className="font-sans text-base font-medium text-text mb-2">
                Hasta $30.000
              </h3>
              <p className="font-sans text-sm text-text-secondary mb-3">
                Joyas delicadas y hermosas que no requieren gran inversión. Encontrarás aros pequeños, colgantes sencillos, pulseras finas y anillos minimalistas. Ideales para regalar sin culpas o para formar una colección junto con otras piezas.
              </p>
              <Link
                href="/regalos-bajo-30000"
                className="font-sans text-sm text-accent transition-colors hover:text-accent-dark underline"
              >
                Ver piezas hasta $30.000
              </Link>
            </div>
            <div className="border-l-4 border-accent pl-4">
              <h3 className="font-sans text-base font-medium text-text mb-2">
                $30.000 - $70.000
              </h3>
              <p className="font-sans text-sm text-text-secondary mb-3">
                Joyas de mayor envergadura y detalle. Pulseras con diseños elaborados, anillos statement, collares con colgantes especiales. Estas piezas hacen regalos significativos que tu madre podrá usar en múltiples ocasiones.
              </p>
              <Link
                href="/regalos-bajo-50000"
                className="font-sans text-sm text-accent transition-colors hover:text-accent-dark underline"
              >
                Ver piezas entre $30.000 y $70.000
              </Link>
            </div>
            <div className="border-l-4 border-accent pl-4">
              <h3 className="font-sans text-base font-medium text-text mb-2">
                Sobre $70.000
              </h3>
              <p className="font-sans text-sm text-text-secondary mb-3">
                Sets completos, piezas de autor, colecciones especiales. Estos son regalos extraordinarios para madres que aprecian la artesanía de nivel superior. Inversiones que trascenderán generaciones como reliquias familiares.
              </p>
              <Link
                href="/regalos-bajo-100000"
                className="font-sans text-sm text-accent transition-colors hover:text-accent-dark underline"
              >
                Ver piezas sobre $70.000
              </Link>
            </div>
          </div>
        </div>

        {/* Mother Types Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Ideas por tipo de mamá
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                La mamá clásica
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Ella aprecia la elegancia intemporal y los diseños que nunca pasan de moda. Regálale collares de perla en plata, aros argolla clásicos, o anillos con líneas limpias. Las piezas atemporales son perfectas para quien valora la sofisticación silenciosa.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                La mamá moderna
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Busca joyas que reflejen el momento actual y su personalidad forward-thinking. Los anillos statement, pulseras stacking y collares con formas geométricas son perfectos. Considera piezas que puedan combinarse de múltiples formas para expresar su estilo dinámico.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                La mamá minimalista
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Ella valora la simplicidad y la funcionalidad. Regálale cadenas finas, studs discretos, o anillos minimalistas. Las piezas que se pueden usar diariamente sin ser demasiado llamativas son ideales. La elegancia reside en la sutileza.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-base font-medium text-text mb-2">
                La mamá espiritual
              </h3>
              <p className="font-sans text-sm text-text-secondary">
                Ella busca significado profundo en cada pieza. Los relicarios, medallas significativas, o joyas con piedras naturales son perfectos. Considera piezas que conecten con sus creencias o valores. El grabado personalizado agrega un nivel adicional de significado.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl mb-2">
              Colección Destacada
            </h2>
            <div className="h-px w-12 bg-accent mb-6" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {featuredProducts.map((product: (typeof featuredProducts)[number], i: number) => (
                <FadeIn key={product.id} delay={i * 60}>
                  <ProductCard
                    product={product}
                    listName="Día de la Madre"
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

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
                subtitle: "Iniciales o fechas especiales",
              },
              {
                icon: "✓",
                title: "Certificado de autenticidad",
                subtitle: "Cada pieza certificada",
              },
              {
                icon: "📦",
                title: "Envío especial",
                subtitle: "Empaque de regalo incluido",
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
