export const revalidate = 3600;

import type { Metadata } from "next";
import { AtelierReveal } from "@/components/home/atelier-reveal";
import { HeroVideo } from "@/components/home/hero-video";
import { Manifiesto } from "@/components/home/manifiesto";
import { Conceptos } from "@/components/home/conceptos";
import { Galeria } from "@/components/home/galeria";
import { Contacto } from "@/components/home/contacto";
import { getHomeContent } from "@/lib/queries/home-content";

export const metadata: Metadata = {
  title: {
    absolute: "Casa Orfebre — Joyería de Autora | Camila",
  },
  description:
    "Joyas creadas desde el instinto, la materia y el proceso. Joyería de autora en plata, bronce y oro, hecha a mano por Camila.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Casa Orfebre — Joyería de Autora | Camila",
    description:
      "Joyas creadas desde el instinto, la materia y el proceso. Joyería de autora en plata, bronce y oro, hecha a mano por Camila.",
    images: [
      {
        url: "/casaorfebre-og-image.png",
        width: 1200,
        height: 630,
        alt: "Casa Orfebre — Joyería de Autora",
      },
    ],
  },
};

export default async function HomePage() {
  const content = await getHomeContent();

  return (
    <div className="min-h-dvh bg-background font-sans font-light text-text">
      <HeroVideo phrase={content.heroPhrase} />
      <AtelierReveal>
        <Manifiesto
          lead={content.manifestoLead}
          paragraphs={content.manifestoParagraphs}
        />
      </AtelierReveal>
      <AtelierReveal>
        <Conceptos concepts={content.concepts} />
      </AtelierReveal>
      <AtelierReveal>
        <Galeria intro={content.galleryIntro} images={content.gallery} />
      </AtelierReveal>
      <AtelierReveal>
        <Contacto
          instagramText={content.contactInstagramText}
          whatsappText={content.contactWhatsappText}
        />
      </AtelierReveal>
    </div>
  );
}
