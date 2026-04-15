import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json()) as { productId?: string };
  if (!body.productId) {
    return Response.json({ error: "productId requerido" }, { status: 400 });
  }

  const collection = await prisma.curatedCollection.findUnique({
    where: { id },
    select: { id: true, slug: true, isActive: true },
  });
  if (!collection) {
    return Response.json({ error: "Colección no encontrada" }, { status: 404 });
  }

  const product = await prisma.product.findUnique({
    where: { id: body.productId },
    select: { id: true },
  });
  if (!product) {
    return Response.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  await prisma.curatedCollection.update({
    where: { id },
    data: { products: { connect: { id: body.productId } } },
  });

  revalidatePath("/colecciones");
  revalidatePath(`/colecciones/${collection.slug}`);
  revalidatePath(`/portal/admin/colecciones/${id}`);

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  if (!productId) {
    return Response.json({ error: "productId requerido" }, { status: 400 });
  }

  const collection = await prisma.curatedCollection.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!collection) {
    return Response.json({ error: "Colección no encontrada" }, { status: 404 });
  }

  await prisma.curatedCollection.update({
    where: { id },
    data: { products: { disconnect: { id: productId } } },
  });

  revalidatePath("/colecciones");
  revalidatePath(`/colecciones/${collection.slug}`);
  revalidatePath(`/portal/admin/colecciones/${id}`);

  return Response.json({ ok: true });
}
