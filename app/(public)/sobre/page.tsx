export const revalidate = 3600;
export const dynamic = "force-static";

import Link from "next/link";
import { EditorialBreadcrumb } from "@/components/shared/editorial-breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata = {
  title: "Sobre — Casa Orfebre",
  description:
    "Casa Orfebre reúne a orfebres chilenos independientes. Curaduría editorial, autenticidad garantizada, piezas firmadas por sus autores.",
  alternates: { canonical: "https://casaorfebre.cl/sobre" },
  openGraph: {
    type: "website" as const,
    title: "Sobre Casa Orfebre",
    description:
      "Galería editorial de joyería chilena. Curaduría, autenticidad garantizada, piezas firmadas.",
    url: "https://casaorfebre.cl/sobre",
    siteName: "Casa Orfebre",
    locale: "es_CL",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Sobre Casa Orfebre",
    description:
      "Galería editorial de joyería chilena. Curaduría editorial y autenticidad garantizada.",
    creator: "@casaorfebre",
    site: "@casaorfebre",
    images: ["/casaorfebre-og-image.png"],
  },
};

const CRITERIA = [
  {
    number: "01",
    title: "Autoría",
    body:
      "Cada pieza es hecha por la mano del orfebre. Ni subcontratada, ni industrial, ni intervenida después de firmada.",
  },
  {
    number: "02",
    title: "Técnica",
    body:
      "Dominio demostrable de oficio: cera perdida, martillado, forjado, filigrana, engaste tradicional. La técnica se prueba en la pieza, no en las redes.",
  },
  {
    number: "03",
    title: "Lenguaje propio",
    body:
      "Una voz estética reconocible. No copias de lo que está de moda. No repeticiones de catálogos internacionales. Chile tiene mucho que decir con sus manos.",
  },
  {
    number: "04",
    title: "Materiales honestos",
    body:
      "Plata 925 o 950, oro 18K, cobre y bronce macizos, piedras con procedencia clara. Nunca baño. Nunca alma. Nunca dorado sobre nada que no sea oro.",
  },
];

