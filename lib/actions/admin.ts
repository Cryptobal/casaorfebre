"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
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
} from "@/lib/emails/templates";

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

  await prisma.artisan.create({
    data: {
      userId: user.id,
      slug,
      displayName: application.name,
      bio: application.bio,
      location: application.location,
      specialty: application.specialty,
      materials: application.materials,
      phone: application.phone,
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await prisma.artisanApplication.update({
    where: { id: applicationId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  });

  try {
    await sendArtisanWelcomeEmail(application.email, { name: application.name });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/postulaciones");
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

  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "APPROVED",
      publishedAt: new Date(),
    },
  });

  try {
    await sendProductApprovedEmail(product.artisan.user.email, {
      artisanName: product.artisan.displayName,
      productName: product.name,
    });
  } catch (e) {
    console.error("Email failed:", e);
  }

  revalidatePath("/portal/admin/productos");
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

  await prisma.productImage.update({
    where: { id: imageId },
    data: { status: "APPROVED" },
  });

  revalidatePath("/portal/admin/fotos");
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
      altText: reason || null, // Workaround: store rejection reason in altText
    },
  });

  revalidatePath("/portal/admin/fotos");
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
