"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session.user;
}

export async function getContactSubmissions(filters?: {
  status?: string;
  search?: string;
}) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }

  const submissions = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
      conversation: { select: { id: true } },
    },
    take: 200,
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    return submissions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q),
    );
  }

  return submissions;
}

export async function updateContactSubmissionStatus(
  id: string,
  status: "REPLIED" | "CLOSED",
) {
  await requireAdmin();

  await prisma.contactSubmission.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/portal/admin/contacto");
}

export async function replyToContactSubmission(submissionId: string) {
  const admin = await requireAdmin();

  const submission = await prisma.contactSubmission.findUnique({
    where: { id: submissionId },
    select: { userId: true, conversationId: true, name: true, message: true, subject: true },
  });

  if (!submission) return { error: "Formulario no encontrado" };
  if (!submission.userId) return { error: "Este contacto no tiene cuenta registrada. Responde por email." };
  if (submission.conversationId) return { conversationId: submission.conversationId };

  // Check if an admin↔buyer conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      buyerId: submission.userId,
      adminId: { not: null },
      artisanId: null,
      deletedAt: null,
    },
  });

  if (existing) {
    // Link submission to existing conversation
    await prisma.contactSubmission.update({
      where: { id: submissionId },
      data: { conversationId: existing.id, status: "REPLIED" },
    });
    revalidatePath("/portal/admin/contacto");
    return { conversationId: existing.id };
  }

  // Create new admin↔buyer conversation and link it
  const conversation = await prisma.conversation.create({
    data: {
      buyerId: submission.userId,
      adminId: admin.id,
    },
  });

  await prisma.contactSubmission.update({
    where: { id: submissionId },
    data: { conversationId: conversation.id, status: "REPLIED" },
  });

  revalidatePath("/portal/admin/contacto");
  return { conversationId: conversation.id };
}

export async function getPendingContactCount() {
  return prisma.contactSubmission.count({
    where: { status: "PENDING" },
  });
}
