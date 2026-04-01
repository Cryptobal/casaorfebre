"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sendPioneerInvitationEmail,
  sendArtisanInvitationEmail,
  sendBuyerInvitationEmail,
} from "@/lib/emails/invitation-templates";
import type {
  InvitationType,
  CampaignInvitationStatus,
  InvitationCampaign,
  Invitation,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const emailSenders: Record<
  InvitationType,
  (to: string, opts: { token: string }) => Promise<void>
> = {
  PIONEER: sendPioneerInvitationEmail,
  ARTISAN: sendArtisanInvitationEmail,
  BUYER: sendBuyerInvitationEmail,
};

// ---------------------------------------------------------------------------
// 1. createAndSendInvitations
// ---------------------------------------------------------------------------

export async function createAndSendInvitations(data: {
  emails: string[];
  type: "PIONEER" | "ARTISAN" | "BUYER";
  campaignName: string;
  campaignDescription?: string;
}): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, sent: 0, failed: 0, skipped: 0, errors: ["No autorizado"] };
  }

  const campaign = await prisma.invitationCampaign.create({
    data: {
      name: data.campaignName,
      type: data.type,
      description: data.campaignDescription || null,
      createdById: session.user.id,
    },
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Filter out emails that already have an active invitation
  const emailsToProcess: string[] = [];
  for (const email of data.emails) {
    const existing = await prisma.invitation.findFirst({
      where: {
        email,
        type: data.type,
        status: { in: ["SENT", "CLICKED", "ACCEPTED"] as CampaignInvitationStatus[] },
      },
    });
    if (existing) {
      skipped++;
    } else {
      emailsToProcess.push(email);
    }
  }

  // Process in batches of 10
  for (let i = 0; i < emailsToProcess.length; i += 10) {
    const batch = emailsToProcess.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(async (email) => {
        const invitation = await prisma.invitation.create({
          data: {
            email,
            type: data.type,
            campaignId: campaign.id,
            createdById: session.user.id,
          },
        });

        try {
          await emailSenders[data.type](email, { token: invitation.token });
          return { email, success: true };
        } catch (e) {
          await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status: "FAILED" },
          });
          return { email, success: false, error: e instanceof Error ? e.message : "Error" };
        }
      }),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          sent++;
        } else {
          failed++;
          errors.push(result.value.email);
        }
      } else {
        failed++;
      }
    }
  }

  await prisma.invitationCampaign.update({
    where: { id: campaign.id },
    data: { totalSent: sent },
  });

  revalidatePath("/portal/admin/invitaciones");

  return { success: true, sent, failed, skipped, errors };
}

// ---------------------------------------------------------------------------
// 2. getCampaigns
// ---------------------------------------------------------------------------

export async function getCampaigns(
  type?: "PIONEER" | "ARTISAN" | "BUYER",
): Promise<(InvitationCampaign & { _count: { invitations: number } })[]> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return [];

  try {
    return await prisma.invitationCampaign.findMany({
      where: type ? { type } : undefined,
      include: { _count: { select: { invitations: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Table may not exist yet if migration hasn't been applied
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. getCampaignDetail
// ---------------------------------------------------------------------------

export async function getCampaignDetail(
  campaignId: string,
): Promise<{ campaign: InvitationCampaign; invitations: Invitation[] } | null> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  try {
    const campaign = await prisma.invitationCampaign.findUnique({
      where: { id: campaignId },
      include: {
        invitations: { orderBy: { sentAt: "desc" } },
      },
    });

    if (!campaign) return null;

    return { campaign, invitations: campaign.invitations };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. trackInvitationClick
// ---------------------------------------------------------------------------

export async function trackInvitationClick(token: string): Promise<void> {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return;

  if (invitation.status === "SENT" || invitation.status === "OPENED") {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { clickedAt: new Date(), status: "CLICKED" },
    });

    if (invitation.campaignId) {
      await prisma.invitationCampaign.update({
        where: { id: invitation.campaignId },
        data: { totalClicked: { increment: 1 } },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. trackInvitationAccepted
// ---------------------------------------------------------------------------

export async function trackInvitationAccepted(token: string): Promise<void> {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return;

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { acceptedAt: new Date(), status: "ACCEPTED" },
  });

  if (invitation.campaignId) {
    await prisma.invitationCampaign.update({
      where: { id: invitation.campaignId },
      data: { totalAccepted: { increment: 1 } },
    });
  }
}

// ---------------------------------------------------------------------------
// 6. resendCampaignInvitation
// ---------------------------------------------------------------------------

export async function resendCampaignInvitation(
  invitationId: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "No autorizado" };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) return { success: false, error: "Invitación no encontrada" };

  try {
    await emailSenders[invitation.type](invitation.email, {
      token: invitation.token,
    });

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { sentAt: new Date(), status: "SENT" },
    });

    revalidatePath("/portal/admin/invitaciones");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Error al reenviar",
    };
  }
}

// ---------------------------------------------------------------------------
// 7. deleteCampaignInvitation
// ---------------------------------------------------------------------------

export async function deleteCampaignInvitation(
  invitationId: string,
): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) return { success: false };

  if (invitation.status !== "FAILED" && invitation.status !== "BOUNCED") {
    return { success: false };
  }

  await prisma.invitation.delete({ where: { id: invitationId } });
  revalidatePath("/portal/admin/invitaciones");
  return { success: true };
}
