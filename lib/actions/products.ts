"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { getArtisanPlanLimits } from "@/lib/plan-limits";
import { revalidatePath } from "next/cache";
import type { ProductionType } from "@prisma/client";
import { getActiveCategories } from "@/lib/queries/catalog";

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
  const categoryIdsRaw = formData.get("categoryIds") as string;
  const categoryIds = categoryIdsRaw
    ? categoryIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];
  const materialIdsRaw = formData.get("materialIds") as string;
  const materialIds = materialIdsRaw
    ? materialIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
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
  const specialtyIdsRaw = formData.get("specialtyIds") as string;
  const specialtyIds = specialtyIdsRaw
    ? specialtyIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];
  const occasionIdsRaw = formData.get("occasionIds") as string;
  const occasionIds = occasionIdsRaw
    ? occasionIdsRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  // Detail fields
  const collectionId = (formData.get("collectionId") as string) || null;
  const tallasRaw = formData.get("tallas") as string;
  const tallas = tallasRaw
    ? tallasRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  const tallaUnica = (formData.get("tallaUnica") as string) || null;
  const tallaAjusteArribaRaw = formData.get("tallaAjusteArriba") as string;
  const tallaAjusteArriba = tallaAjusteArribaRaw ? parseInt(tallaAjusteArribaRaw, 10) : null;
  const tallaAjusteAbajoRaw = formData.get("tallaAjusteAbajo") as string;
  const tallaAjusteAbajo = tallaAjusteAbajoRaw ? parseInt(tallaAjusteAbajoRaw, 10) : null;
  const guiaTallas = (formData.get("guiaTallas") as string) || null;
  const largoCadenaCmRaw = formData.get("largoCadenaCm") as string;
  const largoCadenaCm = largoCadenaCmRaw ? parseFloat(largoCadenaCmRaw) : null;
  const tieneCadena = formData.get("tieneCadena") === "on";
  const espesorCadenaMmRaw = formData.get("espesorCadenaMm") as string;
  const espesorCadenaMm = espesorCadenaMmRaw ? parseFloat(espesorCadenaMmRaw) : null;
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

  // ── Audiencia ──
  const audiencia = (formData.get("audiencia") as string) || "SIN_ESPECIFICAR";

  // ── Medidas específicas por categoría ──
  const pendantWidthRaw = formData.get("pendantWidth") as string;
  const pendantWidth = pendantWidthRaw ? parseFloat(pendantWidthRaw) : null;
  const pendantHeightRaw = formData.get("pendantHeight") as string;
  const pendantHeight = pendantHeightRaw ? parseFloat(pendantHeightRaw) : null;
  const earringWidthRaw = formData.get("earringWidth") as string;
  const earringWidth = earringWidthRaw ? parseFloat(earringWidthRaw) : null;
  const earringDropRaw = formData.get("earringDrop") as string;
  const earringDrop = earringDropRaw ? parseFloat(earringDropRaw) : null;
  const broochWidthRaw = formData.get("broochWidth") as string;
  const broochWidth = broochWidthRaw ? parseFloat(broochWidthRaw) : null;
  const broochHeightRaw = formData.get("broochHeight") as string;
  const broochHeight = broochHeightRaw ? parseFloat(broochHeightRaw) : null;
  const piercingGauge = (formData.get("piercingGauge") as string) || null;
  const piercingBarLengthRaw = formData.get("piercingBarLength") as string;
  const piercingBarLength = piercingBarLengthRaw ? parseFloat(piercingBarLengthRaw) : null;

  // ── Piedras ──
  const stonesJson = formData.get("stonesJson") as string;
  let stonesData: Array<{
    id?: string;
    stoneType: string;
    stoneCarat: string;
    stoneColor: string;
    stoneCut: string;
    stoneOrigin: string;
    stoneClarity: string;
    quantity: string;
  }> = [];
  try {
    if (stonesJson) stonesData = JSON.parse(stonesJson);
  } catch { /* ignore */ }

  return {
    name,
    description,
    story,
    categoryIds,
    materialIds,
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
    specialtyIds,
    occasionIds,
    collectionId,
    tallas,
    tallaUnica,
    tallaAjusteArriba,
    tallaAjusteAbajo,
    guiaTallas,
    largoCadenaCm,
    tieneCadena,
    espesorCadenaMm,
    diametroMm,
    personalizable,
    detallePersonalizacion,
    tiempoElaboracionDias,
    cantidadEdicion,
    cuidados,
    empaque,
    garantia,
    audiencia,
    pendantWidth,
    pendantHeight,
    earringWidth,
    earringDrop,
    broochWidth,
    broochHeight,
    piercingGauge,
    piercingBarLength,
    stonesData,
  };
}

