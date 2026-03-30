"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { getArtisanPlanLimits } from "@/lib/plan-limits";
import { revalidatePath } from "next/cache";
import type { ProductionType } from "@prisma/client";

async function getArtisan() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan || artisan.status !== "APPROVED") return null;
  return artisan;
}

function parseFormData(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const story = (formData.get("story") as string) || null;
  const category = formData.get("category") as string;
  const materialsRaw = formData.get("materials") as string;
  const materials = materialsRaw
    ? materialsRaw.split(",").map((m) => m.trim()).filter(Boolean)
    : [];
  const technique = (formData.get("technique") as string) || null;
  const price = parseInt(formData.get("price") as string, 10);
  const compareAtPriceRaw = formData.get("compareAtPrice") as string;
  const compareAtPrice = compareAtPriceRaw ? parseInt(compareAtPriceRaw, 10) : null;

  // Production type system
  const productionType = (formData.get("productionType") as string) || "UNIQUE";
  const isCustomizable = formData.get("isCustomizable") === "on";
  const elaborationDaysRaw = formData.get("elaborationDays") as string;
  const elaborationDays = elaborationDaysRaw ? parseInt(elaborationDaysRaw, 10) : null;

  // Variants (JSON from hidden input)
  const variantsRaw = formData.get("variants") as string;
  let variants: { size: string; stock: number }[] = [];
  if (variantsRaw) {
    try { variants = JSON.parse(variantsRaw); } catch { variants = []; }
  }

  // Calculate stock and isReturnable based on productionType
  let stock = 1;
  let isReturnable = true;
  if (productionType === "UNIQUE") {
    stock = 1;
  } else if (productionType === "MADE_TO_ORDER") {
    stock = 0;
    isReturnable = false;
  } else if (productionType === "LIMITED") {
    if (variants.length > 0) {
      stock = variants.reduce((sum, v) => sum + v.stock, 0);
    } else {
      const stockRaw = formData.get("stock") as string;
      stock = stockRaw ? parseInt(stockRaw, 10) : 1;
    }
  }

  const dimensions = (formData.get("dimensions") as string) || null;
  const weightRaw = formData.get("weight") as string;
  const weight = weightRaw ? parseFloat(weightRaw) : null;
  const specialtyId = (formData.get("specialtyId") as string) || null;
  const occasionIdsRaw = formData.get("occasionIds") as string;
  const occasionIds = occasionIdsRaw
    ? occasionIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  // Detail fields
  const coleccion = (formData.get("coleccion") as string) || null;
  const tallasRaw = formData.get("tallas") as string;
  const tallas = tallasRaw
    ? tallasRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const guiaTallas = (formData.get("guiaTallas") as string) || null;
  const largoCadenaCmRaw = formData.get("largoCadenaCm") as string;
  const largoCadenaCm = largoCadenaCmRaw ? parseFloat(largoCadenaCmRaw) : null;
  const diametroMmRaw = formData.get("diametroMm") as string;
  const diametroMm = diametroMmRaw ? parseFloat(diametroMmRaw) : null;
  const personalizable = formData.get("personalizable") === "on";
  const detallePersonalizacion = (formData.get("detallePersonalizacion") as string) || null;
  const tiempoElaboracionDiasRaw = formData.get("tiempoElaboracionDias") as string;
  const tiempoElaboracionDias = tiempoElaboracionDiasRaw ? parseInt(tiempoElaboracionDiasRaw, 10) : null;
  const cantidadEdicionRaw = formData.get("cantidadEdicion") as string;
  const cantidadEdicion = cantidadEdicionRaw ? parseInt(cantidadEdicionRaw, 10) : null;
  const cuidados = (formData.get("cuidados") as string) || null;
  const empaque = (formData.get("empaque") as string) || null;
  const garantia = (formData.get("garantia") as string) || null;

  return {
    name,
    description,
    story,
    category,
    materials,
    technique,
    price,
    compareAtPrice,
    productionType,
    isCustomizable,
    elaborationDays,
    variants,
    stock,
    isReturnable,
    dimensions,
    weight,
    specialtyId,
    occasionIds,
    coleccion,
    tallas,
    guiaTallas,
    largoCadenaCm,
    diametroMm,
    personalizable,
    detallePersonalizacion,
    tiempoElaboracionDias,
    cantidadEdicion,
    cuidados,
    empaque,
    garantia,
  };
}

