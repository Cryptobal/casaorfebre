import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiCollectionLimiter } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import {
  suggestCollections,
  refreshCollectionProducts,
  type CollectionSuggestion,
  type ProductSummary,
} from "@/lib/ai/collections";

async function getApprovedProducts(): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      name: true,
      price: true,
      categories: { select: { name: true } },
      materials: { select: { name: true } },
      artisan: { select: { displayName: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.categories[0]?.name || "Joyería",
    materials: p.materials.map((m) => m.name),
    price: p.price,
    artisanName: p.artisan.displayName,
  }));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { success } = await aiCollectionLimiter.limit(session.user.id);
  if (!success) {
    return Response.json(
      { error: "Demasiadas solicitudes. Máximo 5 por hora." },
      { status: 429 },
    );
  }

  const body = await req.json() as {
    action: "suggest" | "create-from-suggestion" | "refresh";
    collectionId?: string;
    suggestion?: CollectionSuggestion;
  };

  try {
    if (body.action === "suggest") {
      const products = await getApprovedProducts();
      const existing = await prisma.curatedCollection.findMany({
        select: { name: true },
      });

      const suggestions = await suggestCollections({
        products,
        existingCollections: existing.map((c) => c.name),
      });

      return Response.json({ suggestions });
    }

    if (body.action === "create-from-suggestion") {
      if (!body.suggestion) {
        return Response.json({ error: "Se requiere suggestion" }, { status: 400 });
      }

      const s = body.suggestion;

      // Check slug uniqueness
      const existingSlug = await prisma.curatedCollection.findUnique({
        where: { slug: s.slug },
      });
      const slug = existingSlug ? `${s.slug}-${Date.now().toString(36)}` : s.slug;

      const collection = await prisma.curatedCollection.create({
        data: {
          name: s.name,
          slug,
          description: s.description,
          metaTitle: s.metaTitle,
          metaDescription: s.metaDescription,
          isActive: false,
          curatedAt: new Date(),
          products: {
            connect: s.productIds.map((id) => ({ id })),
          },
        },
        include: { _count: { select: { products: true } } },
      });

      revalidatePath("/colecciones");
      revalidatePath("/portal/admin/colecciones");

      return Response.json({ collection });
    }

    if (body.action === "refresh") {
      if (!body.collectionId) {
        return Response.json({ error: "Se requiere collectionId" }, { status: 400 });
      }

      const collection = await prisma.curatedCollection.findUnique({
        where: { id: body.collectionId },
        include: { products: { select: { id: true } } },
      });
      if (!collection) {
        return Response.json({ error: "Colección no encontrada" }, { status: 404 });
      }

      const allProducts = await getApprovedProducts();
      const newProductIds = await refreshCollectionProducts(
        { name: collection.name, description: collection.description || "" },
        allProducts
      );

      // Validate IDs exist
      const validIds = allProducts.map((p) => p.id);
      const filteredIds = newProductIds.filter((id) => validIds.includes(id));

      const oldIds = new Set(collection.products.map((p) => p.id));
      const newIds = new Set(filteredIds);
      const added = filteredIds.filter((id) => !oldIds.has(id));
      const removed = collection.products.filter((p) => !newIds.has(p.id)).map((p) => p.id);

      await prisma.curatedCollection.update({
        where: { id: body.collectionId },
        data: {
          curatedAt: new Date(),
          products: {
            connect: added.map((id) => ({ id })),
            disconnect: removed.map((id) => ({ id })),
          },
        },
      });

      revalidatePath("/colecciones");
      revalidatePath(`/colecciones/${collection.slug}`);
      revalidatePath("/portal/admin/colecciones");
      revalidatePath(`/portal/admin/colecciones/${body.collectionId}`);

      return Response.json({
        stats: { added: added.length, removed: removed.length, total: filteredIds.length },
      });
    }

    return Response.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("AI collections failed:", error);
    return Response.json(
      { error: "Error al procesar. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
