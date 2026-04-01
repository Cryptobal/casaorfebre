import { GiftQuiz } from "@/components/gift/gift-quiz";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import Link from "next/link";

export const metadata = {
  title: "Encuentra el Regalo Perfecto — Casa Orfebre",
  description:
    "Usa nuestra guía inteligente para encontrar la joya artesanal chilena perfecta para regalar. Recomendaciones personalizadas según ocasión, estilo y presupuesto.",
  alternates: { canonical: "/regalos" },
  openGraph: {
    title: "Encuentra el Regalo Perfecto — Casa Orfebre",
    description:
      "Guía inteligente de regalos de joyería artesanal chilena. Recomendaciones personalizadas.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Encuentra el Regalo Perfecto — Casa Orfebre",
    description:
      "Guía inteligente de regalos de joyería artesanal chilena.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default function RegalosPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="pt-20 pb-12">
        <FadeIn>
          <SectionHeading
            title="Encuentra el regalo perfecto"
            subtitle="Responde unas pocas preguntas y te recomendaremos joyas artesanales ideales para la ocasión."
            as="h1"
          />
        </FadeIn>
      </div>

      <FadeIn delay={200}>
        <GiftQuiz />
      </FadeIn>

      {/* Internal links to gift pages */}
      <div className="mt-20 border-t border-[#e8e5df] pt-12">
        <h2 className="font-serif text-lg font-semibold text-[#1a1a18] text-center">
          También puedes explorar por presupuesto
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/regalos-bajo-30000"
            className="rounded-lg border border-[#e8e5df] px-4 py-2 text-sm text-[#1a1a18] transition-colors hover:border-[#8B7355] hover:text-[#8B7355]"
          >
            Regalos bajo $30.000
          </Link>
          <Link
            href="/regalos-bajo-50000"
            className="rounded-lg border border-[#e8e5df] px-4 py-2 text-sm text-[#1a1a18] transition-colors hover:border-[#8B7355] hover:text-[#8B7355]"
          >
            Regalos bajo $50.000
          </Link>
          <Link
            href="/regalos-bajo-100000"
            className="rounded-lg border border-[#e8e5df] px-4 py-2 text-sm text-[#1a1a18] transition-colors hover:border-[#8B7355] hover:text-[#8B7355]"
          >
            Regalos bajo $100.000
          </Link>
          <Link
            href="/coleccion/autorregalo"
            className="rounded-lg border border-[#e8e5df] px-4 py-2 text-sm text-[#1a1a18] transition-colors hover:border-[#8B7355] hover:text-[#8B7355]"
          >
            Autorregalo
          </Link>
        </div>
      </div>
    </section>
  );
}
