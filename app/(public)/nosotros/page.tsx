import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Casa Orfebre es el primer marketplace curado de joyería artesanal chilena. Conectamos orfebres verificados con compradores que valoran lo auténtico.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | Casa Orfebre",
    description:
      "El primer marketplace curado de joyería artesanal chilena. Piezas únicas de orfebres verificados.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nosotros | Casa Orfebre",
    description:
      "El primer marketplace curado de joyería artesanal chilena. Piezas únicas de orfebres verificados.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* ─── Hero ─── */}
      <section className="pt-20 pb-16 text-center">
        <FadeIn>
          <SectionHeading
            title="Casa Orfebre — Joyería de Autor"
            subtitle="El primer marketplace curado de joyería artesanal chilena"
            as="h1"
          />
        </FadeIn>
      </section>

      <div className="space-y-0 divide-y divide-border">
        {/* ─── Nuestra misión ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-2xl font-light tracking-tight text-text sm:text-3xl">
                Nuestra misión
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
                Conectar a los mejores orfebres de Chile con compradores que
                valoran lo artesanal y auténtico. Cada pieza en Casa Orfebre es
                seleccionada, verificada y certificada.
              </p>
            </div>
          </FadeIn>
        </section>

        {/* ─── Cómo funciona ─── */}
        <section className="py-16">
          <FadeIn>
            <h2 className="mb-12 text-center font-serif text-2xl font-light tracking-tight text-text sm:text-3xl">
              Cómo funciona
            </h2>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              <StepCard
                number="1"
                title="Explora"
                description="Navega entre piezas únicas de orfebres verificados"
              />
              <StepCard
                number="2"
                title="Elige"
                description="Cada pieza incluye materiales, técnica y certificado"
              />
              <StepCard
                number="3"
                title="Recibe"
                description="Empaque cuidado + Certificado de Autenticidad con QR"
              />
            </div>
          </FadeIn>
        </section>

        {/* ─── Nuestros valores ─── */}
        <section className="py-16">
          <FadeIn>
            <h2 className="mb-12 text-center font-serif text-2xl font-light tracking-tight text-text sm:text-3xl">
              Nuestros valores
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ValueCard
                icon={<CuraduriaIcon />}
                title="Curaduría"
                description="Cada orfebre pasa por un proceso de selección"
              />
              <ValueCard
                icon={<AutenticidadIcon />}
                title="Autenticidad"
                description="Certificado digital con QR en cada pieza"
              />
              <ValueCard
                icon={<ComunidadIcon />}
                title="Comunidad"
                description="Conectamos orfebres entre sí y con sus compradores"
              />
              <ValueCard
                icon={<TransparenciaIcon />}
                title="Transparencia"
                description="Conoces al artesano, su taller y su historia"
              />
            </div>
          </FadeIn>
        </section>

        {/* ─── Para orfebres ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-2xl font-light tracking-tight text-text sm:text-3xl">
                Para orfebres
              </h2>
              <p className="mt-6 text-base font-light leading-relaxed text-text-secondary">
                ¿Eres orfebre? Únete a la comunidad de artesanos más selecta de
                Chile.
              </p>
              <Link
                href="/postular"
                className="mt-8 inline-flex items-center justify-center rounded-md bg-accent px-7 py-3 text-base font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Postula aquí
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* ─── CTA final ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="text-center">
              <Link
                href="/coleccion"
                className="inline-flex items-center justify-center rounded-md border border-border px-7 py-3 text-base font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
              >
                Explorar la colección
              </Link>
            </div>
          </FadeIn>
        </section>
      </div>
    </div>
  );
}

/* ─── Step card ─── */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 font-serif text-lg font-light text-accent">
        {number}
      </div>
      <h3 className="mt-4 font-serif text-lg font-light text-text">{title}</h3>
      <p className="mt-2 text-sm font-light text-text-secondary">
        {description}
      </p>
    </div>
  );
}

/* ─── Value card ─── */

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-6 text-center">
      <div className="mx-auto mb-3 text-accent">{icon}</div>
      <h3 className="font-serif text-lg font-light text-text">{title}</h3>
      <p className="mt-2 text-sm font-light text-text-secondary">
        {description}
      </p>
    </div>
  );
}

/* ─── Icons ─── */

function CuraduriaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AutenticidadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M3 7h18" />
      <path d="M7 21l5-3 5 3v-5" />
    </svg>
  );
}

function ComunidadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TransparenciaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
