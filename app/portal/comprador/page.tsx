import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatCLP } from "@/lib/utils";
import { getBuyerRecommendations } from "@/lib/ai/buyer-recommendations";
import type { OrderStatus } from "@prisma/client";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pendiente de Pago",
  PAID: "Pagado",
  PARTIALLY_SHIPPED: "Parcialmente Enviado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  PARTIALLY_SHIPPED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default async function BuyerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [activeOrders, recentOrders, favoritesCount, giftCards, recommendations] =
    await Promise.all([
      prisma.order.count({
        where: {
          userId,
          status: { in: ["PAID", "PARTIALLY_SHIPPED", "SHIPPED"] },
        },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            take: 2,
            select: {
              product: { select: { name: true, slug: true } },
              artisan: { select: { displayName: true } },
            },
          },
        },
      }),
      prisma.favorite.count({
        where: { userId },
      }),
      prisma.giftCard.findMany({
        where: { purchaserId: userId, status: "ACTIVE" },
        select: { balance: true },
      }),
      getBuyerRecommendations(userId, 4).catch(() => []),
    ]);

  const giftCardBalance = giftCards.reduce((sum, gc) => sum + gc.balance, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl font-light">Mi Cuenta</h1>
      <p className="text-sm text-text-secondary mt-1 mb-8">
        Bienvenido/a de vuelta
      </p>

      {/* Para Ti - Recommendations */}
      {recommendations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
            Para ti
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recommendations.slice(0, 4).map((rec) => (
              <Link
                href={`/coleccion/${rec.slug}`}
                key={rec.id}
                className="group no-underline"
              >
                <div className="aspect-square rounded-lg bg-background overflow-hidden">
                  {rec.image && (
                    <img
                      src={rec.image}
                      alt={rec.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-text truncate">
                  {rec.name}
                </p>
                <p className="text-xs text-text-tertiary">{rec.artisanName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Pedidos Activos
          </p>
          <p className="mt-1 text-2xl font-medium">{activeOrders}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Favoritos
          </p>
          <p className="mt-1 text-2xl font-medium">{favoritesCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-text-tertiary">
            Gift Cards
          </p>
          <p className="mt-1 text-2xl font-medium">
            {giftCardBalance > 0
              ? formatCLP(giftCardBalance)
              : "\u2014"}
          </p>
        </Card>
      </div>

      {/* Recent orders */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Pedidos recientes
        </h2>
        {recentOrders.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">
              Aún no tienes pedidos.
            </p>
            <Link
              href="/coleccion"
              className="mt-2 inline-block text-sm text-accent hover:text-accent-dark"
            >
              Explorar colección &rarr;
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/portal/comprador/pedidos/${order.id}`}
                className="block no-underline"
              >
                <Card className="transition-colors hover:border-accent/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                        >
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {new Intl.DateTimeFormat("es-CL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(order.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        {order.items.map((item, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-text truncate"
                          >
                            {item.product.name}
                            <span className="text-text-tertiary">
                              {" "}
                              &middot; {item.artisan.displayName}
                            </span>
                          </p>
                        ))}
                        {order.items.length === 2 && (
                          <p className="text-xs text-text-tertiary">
                            y más...
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-text whitespace-nowrap">
                      {formatCLP(order.total)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
            <div className="pt-1">
              <Link
                href="/portal/comprador/pedidos"
                className="text-sm text-accent hover:text-accent-dark"
              >
                Ver todos los pedidos &rarr;
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
