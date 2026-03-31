"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function getArtisan() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  if (!artisan || artisan.status !== "APPROVED") return null;
  return artisan;
}

export async function createCollection(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "El nombre es requerido" };

  let slug = slugify(name);

  const existing = await prisma.collection.findUnique({
    where: { artisanId_slug: { artisanId: artisan.id, slug } },
  });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
  }

  try {
    await prisma.collection.create({
      data: {
        artisanId: artisan.id,
        name,
        slug,
        description,
      },
    });
    revalidatePath("/portal/orfebre/colecciones");
    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al crear la coleccion" };
  }
}

export async function updateCollection(
  collectionId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "El nombre es requerido" };

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, artisanId: artisan.id },
  });
  if (!collection) return { error: "Coleccion no encontrada" };

  let slug = slugify(name);
  if (slug !== collection.slug) {
    const existing = await prisma.collection.findUnique({
      where: { artisanId_slug: { artisanId: artisan.id, slug } },
    });
    if (existing && existing.id !== collectionId) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 5)}`;
    }
  }

  try {
    await prisma.collection.update({
      where: { id: collectionId },
      data: { name, slug, description },
    });
    revalidatePath("/portal/orfebre/colecciones");
    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al actualizar" };
  }
}

export async function deleteCollection(collectionId: string) {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, artisanId: artisan.id },
  });
  if (!collection) return { error: "Coleccion no encontrada" };

  try {
    await prisma.collection.delete({ where: { id: collectionId } });
    revalidatePath("/portal/orfebre/colecciones");
    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al eliminar" };
  }
}
