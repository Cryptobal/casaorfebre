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
          className="object-cover object-center brightness-[0.88] saturate-[0.94] contrast-[0.97]"
          quality={88}
        />
        {/* Luz baja, velo tierra suave y uniforme: calma, sin brillo “lúcido” ni foco duro */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[rgb(44_38_34)]/32 via-[rgb(30_26_22)]/46 to-[rgb(14_12_10)]/64"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_120%_100%_at_50%_55%,transparent_0%,rgb(0_0_0_/_0.06)_100%)]"
          aria-hidden
        />
      </div>

      <FadeIn className="relative z-10 max-w-4xl">
        <span className="text-lg text-[#c9b8a8] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">◆</span>
        <h1 className="mt-6 font-serif text-4xl font-light italic text-[#f7f4f0] drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
          Piezas únicas nacidas de manos chilenas
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base font-light text-[#e8e4df]/95 drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)] sm:text-lg">
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
