import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getArtisanMaterials, getArtisanCommissionRate } from "@/lib/actions/artisan-materials";
import { CalculadoraClient } from "./calculadora-client";

export default async function CalculadoraPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [materials, commissionRate] = await Promise.all([
    getArtisanMaterials(),
    getArtisanCommissionRate(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-2xl font-semibold text-text">
        Calculadora de Precio
      </h1>
      <p className="mt-1 text-sm text-text-tertiary">
        Calcula el precio sugerido para tus piezas basándote en tus costos
        reales de materiales y tiempo.
      </p>

      <CalculadoraClient
        initialMaterials={materials}
        commissionRate={commissionRate}
      />
    </div>
  );
}
