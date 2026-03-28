"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { filterMessage } from "@/lib/chat-filter";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user;
}

function isAdmin(role?: string) {
  return role === "ADMIN";
}

// ---------------------------------------------------------------------------
// a) Start conversation
// ---------------------------------------------------------------------------

export async function startConversation(artisanId: string, productId?: string) {
  const user = await requireUser();

  // Require verified email
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true },
  });
  if (!dbUser?.emailVerified) {
    return { error: "Debes verificar tu email para enviar mensajes" };
  }

  // Check if conversation already exists
  const existing = await prisma.conversation.findUnique({
    where: { buyerId_artisanId: { buyerId: user.id, artisanId } },
  });

  if (existing) {
    // Update product reference if provided
    if (productId && !existing.productId) {
      await prisma.conversation.update({
        where: { id: existing.id },
        data: { productId },
      });
    }
    return { conversationId: existing.id };
  }

  const conversation = await prisma.conversation.create({
    data: {
      buyerId: user.id,
      artisanId,
      productId: productId || null,
    },
  });

  return { conversationId: conversation.id };
}

// ---------------------------------------------------------------------------
// b) Send message
// ---------------------------------------------------------------------------

export async function sendMessage(conversationId: string, content: string) {
  const user = await requireUser();
  const trimmed = content.trim();
  if (!trimmed) return { error: "El mensaje no puede estar vacío" };
  if (trimmed.length > 2000) return { error: "Mensaje muy largo (máx. 2000 caracteres)" };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      artisan: { select: { userId: true, displayName: true } },
      buyer: { select: { id: true, name: true, email: true } },
    },
  });

  if (!conversation) return { error: "Conversación no encontrada" };
  if (conversation.status === "BLOCKED") return { error: "Esta conversación ha sido bloqueada" };

  // Verify user is a participant
  const isBuyer = conversation.buyerId === user.id;
  const isArtisan = conversation.artisan.userId === user.id;
  if (!isBuyer && !isArtisan && !isAdmin(user.role)) {
    return { error: "No tienes acceso a esta conversación" };
  }

  // Determine sender role
  const senderRole = isAdmin(user.role) && !isBuyer && !isArtisan
    ? "ADMIN" as const
    : isBuyer
      ? "BUYER" as const
      : "ARTISAN" as const;

  // Apply filter (not for admin messages)
  if (senderRole !== "ADMIN") {
    const filterResult = filterMessage(trimmed);
    if (filterResult.isBlocked) {
      await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId,
            senderId: user.id,
            senderRole,
            content: trimmed,
            isBlocked: true,
            blockedReason: filterResult.reason,
          },
        }),
        prisma.conversation.update({
          where: { id: conversationId },
          data: { hasBypassAttempt: true },
        }),
      ]);
      return {
        error: "No está permitido compartir datos de contacto.",
        blocked: true,
      };
    }
  }

  // Save message and update conversation
  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        senderRole,
        content: trimmed,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  // Send email notification (non-blocking)
  try {
    const { sendNewMessageEmail } = await import("@/lib/emails/templates");
    const recipientIsBuyer = !isBuyer;
    const notifField = recipientIsBuyer ? "lastNotifiedBuyerAt" : "lastNotifiedArtisanAt";
    const lastNotified = recipientIsBuyer
      ? conversation.lastNotifiedBuyerAt
      : conversation.lastNotifiedArtisanAt;

    // Throttle: no email if notified < 5 min ago
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!lastNotified || lastNotified < fiveMinAgo) {
      const recipientEmail = recipientIsBuyer ? conversation.buyer.email : "";
      const recipientName = recipientIsBuyer
        ? conversation.buyer.name || "Comprador"
        : conversation.artisan.displayName;
      const senderName = isBuyer
        ? conversation.buyer.name || "Comprador"
        : conversation.artisan.displayName;
      const portal = recipientIsBuyer ? "comprador" : "orfebre";
      const conversationUrl = `/portal/${portal}/mensajes/${conversationId}`;

      // Get artisan email if needed
      let finalEmail = recipientEmail;
      if (!recipientIsBuyer) {
        const artisanUser = await prisma.user.findUnique({
          where: { id: conversation.artisan.userId },
          select: { email: true },
        });
        finalEmail = artisanUser?.email || "";
      }

      if (finalEmail) {
        await sendNewMessageEmail(finalEmail, recipientName, senderName, trimmed.slice(0, 100), conversationUrl);
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { [notifField]: new Date() },
        });
      }
    }
  } catch (e) {
    console.error("Error sending chat notification email:", e);
  }

  revalidatePath(`/portal/comprador/mensajes/${conversationId}`);
  revalidatePath(`/portal/orfebre/mensajes/${conversationId}`);

  return { success: true };
}

// ---------------------------------------------------------------------------
// c) Get conversations
// ---------------------------------------------------------------------------

export async function getConversations() {
  const user = await requireUser();

  // Get artisan ID if user is an artisan
  const artisan = await prisma.artisan.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const conversations = await prisma.conversation.findMany({
    where: {
      deletedAt: null,
      OR: [
        { buyerId: user.id },
        ...(artisan ? [{ artisanId: artisan.id }] : []),
      ],
    },
    orderBy: { lastMessageAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      artisan: {
        select: {
          id: true,
          displayName: true,
          profileImage: true,
          userId: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { badgeText: true, badgeType: true } } },
            take: 1,
          },
        },
      },
      product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderRole: true },
      },
      _count: {
        select: {
          messages: {
            where: {
              isRead: false,
              isBlocked: false,
              senderId: { not: user.id },
            },
          },
        },
      },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    status: c.status,
    hasBypassAttempt: c.hasBypassAttempt,
    buyer: c.buyer,
    artisan: c.artisan,
    product: c.product,
    lastMessage: c.messages[0] || null,
    unreadCount: c._count.messages,
    isBuyer: c.buyerId === user.id,
    lastMessageAt: c.lastMessageAt,
  }));
}

