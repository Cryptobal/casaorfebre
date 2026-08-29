import type { GalleryImage } from "@/lib/site-config";
import { GalleryFigure } from "./gallery-figure";

export function Galeria({
  intro,
  images,
}: {
  intro: string;
  images: GalleryImage[];
}) {
  if (images.length === 0) return null;

  return (
    <section className="mx-auto box-border max-w-[1240px] px-[clamp(20px,5vw,64px)] pb-[clamp(96px,16vw,180px)] pt-0">
      <p className="mx-auto mb-[clamp(56px,9vw,88px)] mt-0 max-w-[34ch] text-pretty text-center font-serif text-[clamp(21px,4.6vw,28px)] font-light italic leading-[1.5] text-text">
        {intro}
      </p>
      <div className="grid grid-flow-dense grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] items-start gap-[clamp(18px,3vw,32px)]">
        {images.map((image) => (
          <GalleryFigure key={image.src} {...image} />
        ))}
      </div>
    </section>
  );
}
