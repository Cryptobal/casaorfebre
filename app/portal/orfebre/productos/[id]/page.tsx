import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "../product-form";
import { getActiveCategories, getActiveMaterials, getActiveSpecialties, getActiveOccasions } from "@/lib/queries/catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  // Get artisan's active plan to check videoEnabled
  const activeSub = await prisma.membershipSubscription.findFirst({
    where: { artisanId: artisan.id, status: "ACTIVE" },
    include: { plan: true },
    orderBy: { startDate: "desc" },
  });

  const [product, categories, allMaterials, specialties, occasions, collections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        video: true,
        categories: { select: { id: true } },
        materials: { select: { id: true } },
        occasions: { select: { id: true } },
        specialties: { select: { id: true } },
        variants: { orderBy: { size: "asc" } },
      },
    }),
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

  if (!product || product.artisanId !== artisan.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {product.status === "REJECTED" && product.adminNotes && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-medium text-red-800">Producto rechazado</h2>
          <p className="mt-1 text-sm text-red-700">{product.adminNotes}</p>
        </div>
      )}

      <h1 className="mb-8 font-serif text-2xl font-semibold text-text">
        Editar Pieza
      </h1>

      <ProductForm
        artisanId={artisan.id}
        categories={categories}
        materials={allMaterials}
        specialties={specialties}
        occasions={occasions}
        collections={collections}
        videoEnabled={activeSub?.plan?.videoEnabled ?? false}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          story: product.story,
          categoryIds: product.categories.map((c) => c.id),
          materialIds: product.materials.map((m) => m.id),
          technique: product.technique,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          productionType: product.productionType,
          isCustomizable: product.isCustomizable,
          elaborationDays: product.elaborationDays,
          stock: product.stock,
          dimensions: product.dimensions,
          weight: product.weight,
          status: product.status,
          adminNotes: product.adminNotes,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            position: img.position,
          })),
          video: product.video
            ? {
                cloudflareStreamUid: product.video.cloudflareStreamUid,
                status: product.video.status,
              }
            : null,
          specialtyIds: product.specialties.map((s) => s.id),
          occasionIds: product.occasions.map((o) => o.id),
          variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
          collectionId: product.collectionId,
          tallas: product.tallas,
          tallaUnica: product.tallaUnica,
          tallaAjusteArriba: product.tallaAjusteArriba,
          tallaAjusteAbajo: product.tallaAjusteAbajo,
          guiaTallas: product.guiaTallas,
          largoCadenaCm: product.largoCadenaCm,
          diametroMm: product.diametroMm,
          personalizable: product.personalizable,
          detallePersonalizacion: product.detallePersonalizacion,
          tiempoElaboracionDias: product.tiempoElaboracionDias,
          cantidadEdicion: product.cantidadEdicion,
          cuidados: product.cuidados,
          empaque: product.empaque,
          garantia: product.garantia,
        }}
      />
    </div>
  );
}
