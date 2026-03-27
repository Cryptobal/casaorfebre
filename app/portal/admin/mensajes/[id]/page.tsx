import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getMessages } from "@/lib/actions/chat";
import { ChatMessages } from "@/components/chat/chat-messages";
import { AdminConversationActions } from "./admin-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminConversationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      },
      artisan: {
        select: {
          id: true,
          displayName: true,
          slug: true,
          userId: true,
          rating: true,
          totalSales: true,
          status: true,
          commissionRate: true,
          commissionOverride: true,
          mpAccessToken: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: { select: { name: true } } },
            take: 1,
          },
          user: { select: { email: true } },
        },
      },
      product: { select: { name: true, slug: true } },
    },
  });

  if (!conversation) notFound();

  const { messages } = await getMessages(id);

  // Get blocked messages for bypass history
  const blockedMessages = await prisma.message.findMany({
    where: { conversationId: id, isBlocked: true },
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { name: true } } },
  });

  const artisanPlan = conversation.artisan.subscriptions?.[0]?.plan?.name || "Esencial";
  const hasMp = !!conversation.artisan.mpAccessToken;
  const commission = conversation.artisan.commissionOverride ?? conversation.artisan.commissionRate;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main chat area */}
      <div className="flex-1">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/portal/admin/mensajes"
            className="text-sm text-text-secondary hover:text-accent"
          >
            &larr; Mensajes
          </Link>
        </div>

        {/* Participants header */}
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Comprador</p>
            <p className="font-medium">{conversation.buyer.name || "Sin nombre"}</p>
            <p className="text-sm text-text-secondary">{conversation.buyer.email}</p>
          </div>
          <div className="text-text-tertiary">&harr;</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">Orfebre</p>
            <p className="font-medium">{conversation.artisan.displayName}</p>
            <p className="text-sm text-text-secondary">{conversation.artisan.user.email}</p>
          </div>
        </div>

        {/* Chat */}
        <div className="flex h-[500px] flex-col rounded-lg border border-border">
          <ChatMessages messages={messages} />
        </div>

        {/* Admin actions */}
        <AdminConversationActions
          conversationId={id}
          status={conversation.status}
          artisanId={conversation.artisan.id}
        />
      </div>

      {/* Sidebar info panel */}
      <div className="w-full space-y-4 lg:w-80">
        {/* Buyer info */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Comprador
          </h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-text-tertiary">Email</dt><dd>{conversation.buyer.email}</dd></div>
            <div>
              <dt className="text-text-tertiary">Email verificado</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-xs ${conversation.buyer.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {conversation.buyer.emailVerified ? "Sí" : "No"}
                </span>
              </dd>
            </div>
            <div><dt className="text-text-tertiary">Registro</dt><dd>{new Date(conversation.buyer.createdAt).toLocaleDateString("es-CL")}</dd></div>
            <div><dt className="text-text-tertiary">Total pedidos</dt><dd>{conversation.buyer._count.orders}</dd></div>
          </dl>
        </div>

        {/* Artisan info */}
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Orfebre
          </h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-text-tertiary">Email</dt><dd>{conversation.artisan.user.email}</dd></div>
            <div><dt className="text-text-tertiary">Plan</dt><dd>{artisanPlan}</dd></div>
            <div><dt className="text-text-tertiary">Rating</dt><dd>{conversation.artisan.rating.toFixed(1)}</dd></div>
            <div><dt className="text-text-tertiary">Ventas</dt><dd>{conversation.artisan.totalSales}</dd></div>
            <div><dt className="text-text-tertiary">Comisión</dt><dd>{Math.round(commission * 100)}%</dd></div>
            <div>
              <dt className="text-text-tertiary">Mercado Pago</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-xs ${hasMp ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {hasMp ? "Conectado" : "No conectado"}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Bypass history */}
        {blockedMessages.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-red-700">
              Historial de bypass ({blockedMessages.length})
            </h3>
            <div className="space-y-2">
              {blockedMessages.map((m) => (
                <div key={m.id} className="text-sm">
                  <p className="text-xs text-red-600">{m.sender.name} &mdash; {new Date(m.createdAt).toLocaleDateString("es-CL")}</p>
                  <p className="text-red-800">{m.blockedReason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
