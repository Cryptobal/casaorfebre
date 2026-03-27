import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getMessages } from "@/lib/actions/chat";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatMessageInput } from "@/components/chat/chat-message-input";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtisanConversationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      buyer: { select: { name: true, image: true } },
      product: { select: { name: true, slug: true } },
    },
  });

  if (!conversation || !artisan || conversation.artisanId !== artisan.id) notFound();

  const { messages } = await getMessages(id);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col sm:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/portal/orfebre/mensajes"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-background sm:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 font-serif text-sm font-medium text-blue-700">
          {(conversation.buyer.name || "C").slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{conversation.buyer.name || "Comprador"}</p>
          {conversation.product && (
            <p className="truncate text-xs text-text-tertiary">
              Re: {conversation.product.name}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ChatMessages messages={messages} />

      {/* Input */}
      {conversation.status === "BLOCKED" ? (
        <div className="border-t border-border bg-red-50 p-4 text-center text-sm text-red-700">
          Esta conversación ha sido bloqueada por el administrador.
        </div>
      ) : (
        <ChatMessageInput conversationId={id} />
      )}
    </div>
  );
}
