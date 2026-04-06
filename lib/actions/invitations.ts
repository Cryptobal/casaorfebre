"use server";

import { prisma } from "@/lib/prisma";
import { sendPioneerInvitationEmail } from "@/lib/emails/templates";
import { revalidatePath } from "next/cache";

// ============================================================
// HELPERS
// ============================================================

function normalizeForCode(name: string): string {
  return name
    .split(" ")[0]
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

async function generateUniqueCode(name: string): Promise<string> {
  const base = normalizeForCode(name);
  const year = new Date().getFullYear();
  let candidate = `PIONERO-${base}-${year}`;

  const existing = await prisma.promoCode.findUnique({
    where: { code: candidate },
  });

  if (existing) {
    const parts = name.split(" ");
    if (parts.length > 1) {
      const lastInitial = normalizeForCode(parts[1]).charAt(0);
      candidate = `PIONERO-${base}-${lastInitial}-${year}`;
    }

    const existing2 = await prisma.promoCode.findUnique({
      where: { code: candidate },
    });
    if (existing2) {
      let counter = 2;
      while (true) {
        candidate = `PIONERO-${base}-${counter}-${year}`;
        const exists = await prisma.promoCode.findUnique({
          where: { code: candidate },
        });
        if (!exists) break;
        counter++;
      }
    }
  }

  return candidate;
}

// ============================================================
// CREAR INVITACIÓN INDIVIDUAL
// ============================================================

export async function createInvitation(data: {
  recipientName: string;
  recipientEmail: string;
  planName: string;
  durationDays: number;
  campaign: string;
  expiresAt: Date;
  sendEmail: boolean;
  phone?: string | null;
}) {
  // Sanitize phone: must be 8 digits → store as +569XXXXXXXX
  let sanitizedPhone: string | null = null;
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    if (digits.length !== 8) {
      throw new Error("El teléfono debe tener 8 dígitos (sin código país ni 9 inicial).");
    }
    sanitizedPhone = `+569${digits}`;
  }

  const existingInvitation = await prisma.promoCode.findFirst({
    where: {
      recipientEmail: data.recipientEmail,
      campaign: data.campaign,
    },
  });

  if (existingInvitation) {
    throw new Error(
      `Ya existe una invitación para ${data.recipientEmail} en la campaña ${data.campaign}`,
    );
  }

  const code = await generateUniqueCode(data.recipientName);

  const promo = await prisma.promoCode.create({
    data: {
      code,
      type: "FREE_TRIAL",
      planName: data.planName,
      durationDays: data.durationDays,
      maxUses: 1,
      currentUses: 0,
      expiresAt: data.expiresAt,
      isActive: true,
      campaign: data.campaign,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      phone: sanitizedPhone,
      invitationStatus: data.sendEmail ? "SENT" : "DRAFT",
      sentAt: data.sendEmail ? new Date() : null,
      metadata: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
    },
  });

  if (data.sendEmail) {
    try {
      const emailData = await sendPioneerInvitationEmail(data.recipientEmail, {
        name: data.recipientName,
        code,
        planName: data.planName,
        durationDays: data.durationDays,
      });
      if (emailData?.id) {
        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { emailMessageId: emailData.id },
        });
      }
    } catch (error) {
      await prisma.promoCode.update({
        where: { id: promo.id },
        data: { invitationStatus: "DRAFT", sentAt: null },
      });
      throw new Error(`Código creado pero el email falló: ${error}`);
    }
  }

  revalidatePath("/portal/admin/invitaciones");
  return promo;
}

// ============================================================
// RE-ENVIAR INVITACIÓN
// ============================================================

export async function resendInvitation(promoCodeId: string) {
  const promo = await prisma.promoCode.findUnique({
    where: { id: promoCodeId },
  });

  if (!promo) throw new Error("Código no encontrado");
  if (!promo.recipientEmail) throw new Error("No hay email de destinatario");
  if (!promo.isActive) throw new Error("El código está desactivado");
  if (promo.expiresAt < new Date()) throw new Error("El código ha expirado");
  if (promo.currentUses >= promo.maxUses)
    throw new Error("El código ya fue redimido");

  const emailData = await sendPioneerInvitationEmail(promo.recipientEmail, {
    name: promo.recipientName ?? "Orfebre",
    code: promo.code,
    planName: promo.planName,
    durationDays: promo.durationDays,
  });

  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: {
      sentAt: new Date(),
      emailMessageId: emailData?.id ?? promo.emailMessageId,
      invitationStatus:
        promo.invitationStatus === "DRAFT" ? "SENT" : promo.invitationStatus,
    },
  });

  revalidatePath("/portal/admin/invitaciones");
}

// ============================================================
// CREAR INVITACIONES EN BULK
// ============================================================

