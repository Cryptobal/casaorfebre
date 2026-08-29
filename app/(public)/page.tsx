export const revalidate = 3600;

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FadeIn } from "@/components/shared/fade-in";
import { HeroVideo } from "@/components/home/hero-video";
import { Manifiesto } from "@/components/home/manifiesto";
import { Conceptos } from "@/components/home/conceptos";
import { Galeria } from "@/components/home/galeria";
import { Contacto } from "@/components/home/contacto";

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

function Reveal({ children }: { children: ReactNode }) {
  return (
    <FadeIn offsetPx={18} durationMs={900}>
      {children}
    </FadeIn>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroVideo />
      <Reveal>
        <Manifiesto />
      </Reveal>
      <Reveal>
        <Conceptos />
      </Reveal>
      <Reveal>
        <Galeria />
      </Reveal>
      <Reveal>
        <Contacto />
      </Reveal>
    </>
  );
}
