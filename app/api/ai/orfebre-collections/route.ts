import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestArtisanCollections } from "@/lib/ai/orfebre-collections";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return Response.json({ error: "Artesano no encontrado" }, { status: 404 });
  }

  try {
    const suggestions = await suggestArtisanCollections(artisan.id);
    return Response.json({ suggestions });
  } catch (e) {
    console.error("Orfebre collections AI error:", e);
    return Response.json({ error: "Error generando sugerencias" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return Response.json({ error: "Artesano no encontrado" }, { status: 404 });
  }

  try {
    const { name, description, productIds } = await req.json();

    if (!name || !Array.isArray(productIds)) {
      return Response.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const collection = await prisma.collection.create({
      data: {
        artisanId: artisan.id,
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        description: description || null,
        products: { connect: productIds.map((id: string) => ({ id })) },
      },
    });

    return Response.json({ collection });
  } catch (e) {
    console.error("Create collection from AI error:", e);
    return Response.json({ error: "Error creando colección" }, { status: 500 });
  }
}
