import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DeleteBuyerButton } from "../delete-buyer-button";
import { StartAdminChatButton } from "./start-admin-chat-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBuyerDetailPage({ params }: PageProps) {
  const { id } = await params;

  const buyer = await prisma.user.findUnique({
    where: { id, role: "BUYER" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: {
              product: { select: { name: true } },
              artisan: { select: { displayName: true } },
            },
          },
        },
      },
      favorites: {
        include: {
          product: {
            select: {
              name: true,
              slug: true,
              price: true,
              images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
            },
          },
        },
        take: 20,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, slug: true } },
        },
        take: 20,
      },
      referralRewardsEarned: {
        include: {
          referred: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!buyer) notFound();

  const [conversations, questions, contactSubmissions, adminConversation] = await Promise.all([
    prisma.conversation.findMany({
      where: { buyerId: id, deletedAt: null },
      orderBy: { lastMessageAt: "desc" },
      include: {
        artisan: { select: { displayName: true } },
        admin: { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
      },
      take: 50,
    }),
    prisma.productQuestion.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
      },
      take: 50,
    }),
    prisma.contactSubmission.findMany({
      where: {
        OR: [{ userId: id }, { email: buyer.email }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        conversation: { select: { id: true } },
      },
      take: 50,
    }),
    prisma.conversation.findFirst({
      where: {
        buyerId: id,
        adminId: { not: null },
        artisanId: null,
        deletedAt: null,
      },
      select: { id: true },
    }),
  ]);

  const totalSpent = buyer.orders
    .filter((o) => o.status !== "PENDING_PAYMENT" && o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);

  const giftCardPurchases = await prisma.giftCard.count({
    where: { purchaserId: id },
  });
  const canDeleteBuyer = buyer.orders.length === 0 && giftCardPurchases === 0;

  return (
    <div>
      <Link href="/portal/admin/compradores" className="text-sm text-text-secondary hover:text-accent">
        &larr; Compradores
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-light sm:text-3xl">
          {buyer.name || "Sin nombre"}
        </h1>
        <StartAdminChatButton
          buyerId={id}
          existingConversationId={adminConversation?.id}
        />
      </div>

      {/* Personal data */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Datos personales
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-text-tertiary">Nombre</dt><dd>{buyer.name || "—"}</dd></div>
          <div><dt className="text-text-tertiary">Email</dt><dd>{buyer.email}</dd></div>
          <div><dt className="text-text-tertiary">Teléfono</dt><dd>{buyer.shippingPhone || "—"}</dd></div>
          <div><dt className="text-text-tertiary">Dirección</dt><dd>{buyer.shippingAddress || "—"}</dd></div>
          <div><dt className="text-text-tertiary">Ciudad / Región</dt><dd>{[buyer.shippingCity, buyer.shippingRegion].filter(Boolean).join(", ") || "—"}</dd></div>
          <div><dt className="text-text-tertiary">Registro</dt><dd>{new Date(buyer.createdAt).toLocaleDateString("es-CL")}</dd></div>
          <div>
            <dt className="text-text-tertiary">Email verificado</dt>
            <dd>
              <span className={`rounded-full px-2 py-0.5 text-xs ${buyer.emailVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {buyer.emailVerified ? "Sí" : "No"}
              </span>
            </dd>
          </div>
          <div><dt className="text-text-tertiary">Total gastado</dt><dd className="font-medium">{formatCLP(totalSpent)}</dd></div>
        </dl>
      </Card>

      {/* Product Questions */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Preguntas de productos ({questions.length})
        </h2>
        {questions.length === 0 ? (
          <p className="text-sm text-text-tertiary">No ha hecho preguntas</p>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.id} className="rounded-md border border-border/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/coleccion/${q.product.slug}`} className="text-accent hover:underline">
                    {q.product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${q.answer ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {q.answer ? "Respondida" : "Pendiente"}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(q.createdAt).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-text-secondary">{q.question}</p>
                {q.answer && (
                  <p className="mt-1 text-text-tertiary italic">{q.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Contact Form Submissions */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Formularios de contacto ({contactSubmissions.length})
        </h2>
        {contactSubmissions.length === 0 ? (
          <p className="text-sm text-text-tertiary">No ha enviado formularios de contacto</p>
        ) : (
          <div className="space-y-2">
            {contactSubmissions.map((s) => (
              <div key={s.id} className="rounded-md border border-border/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.subject}</span>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      s.status === "PENDING" ? "bg-amber-100 text-amber-700"
                        : s.status === "REPLIED" ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}>
                      {s.status === "PENDING" ? "Pendiente" : s.status === "REPLIED" ? "Respondido" : "Cerrado"}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(s.createdAt).toLocaleDateString("es-CL")}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-text-secondary">{s.message.slice(0, 200)}{s.message.length > 200 ? "..." : ""}</p>
                {s.conversation && (
                  <Link href={`/portal/admin/mensajes/${s.conversation.id}`} className="mt-1 inline-block text-xs text-accent hover:underline">
                    Ver conversación
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Conversations */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Conversaciones ({conversations.length})
        </h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin conversaciones</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => {
              const isAdminConv = !c.artisanId && !!c.adminId;
              const counterpart = isAdminConv ? "Casa Orfebre" : c.artisan?.displayName || "Orfebre";
              return (
                <Link
                  key={c.id}
                  href={`/portal/admin/mensajes/${c.id}`}
                  className="flex items-center justify-between rounded-md border border-border/50 p-3 text-sm hover:bg-background"
                >
                  <div className="flex items-center gap-2">
                    <span>Con <span className="font-medium">{counterpart}</span></span>
                    {isAdminConv && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-text-secondary ml-2">
                      {c.messages[0]?.content.slice(0, 40) || "Sin mensajes"}
                    </span>
                    {c.messages[0] && (
                      <span className="text-xs text-text-tertiary">
                        {new Date(c.messages[0].createdAt).toLocaleDateString("es-CL")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Orders */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Pedidos ({buyer.orders.length})
        </h2>
        {buyer.orders.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin pedidos</p>
        ) : (
          <div className="space-y-2">
            {buyer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/portal/admin/pedidos`}
                className="flex items-center justify-between rounded-md border border-border/50 p-3 text-sm hover:bg-background"
              >
                <div>
                  <span className="font-medium">#{o.orderNumber}</span>
                  <span className="ml-2 text-text-secondary">
                    {o.items.map((i) => i.product.name).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-text-tertiary">
                  <span>{formatCLP(o.total)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    o.status === "COMPLETED" || o.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : o.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}>
                    {o.status}
                  </span>
                  <span>{new Date(o.createdAt).toLocaleDateString("es-CL")}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Favorites */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Favoritos ({buyer.favorites.length})
        </h2>
        {buyer.favorites.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin favoritos</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {buyer.favorites.map((f) => (
              <Link
                key={f.id}
                href={`/coleccion/${f.product.slug}`}
                className="group overflow-hidden rounded-md border border-border"
              >
                {f.product.images[0] ? (
                  <img
                    src={f.product.images[0].url}
                    alt={f.product.name}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-background text-text-tertiary">
                    Sin foto
                  </div>
                )}
                <p className="truncate p-2 text-xs">{f.product.name}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Reviews */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Reseñas ({buyer.reviews.length})
        </h2>
        {buyer.reviews.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin reseñas</p>
        ) : (
          <div className="space-y-3">
            {buyer.reviews.map((r) => (
              <div key={r.id} className="rounded-md border border-border/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Link href={`/coleccion/${r.product.slug}`} className="text-accent hover:underline">
                    {r.product.name}
                  </Link>
                  <div className="flex items-center gap-1">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </div>
                </div>
                <p className="mt-1 text-text-secondary">{r.comment}</p>
                <p className="mt-1 text-xs text-text-tertiary">{new Date(r.createdAt).toLocaleDateString("es-CL")}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Referrals */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Referidos ({buyer.referralRewardsEarned.length})
        </h2>
        {buyer.referralRewardsEarned.length === 0 ? (
          <p className="text-sm text-text-tertiary">No ha referido a nadie</p>
        ) : (
          <div className="space-y-2">
            {buyer.referralRewardsEarned.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-border/50 p-3 text-sm">
                <span>{r.referred.name || r.referred.email}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  r.status === "USED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <DeleteBuyerButton
        buyerId={buyer.id}
        canDelete={canDeleteBuyer}
        blockReason={
          !canDeleteBuyer
            ? buyer.orders.length > 0
              ? "Este comprador tiene pedidos registrados. Por trazabilidad no se puede eliminar la cuenta desde el panel."
              : "Tiene gift cards asociadas como comprador; no se puede eliminar la cuenta."
            : undefined
        }
      />
    </div>
  );
}
