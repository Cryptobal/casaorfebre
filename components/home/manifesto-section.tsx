import { FadeIn } from "@/components/shared/fade-in";

/**
 * Manifiesto home — texto aprobado en el brief editorial v1 §2.1.
 * Layout: bg-background, py-32, centrado, prose-sm.
 */
export function ManifestoSection() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
        <FadeIn>
          <div className="font-serif text-xl font-light leading-relaxed text-text sm:text-2xl">
            <p>En Chile se sigue trabajando la plata a mano.</p>
            <p className="mt-8">
              Reunimos a quienes aún lo hacen — orfebres independientes,
              piezas únicas, cada una <span className="italic">firmada</span> por su autor.
            </p>
            <p className="mt-8">
              Curaduría pieza por pieza.
              <br />
              Autenticidad garantizada.
              <br />
              La mayor parte de cada venta llega directamente al artesano.
            </p>
          </div>

          <span aria-hidden className="mx-auto mt-12 block h-px w-[48px] bg-accent" />

          <p className="mt-6 text-[11px] font-light italic uppercase tracking-[0.2em] text-text-tertiary">
            Carlos y Camila
            <br />
            <span className="normal-case tracking-[0.15em]">Cofundadores</span>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
