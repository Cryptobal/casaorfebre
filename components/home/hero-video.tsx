"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  HERO_POSTER_ALT,
  HERO_POSTER_URL,
  HERO_VIDEO_URL,
} from "@/lib/site-config";

export function HeroVideo({ phrase }: { phrase: string }) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setShowVideo(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <header className="relative h-dvh min-h-[560px] overflow-hidden">
      <div className="absolute inset-0 bg-hero-scrim">
        <Image
          src={HERO_POSTER_URL}
          alt={HERO_POSTER_ALT}
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        {showVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={HERO_POSTER_URL}
            aria-hidden
            onError={() => setShowVideo(false)}
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        )}
      </div>

      <div className="hero-overlay pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end px-6 pb-[max(12dvh,90px)] text-center">
        <h1 className="m-0 font-serif text-[clamp(56px,11vw,108px)] font-light leading-none tracking-[0.18em] text-background">
          camila
        </h1>
        <div className="mt-[26px] mb-5 h-px w-16 bg-accent-light" />
        <div className="text-[clamp(10px,2.6vw,12px)] font-normal uppercase tracking-[0.42em] text-accent-light">
          Joyería de autora
        </div>
        <p className="mt-[34px] mb-0 max-w-[26ch] text-pretty font-serif text-[clamp(19px,4.6vw,26px)] font-light italic leading-[1.45] text-background/88">
          {phrase}
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-[34px] left-1/2 -translate-x-1/2 motion-reduce:hidden">
        <div className="atelier-scroll-hint h-11 w-px bg-background/70" />
      </div>
    </header>
  );
}
