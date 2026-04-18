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
    "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestro marketplace curado de joyería artesanal chilena.",
  alternates: { canonical: "/postular" },
  openGraph: {
    title: "Postular como Orfebre | Casa Orfebre",
    description:
      "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestro marketplace curado de joyería artesanal chilena.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Postular como Orfebre | Casa Orfebre",
    description:
      "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestro marketplace curado de joyería artesanal chilena.",
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
      : "Únete a nuestra comunidad de artesanos verificados y muestra tu trabajo al mundo.";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">
          {headerTitle}
        </h1>
        <p className="mt-3 text-text-secondary">{headerSubtitle}</p>
      </div>

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
