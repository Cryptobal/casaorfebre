interface PioneerBannerProps {
  /**
   * Cuando se pasan `benefits`, el banner corresponde a una invitación con
   * código PIONERO-... ya validado. Sin `benefits`, se renderiza el banner
   * genérico de postulación al Programa Pioneros (flujo /para-pionero).
   */
  benefits?: {
    planDisplayName: string;
    price: string;
    freeMonths: number;
    totalValue: string;
  };
}

export function PioneerBanner({ benefits }: PioneerBannerProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-[#8B7355]/30 bg-gradient-to-br from-[#FAFAF8] to-[#f0ebe3]">
      <div className="px-6 py-6 text-center">
        {/* Founder badge */}
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#8B7355]/10">
          <svg
            className="h-6 w-6 text-[#8B7355]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-[#8B7355]">
          Programa Pioneros
        </p>

        {benefits ? (
          <>
            <h2 className="mt-2 font-serif text-xl font-light text-[#1a1a18] sm:text-2xl">
              {benefits.freeMonths} meses de Plan {benefits.planDisplayName} gratis
            </h2>

            <p className="mt-2 text-sm text-[#1a1a18]/60">
              Valor total:{" "}
              <span className="line-through">{benefits.totalValue}</span>{" "}
              <span className="font-medium text-green-700">$0</span>
            </p>

            <p className="mt-3 text-sm text-[#1a1a18]/70">
              Completa tu postulación y al ser aprobado tu plan se activará
              automáticamente.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-serif text-xl font-light text-[#1a1a18] sm:text-2xl">
              Estás postulando como Pionero
            </h2>

            <p className="mt-3 mx-auto max-w-md text-sm text-[#1a1a18]/70">
              Si tu portafolio es aprobado, activamos automáticamente{" "}
              <span className="font-medium text-[#1a1a18]">3 meses de Plan Maestro gratis</span>{" "}
              y 0% de comisión. Sin contratos, sin permanencia.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
