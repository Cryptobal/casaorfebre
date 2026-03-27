"use client";

import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";

const HERO_VIDEO_UID = "22f09ecf3c4b24837d7031d07e69a43f";
const CF_CUSTOMER_CODE = process.env.NEXT_PUBLIC_CF_STREAM_CUSTOMER_CODE;

export function HeroSection() {
  const iframeSrc = CF_CUSTOMER_CODE
    ? `https://${CF_CUSTOMER_CODE}/${HERO_VIDEO_UID}/iframe?muted=true&autoplay=true&loop=true&controls=false`
    : null;

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {iframeSrc && (
        <div className="absolute inset-0 -z-10">
          <iframe
            src={iframeSrc}
            allow="autoplay; encrypted-media"
            className="pointer-events-none border-0"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "177.78vh",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%)",
            }}
            title="Video de fondo - joyería artesanal"
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
      )}

      <FadeIn>
        <span className="text-accent text-lg">◆</span>
        <h1 className="mt-6 font-serif text-4xl font-light italic text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
          Piezas únicas nacidas de manos chilenas
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base font-light text-white/80 drop-shadow-sm sm:text-lg">
          Joyería artesanal de orfebres verificados. Cada pieza cuenta una
          historia.
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