export async function bulkCreateInvitations(
  orfebres: Array<{ name: string; email: string }>,
  options: {
    planName: string;
    durationDays: number;
    campaign: string;
    expiresAt: Date;
    sendEmails: boolean;
  },
) {
  const results: Array<{
    name: string;
    email: string;
    code: string;
    status: "created" | "error" | "skipped";
    error?: string;
  }> = [];

  for (const orfebre of orfebres) {
    try {
      const existing = await prisma.promoCode.findFirst({
        where: {
          recipientEmail: orfebre.email,
          campaign: options.campaign,
        },
      });

      if (existing) {
        results.push({
          name: orfebre.name,
          email: orfebre.email,
          code: existing.code,
          status: "skipped",
          error: "Ya existe invitación para este email",
        });
        continue;
      }

      const promo = await createInvitation({
        recipientName: orfebre.name,
        recipientEmail: orfebre.email,
        ...options,
        sendEmail: options.sendEmails,
      });

      results.push({
        name: orfebre.name,
        email: orfebre.email,
        code: promo.code,
        status: "created",
      });

      // Delay between emails for Resend rate limiting
      if (options.sendEmails) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      results.push({
        name: orfebre.name,
        email: orfebre.email,
        code: "",
        status: "error",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  revalidatePath("/portal/admin/invitaciones");
  return results;
}

// ============================================================
// DESACTIVAR INVITACIÓN
// ============================================================

export async function deactivateInvitation(promoCodeId: string) {
  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { isActive: false },
  });

  revalidatePath("/portal/admin/invitaciones");
}

// ============================================================
// ELIMINAR INVITACIÓN
// ============================================================

export async function deleteInvitation(promoCodeId: string) {
  const promo = await prisma.promoCode.findUnique({
    where: { id: promoCodeId },
    include: { redemptions: true },
  });

  if (!promo) throw new Error("Código no encontrado");
  if (promo.redemptions.length > 0) {
    throw new Error("No se puede eliminar: este código ya tiene redenciones");
  }

  await prisma.promoCode.delete({ where: { id: promoCodeId } });
  revalidatePath("/portal/admin/invitaciones");
}

// ============================================================
// OBTENER INVITACIONES
// ============================================================

export async function getInvitations(filters?: {
  campaign?: string;
  status?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    recipientEmail: { not: null },
  };

  if (filters?.campaign) {
    where.campaign = filters.campaign;
  }

  if (filters?.status) {
    where.invitationStatus = filters.status;
  }

  if (filters?.search) {
    where.OR = [
      { recipientName: { contains: filters.search, mode: "insensitive" } },
      { recipientEmail: { contains: filters.search, mode: "insensitive" } },
      { code: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const invitations = await prisma.promoCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      redemptions: true,
    },
  });

  return invitations;
}

// ============================================================
// MÉTRICAS DE CAMPAÑA
// ============================================================

export async function getCampaignMetrics(campaign: string) {
  const baseWhere = { campaign, recipientEmail: { not: null } };

  const [total, sent, opened, applied, redeemed, expired] = await Promise.all([
    prisma.promoCode.count({ where: baseWhere }),
    prisma.promoCode.count({
      where: { ...baseWhere, invitationStatus: { not: "DRAFT" } },
    }),
    prisma.promoCode.count({
      where: { ...baseWhere, openedAt: { not: null } },
    }),
    prisma.promoCode.count({
      where: { ...baseWhere, appliedAt: { not: null } },
    }),
    prisma.promoCode.count({
      where: { ...baseWhere, redeemedAt: { not: null } },
    }),
    prisma.promoCode.count({
      where: { ...baseWhere, invitationStatus: "EXPIRED" },
    }),
  ]);

  return {
    total,
    sent,
    opened,
    applied,
    redeemed,
    expired,
    rates: {
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      applicationRate: opened > 0 ? Math.round((applied / opened) * 100) : 0,
      redemptionRate:
        applied > 0 ? Math.round((redeemed / applied) * 100) : 0,
    },
  };
}

// ============================================================
// OBTENER CAMPAÑAS EXISTENTES
// ============================================================

// ============================================================
// TRACKING WHATSAPP
// ============================================================

export async function trackWhatsAppSent(promoCodeId: string) {
  await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: { whatsappSentAt: new Date() },
  });
  revalidatePath("/portal/admin/invitaciones");
  return { success: true };
}

// ============================================================
// OBTENER CAMPAÑAS
// ============================================================

export async function getCampaigns() {
  const campaigns = await prisma.promoCode.groupBy({
    by: ["campaign"],
    _count: { id: true },
    orderBy: { campaign: "asc" },
  });

  return campaigns.map((c) => ({
    name: c.campaign,
    count: c._count.id,
  }));
}