export default function SobrePage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Casa Orfebre",
    url: "https://casaorfebre.cl",
    description:
      "Galería editorial de joyería chilena. Curaduría pieza por pieza, autenticidad garantizada.",
    logo: "https://casaorfebre.cl/casaorfebre-logo-compact.svg",
    founder: [
      { "@type": "Person", name: "Carlos Irigoyen" },
      { "@type": "Person", name: "Camila Torres Puga" },
    ],
    sameAs: [
      "https://www.instagram.com/casaorfebre",
      "https://cl.pinterest.com/casaorfebre/",
      "https://x.com/casaorfebre",
      "https://www.tiktok.com/@casaorfebre",
    ],
  };

  return (
    <>
      <JsonLd data={orgJsonLd} />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
        <EditorialBreadcrumb
          items={[
            { label: "Casa Orfebre", href: "/" },
            { label: "Sobre" },
          ]}
        />

        {/* Hero tipográfico */}
        <FadeIn>
          <header className="mt-12 lg:mt-20">
            <h1 className="font-serif text-6xl font-light leading-[0.95] text-text sm:text-7xl lg:text-8xl xl:text-[10rem]">
              Casa Orfebre
            </h1>
            <p className="mt-8 max-w-prose font-serif text-xl font-light italic text-text-secondary">
              Joyería de autor, hecha en Chile.
            </p>
            <span aria-hidden className="mt-10 block h-px w-[60px] bg-accent" />
          </header>
        </FadeIn>

        {/* Manifiesto extendido — brief editorial v1 §2.2 */}
        <FadeIn delay={80}>
          <article className="mt-20 max-w-prose space-y-8 font-serif text-xl font-light leading-relaxed text-text lg:mt-28">
            <p className="text-3xl sm:text-4xl">
              Casa Orfebre nace de una pregunta simple:{" "}
              <span className="italic">
                ¿dónde está la joyería chilena que no se ve?
              </span>
            </p>

            <p>
              En Chile hay una tradición orfebre que se sostiene en silencio.
              Platería mapuche, iconografía diaguita, técnica castellana
              heredada de los gremios coloniales. Y hoy, cientos de orfebres
              independientes que trabajan desde talleres pequeños — en ciudades,
              en pueblos, en el sur y en el norte — haciendo piezas a mano,
              una por una.
            </p>

            <p>
              Muchos venden por Instagram, por el boca a boca, por ferias
              esporádicas. No porque les falte talento. Les falta vitrina.
              Les falta una casa.
            </p>

            <p className="text-2xl">Casa Orfebre es esa casa.</p>

            <p>
              Reunimos a orfebres chilenos verificados, presentamos su obra con
              cuidado editorial, y garantizamos lo que vendemos. Cada pieza
              viene con un certificado digital de autenticidad, firmado por
              su autor, con QR verificable. Cada compra está protegida por
              catorce días de garantía.
            </p>

            <p>
              No somos un marketplace masivo. Somos una galería que selecciona
              pieza por pieza. La mayor parte del valor de cada venta llega
              directamente al orfebre — nosotros nos encargamos de que el
              mundo los vea.
            </p>

            <div>
              <span aria-hidden className="mt-2 block h-px w-[48px] bg-accent" />
              <p className="mt-6 text-[11px] font-light italic uppercase tracking-[0.2em] text-text-tertiary">
                Carlos y Camila
                <br />
                <span className="normal-case tracking-[0.15em]">
                  Cofundadores · Santiago
                </span>
              </p>
            </div>
          </article>
        </FadeIn>

        {/* Quiénes somos */}
        <FadeIn delay={80}>
          <section className="mt-24 grid grid-cols-1 gap-10 border-t border-[color:var(--color-border-soft)] pt-20 lg:mt-32 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
                Quiénes somos
              </h2>
            </div>
            <div className="lg:col-span-9">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                {/* TODO CONTENIDO: fotos editoriales de Carlos y Camila. */}
                <FounderCard
                  name="Carlos Irigoyen"
                  role="Cofundador"
                  quote="Reunir a los orfebres que aún trabajan con las manos."
                />
                <FounderCard
                  name="Camila Torres Puga"
                  role="Cofundadora · Maestra Orfebre"
                  quote="Presentar la joyería chilena con el cuidado que merece."
                />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Cómo curamos */}
        <FadeIn delay={80}>
          <section className="mt-24 border-t border-[color:var(--color-border-soft)] pt-20 lg:mt-32">
            <h2 className="font-serif text-4xl font-light text-text sm:text-5xl">
              Cómo curamos
            </h2>
            <span aria-hidden className="mt-6 block h-px w-[48px] bg-accent" />

            <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2">
              {CRITERIA.map((c) => (
                <div key={c.number}>
                  <p className="text-[11px] font-light uppercase tracking-[0.25em] text-accent">
                    {c.number}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-light italic text-text">
                    {c.title}
                  </h3>
                  <p className="mt-4 max-w-prose text-sm font-light leading-relaxed text-text sm:text-base">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Autenticidad */}
        <FadeIn delay={80}>
          <section className="mt-24 grid grid-cols-1 gap-10 border-t border-[color:var(--color-border-soft)] pt-20 lg:mt-32 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
                Autenticidad
              </h2>
            </div>
            <div className="space-y-6 lg:col-span-9">
              <h3 className="font-serif text-3xl font-light text-text sm:text-4xl">
                Un <span className="italic">certificado digital</span> con cada pieza.
              </h3>
              <p className="max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                Cada joya se entrega con un código único y un QR verificable.
                Ese documento vincula la pieza a su ficha en Casa Orfebre y
                al orfebre que la firmó — una cadena de trazabilidad simple
                y sólida.
              </p>
              <p className="max-w-prose text-sm font-light leading-relaxed text-text-secondary">
                No es un ensayo de laboratorio. La declaración de materiales
                (ley de la plata, quilate del oro, origen de las piedras)
                sigue siendo responsabilidad del orfebre, como en cualquier
                joyería física. El certificado autentica el vínculo entre
                pieza, publicación y autoría.
              </p>
              <div aria-hidden className="mt-6">
                <MockCertificate />
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Garantía */}
        <FadeIn delay={80}>
          <section className="mt-24 grid grid-cols-1 gap-10 border-t border-[color:var(--color-border-soft)] pt-20 lg:mt-32 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
                Garantía
              </h2>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-serif text-3xl font-light text-text sm:text-4xl">
                Catorce días para cambiar de opinión.
              </h3>
              <p className="mt-6 max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                Si la pieza no llega, llega distinta, o llega dañada, el
                reembolso es completo. Para compras estándar, tienes catorce
                días desde la entrega para solicitar devolución.
              </p>
              <Link
                href="/garantia"
                className="mt-8 inline-block border-b border-accent pb-1 text-sm font-light uppercase tracking-[0.15em] text-accent transition-colors hover:text-accent-dark"
              >
                Ver el detalle de la garantía →
              </Link>
            </div>
          </section>
        </FadeIn>

        {/* Para orfebres */}
        <FadeIn delay={80}>
          <section className="mt-24 grid grid-cols-1 gap-10 border-t border-[color:var(--color-border-soft)] pt-20 lg:mt-32 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-[11px] font-light uppercase tracking-[0.25em] text-text-tertiary">
                Para orfebres
              </h2>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-serif text-3xl font-light text-text sm:text-4xl">
                ¿Trabajas la <span className="italic">plata a mano</span>?
              </h3>
              <p className="mt-6 max-w-prose font-serif text-lg font-light leading-relaxed text-text">
                Buscamos orfebres que firmen cada pieza. Postular es abrir una
                conversación — revisamos portfolio, conversamos contigo, y
                decidimos juntos si tu obra entra a Casa Orfebre.
              </p>
              <Link
                href="/postular"
                className="mt-8 inline-block border border-text px-8 py-3 text-sm font-light tracking-wide text-text transition-colors hover:bg-text hover:text-background"
              >
                Postular como orfebre →
              </Link>
            </div>
          </section>
        </FadeIn>
      </section>
    </>
  );
}