export async function createMinimalDraft(): Promise<{ productId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });
  if (!artisan) return { error: "No autorizado" };

  const slug = `borrador-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const product = await prisma.product.create({
    data: {
      artisanId: artisan.id,
      name: "",
      description: "",
      slug,
      price: 0,
      status: "DRAFT",
    },
  });

  return { productId: product.id };
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

  if (data.categoryIds.length === 0) {
    return { error: "Selecciona al menos una categoría" };
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
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
        materials: data.materialIds.length > 0
          ? { connect: data.materialIds.map((id) => ({ id })) }
          : undefined,
        specialties: data.specialtyIds.length > 0
          ? { connect: data.specialtyIds.map((id) => ({ id })) }
          : undefined,
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
        collectionId: data.collectionId,
        tallas: data.tallas,
        tallaUnica: data.tallaUnica,
        tallaAjusteArriba: data.tallaAjusteArriba,
        tallaAjusteAbajo: data.tallaAjusteAbajo,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        tieneCadena: data.tieneCadena,
        espesorCadenaMm: data.espesorCadenaMm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        audiencia: data.audiencia as any,
        pendantWidth: data.pendantWidth,
        pendantHeight: data.pendantHeight,
        earringWidth: data.earringWidth,
        earringDrop: data.earringDrop,
        broochWidth: data.broochWidth,
        broochHeight: data.broochHeight,
        piercingGauge: data.piercingGauge,
        piercingBarLength: data.piercingBarLength,
        status: "DRAFT",
      },
    });

    // Create stones
    if (data.stonesData.length > 0) {
      await prisma.productStone.createMany({
        data: data.stonesData.map((s, i) => ({
          productId: product.id,
          stoneType: s.stoneType,
          stoneCarat: s.stoneCarat ? parseFloat(s.stoneCarat) : null,
          stoneColor: s.stoneColor || null,
          stoneCut: s.stoneCut || null,
          stoneOrigin: s.stoneOrigin || null,
          stoneClarity: s.stoneClarity || null,
          quantity: s.quantity ? parseInt(s.quantity) : 1,
          position: i,
        })),
      });
    }

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

  if (product.status === "PENDING_REVIEW") {
    return { error: "No puedes editar un producto que está pendiente de revisión. Espera a que sea aprobado o rechazado." };
  }

  const data = parseFormData(formData);

  if (!data.name || !data.description || !data.price) {
    return { error: "Nombre, descripcion y precio son requeridos" };
  }

  if (data.price < 1000) {
    return { error: "El precio minimo es $1.000 CLP" };
  }

  if (data.categoryIds.length === 0) {
    return { error: "Selecciona al menos una categoría" };
  }

  // When saving as borrador, keep current status for DRAFT/REJECTED.
  // If product was APPROVED, saving as borrador sets it back to DRAFT
  // (the orfebre must use "Enviar a revisión" to re-publish).
  let newStatus = product.status;
  if (product.status === "APPROVED") {
    newStatus = "DRAFT";
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        story: data.story,
        categories: { set: [], connect: data.categoryIds.map((id) => ({ id })) },
        materials: { set: [], connect: data.materialIds.map((id) => ({ id })) },
        specialties: { set: data.specialtyIds.map((id) => ({ id })) },
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
        collectionId: data.collectionId,
        tallas: data.tallas,
        tallaUnica: data.tallaUnica,
        tallaAjusteArriba: data.tallaAjusteArriba,
        tallaAjusteAbajo: data.tallaAjusteAbajo,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        tieneCadena: data.tieneCadena,
        espesorCadenaMm: data.espesorCadenaMm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        audiencia: data.audiencia as any,
        pendantWidth: data.pendantWidth,
        pendantHeight: data.pendantHeight,
        earringWidth: data.earringWidth,
        earringDrop: data.earringDrop,
        broochWidth: data.broochWidth,
        broochHeight: data.broochHeight,
        piercingGauge: data.piercingGauge,
        piercingBarLength: data.piercingBarLength,
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

    // Manage stones
    const existingStoneIds = data.stonesData.filter(s => s.id).map(s => s.id!);
    await prisma.productStone.deleteMany({
      where: { productId, id: { notIn: existingStoneIds } },
    });
    for (let i = 0; i < data.stonesData.length; i++) {
      const s = data.stonesData[i];
      const stonePayload = {
        productId,
        stoneType: s.stoneType,
        stoneCarat: s.stoneCarat ? parseFloat(s.stoneCarat) : null,
        stoneColor: s.stoneColor || null,
        stoneCut: s.stoneCut || null,
        stoneOrigin: s.stoneOrigin || null,
        stoneClarity: s.stoneClarity || null,
        quantity: s.quantity ? parseInt(s.quantity) : 1,
        position: i,
      };
      if (s.id) {
        await prisma.productStone.update({ where: { id: s.id }, data: stonePayload });
      } else {
        await prisma.productStone.create({ data: stonePayload });
      }
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
    include: { images: true, categories: { select: { slug: true } } },
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
  const categorySlugs = product.categories.map((c) => c.slug);
  if (categorySlugs.includes("anillo") && product.productionType === "LIMITED") {
    const variantCount = await prisma.productVariant.count({ where: { productId } });
    if (product.tallas.length === 0 && variantCount === 0) {
      return { error: "Los anillos con producción limitada requieren tallas o stock por talla para publicarse" };
    }
  }
  if (categorySlugs.includes("collar") || categorySlugs.includes("cadena")) {
    if (!product.largoCadenaCm) {
      return { error: "Los collares y cadenas requieren el largo de cadena (cm) para publicarse" };
    }
  }
  if (categorySlugs.includes("colgante") && product.tieneCadena) {
    if (!product.largoCadenaCm) {
      return { error: "Los colgantes con cadena requieren el largo de cadena (cm) para publicarse" };
    }
  }
  if (categorySlugs.includes("aros")) {
    if (!product.diametroMm) {
      return { error: "Los aros requieren el diámetro (mm) para publicarse" };
    }
  }
  if (categorySlugs.includes("pulsera")) {
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

  const originalityDeclared = formData.get("originalityDeclared") === "true";
  if (!originalityDeclared) {
    return { error: "Debes marcar la declaración de originalidad para enviar a revisión" };
  }

  if (product.images.length === 0) {
    return { error: "El producto debe tener al menos 1 imagen" };
  }

  if (data.categoryIds.length === 0) {
    return { error: "Selecciona al menos una categoría" };
  }

  // Resolve category slugs for validation
  const allCategories = await getActiveCategories();
  const selectedSlugs = allCategories
    .filter((c) => data.categoryIds.includes(c.id))
    .map((c) => c.slug);

  if (selectedSlugs.includes("anillo") && data.productionType === "LIMITED" && data.tallas.length === 0 && data.variants.length === 0) {
    return { error: "Los anillos con producción limitada requieren tallas o stock por talla para publicarse" };
  }
  if ((selectedSlugs.includes("collar") || selectedSlugs.includes("cadena")) && !data.largoCadenaCm) {
    return { error: "Los collares y cadenas requieren el largo de cadena (cm) para publicarse" };
  }
  if (selectedSlugs.includes("colgante") && data.tieneCadena && !data.largoCadenaCm) {
    return { error: "Los colgantes con cadena requieren el largo de cadena (cm) para publicarse" };
  }
  if (selectedSlugs.includes("aros") && !data.diametroMm) {
    return { error: "Los aros requieren el diámetro (mm) para publicarse" };
  }
  if (selectedSlugs.includes("pulsera") && !data.diametroMm) {
    return { error: "Las pulseras requieren el diámetro o largo (mm) para publicarse" };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        description: data.description,
        story: data.story,
        categories: { set: [], connect: data.categoryIds.map((id) => ({ id })) },
        materials: { set: [], connect: data.materialIds.map((id) => ({ id })) },
        specialties: { set: data.specialtyIds.map((id) => ({ id })) },
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
        collectionId: data.collectionId,
        tallas: data.tallas,
        tallaUnica: data.tallaUnica,
        tallaAjusteArriba: data.tallaAjusteArriba,
        tallaAjusteAbajo: data.tallaAjusteAbajo,
        guiaTallas: data.guiaTallas,
        largoCadenaCm: data.largoCadenaCm,
        tieneCadena: data.tieneCadena,
        espesorCadenaMm: data.espesorCadenaMm,
        diametroMm: data.diametroMm,
        personalizable: data.personalizable,
        detallePersonalizacion: data.detallePersonalizacion,
        tiempoElaboracionDias: data.tiempoElaboracionDias,
        cantidadEdicion: data.cantidadEdicion,
        cuidados: data.cuidados,
        empaque: data.empaque,
        garantia: data.garantia,
        audiencia: data.audiencia as any,
        pendantWidth: data.pendantWidth,
        pendantHeight: data.pendantHeight,
        earringWidth: data.earringWidth,
        earringDrop: data.earringDrop,
        broochWidth: data.broochWidth,
        broochHeight: data.broochHeight,
        piercingGauge: data.piercingGauge,
        piercingBarLength: data.piercingBarLength,
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

    // Manage stones
    const existingStoneIds = data.stonesData.filter(s => s.id).map(s => s.id!);
    await prisma.productStone.deleteMany({
      where: { productId, id: { notIn: existingStoneIds } },
    });
    for (let i = 0; i < data.stonesData.length; i++) {
      const s = data.stonesData[i];
      const stonePayload = {
        productId,
        stoneType: s.stoneType,
        stoneCarat: s.stoneCarat ? parseFloat(s.stoneCarat) : null,
        stoneColor: s.stoneColor || null,
        stoneCut: s.stoneCut || null,
        stoneOrigin: s.stoneOrigin || null,
        stoneClarity: s.stoneClarity || null,
        quantity: s.quantity ? parseInt(s.quantity) : 1,
        position: i,
      };
      if (s.id) {
        await prisma.productStone.update({ where: { id: s.id }, data: stonePayload });
      } else {
        await prisma.productStone.create({ data: stonePayload });
      }
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

export async function reactivateProduct(
  productId: string,
  newStock: number
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  if (product.status !== "SOLD_OUT") {
    return { error: "Solo se pueden reactivar productos agotados" };
  }

  if (newStock < 1) {
    return { error: "El stock debe ser al menos 1" };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock, status: "APPROVED" },
    });

    revalidatePath("/portal/orfebre/productos");
    return { success: true };
  } catch {
    return { error: "Error al reactivar el producto" };
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

/**
 * Persist image ordering for a product without changing its status.
 * Reordering photos is considered a minor presentation change and does not
 * require a new review cycle — even for APPROVED products.
 */
export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{ error?: string; success?: boolean }> {
  const artisan = await getArtisan();
  if (!artisan) return { error: "No tienes permisos" };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: { select: { id: true } } },
  });

  if (!product || product.artisanId !== artisan.id) {
    return { error: "Producto no encontrado" };
  }

  if (product.status === "PENDING_REVIEW") {
    return { error: "No puedes reordenar imágenes mientras la pieza está en revisión" };
  }

  const existingIds = new Set(product.images.map((i) => i.id));
  const sanitized = imageIds.filter((id) => existingIds.has(id));
  if (sanitized.length !== product.images.length) {
    return { error: "Orden inválido: faltan imágenes" };
  }

  try {
    await prisma.$transaction(
      sanitized.map((id, position) =>
        prisma.productImage.update({ where: { id }, data: { position } })
      )
    );
    revalidatePath("/portal/orfebre/productos");
    revalidatePath(`/portal/orfebre/productos/${productId}`);
    return { success: true };
  } catch {
    return { error: "Error al guardar el orden de las imágenes" };
  }
}
