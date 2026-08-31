"use server";

import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";
import {
  clampGalleryFocalX,
  MAX_GALLERY_UPLOAD_BYTES,
  MAX_HOME_GALLERY_IMAGES,
  suggestedGalleryCaption,
  type HomeConcept,
} from "@/lib/home-defaults";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

type ActionResult = { success?: boolean; error?: string; warning?: string };

async function requireAdmin(): Promise<{ error: string } | { ok: true }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "No autorizado" };
  }
  return { ok: true };
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/portal/admin/home");
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function sniffImageMime(
  buffer: Buffer
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function extForMime(mime: "image/jpeg" | "image/png" | "image/webp"): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return "webp";
}

function r2KeyFromPublicUrl(url: string): string | null {
  const bases = [
    process.env.R2_PUBLIC_URL,
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  ].filter((base): base is string => Boolean(base));

  for (const base of bases) {
    const normalized = base.replace(/\/$/, "");
    if (url.startsWith(`${normalized}/`)) {
      return url.slice(normalized.length + 1).split("?")[0];
    }
  }

  if (url.startsWith("r2://")) return url.slice(5);

  const marker = "home/galeria/";
  const idx = url.indexOf(marker);
  if (idx >= 0) return url.slice(idx).split("?")[0];

  return null;
}

export type HomeTextFields = {
  heroPhrase?: string;
  manifesto?: string;
  concepts?: HomeConcept[];
  galleryIntro?: string;
  contactInstagramText?: string;
  contactWhatsappText?: string;
};

export async function updateHomeTexts(
  fields: HomeTextFields
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  try {
    const data: {
      heroPhrase?: string | null;
      manifesto?: string | null;
      concepts?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
      galleryIntro?: string | null;
      contactInstagramText?: string | null;
      contactWhatsappText?: string | null;
    } = {};

    if (fields.heroPhrase !== undefined) {
      data.heroPhrase = emptyToNull(fields.heroPhrase);
    }
    if (fields.manifesto !== undefined) {
      data.manifesto = emptyToNull(fields.manifesto);
    }
    if (fields.galleryIntro !== undefined) {
      data.galleryIntro = emptyToNull(fields.galleryIntro);
    }
    if (fields.contactInstagramText !== undefined) {
      data.contactInstagramText = emptyToNull(fields.contactInstagramText);
    }
    if (fields.contactWhatsappText !== undefined) {
      data.contactWhatsappText = emptyToNull(fields.contactWhatsappText);
    }
    if (fields.concepts !== undefined) {
      if (!Array.isArray(fields.concepts) || fields.concepts.length !== 4) {
        return { error: "Debes completar los 4 conceptos" };
      }
      const sanitized: HomeConcept[] = fields.concepts.map((concept) => ({
        title: typeof concept.title === "string" ? concept.title : "",
        text: typeof concept.text === "string" ? concept.text : "",
      }));
      const allEmpty = sanitized.every(
        (c) => c.title.trim() === "" && c.text.trim() === ""
      );
      data.concepts = allEmpty
        ? Prisma.DbNull
        : (sanitized as unknown as Prisma.InputJsonValue);
    }

    if (Object.keys(data).length === 0) {
      return { error: "No hay cambios para guardar" };
    }

    await prisma.homeContent.upsert({
      where: { id: "home" },
      create: { id: "home", ...data },
      update: data,
    });

    revalidateHome();
    return { success: true };
  } catch (error) {
    console.error("[home-content] updateHomeTexts:", error);
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }
}

export type AddGalleryImagesResult = {
  success?: boolean;
  error?: string;
  added?: number;
  errors?: string[];
};

