import { MANIFIESTO_KICKER } from "@/lib/site-config";

export function Manifiesto({
  lead,
  paragraphs,
}: {
  lead: string;
  paragraphs: string[];
}) {
  return (
    <section className="flex justify-center px-6 py-[clamp(96px,16vw,180px)]">
      <div className="max-w-[65ch]">
        <div className="mb-11 text-[11px] font-normal uppercase tracking-[0.32em] text-accent">
          {MANIFIESTO_KICKER}
        </div>
        <p className="mb-[30px] mt-0 text-pretty font-serif text-[clamp(24px,4.5vw,30px)] font-normal leading-[1.4] text-text">
          {lead}
        </p>
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className={`mt-0 text-pretty text-base font-light leading-[2] text-text-secondary ${
              index === paragraphs.length - 1 ? "mb-0" : "mb-[26px]"
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