export async function createProduct(
  _prevState: { error?: string; success?: boolean; productId?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean; productId?: string }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos para crear productos" };

  const data = parseFormData(formData);

  if (!data.name || !data.description || !data.price) {
    return { error: "Nombre, descripcion y precio son requeridos" };
  }

  if (data.price < 1000) {
    return { error: "El precio minimo es $1.000 CLP" };
  }

  // ── Enforce product limit by plan ──
  const limits = await getArtisanPlanLimits(artisan.id);
  if (limits.maxProducts > 0) {
    const activeCount = await prisma.product.count({
      where: {
        artisanId: artisan.id,
        status: { in: ["DRAFT", "PENDING_REVIEW", "APPROVED"] },
      },
    });
    if (activeCount >= limits.maxProducts) {
      const planLabel = limits.planName.charAt(0).toUpperCase() + limits.planName.slice(1);
      const upgradeMsg = limits.nextPlanName
        ? ` Actualiza a ${limits.nextPlanName} para publicar más piezas.`
        : "";
      return {
        error: `Has alcanzado el límite de ${limits.maxProducts} productos de tu plan ${planLabel}.${upgradeMsg}`,
      };
    }
  }

  let slug = slugify(data.name);

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        artisanId: artisan.id,
        slug,
        name: data.name,
        description: data.description,
        story: data.story,
        category: data.category as "AROS" | "COLLAR" | "ANILLO" | "PULSERA" | "BROCHE" | "COLGANTE" | "OTRO",
        materials: data.materials,
        specialtyId: data.specialtyId,
        occasions: data.occasionIds.length > 0
          ? { connect: data.occasionIds.map((id) => ({ id })) }
          : undefined,
        technique: data.technique,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        productionType: data.productionType as ProductionType,
        isCustomizable: data.isCustomizable,
        elaborationDays: data.productionType === "MADE_TO_ORDER" ? data.elaborationDays : null,
        stock: data.stock,
        isReturnable: data.isReturnable,
        dimensions: data.dimensions,
        weight: data.weight,
        coleccion: data.coleccion,
        tallas: data.tallas,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        status: "DRAFT",
      },
    });

    // Create variants if provided
    if (data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId: product.id,
          size: v.size,
          stock: v.stock,
        })),
      });
    }

    revalidatePath("/portal/orfebre/productos");
    return { success: true, productId: product.id };
  } catch {
    return { error: "Error al crear el producto" };
  }
}

export async function updateProduct(
  productId: string,
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  const data = parseFormData(formData);

  if (!data.name || !data.description || !data.price) {
    return { error: "Nombre, descripcion y precio son requeridos" };
  }

  if (data.price < 1000) {
    return { error: "El precio minimo es $1.000 CLP" };
  }

  // If product was APPROVED and key fields changed, set to PENDING_REVIEW
  let newStatus = product.status;
  if (product.status === "APPROVED") {
    const categoryChanged = data.category !== product.category;
    const materialsChanged =
      JSON.stringify(data.materials.sort()) !== JSON.stringify([...product.materials].sort());
    const priceChanged = data.price !== product.price;

    if (categoryChanged || materialsChanged || priceChanged) {
      newStatus = "PENDING_REVIEW";
    }
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        story: data.story,
        category: data.category as "AROS" | "COLLAR" | "ANILLO" | "PULSERA" | "BROCHE" | "COLGANTE" | "OTRO",
        materials: data.materials,
        specialtyId: data.specialtyId,
        occasions: { set: data.occasionIds.map((id) => ({ id })) },
        technique: data.technique,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        productionType: data.productionType as ProductionType,
        isCustomizable: data.isCustomizable,
        elaborationDays: data.productionType === "MADE_TO_ORDER" ? data.elaborationDays : null,
        stock: data.stock,
        isReturnable: data.isReturnable,
        dimensions: data.dimensions,
        weight: data.weight,
        coleccion: data.coleccion,
        tallas: data.tallas,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        status: newStatus,
      },
    });

    // Recreate variants
    await prisma.productVariant.deleteMany({ where: { productId } });
    if (data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId,
          size: v.size,
          stock: v.stock,
        })),
      });
    }

    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el producto" };
  }
}