export async function addGalleryImages(
  formData: FormData
): Promise<AddGalleryImagesResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return { error: "No se recibieron fotos" };
  }

  try {
    const existingCount = await prisma.homeGalleryImage.count();
    const remaining = MAX_HOME_GALLERY_IMAGES - existingCount;
    if (remaining <= 0) {
      return {
        error: `Ya hay ${MAX_HOME_GALLERY_IMAGES} fotos. Borra alguna para agregar más.`,
      };
    }

    const maxOrder = await prisma.homeGalleryImage.aggregate({
      _max: { sortOrder: true },
    });
    let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const errors: string[] = [];
    let added = 0;
    let slots = remaining;

    for (const file of files) {
      const label = file.name || "foto";
      if (slots <= 0) {
        errors.push(`${label}: no se subió, se alcanzó el máximo de ${MAX_HOME_GALLERY_IMAGES} fotos`);
        continue;
      }
      if (file.size > MAX_GALLERY_UPLOAD_BYTES) {
        errors.push(`${label}: supera 2 MB después de comprimir`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mime = sniffImageMime(buffer);
        if (!mime) {
          errors.push(`${label}: formato no válido (usa JPG, PNG o WebP)`);
          continue;
        }

        const key = `home/galeria/${randomUUID()}.${extForMime(mime)}`;
        const url = await uploadToR2(buffer, key, mime);
        await prisma.homeGalleryImage.create({
          data: {
            url,
            caption: null,
            sortOrder: nextOrder,
          },
        });
        nextOrder += 1;
        added += 1;
        slots -= 1;
      } catch (error) {
        console.error("[home-content] addGalleryImages file:", error);
        errors.push(`${label}: no se pudo subir. Intenta de nuevo.`);
      }
    }

    if (added > 0) revalidateHome();

    if (added === 0) {
      return {
        error: errors[0] ?? "No se pudo subir ninguna foto",
        errors,
      };
    }

    return { success: true, added, errors: errors.length ? errors : undefined };
  } catch (error) {
    console.error("[home-content] addGalleryImages:", error);
    return { error: "No se pudieron subir las fotos. Intenta de nuevo." };
  }
}

export async function updateImageCaption(
  id: string,
  caption: string
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  if (!id) return { error: "Imagen no encontrada" };

  try {
    const image = await prisma.homeGalleryImage.findUnique({ where: { id } });
    if (!image) return { error: "Imagen no encontrada" };

    await prisma.homeGalleryImage.update({
      where: { id },
      data: { caption: emptyToNull(caption) },
    });

    revalidateHome();
    return { success: true };
  } catch (error) {
    console.error("[home-content] updateImageCaption:", error);
    return { error: "No se pudo guardar la leyenda" };
  }
}

export async function moveImage(
  id: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  if (direction !== "up" && direction !== "down") {
    return { error: "Movimiento no válido" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const images = await tx.homeGalleryImage.findMany({
        orderBy: { sortOrder: "asc" },
      });
      const index = images.findIndex((image) => image.id === id);
      if (index < 0) {
        throw new Error("NOT_FOUND");
      }
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= images.length) {
        return;
      }
      const reordered = [...images];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(swapIndex, 0, moved);

      await Promise.all(
        reordered.map((image, sortOrder) =>
          tx.homeGalleryImage.update({
            where: { id: image.id },
            data: { sortOrder },
          })
        )
      );
    });

    revalidateHome();
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return { error: "Imagen no encontrada" };
    }
    console.error("[home-content] moveImage:", error);
    return { error: "No se pudo reordenar" };
  }
}

export async function deleteImage(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  if (!id) return { error: "Imagen no encontrada" };

  try {
    const image = await prisma.homeGalleryImage.findUnique({ where: { id } });
    if (!image) return { error: "Imagen no encontrada" };

    await prisma.homeGalleryImage.delete({ where: { id } });

    let warning: string | undefined;
    const key = r2KeyFromPublicUrl(image.url);
    if (key?.startsWith("home/galeria/")) {
      try {
        await deleteFromR2(key);
      } catch (error) {
        console.error("[home-content] deleteFromR2:", error);
        warning = "La foto se quitó de la home, pero no se pudo borrar del almacenamiento.";
      }
    } else if (!image.productImageId && !key?.startsWith("home/galeria/")) {
      warning =
        "La foto se quitó de la home, pero no se encontró el archivo en el almacenamiento.";
    }

    revalidateHome();
    return { success: true, warning };
  } catch (error) {
    console.error("[home-content] deleteImage:", error);
    return { error: "No se pudo borrar la foto" };
  }
}

