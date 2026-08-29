import type { HomeConcept } from "@/lib/home-defaults";

export function Conceptos({ concepts }: { concepts: HomeConcept[] }) {
  return (
    <section className="mx-auto box-border max-w-[1240px] px-[clamp(24px,6vw,72px)] pb-[clamp(96px,16vw,180px)] pt-0">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-[clamp(28px,4vw,48px)] gap-y-[clamp(40px,6vw,64px)]">
        {concepts.map((concept) => (
          <div key={concept.title}>
            <div className="mb-[18px] h-px w-7 bg-accent-light" />
            <h3 className="mb-3.5 mt-0 font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-accent">
              {concept.title}
            </h3>
            <p className="m-0 text-pretty text-sm font-light leading-[1.85] text-text-secondary">
              {concept.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
