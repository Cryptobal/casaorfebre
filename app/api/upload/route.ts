import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { getArtisanPlanLimits } from "@/lib/plan-limits";
import { uploadLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limit: 20 uploads/min per user
  const { success } = await uploadLimiter.limit(session.user.id);
  if (!success) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un momento." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file || !productId) {
    return NextResponse.json({ error: "Archivo y productId requeridos" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Solo se permiten imágenes JPG, PNG o WebP" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen no debe superar 10 MB" }, { status: 400 });
  }

  // ── Enforce photo limit by plan ──
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { artisan: true, _count: { select: { images: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  // Ownership check: only the product's artisan can upload images
  if (product.artisan.userId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso para subir imágenes a este producto" }, { status: 403 });
  }

  if (product.status === "PENDING_REVIEW") {
    return NextResponse.json({ error: "No puedes modificar imágenes de un producto en revisión" }, { status: 400 });
  }
  try {
    const limits = await getArtisanPlanLimits(product.artisanId);
    if (limits.maxPhotosPerProduct > 0 && product._count.images >= limits.maxPhotosPerProduct) {
      const planLabel = limits.planName.charAt(0).toUpperCase() + limits.planName.slice(1);
      const upgradeMsg = limits.nextPlanName
        ? ` Actualiza a ${limits.nextPlanName} para subir más fotos.`
        : "";
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${limits.maxPhotosPerProduct} fotos por pieza de tu plan ${planLabel}.${upgradeMsg}` },
        { status: 400 }
      );
    }
  } catch {
    // If plan limits fail, allow upload (graceful degradation)
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const key = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToR2(buffer, key, file.type);

    // Get next position
    const maxPos = await prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const position = (maxPos._max.position ?? -1) + 1;

    const image = await prisma.productImage.create({
      data: {
        productId,
        url,
        position,
        status: "PENDING_REVIEW",
        isOriginal: true,
      },
    });

    return NextResponse.json({ url, imageId: image.id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get("imageId");

  if (!imageId) {
    return NextResponse.json({ error: "imageId requerido" }, { status: 400 });
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: { include: { artisan: true } } },
  });

  if (!image) {
    return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
  }

  if (image.product.artisan.userId !== session.user.id) {
    return NextResponse.json({ error: "No tienes permiso para eliminar esta imagen" }, { status: 403 });
  }

  if (image.product.status === "PENDING_REVIEW") {
    return NextResponse.json({ error: "No puedes modificar imágenes de un producto en revisión" }, { status: 400 });
  }

  // Delete from R2
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl && image.url.startsWith(publicUrl)) {
    const key = image.url.replace(`${publicUrl}/`, "");
    try {
      await deleteFromR2(key);
    } catch {
      // Continue even if R2 delete fails
    }
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  return NextResponse.json({ success: true });
}
