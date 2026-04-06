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
  title: "Anillos de Promesa y Compromiso de Plata | Casa Orfebre",
  description: "Anillos de promesa y compromiso en plata artesanal. Diseños únicos hechos a mano con grabado personalizado. Encuentra el anillo perfecto para ese momento especial.",
  alternates: { canonical: "/ocasion/anillos-de-compromiso-plata" },
  openGraph: {
    title: "Anillos de Promesa y Compromiso de Plata | Casa Orfebre",
    description: "Anillos de promesa y compromiso en plata artesanal. Diseños únicos hechos a mano.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿Qué significa un anillo de promesa?",
    answer: "Un anillo de promesa simboliza un compromiso especial entre dos personas. Puede representar una promesa de amor, amistad, fidelidad o cualquier tipo de pacto significativo. Es una forma de expresar un compromiso antes de un paso mayor, como un matrimonio, o simplemente de sellar un momento importante en la relación.",
  },
  {
    question: "¿En qué dedo va el anillo de promesa?",
    answer: "Tradicionalmente en Chile, el anillo de promesa se usa en el anular de la mano derecha. Sin embargo, esta convención puede variar según la cultura y preferencia personal. Algunos lo usan en el dedo índice o medio. Lo importante es que sea significativo para la pareja que lo comparte.",
  },
  {
    question: "¿Cuál es la diferencia entre anillo de promesa y de compromiso?",
    answer: "El anillo de promesa puede simbolizar cualquier tipo de compromiso importante (amor, amistad, promesa personal), mientras que el anillo de compromiso es específicamente la joya que precede al matrimonio. El de promesa suele ser más flexible en diseño y puede usarse antes de la propuesta formal, mientras que el de compromiso es más una declaración directa de intención matrimonial.",
  },
  {
    question: "¿Los anillos de plata son buenos para compromiso?",
    answer: "Sí, absolutamente. La plata 925 es hipoalergénica, duradera y hermosa. Es una opción más accesible que otros metales preciosos sin sacrificar calidad. La plata artesanal permite diseños más elaborados y personalizados, lo que hace que un anillo de plata sea una opción excelente para un momento tan especial.",
  },
  {
    question: "¿Cuánto cuesta un anillo de compromiso de plata en Chile?",
    answer: "El precio varía según el diseño, complejidad y presencia de piedras. Los anillos de plata artesanal en Casa Orfebre van desde aproximadamente $15.000 hasta $150.000 o más, dependiendo de si incluyen piedras preciosas, grabados adicionales o diseños muy elaborados. Cada pieza es única y hecha a mano.",
  },
  {
    question: "¿Se puede grabar un anillo de plata?",
    answer: "Sí, muchos orfebres artesanales ofrecen grabado personalizado en anillos de plata. Puedes grabar iniciales, fechas, frases cortas o símbolos especiales. El grabado agrega un toque muy personal y significativo al anillo, convirtiéndolo en una pieza verdaderamente única para ese momento especial.",
  },
];

