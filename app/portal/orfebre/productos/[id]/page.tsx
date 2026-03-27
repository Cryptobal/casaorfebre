import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "../product-form";
import { getActiveSpecialties, getActiveOccasions } from "@/lib/queries/catalog";

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

  const [product, specialties, occasions] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        video: true,
        occasions: { select: { id: true } },
      },
    }),
    getActiveSpecialties(),
    getActiveOccasions(),
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
        specialties={specialties}
        occasions={occasions}
        videoEnabled={activeSub?.plan?.videoEnabled ?? false}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          story: product.story,
          category: product.category,
          materials: product.materials,
          technique: product.technique,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          isUnique: product.isUnique,
          editionSize: product.editionSize,
          stock: product.stock,
          isCustomMade: product.isCustomMade,
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
          specialtyId: product.specialtyId,
          occasionIds: product.occasions.map((o) => o.id),
        }}
      />
    </div>
  );
}
