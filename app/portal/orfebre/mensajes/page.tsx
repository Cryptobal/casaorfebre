import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default async function ArtisanMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!artisan) redirect("/portal/comprador/pedidos");

  const conversations = await prisma.conversation.findMany({
    where: { artisanId: artisan.id },
    orderBy: { lastMessageAt: "desc" },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      product: {
        select: {
          name: true,
          slug: true,
          images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
        },
      },
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
              senderId: { not: session.user.id },
            },
          },
        },
      },
    },
  });

  // Calculate average response time
  const allMessages = await prisma.message.findMany({
    where: {
      conversation: { artisanId: artisan.id },
      senderRole: { in: ["BUYER", "ARTISAN"] },
      isBlocked: false,
    },
    orderBy: { createdAt: "asc" },
    select: { senderRole: true, createdAt: true, conversationId: true },
  });

  let totalResponseMs = 0;
  let responseCount = 0;
  const grouped: Record<string, typeof allMessages> = {};
  for (const m of allMessages) {
    if (!grouped[m.conversationId]) grouped[m.conversationId] = [];
    grouped[m.conversationId].push(m);
  }
  for (const msgs of Object.values(grouped)) {
    for (let i = 1; i < msgs.length; i++) {
      if (msgs[i].senderRole === "ARTISAN" && msgs[i - 1].senderRole === "BUYER") {
        totalResponseMs += new Date(msgs[i].createdAt).getTime() - new Date(msgs[i - 1].createdAt).getTime();
        responseCount++;
      }
    }
  }
  const avgResponseHours = responseCount > 0 ? Math.round(totalResponseMs / responseCount / 3600000) : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-light sm:text-3xl">Mensajes</h1>
        {avgResponseHours !== null && (
          <p className="text-xs text-text-tertiary">
            Tiempo promedio de respuesta: <span className="font-medium text-text-secondary">{avgResponseHours}h</span>
          </p>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border p-8 text-center">
          <p className="text-text-secondary">
            Aún no tienes mensajes de compradores.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {conversations.map((c) => {
            const thumb = c.product?.images?.[0]?.url;
            return (
              <Link
                key={c.id}
                href={`/portal/orfebre/mensajes/${c.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-background sm:gap-4 sm:p-4"
              >
                {/* Buyer avatar */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 font-serif text-sm font-medium text-blue-700">
                  {(c.buyer.name || "C").slice(0, 2).toUpperCase()}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text">
                    {c.buyer.name || "Comprador"}
                  </p>
                  {c.product && (
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {thumb && (
                        <img src={thumb} alt="" className="h-4 w-4 rounded object-cover" />
                      )}
                      <p className="truncate text-xs text-text-tertiary">
                        {c.product.name}
                      </p>
                    </div>
                  )}
                  {c.messages[0] && (
                    <p className="mt-0.5 truncate text-sm text-text-secondary">
                      {c.messages[0].content.slice(0, 60)}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  {c.messages[0] && (
                    <span className="text-xs text-text-tertiary">
                      {timeAgo(c.messages[0].createdAt)}
                    </span>
                  )}
                  {c._count.messages > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                      {c._count.messages}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
