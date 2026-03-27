"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { HOME_HERO_IMAGE_URL } from "@/lib/home-hero";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 -z-10">
        <Image
          src={HOME_HERO_IMAGE_URL}
          alt="Orfebre trabajando joyería artesanal en el taller"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          quality={88}
        />
        {/* Capa para legibilidad del texto en todos los anchos */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/75 via-background/45 to-background/85"
          aria-hidden
        />
      </div>

      <FadeIn className="relative z-10 max-w-4xl">
        <span className="text-lg text-accent">◆</span>
        <h1 className="mt-6 font-serif text-4xl font-light italic text-white drop-shadow-md sm:text-5xl lg:text-6xl">
          Piezas únicas nacidas de manos chilenas
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base font-light text-white/90 drop-shadow-sm sm:text-lg">
          Joyería artesanal de orfebres verificados. Cada pieza cuenta una historia.
        </p>
        <div className="mt-10">
          <Link href="/coleccion">
            <Button size="lg">Explorar Colección</Button>
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
