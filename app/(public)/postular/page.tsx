import type { Metadata } from "next";
import { PostularFlow } from "./postular-flow";
import {
  getActiveCategories,
  getActiveMaterials,
  getActiveSpecialties,
  getActivePlans,
} from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "Postular como Orfebre",
  description:
    "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestra plataforma de joyería artesanal chilena. Verificamos autoría, no estilos.",
  alternates: { canonical: "/postular" },
  openGraph: {
    title: "Postular como Orfebre | Casa Orfebre",
    description:
      "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestra plataforma de joyería artesanal chilena. Verificamos autoría, no estilos.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Postular como Orfebre | Casa Orfebre",
    description:
      "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestra plataforma de joyería artesanal chilena. Verificamos autoría, no estilos.",
    images: ["/casaorfebre-og-image.png"],
  },
};

export default async function PostularPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; code?: string; pionero?: string }>;
}) {
  const { plan: preselectedPlan, code: promoCodeParam, pionero } = await searchParams;
  const isPioneerApplication = pionero === "1" || pionero === "true";

  // Validate promo code server-side if present
  let promoData: {
    valid: boolean;
    planName?: string;
    durationDays?: number;
    campaign?: string;
    reason?: string;
    benefits?: {
      planDisplayName: string;
      price: string;
      freeMonths: number;
      totalValue: string;
    };
  } | null = null;

  if (promoCodeParam) {
    const { prisma } = await import("@/lib/prisma");
    const code = promoCodeParam.trim().toUpperCase();
    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (!promo || !promo.isActive) {
      promoData = { valid: false, reason: "not_found" };
    } else if (promo.expiresAt < new Date()) {
      promoData = { valid: false, reason: "expired" };
    } else if (promo.currentUses >= promo.maxUses) {
      promoData = { valid: false, reason: "used" };
    } else {
      const plan = await prisma.membershipPlan.findFirst({
        where: { name: { equals: promo.planName, mode: "insensitive" } },
      });
      const freeMonths = Math.round(promo.durationDays / 30);
      const totalValue = plan ? plan.price * freeMonths : 0;
      const fmt = (v: number) =>
        new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          maximumFractionDigits: 0,
        }).format(v);

      promoData = {
        valid: true,
        planName: promo.planName,
        durationDays: promo.durationDays,
        campaign: promo.campaign,
        benefits: {
          planDisplayName: plan
            ? plan.name.charAt(0).toUpperCase() + plan.name.slice(1)
            : promo.planName,
          price: plan ? `${fmt(plan.price)}/mes` : "",
          freeMonths,
          totalValue: fmt(totalValue),
        },
      };
    }
  }

  const [categories, materials, specialties, plans] = await Promise.all([
    getActiveCategories(),
    getActiveMaterials(),
    getActiveSpecialties(),
    getActivePlans(),
  ]);

  const headerTitle = promoData?.valid
    ? "Bienvenido al Programa Pioneros"
    : isPioneerApplication
      ? "Postula al Programa Pioneros"
      : "Postula como Orfebre";

  const headerSubtitle = promoData?.valid
    ? "Has sido seleccionado como uno de los primeros orfebres de Casa Orfebre."
    : isPioneerApplication
      ? "Si te aprobamos, activamos 3 meses de Plan Maestro gratis y 0% de comisión en tu cuenta."
      : "Una plataforma para orfebres que diseñan o producen sus propias piezas. Verificamos autoría, no estilos.";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">
          {headerTitle}
        </h1>
        <p className="mt-3 text-text-secondary">{headerSubtitle}</p>
      </div>

      {!promoData?.valid && !isPioneerApplication && (
        <section
          className="mx-auto mt-10 max-w-2xl rounded-xl border border-border bg-surface/60 px-6 py-6 text-left sm:px-8"
          aria-labelledby="criterios-verificacion"
        >
          <h2
            id="criterios-verificacion"
            className="font-serif text-lg font-light text-text"
          >
            Qué verificamos
          </h2>
          <p className="mt-2 text-sm font-light text-text-secondary">
            No es un jurado de estilo: confirmamos que detrás de tu taller hay
            trabajo propio y piezas auténticas.
          </p>
          <ul className="mt-4 space-y-2.5 text-sm font-light text-text-secondary">
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              <span>
                Eres orfebre o creadora real de las piezas que postulas.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              <span>
                No revendes productos importados ni comprados al por mayor.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              <span>
                Tienes trabajo propio: diseño, fabricación o participación real
                en la producción.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              <span>
                Tus fotos e información cumplen un estándar mínimo de la
                plataforma.
              </span>
            </li>
          </ul>
        </section>
      )}

      <div className="mt-12">
        <PostularFlow
          plans={plans}
          preselectedPlan={
            promoData?.valid
              ? promoData.planName!
              : isPioneerApplication
                ? "maestro"
                : preselectedPlan || null
          }
          specialties={specialties.map((s) => s.name)}
          categories={categories.map((c) => c.name)}
          materials={materials.map((m) => m.name)}
          promoCode={promoData?.valid ? promoCodeParam!.trim().toUpperCase() : null}
          promoData={promoData}
          isPioneerApplication={isPioneerApplication && !promoData?.valid}
        />
      </div>
    </div>
  );
}
