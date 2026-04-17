import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { CITIES } from "@/lib/data/cities";

export const metadata: Metadata = {
  title: "Joyerías Artesanales en Chile | Casa Orfebre",
  description:
    "Encuentra joyería artesanal de plata en tu ciudad. Orfebres verificados con envío a todo Chile. Anillos, collares, aros y más.",
  alternates: { canonical: "/joyerias" },
  openGraph: {
    title: "Joyerías Artesanales en Chile | Casa Orfebre",
    description:
      "Encuentra joyería artesanal de plata en tu ciudad. Orfebres verificados con envío a todo Chile.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Joyerías Artesanales en Chile | Casa Orfebre",
    description:
      "Encuentra joyería artesanal de plata en tu ciudad. Orfebres verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default function JoyeriasPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Joyerías en Chile",
        item: `${baseUrl}/joyerias`,
      },
    ],
  };

  const cityListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Joyerías Artesanales en Chile",
    description:
      "Encuentra joyería artesanal de plata en 16 ciudades chilenas. Orfebres verificados con envío a todo Chile.",
    url: `${baseUrl}/joyerias`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: CITIES.length,
      itemListElement: CITIES.map((city, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Joyería Artesanal en ${city.name}`,
        url: `${baseUrl}/joyerias/${city.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={cityListJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
        <SectionHeading
          title="Joyerías Artesanales en Chile"
          subtitle="Encuentra joyería artesanal de plata en tu ciudad. Orfebres verificados con envío a todo Chile."
          as="h1"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CITIES.map((city, index) => (
            <FadeIn key={city.slug} delay={index * 50}>
              <Link
                href={`/joyerias/${city.slug}`}
                className="group block rounded-lg border border-border bg-surface p-6 transition-all hover:shadow-lg hover:border-accent"
              >
                <h2 className="font-serif text-xl font-light text-text group-hover:text-accent mb-2">
                  {city.name}
                </h2>
                <p className="text-xs text-text-tertiary">{city.region}</p>
                <div className="mt-4 flex items-center gap-1 text-accent text-sm font-light opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar →
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-surface-secondary rounded-lg p-8">
          <h2 className="font-serif text-2xl font-light text-text mb-6">
            Compra joyería artesanal de plata en Chile
          </h2>
          <p className="text-text-secondary font-light leading-relaxed mb-6">
            Casa Orfebre conecta a compradores en toda Chile con orfebres artesanales verificados.
            Cada región tiene su propia tradición de orfebrería: desde la platería mapuche de Temuco,
            hasta la filigrana de Puerto Montt, pasando por la joyería con lapislázuli de La Serena.
          </p>
          <p className="text-text-secondary font-light leading-relaxed">
            Selecciona tu ciudad para explorar orfebres locales y descubrir joyas únicas de plata 925 y 950
            con certificado de autenticidad. Envío seguro a todo Chile.
          </p>
        </div>
      </div>
    </>
  );
}
