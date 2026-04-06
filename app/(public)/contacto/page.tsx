import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { ContactForm } from "./contact-form";

export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escríbenos para consultas, soporte con pedidos, colaboraciones o para vender tus joyas en Casa Orfebre. Respondemos en 24-48 horas.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto | Casa Orfebre",
    description:
      "Escríbenos para consultas, soporte o colaboraciones. Respondemos en 24-48 horas.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Casa Orfebre",
    description:
      "Escríbenos para consultas, soporte o colaboraciones. Respondemos en 24-48 horas.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* ─── Hero ─── */}
      <section className="pt-20 pb-12 text-center">
        <FadeIn>
          <SectionHeading
            title="Contacto"
            subtitle="¿Tienes alguna consulta? Estamos aquí para ayudarte"
            as="h1"
          />
        </FadeIn>
      </section>

      <FadeIn>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* ─── Form ─── */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* ─── Sidebar info ─── */}
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-4 font-serif text-lg font-light text-text">
                Información de contacto
              </h2>
              <div className="space-y-4 text-sm text-text-secondary">
                <div>
                  <p className="font-medium text-text">Email de soporte</p>
                  <a
                    href="mailto:contacto@casaorfebre.cl"
                    className="text-accent hover:underline"
                  >
                    contacto@casaorfebre.cl
                  </a>
                </div>
                <div>
                  <p className="font-medium text-text">Horario de atención</p>
                  <p>Lunes a Viernes, 9:00 a 18:00</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-3 font-serif text-lg font-light text-text">
                Enlaces útiles
              </h2>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/preguntas-frecuentes"
                    className="text-accent hover:underline"
                  >
                    ¿Tienes dudas frecuentes? Revisa nuestro FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/postular"
                    className="text-accent hover:underline"
                  >
                    ¿Eres orfebre? Postula aquí
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
