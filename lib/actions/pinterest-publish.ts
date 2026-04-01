"use server";

import { prisma } from "@/lib/prisma";
import { pinterestClient } from "@/lib/pinterest";

const CATEGORY_BOARD_MAP: Record<string, string | undefined> = {
  anillo: process.env.PINTEREST_BOARD_ANILLOS,
  anillos: process.env.PINTEREST_BOARD_ANILLOS,
  aro: process.env.PINTEREST_BOARD_AROS,
  aros: process.env.PINTEREST_BOARD_AROS,
  collar: process.env.PINTEREST_BOARD_COLLARES,
  collares: process.env.PINTEREST_BOARD_COLLARES,
  pulsera: process.env.PINTEREST_BOARD_PULSERAS,
  pulseras: process.env.PINTEREST_BOARD_PULSERAS,
  colgante: process.env.PINTEREST_BOARD_COLGANTES,
  colgantes: process.env.PINTEREST_BOARD_COLGANTES,
  dije: process.env.PINTEREST_BOARD_COLGANTES,
  dijes: process.env.PINTEREST_BOARD_COLGANTES,
};

function getBoardId(categories: { name: string; slug: string }[]): string {
  const defaultBoard = process.env.PINTEREST_BOARD_ID || "";

  for (const cat of categories) {
    const slug = cat.slug.toLowerCase();
    const name = cat.name.toLowerCase();
    const board = CATEGORY_BOARD_MAP[slug] || CATEGORY_BOARD_MAP[name];
    if (board) return board;
  }

  return defaultBoard;
}

function buildPinDescription(product: {
  name: string;
  description: string;
  artisan: { displayName: string; region: string | null };
  materials: { name: string }[];
  productionType: string;
}): string {
  const typeLabel =
    product.productionType === "UNIQUE"
      ? "Pieza única"
      : product.productionType === "MADE_TO_ORDER"
        ? "Pieza personalizada"
        : "Edición limitada";

  const materialsText =
    product.materials.length > 0
      ? `Materiales: ${product.materials.map((m) => m.name).join(", ")}.`
      : "";

  const region = product.artisan.region || "Chile";

  const desc = `${product.name} — ${product.description.slice(0, 150)}. Hecho a mano por ${product.artisan.displayName} en ${region}, Chile. ${materialsText} ${typeLabel}. ✨ Compra en Casa Orfebre — Joyería de Autor`;

  return desc.slice(0, 500);
}

export async function publishProductToPinterest(
  productId: string,
): Promise<{ success: boolean; error?: string; pinId?: string }> {
  if (!process.env.PINTEREST_ACCESS_TOKEN) {
    return { success: false, error: "Pinterest no configurado" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
      categories: { select: { name: true, slug: true } },
      materials: { select: { name: true } },
      artisan: { select: { displayName: true, region: true } },
    },
  });

  if (!product) return { success: false, error: "Producto no encontrado" };
  if (product.pinterestPinId)
    return { success: false, error: "Ya publicado en Pinterest" };
  if (product.images.length === 0)
    return { success: false, error: "Sin imágenes aprobadas" };
  if (product.status !== "APPROVED")
    return { success: false, error: "Producto no aprobado" };

  const boardId = getBoardId(product.categories);
  if (!boardId) return { success: false, error: "Board de Pinterest no configurado" };

  const description = buildPinDescription(product);

  const result = await pinterestClient.createPin({
    title: product.name,
    description,
    link: `https://casaorfebre.cl/coleccion/${product.slug}`,
    board_id: boardId,
    media_source: {
      source_type: "image_url",
      url: product.images[0].url,
    },
  });

  if (!result) return { success: false, error: "Error al crear Pin" };

  await prisma.product.update({
    where: { id: productId },
    data: { pinterestPinId: result.id },
  });

  return { success: true, pinId: result.id };
}