export async function submitForReview(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  if (product.images.length === 0) {
    return { error: "El producto debe tener al menos 1 imagen" };
  }

  if (!product.name || !product.description || product.price <= 0) {
    return { error: "El producto debe tener nombre, descripcion y precio mayor a 0" };
  }

  // Validate mandatory measurements by category
  const cat = product.category;
  if (cat === "ANILLO" && product.productionType === "LIMITED") {
    const variantCount = await prisma.productVariant.count({ where: { productId } });
    if (product.tallas.length === 0 && variantCount === 0) {
      return { error: "Los anillos con producción limitada requieren tallas o stock por talla para publicarse" };
    }
  }
  if (cat === "COLLAR" || cat === "COLGANTE") {
    if (!product.largoCadenaCm) {
      return { error: "Los collares y colgantes requieren el largo de cadena (cm) para publicarse" };
    }
  }
  if (cat === "AROS") {
    if (!product.diametroMm) {
      return { error: "Los aros requieren el diámetro (mm) para publicarse" };
    }
  }
  if (cat === "PULSERA") {
    if (!product.diametroMm) {
      return { error: "Las pulseras requieren el diámetro o largo (mm) para publicarse" };
    }
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: "PENDING_REVIEW" },
    });

    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al enviar a revision" };
  }
}

export async function saveAndSubmitForReview(
  productId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  const data = parseFormData(formData);

  if (!data.name || !data.description || !data.price) {
    return { error: "Nombre, descripcion y precio son requeridos" };
  }

  if (data.price < 1000) {
    return { error: "El precio minimo es $1.000 CLP" };
  }

  if (product.images.length === 0) {
    return { error: "El producto debe tener al menos 1 imagen" };
  }

  const cat = data.category;
  if (cat === "ANILLO" && data.productionType === "LIMITED" && data.tallas.length === 0 && data.variants.length === 0) {
    return { error: "Los anillos con producción limitada requieren tallas o stock por talla para publicarse" };
  }
  if ((cat === "COLLAR" || cat === "COLGANTE") && !data.largoCadenaCm) {
    return { error: "Los collares y colgantes requieren el largo de cadena (cm) para publicarse" };
  }
  if (cat === "AROS" && !data.diametroMm) {
    return { error: "Los aros requieren el diámetro (mm) para publicarse" };
  }
  if (cat === "PULSERA" && !data.diametroMm) {
    return { error: "Las pulseras requieren el diámetro o largo (mm) para publicarse" };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        story: data.story,
        category: data.category as "AROS" | "COLLAR" | "ANILLO" | "PULSERA" | "BROCHE" | "COLGANTE" | "OTRO",
        materials: data.materials,
        specialtyId: data.specialtyId,
        occasions: { set: data.occasionIds.map((id) => ({ id })) },
        technique: data.technique,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        productionType: data.productionType as ProductionType,
        isCustomizable: data.isCustomizable,
        elaborationDays: data.productionType === "MADE_TO_ORDER" ? data.elaborationDays : null,
        stock: data.stock,
        isReturnable: data.isReturnable,
        dimensions: data.dimensions,
        weight: data.weight,
        coleccion: data.coleccion,
        tallas: data.tallas,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        status: "PENDING_REVIEW",
      },
    });

    // Recreate variants
    await prisma.productVariant.deleteMany({ where: { productId } });
    if (data.variants.length > 0) {
      await prisma.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId,
          size: v.size,
          stock: v.stock,
        })),
      });
    }

    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al enviar a revision" };
  }
}

export async function togglePauseProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  if (product.status !== "APPROVED" && product.status !== "PAUSED") {
    return { error: "Solo se pueden pausar/reanudar productos aprobados" };
  }

  const newStatus = product.status === "APPROVED" ? "PAUSED" : "APPROVED";

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
    });

    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al cambiar estado del producto" };
  }
}

export async function deleteProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      _count: { select: { orderItems: true } },
    },
  });

  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  if (product._count.orderItems > 0) {
    return {
      error:
        "No se puede eliminar un producto con ventas. Pausa el producto en su lugar.",
    };
  }

  try {
    const publicUrl = process.env.R2_PUBLIC_URL;
    for (const img of product.images) {
      if (publicUrl && img.url.startsWith(publicUrl)) {
        const key = img.url.replace(`${publicUrl}/`, "");
        try {
          await deleteFromR2(key);
        } catch {
          // best-effort
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { productId } });
      await tx.certificate.deleteMany({ where: { productId } });
      await tx.conversation.updateMany({
        where: { productId },
        data: { productId: null },
      });
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });
  } catch (e) {
    console.error("[deleteProduct]", productId, e);
    return {
      error:
        "No se pudo eliminar el producto. Recarga la página e intenta de nuevo.",
    };
  }

  revalidatePath("/portal/orfebre/productos");
  revalidatePath("/coleccion");
  return { success: true };
}

export async function deleteProductImage(
  imageId: string
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });

  if (!image || image.product.artisanId !== artisan.id) {
    return { error: "Imagen no encontrada" };
  }

  // Extract key from URL
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

  revalidatePath("/portal/orfebre/productos");
  return { success: true };
}