/** Placeholder editorial para cofundador sin foto aún cargada. */
function FounderCard({
  name,
  role,
  quote,
}: {
  name: string;
  role: string;
  quote: string;
}) {
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-background">
        <div className="flex h-full items-center justify-center">
          <span
            aria-hidden
            className="font-serif text-[8rem] font-light italic leading-none text-text-tertiary"
          >
            {name
              .split(" ")
              .map((w) => w.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
        </div>
      </div>
      <p className="mt-5 text-sm font-light uppercase tracking-[0.15em] text-text">
        {name}
      </p>
      <p className="mt-1 font-serif text-sm font-light italic text-text-secondary">
        {role}
      </p>
      <blockquote className="mt-4 font-serif text-base font-light italic leading-snug text-text">
        {quote}
      </blockquote>
    </div>
  );
}

/** Mockup tipográfico del certificado digital — se reemplaza por un render real más adelante. */
function MockCertificate() {
  return (
    <div className="max-w-md border border-[color:var(--color-border)] bg-surface p-8">
      <p className="text-[10px] font-light uppercase tracking-[0.3em] text-text-tertiary">
        Certificado · Casa Orfebre
      </p>
      <p className="mt-6 font-serif text-2xl font-light italic text-text">
        Movimiento Congelado II
      </p>
      <p className="mt-1 text-sm font-light text-text-secondary">
        Por Camila Torres Puga
      </p>
      <dl className="mt-6 space-y-1 text-[11px] font-light text-text-secondary">
        <div className="flex justify-between gap-4">
          <dt className="text-text-tertiary">Código</dt>
          <dd className="tabular-nums">CO-2026-00042</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-tertiary">Emitido</dt>
          <dd>18 abril 2026</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-tertiary">Materiales</dt>
          <dd>Plata 950 · Cera perdida</dd>
        </div>
      </dl>
      <div className="mt-6 flex items-end justify-between">
        <span className="text-[10px] font-light uppercase tracking-[0.2em] text-text-tertiary">
          Firmado digitalmente
        </span>
        <div
          aria-hidden
          className="h-16 w-16 border border-[color:var(--color-border)] bg-[repeating-conic-gradient(var(--color-text)_0%_25%,transparent_0%_50%)_50%/8px_8px]"
        />
      </div>
    </div>
  );
}
