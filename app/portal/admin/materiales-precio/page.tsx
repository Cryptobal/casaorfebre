import { prisma } from "@/lib/prisma";
import { MaterialPriceEditor } from "./material-price-editor";

export default async function MaterialesPrecioPage() {
  const materials = await prisma.materialPrice.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Precios de Referencia</h1>
      <p className="mt-2 text-sm text-text-tertiary">
        Estos precios son sugerencias iniciales para orfebres nuevos. Cada
        orfebre puede personalizar sus propios costos en la calculadora.
      </p>

      <MaterialPriceEditor materials={materials} />
    </div>
  );
}
