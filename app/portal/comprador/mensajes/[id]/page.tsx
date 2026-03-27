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

export default async function BuyerConversationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      artisan: {
        select: {
          displayName: true,
          slug: true,
          profileImage: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { badgeText: true } } },
            take: 1,
          },
        },
      },
      product: { select: { name: true, slug: true } },
    },
  });

  if (!conversation || conversation.buyerId !== session.user.id) notFound();

  const { messages } = await getMessages(id);
  const badge = conversation.artisan.subscriptions?.[0]?.plan?.badgeText;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col sm:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Link
          href="/portal/comprador/mensajes"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-background sm:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-sm font-medium text-accent">
          {conversation.artisan.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{conversation.artisan.displayName}</p>
            {badge && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{badge}</span>
            )}
          </div>
          {conversation.product && (
            <p className="truncate text-xs text-text-tertiary">
              Re: {conversation.product.name}
            </p>
          )}
        </div>
        <Link
          href={`/orfebres/${conversation.artisan.slug}`}
          className="flex-shrink-0 text-xs text-accent hover:underline"
        >
          Ver perfil
        </Link>
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
