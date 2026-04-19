import Link from "next/link";
import Image from "next/image";
import { HOME_HERO_IMAGE_URL } from "@/lib/home-hero";

/**
 * Hero editorial. Full viewport desktop, 80vh mobile.
 * Imagen de fondo (pieza en detalle; si el asset activo es un plano de taller,
 * sirve igual — la composición y overlay centran la obra en el fondo).
 * Texto abajo-izquierda. Cero pills de confianza.
 */
export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] w-full flex-col items-start justify-end overflow-hidden lg:min-h-[100svh]">
      <div className="absolute inset-0 -z-10">
        <Image
          src={HOME_HERO_IMAGE_URL}
          alt="Pieza de joyería de autor hecha en Chile"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        {/* Gradiente suave sólo desde abajo — centra el texto sin oscurecer la obra. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 w-full px-6 pb-16 pt-24 sm:px-10 sm:pb-20 lg:px-16 lg:pb-24">
        <p className="text-xs font-light uppercase tracking-[0.3em] text-[#d8c9b5]">
          Casa Orfebre
        </p>
        <span aria-hidden className="mt-4 block h-px w-[60px] bg-[#d8c9b5]" />

        <h1 className="mt-6 max-w-[18ch] font-serif text-5xl font-light leading-[0.95] text-[#FAFAF8] sm:text-6xl lg:text-7xl xl:text-8xl">
          Joyería de <span className="italic">autor</span>,
          <br />
          hecha en Chile.
        </h1>

        <div className="mt-10">
          <Link
            href="/coleccion"
            className="inline-block border border-[#FAFAF8] px-8 py-3 text-sm font-light tracking-wide text-[#FAFAF8] transition-colors hover:bg-[#FAFAF8] hover:text-text"
          >
            Explorar Colección →
          </Link>
        </div>
      </div>
    </section>
  );
}
