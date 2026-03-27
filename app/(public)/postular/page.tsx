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
};

export default async function PostularPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: preselectedPlan } = await searchParams;
  const [categories, materials, specialties, plans] = await Promise.all([
    getActiveCategories(),
    getActiveMaterials(),
    getActiveSpecialties(),
    getActivePlans(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-light sm:text-4xl">
          Postula como Orfebre
        </h1>
        <p className="mt-3 text-text-secondary">
          Únete a nuestra comunidad de artesanos verificados y muestra tu
          trabajo al mundo.
        </p>
      </div>

      <div className="mt-12">
        <PostularFlow
          plans={plans}
          preselectedPlan={preselectedPlan || null}
          specialties={specialties.map((s) => s.name)}
          categories={categories.map((c) => c.name)}
          materials={materials.map((m) => m.name)}
        />
      </div>
    </div>
  );
}
