import type { Metadata } from "next";
import { ApplicationForm } from "./application-form";
import { getActiveCategories, getActiveMaterials } from "@/lib/queries/catalog";

export const metadata: Metadata = {
  title: "Postular como Orfebre",
  description:
    "Únete a Casa Orfebre. Postula como orfebre y vende tus piezas en nuestro marketplace curado de joyería artesanal chilena.",
};

export default async function PostularPage() {
  const [categories, materials] = await Promise.all([
    getActiveCategories(),
    getActiveMaterials(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
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
        <ApplicationForm
          categories={categories.map((c) => c.name)}
          materials={materials.map((m) => m.name)}
        />
      </div>
    </div>
  );
}