export async function updateImageFocal(
  id: string,
  focalX: number
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  if (!id) return { error: "Imagen no encontrada" };

  try {
    const image = await prisma.homeGalleryImage.findUnique({ where: { id } });
    if (!image) return { error: "Imagen no encontrada" };

    await prisma.homeGalleryImage.update({
      where: { id },
      data: { focalX: clampGalleryFocalX(focalX) },
    });

    revalidateHome();
    return { success: true };
  } catch (error) {
    console.error("[home-content] updateImageFocal:", error);
    return { error: "No se pudo guardar el encuadre" };
  }
}

export type AddGalleryFromProductsResult = {
  success?: boolean;
  error?: string;
  added?: number;
  skipped?: number;
};

export async function addGalleryFromProductImages(
  ids: string[]
): Promise<AddGalleryFromProductsResult> {
  const gate = await requireAdmin();
  if ("error" in gate) return gate;

  const uniqueIds = [
    ...new Set(
      (Array.isArray(ids) ? ids : []).filter(
        (id): id is string => typeof id === "string" && id.length > 0
      )
    ),
  ];

  if (uniqueIds.length === 0) {
    return { error: "No se seleccionaron fotos" };
  }

  try {
    const existingCount = await prisma.homeGalleryImage.count();
    const remaining = MAX_HOME_GALLERY_IMAGES - existingCount;
    if (remaining <= 0) {
      return {
        error: `Ya hay ${MAX_HOME_GALLERY_IMAGES} fotos. Borra alguna para agregar más.`,
      };
    }

    const [photos, alreadyUsed] = await Promise.all([
      prisma.productImage.findMany({
        where: { id: { in: uniqueIds }, status: "APPROVED" },
        select: {
          id: true,
          url: true,
          product: {
            select: {
              name: true,
              materials: { select: { name: true }, orderBy: { position: "asc" } },
            },
          },
        },
      }),
      prisma.homeGalleryImage.findMany({
        where: { productImageId: { in: uniqueIds } },
        select: { productImageId: true },
      }),
    ]);

    const photoById = new Map(photos.map((photo) => [photo.id, photo]));
    const usedIds = new Set(
      alreadyUsed
        .map((row) => row.productImageId)
        .filter((id): id is string => Boolean(id))
    );

    const toAdd: typeof photos = [];
    let skipped = 0;

    for (const id of uniqueIds) {
      const photo = photoById.get(id);
      if (!photo || usedIds.has(id)) {
        skipped += 1;
        continue;
      }
      if (toAdd.length >= remaining) {
        skipped += 1;
        continue;
      }
      toAdd.push(photo);
      usedIds.add(id);
    }

    if (toAdd.length === 0) {
      return {
        error:
          remaining <= 0
            ? `Ya hay ${MAX_HOME_GALLERY_IMAGES} fotos. Borra alguna para agregar más.`
            : "Esas fotos ya están en la galería o no están disponibles",
        skipped,
      };
    }

    const maxOrder = await prisma.homeGalleryImage.aggregate({
      _max: { sortOrder: true },
    });
    let nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    await prisma.homeGalleryImage.createMany({
      data: toAdd.map((photo) => ({
        url: photo.url,
        caption: suggestedGalleryCaption(
          photo.product.materials.map((material) => material.name),
          photo.product.name
        ) || null,
        sortOrder: nextOrder++,
        productImageId: photo.id,
      })),
    });

    revalidateHome();
    return { success: true, added: toAdd.length, skipped: skipped || undefined };
  } catch (error) {
    console.error("[home-content] addGalleryFromProductImages:", error);
    return { error: "No se pudieron agregar las fotos. Intenta de nuevo." };
  }
}