export default async function PromiseRingsPage() {

  // Fetch products - try occasion filter first, fallback to rings category
  let products = await getApprovedProducts({ occasionSlug: "compromiso" });
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
            { label: "Anillos de Compromiso" },
          ]}
        />

        {/* Hero Section */}
        <div className="mb-16 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            Anillos de Promesa y Compromiso
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-6 font-sans text-lg font-light leading-relaxed text-text-secondary">
            Cada promesa merece una pieza única, hecha a mano con el cuidado que ese momento merece.
          </p>
        </div>

        {/* Educational Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            ¿Qué es un anillo de promesa?
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-6 font-sans text-sm leading-relaxed text-text-secondary space-y-4">
            <p>
              Un anillo de promesa es una pieza de joyería que simboliza un compromiso especial entre dos personas. A diferencia del anillo de matrimonio, el anillo de promesa puede representar muchas cosas diferentes: una promesa de futuro matrimonio, un compromiso de amor, una amistad profunda, o simplemente sellar un pacto importante.
            </p>
            <p>
              En la tradición chilena, estos anillos han ganado popularidad como una forma moderna de expresar un compromiso significativo. Son perfectos para parejas que desean marcar un momento importante en su relación, pero que aún no están listos para el matrimonio, o simplemente para aquellos que quieren una pieza que represente su amor de una manera más personal y única.
            </p>
            <p>
              Lo especial de los anillos de promesa artesanales es que pueden ser completamente personalizados. Desde el material y el diseño hasta los detalles más pequeños, cada anillo cuenta una historia única y refleja la individualidad de quienes lo usan.
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
                    listName="Anillos de Compromiso"
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

        {/* How to Choose Guide */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            ¿Cómo elegir tu anillo de promesa?
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                number: "1",
                title: "Elige el estilo",
                description: "Decide si prefieres un anillo liso y minimalista, con piedra (diamante, zafiro, etc.) o con grabados decorativos. Considera tu gusto personal y el de tu pareja.",
              },
              {
                number: "2",
                title: "Conoce la talla",
                description: "Es importante medir correctamente la talla del anillo. Puedes usar una talla guía o medir un anillo que ya uses. Consulta nuestra tabla de tallas para convertir entre sistemas.",
              },
              {
                number: "3",
                title: "Elige el material",
                description: "Ofrecemos plata 925 y 950. La plata 925 es más accesible, mientras que la 950 es más pura. Ambas son durables, hipoalergénicas y hermosas.",
              },
              {
                number: "4",
                title: "Personaliza tu anillo",
                description: "Agrega grabado con iniciales, una fecha especial o una frase corta que sea significativa para ustedes. Esto hace el anillo verdaderamente único.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <span className="font-sans text-sm font-medium text-white">
                      {step.number}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-sans text-base font-medium text-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-sans text-sm text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ring Size Table */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Tabla de Tallas
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-text">Chile</th>
                  <th className="px-4 py-3 text-left font-medium text-text">US</th>
                  <th className="px-4 py-3 text-left font-medium text-text">EU</th>
                  <th className="px-4 py-3 text-left font-medium text-text">UK</th>
                  <th className="px-4 py-3 text-left font-medium text-text">Diámetro (mm)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["5", "3", "44", "F", "14.9"],
                  ["7", "4", "46.5", "H", "15.3"],
                  ["9", "5", "49", "J½", "15.7"],
                  ["11", "6", "51.5", "L½", "16.1"],
                  ["13", "7", "54", "O", "16.5"],
                  ["15", "8", "57", "P½", "17.0"],
                  ["17", "9", "59", "R½", "17.4"],
                  ["19", "10", "62", "T½", "17.8"],
                  ["21", "11", "64", "V½", "18.2"],
                  ["23", "12", "66.5", "X½", "18.6"],
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-3 text-text-secondary">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Silver Section */}
        <div className="mx-auto mb-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            ¿Por qué elegir plata para un anillo de compromiso?
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <div className="mt-6 font-sans text-sm leading-relaxed text-text-secondary">
            <p>
              La plata es la opción perfecta para un anillo de promesa. Es accesible en precio sin comprometer la calidad, lo que permite que más parejas puedan acceder a una pieza artesanal hermosa. La plata 925 es hipoalergénica, lo que la hace segura para uso diario sin causar irritación en la piel. Es también muy duradera cuando se cuida adecuadamente, y su brillo natural hace que cualquier diseño se vea elegante y sofisticado. Además, la plata permite a nuestros orfebres crear diseños más elaborados y detallados que serían más costosos en oro, sin sacrificar la belleza o la calidad. Un anillo de plata artesanal es una inversión significativa en un momento importante, con un valor que trasciende lo monetario.
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
                subtitle: "Cada pieza certificada",
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
                    href="/coleccion/anillos"
                    className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                  >
                    Todos los anillos
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
