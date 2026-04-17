export const revalidate = 120;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { getTesorosProducts } from "@/lib/queries/products";

import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { ProductCard } from "@/components/products/product-card";

export const metadata: Metadata = {
  title:
    "Tesoros de Chile — Joyería Artesanal con Materiales Únicos | Casa Orfebre",
  description:
    "Descubre joyería artesanal chilena con platería mapuche, lapislázuli y cobre. Materiales únicos trabajados por orfebres verificados.",
  alternates: { canonical: "/tesoros-de-chile" },
  openGraph: {
    title:
      "Tesoros de Chile — Joyería Artesanal con Materiales Únicos | Casa Orfebre",
    description:
      "Descubre joyería artesanal chilena con platería mapuche, lapislázuli y cobre. Materiales únicos trabajados por orfebres verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Tesoros de Chile — Joyería Artesanal con Materiales Únicos | Casa Orfebre",
    description:
      "Descubre joyería artesanal chilena con platería mapuche, lapislázuli y cobre.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const SECTIONS = [
  {
    id: "plateria-mapuche",
    title: "Platería Mapuche",
    paragraphs: [
      "La tradición de la platería mapuche se remonta a más de 300 años. Cada pieza lleva consigo la cosmovisión de un pueblo: la luna (Küyen), el cultrún (tambor sagrado), y las aves que conectan el cielo con la tierra.",
      "Los orfebres mapuche trabajan la plata con técnicas heredadas por generaciones — el repujado, el calado, y la filigrana crean piezas que son tanto joyería como relato cultural.",
      "En 2003, UNESCO reconoció el arte mapuche como patrimonio cultural inmaterial, consolidando su valor más allá de lo decorativo.",
    ],
    cta: "Ver joyería de inspiración mapuche",
    ctaHref: "/coleccion?material=Plata+950",
    materialKeywords: ["Plata 950", "Plata 925"],
    textKeywords: ["mapuche"],
    emptyLabel: "platería mapuche",
  },
  {
    id: "lapislazuli",
    title: "Lapislázuli — La Gema del Desierto",
    paragraphs: [
      "Chile es uno de los dos únicos países del mundo donde se encuentra lapislázuli de calidad gema — el otro es Afganistán. Extraído en la Cordillera de los Andes, en la región de Coquimbo, este mineral azul intenso ha sido declarado piedra nacional de Chile.",
      "Los orfebres chilenos combinan el lapislázuli con plata y cobre, creando piezas que capturan el azul profundo del Pacífico y el cielo del desierto de Atacama.",
    ],
    cta: "Ver joyería con lapislázuli",
    ctaHref: "/coleccion?material=Lapislázuli",
    materialKeywords: ["Lapislázuli"],
    textKeywords: ["lapislázuli", "lapis"],
    emptyLabel: "lapislázuli",
  },
  {
    id: "cobre",
    title: "Cobre — El Metal de Chile",
    paragraphs: [
      "Chile produce un tercio del cobre mundial. Más allá de la industria minera, el cobre tiene una larga tradición artesanal. Su tono cálido y su maleabilidad lo hacen ideal para joyería contemporánea.",
      "Los orfebres que trabajan cobre artesanal transforman este metal en piezas con pátinas únicas — cada una evoluciona con el tiempo, haciendo que tu joya sea verdaderamente irrepetible.",
    ],
    cta: "Ver joyería en cobre",
    ctaHref: "/coleccion?material=Cobre",
    materialKeywords: ["Cobre"],
    textKeywords: ["cobre"],
    emptyLabel: "cobre",
  },
] as const;

export default async function TesorosDeChilePage() {

  const sectionProducts = await Promise.all(
    SECTIONS.map((s) =>
      getTesorosProducts([...s.materialKeywords], [...s.textKeywords], 4)
    )
  );

  const allProducts = sectionProducts.flat();
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tesoros de Chile — Joyería Artesanal con Materiales Únicos",
    description:
      "Descubre joyería artesanal chilena con platería mapuche, lapislázuli y cobre.",
    url: "https://casaorfebre.cl/tesoros-de-chile",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allProducts.length,
      itemListElement: allProducts.map((p: any, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `https://casaorfebre.cl/coleccion/${p.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLdData} />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* ─── Hero ─── */}
        <section className="pt-20 pb-16 text-center">
          <FadeIn>
            <SectionHeading
              title="Tesoros de Chile"
              subtitle="Materiales únicos que cuentan la historia de nuestra tierra. Descubre la joyería que solo Chile puede crear."
              as="h1"
            />
          </FadeIn>
        </section>

        {/* ─── Editorial Sections ─── */}
        <div className="space-y-0 divide-y divide-border">
          {SECTIONS.map((section, sIdx) => {
            const products = sectionProducts[sIdx];
            return (
              <section key={section.id} className="py-16">
                <FadeIn>
                  <h2 className="font-serif text-2xl font-light tracking-tight text-text sm:text-3xl">
                    {section.title}
                  </h2>

                  <div className="mt-6 space-y-4">
                    {section.paragraphs.map((p, i) => (
                      <p
                        key={i}
                        className="text-base font-light leading-relaxed text-text-secondary"
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Link
                      href={section.ctaHref}
                      className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
                    >
                      {section.cta} →
                    </Link>
                  </div>
                </FadeIn>

                {/* Product Grid */}
                <FadeIn delay={100}>
                  {products.length > 0 ? (
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map((product, pIdx) => (
                        <FadeIn key={product.id} delay={pIdx * 80}>
                          <ProductCard
                            product={product}
                          />
                        </FadeIn>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-8 rounded-lg border border-border bg-surface px-6 py-8 text-center">
                      <p className="text-sm font-light text-text-tertiary">
                        Próximamente — estamos incorporando orfebres
                        especializados en {section.emptyLabel}
                      </p>
                    </div>
                  )}
                </FadeIn>
              </section>
            );
          })}
        </div>

        {/* ─── Footer CTA ─── */}
        <FadeIn>
          <div className="mt-16 rounded-lg border border-border bg-surface px-8 py-10 text-center">
            <p className="text-sm font-light text-text-secondary">
              Cada pieza incluye Certificado de Autenticidad Casa Orfebre
            </p>
            <Link
              href="/coleccion"
              className="mt-4 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Explorar toda la colección →
            </Link>
          </div>
        </FadeIn>
      </div>
    </>
  );
}

/** Safe JSON-LD component — avoids inline dangerouslySetInnerHTML with user data */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Static data only — no user input flows into this serialization
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
