import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductForm } from "../product-form";
import { getActiveCategories, getActiveMaterials, getActiveSpecialties, getActiveOccasions } from "@/lib/queries/catalog";

export default async function NuevoProductoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const [categories, materials, specialties, occasions, collections] = await Promise.all([
    getActiveCategories(),
    getActiveMaterials(),
    getActiveSpecialties(),
    getActiveOccasions(),
    prisma.collection.findMany({
      where: { artisanId: artisan.id, isActive: true },
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-serif text-2xl font-semibold text-text">
        Nueva Pieza
      </h1>
      <ProductForm
        artisanId={artisan.id}
        categories={categories}
        materials={materials}
        specialties={specialties}
        occasions={occasions}
        collections={collections}
      />
    </div>
  );
}