// ---------------------------------------------------------------------------
// d) Get messages
// ---------------------------------------------------------------------------

export async function getMessages(conversationId: string) {
  const user = await requireUser();

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      artisan: { select: { userId: true } },
    },
  });

  if (!conversation) return { error: "Conversación no encontrada", messages: [] };

  const isBuyer = conversation.buyerId === user.id;
  const isArtisan = conversation.artisan.userId === user.id;
  if (!isBuyer && !isArtisan && !isAdmin(user.role)) {
    return { error: "No tienes acceso", messages: [] };
  }

  // Determine viewer role for visibility filtering
  const viewerRole = isAdmin(user.role) ? null : isBuyer ? "BUYER" : "ARTISAN";

  // Mark messages from the other person as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedAt: null,
      // Non-admin users only see messages visible to them
      ...(viewerRole ? {
        OR: [
          { visibleTo: null },
          { visibleTo: viewerRole },
        ],
      } : {}),
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });

  return {
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderRole: m.senderRole,
      senderName: m.sender.name,
      senderImage: m.sender.image,
      content: m.content,
      isBlocked: m.isBlocked,
      blockedReason: m.blockedReason,
      isRead: m.isRead,
      createdAt: m.createdAt,
      isOwn: m.senderId === user.id,
      visibleTo: m.visibleTo,
    })),
  };
}

// ---------------------------------------------------------------------------
// e) Mark as read
// ---------------------------------------------------------------------------

export async function markAsRead(conversationId: string) {
  const user = await requireUser();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}

// ---------------------------------------------------------------------------
// f) Admin: block conversation
// ---------------------------------------------------------------------------

export async function adminBlockConversation(conversationId: string, message?: string) {
  const user = await requireUser();
  if (!isAdmin(user.role)) return { error: "No autorizado" };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: "BLOCKED" },
  });

  if (message) {
    await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        senderRole: "ADMIN",
        content: message,
      },
    });
  }

  revalidatePath(`/portal/admin/mensajes/${conversationId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// g) Admin: send warning
// ---------------------------------------------------------------------------

export async function adminSendWarning(
  conversationId: string,
  toRole: "BUYER" | "ARTISAN",
  message: string,
) {
  const user = await requireUser();
  if (!isAdmin(user.role)) return { error: "No autorizado" };

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      senderRole: "ADMIN",
      content: message,
      visibleTo: toRole,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath(`/portal/admin/mensajes/${conversationId}`);
  revalidatePath(`/portal/comprador/mensajes/${conversationId}`);
  revalidatePath(`/portal/orfebre/mensajes/${conversationId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin: get all conversations
// ---------------------------------------------------------------------------

export async function adminGetConversations(filters?: {
  bypass?: boolean;
  status?: string;
  search?: string;
}) {
  const user = await requireUser();
  if (!isAdmin(user.role)) return [];

  const where: Record<string, unknown> = { deletedAt: null };
  if (filters?.bypass) where.hasBypassAttempt = true;
  if (filters?.status) where.status = filters.status;

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, email: true } },
      artisan: {
        select: {
          id: true,
          displayName: true,
          userId: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { name: true, badgeText: true } } },
            take: 1,
          },
        },
      },
      product: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
      _count: { select: { messages: { where: { isBlocked: true } } } },
    },
    take: 200,
  });

  // If search filter, apply client-side for simplicity
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.buyer.name?.toLowerCase().includes(q) ||
        c.buyer.email?.toLowerCase().includes(q) ||
        c.artisan.displayName.toLowerCase().includes(q),
    );
  }

  return conversations;
}

// ---------------------------------------------------------------------------
// Get unread count for badge
// ---------------------------------------------------------------------------

export async function getUnreadMessageCount() {
  const user = await requireUser();

  const artisan = await prisma.artisan.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const count = await prisma.message.count({
    where: {
      isRead: false,
      isBlocked: false,
      senderId: { not: user.id },
      conversation: {
        OR: [
          { buyerId: user.id },
          ...(artisan ? [{ artisanId: artisan.id }] : []),
        ],
      },
    },
  });

  return count;
}

// ---------------------------------------------------------------------------
// Admin: get bypass conversation count for badge
// ---------------------------------------------------------------------------

export async function getBypassConversationCount() {
  return prisma.conversation.count({
    where: { hasBypassAttempt: true, status: "ACTIVE" },
  });
}

// ---------------------------------------------------------------------------
// Admin: delete message (soft)
// ---------------------------------------------------------------------------

export async function adminDeleteMessage(messageId: string) {
  const user = await requireUser();
  if (!isAdmin(user.role)) return { error: "No autorizado" };

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true },
  });
  if (!message) return { error: "Mensaje no encontrado" };

  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/portal/admin/mensajes/${message.conversationId}`);
  revalidatePath(`/portal/comprador/mensajes/${message.conversationId}`);
  revalidatePath(`/portal/orfebre/mensajes/${message.conversationId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Admin: delete conversation (soft)
// ---------------------------------------------------------------------------

export async function adminDeleteConversation(conversationId: string) {
  const user = await requireUser();
  if (!isAdmin(user.role)) return { error: "No autorizado" };

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/portal/admin/mensajes");
  return { success: true };
}
