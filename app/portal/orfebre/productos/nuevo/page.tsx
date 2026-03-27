import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductForm } from "../product-form";
import { getActiveSpecialties, getActiveOccasions } from "@/lib/queries/catalog";

export default async function NuevoProductoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const [specialties, occasions] = await Promise.all([
    getActiveSpecialties(),
    getActiveOccasions(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-serif text-2xl font-semibold text-text">
        Nueva Pieza
      </h1>
      <ProductForm
        artisanId={artisan.id}
        specialties={specialties}
        occasions={occasions}
      />
    </div>
  );
}
