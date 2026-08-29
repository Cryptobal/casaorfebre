import {
  MANIFIESTO_KICKER,
  MANIFIESTO_LEAD,
  MANIFIESTO_PARAGRAPHS,
} from "@/lib/site-config";

export function Manifiesto() {
  return (
    <section className="flex justify-center px-6 py-[clamp(96px,16vw,180px)]">
      <div className="max-w-[65ch]">
        <div className="mb-11 text-[11px] font-normal uppercase tracking-[0.32em] text-accent">
          {MANIFIESTO_KICKER}
        </div>
        <p className="mb-[30px] mt-0 text-pretty font-serif text-[clamp(24px,4.5vw,30px)] font-normal leading-[1.4] text-text">
          {MANIFIESTO_LEAD}
        </p>
        {MANIFIESTO_PARAGRAPHS.map((paragraph, index) => (
          <p
            key={paragraph}
            className={`mt-0 text-pretty text-base font-light leading-[2] text-text-secondary ${
              index === MANIFIESTO_PARAGRAPHS.length - 1 ? "mb-0" : "mb-[26px]"
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
