import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
