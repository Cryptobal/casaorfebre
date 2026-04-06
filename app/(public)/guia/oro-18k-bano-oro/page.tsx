import type { Metadata } from "next";
import Link from "next/link";
import { getApprovedProducts } from "@/lib/queries/products";
import { generateFAQJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Oro 18K vs Baño de Oro: Guía Completa 2026",
  description:
    "Comparativa completa entre oro 18k y baño de oro. Diferencias, durabilidad, precio y cuál elegir para tus joyas artesanales. Guía de compra con recomendaciones.",
  alternates: { canonical: "/guia/oro-18k-bano-oro" },
  openGraph: {
    title: "Oro 18K vs Baño de Oro: Guía Completa 2026 | Casa Orfebre",
    description:
      "Comparativa completa entre oro 18k y baño de oro. Diferencias, durabilidad, precio y cuál elegir para tus joyas artesanales.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
};

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "¿El oro 18K es mejor que el baño de oro?",
    answer:
      "Depende del uso. El oro 18K es una inversión sólida para piezas que se usan diariamente, duran toda la vida y pueden heredarse. El baño de oro es más accesible económicamente y perfecto para piezas que se usan ocasionalmente. No es mejor ni peor, es diferente según tus necesidades.",
  },
  {
    question: "¿Cuánto dura el baño de oro?",
    answer:
      "El baño de oro de calidad en joyería artesanal dura típicamente entre 6 meses a 3 años dependiendo del uso. Si lo usas intensamente todos los días, el baño se desgasta más rápido. Con cuidado y uso ocasional, puede durar varios años. Se puede renovar fácilmente en un taller.",
  },
  {
    question: "¿Es el baño de oro duradero?",
    answer:
      "El baño de oro es menos duradero que el oro 18K macizo. Sin embargo, un buen baño de oro sobre plata 925 es bastante resistente si lo cuidas. La clave es evitar rozamientos constantes, no sumergir en agua clorada y limpiar con cuidado. Es una inversión menor que el oro pero requiere más mantenimiento.",
  },
  {
    question: "¿Puedo usar baño de oro todos los días?",
    answer:
      "Puedes, pero no es recomendable si usas la pieza intensamente todos los días. El baño de oro se desgasta con el fricción constante. Es ideal para uso ocasional a moderado. Si deseas una pieza para usar diariamente, el oro 18K es una mejor inversión a largo plazo.",
  },
  {
    question: "¿El oro 18K tiene que ser amarillo?",
    answer:
      "No. El oro 18K existe en varios tonos: amarillo (tradicional), blanco (aleado con plata y níquel), y rosado (aleado con cobre). Cada tono tiene sus propias características de brillo y durabilidad. En joyería artesanal chilena, todos los tonos están disponibles.",
  },
  {
    question: "¿Qué es mejor para anillos, oro 18K o baño de oro?",
    answer:
      "Para anillos de uso diario como argollas de matrimonio, el oro 18K es definitivamente mejor. Los anillos reciben mucho desgaste y el baño de oro se gastas rápidamente. Para anillos ocasionales, el baño de oro es una opción económica. Si es una inversión importante, elige siempre oro macizo.",
  },
];

interface TableRow {
  caracteristica: string;
  oro18k: string;
  baito: string;
}

const tableData: TableRow[] = [
  {
    caracteristica: "Composición",
    oro18k: "75% oro puro + 25% otros metales",
    baito: "Plata 925/950 + capa de oro",
  },
  {
    caracteristica: "Durabilidad",
    oro18k: "Muy alta (generaciones)",
    baito: "Media (meses a años)",
  },
  {
    caracteristica: "Brillo",
    oro18k: "Duradero, profundo",
    baito: "Intenso inicialmente, se desvanece",
  },
  {
    caracteristica: "Precio relativo",
    oro18k: "$$$",
    baito: "$",
  },
  {
    caracteristica: "Mantenimiento",
    oro18k: "Mínimo",
    baito: "Regular (proteger, relimpiar)",
  },
];

