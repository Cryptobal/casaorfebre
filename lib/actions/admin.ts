"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { slugify, formatCLP } from "@/lib/utils";
import {
  sendArtisanWelcomeEmail,
  sendApplicationRejectedEmail,
  sendProductApprovedEmail,
  sendProductRejectedEmail,
  sendDisputeResolvedEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendReturnReceivedEmail,
  sendRefundProcessedEmail,
  sendEmail,
} from "@/lib/emails/templates";
import { CURRENT_LEGAL_VERSIONS } from "@/lib/legal/constants";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

// 1. Approve application
export async function approveApplication(
  applicationId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const application = await prisma.artisanApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) return { error: "Postulacion no encontrada" };
  if (application.status !== "PENDING") return { error: "La postulacion ya fue revisada" };

  let slug = slugify(application.name);
  const existingSlug = await prisma.artisan.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // Check if user with this email already exists
  let user = await prisma.user.findUnique({
    where: { email: application.email },
  });

  if (user) {
    // Promote existing user to ARTISAN
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ARTISAN", name: user.name || application.name },
    });
  } else {
    // Create new user with ARTISAN role
    user = await prisma.user.create({
      data: {
        email: application.email,
        name: application.name,
        role: "ARTISAN",
      },
    });
  }

  const artisan = await prisma.artisan.create({
    data: {
      userId: user.id,
      slug,
      displayName: application.name,
      bio: application.bio,
      location: application.location,
      region: application.region,
      specialty: application.specialty,
      materials: application.materials,
      phone: application.phone,
      workshopImages:
        application.portfolioImages.length > 0 ? application.portfolioImages : [],
      yearsExperience: application.yearsExperience,
      awards: application.awards,
      status: "APPROVED",
      approvedAt: new Date(),
      consentTerms: application.consentTerms ?? true,
      consentTermsAt: application.consentTermsAt ?? new Date(),
      consentMarketing: application.consentMarketing ?? false,
      consentMarketingAt: application.consentMarketingAt ?? null,
      consentSocialMedia: application.consentSocialMedia ?? false,
      consentSocialMediaAt: application.consentSocialMediaAt ?? null,
    },
  });

  // Record legal acceptances from the application form
  await prisma.legalAcceptance.createMany({
    data: [
      {
        userId: user.id,
        documentType: "SELLER_AGREEMENT",
        documentVersion: CURRENT_LEGAL_VERSIONS.SELLER_AGREEMENT,
        method: "CHECKBOX",
      },
      {
        userId: user.id,
        documentType: "TERMS_AND_CONDITIONS",
        documentVersion: CURRENT_LEGAL_VERSIONS.TERMS_AND_CONDITIONS,
        method: "CHECKBOX",
      },
      {
        userId: user.id,
        documentType: "PRIVACY_POLICY",
        documentVersion: CURRENT_LEGAL_VERSIONS.PRIVACY_POLICY,
        method: "CHECKBOX",
      },
    ],
  });

  await prisma.artisanApplication.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  });

  // Redeem promo code if the application had one
  let promoRedeemed = false;
  let promoEndDate: Date | null = null;
  if (application.promoCode) {
    try {
      await redeemPromoCode(application.promoCode, artisan.id, application.email);
      promoRedeemed = true;
      // Calculate end date for the welcome email
      const promo = await prisma.promoCode.findUnique({
        where: { code: application.promoCode },
      });
      if (promo) {
        promoEndDate = new Date();
        promoEndDate.setDate(promoEndDate.getDate() + promo.durationDays);
        // Track invitation funnel: mark as REDEEMED
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: {
            redeemedAt: new Date(),
            invitationStatus: "REDEEMED",
          },
        });
      }
    } catch (e) {
      console.error("Promo code redemption failed:", e);
    }
  }

  try {
    await sendArtisanWelcomeEmail(application.email, {
      name: application.name,
      promoRedeemed,
      promoEndDate,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/postulaciones");
  revalidatePath("/portal");
  return { success: true };
}

// 2. Reject application
export async function rejectApplication(
  applicationId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const reason = formData.get("reason") as string;

  const application = await prisma.artisanApplication.findUnique({
    where: { id: applicationId },
  });
  if (!application) return { error: "Postulacion no encontrada" };

  await prisma.artisanApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewNotes: reason || null,
      reviewedAt: new Date(),
    },
  });

  try {
    await sendApplicationRejectedEmail(application.email, {
      name: application.name,
      reason: reason || "No se proporcionó motivo",
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/postulaciones");
  revalidatePath("/portal");
  return { success: true };
}

// 3. Approve product
export async function approveProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { artisan: { include: { user: { select: { email: true } } } } },
  });
  if (!product) return { error: "Producto no encontrado" };

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        status: "APPROVED",
        publishedAt: new Date(),
      },
    }),
    // Auto-approve all pending photos when product is approved
    prisma.productImage.updateMany({
      where: { productId, status: "PENDING_REVIEW" },
      data: { status: "APPROVED" },
    }),
  ]);

  try {
    await sendProductApprovedEmail(product.artisan.user.email, {
      artisanName: product.artisan.displayName,
      productName: product.name,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/admin/fotos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath(`/orfebres/${product.artisan.slug}`);
  revalidatePath("/coleccion");
  revalidatePath("/");
  return { success: true };
}

// 4. Reject product
export async function rejectProduct(
  productId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const notes = formData.get("notes") as string;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { artisan: { include: { user: { select: { email: true } } } } },
  });
  if (!product) return { error: "Producto no encontrado" };

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "REJECTED",
      adminNotes: notes || null,
    },
  });

  try {
    await sendProductRejectedEmail(product.artisan.user.email, {
      artisanName: product.artisan.displayName,
      productName: product.name,
      reason: notes || "No se proporcionó motivo",
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath(`/orfebres/${product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 5. Approve photo
export async function approvePhoto(
  imageId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const image = await prisma.productImage.update({
    where: { id: imageId },
    data: { status: "APPROVED" },
    include: { product: { include: { artisan: { select: { slug: true } } } } },
  });

  revalidatePath("/portal/admin/fotos");
  revalidatePath(`/orfebres/${image.product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 6. Approve photos batch
export async function approvePhotosBatch(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const imageIdsRaw = formData.get("imageIds") as string;
  if (!imageIdsRaw) return { error: "No se proporcionaron imagenes" };

  let imageIds: string[];
  try {
    imageIds = JSON.parse(imageIdsRaw);
  } catch {
    return { error: "Formato de IDs invalido" };
  }

  await prisma.productImage.updateMany({
    where: { id: { in: imageIds } },
    data: { status: "APPROVED" },
  });

  revalidatePath("/portal/admin/fotos");
  revalidatePath("/coleccion");
  revalidatePath("/");
  return { success: true };
}

// 7. Reject photo
export async function rejectPhoto(
  imageId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const reason = formData.get("reason") as string;

  await prisma.productImage.update({
    where: { id: imageId },
    data: {
      status: "REJECTED",
      rejectionReason: reason || null,
    },
  });

  revalidatePath("/portal/admin/fotos");
  revalidatePath("/portal/admin/productos");
  return { success: true };
}

// 8. Replace photo
export async function replacePhoto(
  imageId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "No se proporciono archivo" };

  const existingImage = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });

  if (!existingImage) return { error: "Imagen no encontrada" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const key = `products/${existingImage.productId}/${Date.now()}.${ext}`;
  const newUrl = await uploadToR2(buffer, key, file.type);

  await prisma.productImage.update({
    where: { id: imageId },
    data: {
      originalUrl: existingImage.url,
      url: newUrl,
      status: "REPLACED",
      isOriginal: false,
    },
  });

  revalidatePath("/portal/admin/fotos");
  return { success: true };
}

// 8b. Admin: suspend approved product
export async function adminSuspendProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { artisan: { select: { slug: true } } },
  });
  if (!product) return { error: "Producto no encontrado" };
  if (product.status !== "APPROVED") return { error: "Solo se pueden suspender productos aprobados" };

  await prisma.product.update({
    where: { id: productId },
    data: { status: "PAUSED", pauseReason: "ADMIN" },
  });

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath(`/orfebres/${product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 8c. Admin: reactivate paused product
export async function adminReactivateProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { artisan: { select: { slug: true } } },
  });
  if (!product) return { error: "Producto no encontrado" };
  if (product.status !== "PAUSED") return { error: "Solo se pueden reactivar productos en pausa" };

  await prisma.product.update({
    where: { id: productId },
    data: { status: "APPROVED", pauseReason: null, pausedAt: null },
  });

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath(`/orfebres/${product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 8d. Admin: delete product (only if no sales)
export async function adminDeleteProduct(
  productId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      artisan: { select: { slug: true } },
      _count: { select: { orderItems: true } },
    },
  });
  if (!product) return { error: "Producto no encontrado" };

  if (product._count.orderItems > 0) {
    return { error: "No se puede eliminar un producto con ventas. Suspende o pausa el producto en su lugar." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { productId } });
      await tx.certificate.deleteMany({ where: { productId } });
      await tx.conversation.updateMany({
        where: { productId },
        data: { productId: null },
      });
      await tx.product.delete({ where: { id: productId } });
    });
  } catch (e) {
    console.error("[adminDeleteProduct]", productId, e);
    return {
      error:
        "No se pudo eliminar el producto (puede haber datos vinculados). Recarga la p?gina e intenta de nuevo.",
    };
  }

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/orfebre/productos");
  revalidatePath(`/orfebres/${product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 8e. Admin: delete photo
export async function adminDeletePhoto(
  imageId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: { include: { artisan: { select: { slug: true } } } } },
  });
  if (!image) return { error: "Imagen no encontrada" };

  await prisma.productImage.delete({ where: { id: imageId } });

  revalidatePath("/portal/admin/fotos");
  revalidatePath(`/orfebres/${image.product.artisan.slug}`);
  revalidatePath("/coleccion");
  return { success: true };
}

// 8f. Admin: batch delete products (only those without sales)
export async function adminDeleteProductsBatch(
  formData: FormData
): Promise<{ error?: string; success?: boolean; deleted: number; skipped: number }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado", deleted: 0, skipped: 0 };
  }

  const idsRaw = formData.get("productIds");
  if (!idsRaw || typeof idsRaw !== "string") return { error: "IDs requeridos", deleted: 0, skipped: 0 };

  const productIds: string[] = JSON.parse(idsRaw);
  if (!Array.isArray(productIds) || productIds.length === 0) return { error: "IDs requeridos", deleted: 0, skipped: 0 };

  let deleted = 0;
  let skipped = 0;

  for (const productId of productIds) {
    const result = await adminDeleteProduct(productId);
    if (result.success) {
      deleted++;
    } else {
      skipped++;
    }
  }

  revalidatePath("/portal/admin/productos");
  return { success: true, deleted, skipped };
}

// 8g. Admin: batch delete photos
export async function adminDeletePhotosBatch(
  formData: FormData
): Promise<{ error?: string; success?: boolean; deleted: number }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado", deleted: 0 };
  }

  const idsRaw = formData.get("imageIds");
  if (!idsRaw || typeof idsRaw !== "string") return { error: "IDs requeridos", deleted: 0 };

  const imageIds: string[] = JSON.parse(idsRaw);
  if (!Array.isArray(imageIds) || imageIds.length === 0) return { error: "IDs requeridos", deleted: 0 };

  let deleted = 0;

  for (const imageId of imageIds) {
    const result = await adminDeletePhoto(imageId);
    if (result.success) deleted++;
  }

  revalidatePath("/portal/admin/fotos");
  return { success: true, deleted };
}

// 9. Update artisan commission rate
export async function updateArtisanCommission(
  artisanId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const rateStr = formData.get("rate") as string;
  const rate = parseFloat(rateStr);

  if (isNaN(rate) || rate <= 0 || rate >= 1) {
    return { error: "La comision debe ser un valor entre 0 y 1" };
  }

  await prisma.artisan.update({
    where: { id: artisanId },
    data: { commissionRate: rate },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

// 10. Update membership plan
export async function updatePlan(
  planId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan) return { error: "Plan no encontrado" };

  const price = parseInt(formData.get("price") as string, 10);
  const annualPriceRaw = formData.get("annualPrice") as string;
  const annualPrice = annualPriceRaw ? parseInt(annualPriceRaw, 10) : null;
  const commissionRate = parseFloat(formData.get("commissionRate") as string);
  const maxProducts = parseInt(formData.get("maxProducts") as string, 10);
  const maxPhotosPerProduct = parseInt(formData.get("maxPhotosPerProduct") as string, 10);
  const videoEnabled = formData.get("videoEnabled") === "true";
  const badgeText = (formData.get("badgeText") as string) || null;
  const badgeType = (formData.get("badgeType") as string) || null;
  const searchWeight = parseFloat(formData.get("searchWeight") as string);
  const payoutFrequency = formData.get("payoutFrequency") as string;
  const socialPostsPerMonth = parseInt(formData.get("socialPostsPerMonth") as string, 10);
  const supportLevel = formData.get("supportLevel") as string;
  const hasCertificate = formData.get("hasCertificate") === "true";
  const homeHighlight = formData.get("homeHighlight") === "true";
  const hasBasicStats = formData.get("hasBasicStats") === "true";
  const hasAdvancedStats = formData.get("hasAdvancedStats") === "true";

  if (isNaN(commissionRate) || commissionRate < 0 || commissionRate >= 1) {
    return { error: "La comisión debe ser un valor entre 0 y 1" };
  }

  await prisma.membershipPlan.update({
    where: { id: planId },
    data: {
      price,
      annualPrice,
      commissionRate,
      maxProducts,
      maxPhotosPerProduct,
      videoEnabled,
      badgeText,
      badgeType,
      searchWeight,
      payoutFrequency,
      socialPostsPerMonth,
      supportLevel,
      hasCertificate,
      homeHighlight,
      hasBasicStats,
      hasAdvancedStats,
    },
  });

  revalidatePath("/portal/admin/planes");
  return { success: true };
}

// 11. Update artisan overrides
export async function updateArtisanOverrides(
  artisanId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const commissionOverrideRaw = formData.get("commissionOverride") as string;
  const maxProductsOverrideRaw = formData.get("maxProductsOverride") as string;
  const maxPhotosOverrideRaw = formData.get("maxPhotosOverride") as string;

  const commissionOverride = commissionOverrideRaw ? parseFloat(commissionOverrideRaw) : null;
  const maxProductsOverride = maxProductsOverrideRaw ? parseInt(maxProductsOverrideRaw, 10) : null;
  const maxPhotosOverride = maxPhotosOverrideRaw ? parseInt(maxPhotosOverrideRaw, 10) : null;

  if (commissionOverride !== null && (commissionOverride < 0 || commissionOverride >= 1)) {
    return { error: "La comisión debe ser un valor entre 0 y 1" };
  }

  await prisma.artisan.update({
    where: { id: artisanId },
    data: {
      commissionOverride,
      maxProductsOverride,
      maxPhotosOverride,
    },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

// 12. Toggle home highlight
export async function toggleHomeHighlight(
  artisanId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: { homeHighlight: true },
  });
  if (!artisan) return { error: "Orfebre no encontrado" };

  await prisma.artisan.update({
    where: { id: artisanId },
    data: { homeHighlight: !artisan.homeHighlight },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

// 13. Suspend artisan
export async function suspendArtisan(
  artisanId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.artisan.update({
    where: { id: artisanId },
    data: { status: "SUSPENDED" },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

// 13b. Reactivar orfebre suspendido (vuelve a estado aprobado)
export async function reactivateArtisan(
  artisanId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: { status: true },
  });
  if (!artisan) return { error: "Orfebre no encontrado" };
  if (artisan.status !== "SUSPENDED") {
    return { error: "Solo se pueden reactivar cuentas suspendidas" };
  }

  await prisma.artisan.update({
    where: { id: artisanId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

/**
 * Intenta eliminar la cuenta del orfebre (usuario + perfil) solo si no hay actividad comercial.
 * Si hay productos, ventas u órdenes (como comprador), no elimina: deja la cuenta suspendida.
 */
export async function removeOrSuspendArtisanAccount(
  artisanId: string
): Promise<{
  error?: string;
  outcome?: "deleted" | "suspended";
  message?: string;
}> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: {
      id: true,
      userId: true,
      totalSales: true,
      _count: { select: { products: true, orderItems: true } },
    },
  });
  if (!artisan) return { error: "Orfebre no encontrado" };

  const userId = artisan.userId;

  const [buyerOrders, giftPurchases] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.giftCard.count({ where: { purchaserId: userId } }),
  ]);

  const hasSellerActivity =
    artisan._count.products > 0 ||
    artisan._count.orderItems > 0 ||
    artisan.totalSales > 0;
  const hasBuyerActivity = buyerOrders > 0 || giftPurchases > 0;

  if (hasSellerActivity || hasBuyerActivity) {
    await prisma.artisan.update({
      where: { id: artisanId },
      data: { status: "SUSPENDED" },
    });
    revalidatePath("/portal/admin/orfebres");
    const parts: string[] = [];
    if (artisan._count.products > 0) {
      parts.push(
        `${artisan._count.products} producto(s) en el sistema (incluye borradores, pendientes o rechazados; revisa Admin → Productos y cambia el filtro de estado)`
      );
    }
    if (artisan._count.orderItems > 0) {
      parts.push(`${artisan._count.orderItems} línea(s) de venta asociada(s)`);
    }
    if (artisan.totalSales > 0) {
      parts.push("registro de ventas en el perfil del orfebre");
    }
    if (buyerOrders > 0) {
      parts.push(`${buyerOrders} pedido(s) como comprador`);
    }
    if (giftPurchases > 0) {
      parts.push(`${giftPurchases} compra(s) de gift card`);
    }
    const detail = parts.length > 0 ? ` Motivo: ${parts.join("; ")}.` : "";
    return {
      outcome: "suspended",
      message:
        `No se puede borrar la cuenta por trazabilidad; quedó suspendida.${detail}`,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.message.deleteMany({
      where: { conversation: { artisanId } },
    });
    await tx.conversation.deleteMany({ where: { artisanId } });
    await tx.membershipSubscription.deleteMany({ where: { artisanId } });
    await tx.artisanMaterial.deleteMany({ where: { artisanId } });
    await tx.artisan.update({
      where: { id: artisanId },
      data: { specialties: { set: [] } },
    });
    await tx.artisan.delete({ where: { id: artisanId } });

    await tx.message.deleteMany({
      where: { conversation: { buyerId: userId } },
    });
    await tx.conversation.deleteMany({ where: { buyerId: userId } });
    await tx.productQuestion.deleteMany({ where: { userId } });
    await tx.review.deleteMany({ where: { userId } });
    await tx.dispute.deleteMany({ where: { userId } });
    await tx.returnRequest.deleteMany({ where: { userId } });
    await tx.referralReward.deleteMany({
      where: { OR: [{ referrerId: userId }, { referredId: userId }] },
    });
    await tx.blogPost.deleteMany({ where: { authorId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/portal/admin/orfebres");
  return { outcome: "deleted" };
}

// 11. Resolve dispute
export async function resolveDispute(
  disputeId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const resolution = formData.get("resolution") as string;
  const status = formData.get("status") as
    | "RESOLVED_REFUND"
    | "RESOLVED_PARTIAL_REFUND"
    | "RESOLVED_NO_REFUND"
    | "CLOSED";

  if (!resolution || !status) {
    return { error: "Resolucion y estado son requeridos" };
  }

  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      user: { select: { email: true, name: true } },
      order: { select: { orderNumber: true } },
    },
  });
  if (!dispute) return { error: "Disputa no encontrada" };

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status,
      resolution,
      resolvedAt: new Date(),
    },
  });

  try {
    await sendDisputeResolvedEmail(dispute.user.email, {
      name: dispute.user.name || "Cliente",
      orderNumber: dispute.order.orderNumber,
      resolution,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/disputas");
  return { success: true };
}

// 12. Approve return
export async function approveReturn(
  returnRequestId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
  });
  if (!returnRequest) return { error: "Solicitud no encontrada" };

  await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: "APPROVED" },
  });

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: returnRequest.orderItemId },
    include: { order: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (orderItem?.order?.user?.email) {
    try {
      await sendReturnApprovedEmail(orderItem.order.user.email, {
        buyerName: orderItem.order.user.name || "Cliente",
        productName: orderItem.productName,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/admin/devoluciones");
  return { success: true };
}

// 13. Reject return
export async function rejectReturn(
  returnRequestId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const adminNotes = formData.get("adminNotes") as string;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
  });
  if (!returnRequest) return { error: "Solicitud no encontrada" };

  await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      status: "REJECTED",
      adminNotes: adminNotes || null,
    },
  });

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: returnRequest.orderItemId },
    include: { order: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (orderItem?.order?.user?.email) {
    try {
      await sendReturnRejectedEmail(orderItem.order.user.email, {
        buyerName: orderItem.order.user.name || "Cliente",
        productName: orderItem.productName,
        reason: adminNotes || "No se proporcionó motivo",
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/admin/devoluciones");
  return { success: true };
}

// 14. Process refund
export async function processRefund(
  returnRequestId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const refundAmountStr = formData.get("refundAmount") as string;
  const refundAmount = parseInt(refundAmountStr, 10);

  if (isNaN(refundAmount) || refundAmount <= 0) {
    return { error: "Monto de devolucion invalido" };
  }

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
  });
  if (!returnRequest) return { error: "Solicitud no encontrada" };

  await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      status: "REFUNDED",
      refundAmount,
      resolvedAt: new Date(),
    },
  });

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: returnRequest.orderItemId },
    include: { order: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (orderItem?.order?.user?.email) {
    try {
      await sendRefundProcessedEmail(orderItem.order.user.email, {
        buyerName: orderItem.order.user.name || "Cliente",
        amount: refundAmount,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/admin/devoluciones");
  return { success: true };
}

// 15. Curate product (mark/unmark as curator pick)
export async function curateProduct(
  productId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const isCuratorPick = formData.get("isCuratorPick") === "true";
  const curatorNote = (formData.get("curatorNote") as string)?.slice(0, 300) || null;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { status: true },
  });
  if (!product) return { error: "Producto no encontrado" };
  if (product.status !== "APPROVED") return { error: "Solo se pueden curar productos aprobados" };

  if (isCuratorPick) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        isCuratorPick: true,
        curatorPickAt: new Date(),
        curatorNote,
      },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: {
        isCuratorPick: false,
        curatorPickAt: null,
        curatorNote: null,
      },
    });
  }

  revalidatePath("/portal/admin/productos");
  revalidatePath("/portal/admin/curaduria");
  revalidatePath("/seleccion-del-curador");
  revalidatePath("/");
  return { success: true };
}

// 16. Mark return as received by artisan
export async function markReturnReceived(
  returnRequestId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
  });
  if (!returnRequest) return { error: "Solicitud no encontrada" };

  await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: "RECEIVED_BY_ARTISAN" },
  });

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: returnRequest.orderItemId },
    include: { order: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (orderItem?.order?.user?.email) {
    try {
      await sendReturnReceivedEmail(orderItem.order.user.email, {
        buyerName: orderItem.order.user.name || "Cliente",
        productName: orderItem.productName,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/admin/devoluciones");
  return { success: true };
}

/** Elimina una postulación (registro en `artisan_applications`). Borrado real en base de datos. */
export async function deleteArtisanApplication(
  applicationId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const app = await prisma.artisanApplication.findUnique({
    where: { id: applicationId },
  });
  if (!app) return { error: "Postulación no encontrada" };

  await prisma.artisanApplication.delete({
    where: { id: applicationId },
  });

  revalidatePath("/portal/admin/postulaciones");
  revalidatePath("/portal");
  return { success: true };
}

/**
 * Elimina un comprador (usuario BUYER) y datos no vinculados a pedidos.
 * No elimina si hay pedidos o gift cards compradas: los datos deben conservarse por trazabilidad.
 */
export async function deleteBuyerUser(
  userId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "BUYER" },
  });
  if (!user) return { error: "Comprador no encontrado" };

  const orderCount = await prisma.order.count({ where: { userId } });
  if (orderCount > 0) {
    return {
      error:
        "No se puede eliminar: este comprador tiene pedidos asociados. Por trazabilidad, los datos deben conservarse en el sistema.",
    };
  }

  const giftCount = await prisma.giftCard.count({ where: { purchaserId: userId } });
  if (giftCount > 0) {
    return {
      error:
        "No se puede eliminar: tiene gift cards registradas como comprador.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.message.deleteMany({
      where: { conversation: { buyerId: userId } },
    });
    await tx.conversation.deleteMany({ where: { buyerId: userId } });
    await tx.productQuestion.deleteMany({ where: { userId } });
    await tx.review.deleteMany({ where: { userId } });
    await tx.dispute.deleteMany({ where: { userId } });
    await tx.returnRequest.deleteMany({ where: { userId } });
    await tx.referralReward.deleteMany({
      where: { OR: [{ referrerId: userId }, { referredId: userId }] },
    });
    await tx.blogPost.deleteMany({ where: { authorId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/portal/admin/compradores");
  return { success: true };
}

/**
 * Redeems a promo code for an artisan: creates subscription, updates commission,
 * records redemption, increments usage. All wrapped in a transaction.
 */
async function redeemPromoCode(
  code: string,
  artisanId: string,
  email: string
) {
  await prisma.$transaction(async (tx) => {
    const promo = await tx.promoCode.findUnique({ where: { code } });
    if (
      !promo ||
      !promo.isActive ||
      promo.expiresAt < new Date() ||
      promo.currentUses >= promo.maxUses
    ) {
      throw new Error("Código promocional inválido o expirado");
    }

    // Check if already redeemed by this email
    const existingRedemption = await tx.promoCodeRedemption.findUnique({
      where: { promoCodeId_email: { promoCodeId: promo.id, email } },
    });
    if (existingRedemption) {
      throw new Error("Este código ya fue redimido por este email");
    }

    const plan = await tx.membershipPlan.findFirst({
      where: { name: { equals: promo.planName, mode: "insensitive" } },
    });
    if (!plan) {
      throw new Error(`Plan "${promo.planName}" no encontrado`);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + promo.durationDays);

    // Create subscription with source PROMO_CODE
    await tx.membershipSubscription.create({
      data: {
        artisanId,
        planId: plan.id,
        status: "ACTIVE",
        startDate,
        endDate,
        source: "PROMO_CODE",
        promoCodeId: promo.id,
      },
    });

    // Update artisan commission to plan rate
    await tx.artisan.update({
      where: { id: artisanId },
      data: { commissionRate: plan.commissionRate },
    });

    // Record redemption
    await tx.promoCodeRedemption.create({
      data: {
        promoCodeId: promo.id,
        artisanId,
        email,
      },
    });

    // Increment uses
    await tx.promoCode.update({
      where: { id: promo.id },
      data: { currentUses: { increment: 1 } },
    });
  });
}

// ── Admin: delete order ──────────────────────────────────────────────
export async function adminDeleteOrder(
  orderId: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { select: { id: true } },
    },
  });

  if (!order) return { error: "Pedido no encontrado" };

  const orderItemIds = order.items.map((i) => i.id);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.returnRequest.deleteMany({
        where: { orderItemId: { in: orderItemIds } },
      });
      await tx.dispute.deleteMany({ where: { orderId } });
      await tx.giftCardUsage.deleteMany({ where: { orderId } });
      await tx.referralReward.updateMany({
        where: { orderId },
        data: { orderId: null },
      });
      await tx.giftCard.updateMany({
        where: { orderId },
        data: { orderId: null },
      });
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });
  } catch (e) {
    console.error("[adminDeleteOrder]", orderId, e);
    return {
      error:
        "No se pudo eliminar el pedido. Puede haber datos vinculados.",
    };
  }

  revalidatePath("/portal/admin/pedidos");
  return { success: true };
}

// Change artisan plan
export async function changeArtisanPlan(
  artisanId: string,
  newPlanName: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const plan = await prisma.membershipPlan.findUnique({
    where: { name: newPlanName },
  });
  if (!plan) return { error: "Plan no encontrado" };

  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });
  if (!artisan) return { error: "Orfebre no encontrado" };

  const activeSub = artisan.subscriptions[0];

  if (activeSub) {
    // Update existing subscription to new plan
    await prisma.membershipSubscription.update({
      where: { id: activeSub.id },
      data: { planId: plan.id },
    });
  } else {
    // Create new subscription
    await prisma.membershipSubscription.create({
      data: {
        artisanId,
        planId: plan.id,
        status: "ACTIVE",
        source: "ADMIN",
      },
    });
  }

  // Update artisan commission rate from plan
  await prisma.artisan.update({
    where: { id: artisanId },
    data: { commissionRate: plan.commissionRate },
  });

  revalidatePath("/portal/admin/orfebres");
  return { success: true };
}

// Mark all pending payouts for an artisan as paid
export async function markArtisanPaid(artisanId: string): Promise<{ error?: string; success?: boolean }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  const pendingItems = await prisma.orderItem.findMany({
    where: { artisanId, payoutStatus: "PENDING" },
    include: { artisan: { include: { user: { select: { email: true } } } } },
  });

  if (pendingItems.length === 0) {
    return { error: "No hay pagos pendientes para este orfebre" };
  }

  const totalPaid = pendingItems.reduce((sum, item) => sum + item.artisanPayout, 0);

  await prisma.orderItem.updateMany({
    where: { artisanId, payoutStatus: "PENDING" },
    data: { payoutStatus: "PAID", payoutAt: new Date() },
  });

  const artisan = pendingItems[0].artisan;
  if (artisan?.user?.email) {
    try {
      await sendEmail(
        artisan.user.email,
        `Pago transferido: ${formatCLP(totalPaid)}`,
        `<p>Hola ${artisan.displayName},</p>
         <p>Se ha transferido <strong>${formatCLP(totalPaid)}</strong> a tu cuenta bancaria.</p>
         <p>Gracias por ser parte de Casa Orfebre.</p>`
      );
    } catch (e) {
      console.error("Payout confirmation email failed:", e);
    }
  }

  revalidatePath("/portal/admin/pagos");
  return { success: true };
}