export default async function OroGuiaPage() {
  const products = await getApprovedProducts({}).then((items) => items.slice(0, 4));

  const faqJsonLd = generateFAQJsonLd(faqs);

  const tocItems = [
    { id: "que-es-18k", label: "¿Qué es el oro 18K?" },
    { id: "que-es-bano", label: "¿Qué es el baño de oro?" },
    { id: "diferencias", label: "Diferencias principales" },
    { id: "tabla-comparativa", label: "Tabla comparativa" },
    { id: "durabilidad", label: "Durabilidad y mantenimiento" },
    { id: "cual-elegir", label: "¿Cuál elegir?" },
    { id: "faq", label: "Preguntas frecuentes" },
  ];

  return (
    <>
      <JsonLd data={faqJsonLd} />

      <article className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <FadeIn>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Guías", href: "/guia" },
              { label: "Oro 18K vs Baño", href: "/guia/oro-18k-bano-oro" },
            ]}
          />
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FadeIn>
              <header className="mb-12">
                <div className="mb-4 h-1 w-16 bg-accent"></div>
                <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
                  Oro 18K vs Baño de Oro: Guía Completa
                </h1>
              </header>
            </FadeIn>

            <FadeIn delay={0.1}>
              <nav className="mb-12 rounded-lg border-l-4 border-accent bg-white p-6">
                <h2 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wide text-text">
                  En este artículo
                </h2>
                <ul className="space-y-2">
                  {tocItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </FadeIn>

            <FadeIn delay={0.2}>
              <section id="que-es-18k" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es el oro 18K?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El oro 18K contiene 75% de oro puro y 25% de otros metales como cobre, plata o níquel.
                  Esta proporción lo hace ideal para joyería: suficientemente puro para tener auténtico
                  color y valor del oro, pero lo suficientemente resistente para soportar uso diario sin deformarse.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El oro 18K es el estándar internacional más valorado en joyería artesanal. Cuando compras
                  una alianza, collar o anillo de oro genuino, típicamente es oro 18K. El sello grabado
                  debe indicar "18K" o "750" (que representa el mismo 75%) u otro marcador de pureza.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  La durabilidad del oro 18K es excepcional. Una joya de oro 18K puede durar generaciones.
                  Es la opción perfecta para argollas de matrimonio y piezas que deseas sean herencia familiar.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.3}>
              <section id="que-es-bano" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Qué es el baño de oro?
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El baño de oro es un proceso donde se aplica una muy fina capa de oro sobre otro metal
                  —típicamente plata 925 o 950. No es una aleación como el oro 18K, sino una capa superficial
                  de oro depositada sobre un metal base.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El baño de oro es mucho más económico porque la cantidad de oro utilizado es mínima—apenas
                  micras de espesor. Esto lo hace accesible para quienes desean la calidez visual del oro sin
                  la inversión de comprar oro sólido. Una joya con baño de oro cuesta una fracción del precio
                  de la misma pieza en oro 18K.
                </p>
                <p className="font-light leading-relaxed text-text-secondary">
                  Sin embargo, esta capa es temporal. Con el uso constante, especialmente si roza frecuentemente
                  contra piel o ropa, el baño se desgasta. Cuando ocurre, la plata base queda expuesta. El baño
                  puede renovarse en un taller, pero es un costo adicional a considerar.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.4}>
              <section id="diferencias" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Diferencias principales
                </h2>
                <p className="mb-6 font-light leading-relaxed text-text-secondary">
                  Aunque ambos tienen ese brillo dorado hermoso, las diferencias son fundamentales:
                </p>

                <div className="space-y-6">
                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Estructura</h3>
                    <p className="font-light text-text-secondary">
                      Oro 18K: Aleación homogénea de oro y otros metales en toda la pieza. Baño de oro:
                      Capa superficial de oro sobre metal base diferente.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Inversión</h3>
                    <p className="font-light text-text-secondary">
                      Oro 18K: Significativa pero duradera y permanente. Baño de oro: Menor, con costo
                      de mantenimiento o renovación.
                    </p>
                  </div>

                  <div className="border-l-2 border-accent/30 pl-6">
                    <h3 className="mb-2 font-sans font-semibold text-text">Longevidad</h3>
                    <p className="font-light text-text-secondary">
                      Oro 18K: Permanente (generaciones). Baño de oro: Temporal (meses a algunos años).
                    </p>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.5}>
              <section id="tabla-comparativa" className="mb-12 scroll-mt-20">
                <h2 className="mb-6 font-serif text-3xl font-light tracking-tight text-text">
                  Tabla comparativa
                </h2>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-accent/5">
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Característica
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Oro 18K
                        </th>
                        <th className="px-6 py-4 text-left font-sans text-sm font-semibold text-text">
                          Baño de Oro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-accent/2">
                          <td className="px-6 py-4 font-sans text-sm font-medium text-text">
                            {row.caracteristica}
                          </td>
                          <td className="px-6 py-4 font-sans text-sm text-text-secondary">
                            {row.oro18k}
                          </td>
                          <td className="px-6 py-4 font-sans text-sm text-text-secondary">
                            {row.baito}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.6}>
              <section id="durabilidad" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  Durabilidad y mantenimiento
                </h2>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  La durabilidad del oro 18K es su mayor ventaja. No necesita renovación, no se desvanece
                  y no requiere cuidados especiales más allá de la limpieza regular. Puedes llevar un anillo
                  de oro 18K bajo el agua, en la ducha, en la playa sin preocupación. El oro no se oxida.
                </p>
                <p className="mb-4 font-light leading-relaxed text-text-secondary">
                  El baño de oro requiere más cuidado: evita agua clorada, retira durante duchas largas,
                  evita roce constante, limpia con paño suave. Cuando se desgaste (típicamente 6 meses
                  a 3 años), necesita renovación por un orfebre.
                </p>
              </section>
            </FadeIn>

            <FadeIn delay={0.7}>
              <section id="cual-elegir" className="mb-12 scroll-mt-20">
                <h2 className="mb-4 font-serif text-3xl font-light tracking-tight text-text">
                  ¿Cuál elegir?
                </h2>
                <p className="mb-6 font-light leading-relaxed text-text-secondary">
                  La decisión depende de tres factores: presupuesto, frecuencia de uso e intención de la joya.
                </p>

                <div className="space-y-6 mb-6">
                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Elige Oro 18K si:</h3>
                    <ul className="space-y-2 font-light text-text-secondary">
                      <li>• Deseas joya de uso diario (anillos, cadenas, pulseras)</li>
                      <li>• Buscas pieza que durará generaciones</li>
                      <li>• Tienes estilo de vida activo</li>
                      <li>• Deseas sea herencia familiar</li>
                      <li>• Prefieres no preocuparte por mantenimiento</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-2 font-sans font-semibold text-text">Elige Baño de Oro si:</h3>
                    <ul className="space-y-2 font-light text-text-secondary">
                      <li>• Tu presupuesto es limitado</li>
                      <li>• Deseas estética del oro sin inversión</li>
                      <li>• La usarás ocasionalmente</li>
                      <li>• Eres cuidadoso con tus piezas</li>
                      <li>• Deseas experimentar sin gran inversión</li>
                    </ul>
                  </div>
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.8}>
              <section id="faq" className="scroll-mt-20">
                <h2 className="mb-8 font-serif text-3xl font-light tracking-tight text-text">
                  Preguntas frecuentes
                </h2>

                <div className="space-y-6">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-border pb-6 last:border-b-0">
                      <h3 className="mb-3 font-sans font-semibold text-text">{faq.question}</h3>
                      <p className="font-light leading-relaxed text-text-secondary">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 rounded-lg bg-accent/5 p-8 text-center">
                  <p className="mb-4 font-light text-text-secondary">
                    Ahora que entiendes las diferencias, es momento de encontrar la pieza perfecta.
                  </p>
                  <Link
                    href="/coleccion/oro"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-sans font-semibold text-white transition-colors hover:bg-accent/90"
                  >
                    Explora joyas en oro 18K →
                  </Link>
                </div>
              </section>
            </FadeIn>
          </div>

          <aside className="hidden lg:block">
            <FadeIn delay={0.2}>
              <div className="sticky top-20 space-y-8">
                <div>
                  <h3 className="mb-6 font-serif text-lg font-light text-text">
                    Joyas en Oro
                  </h3>
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        listName="oro-18k-bano-oro-guide"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </aside>
        </div>
      </article>
    </>
  );
}
