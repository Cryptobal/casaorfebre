import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCLP } from "@/lib/utils";
import { formatGiftCardCode } from "@/lib/gift-cards";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activa", color: "bg-green-100 text-green-800" },
  PARTIALLY_USED: { label: "Parcialmente usada", color: "bg-amber-100 text-amber-800" },
  REDEEMED: { label: "Agotada", color: "bg-gray-100 text-gray-600" },
  EXPIRED: { label: "Expirada", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-700" },
};

export default async function BuyerGiftCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userEmail = session.user.email || "";

  const [purchased, received] = await Promise.all([
    prisma.giftCard.findMany({
      where: { purchaserId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.giftCard.findMany({
      where: { recipientEmail: userEmail },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-text">Mis Gift Cards</h1>
        <p className="mt-1 text-sm text-text-tertiary">
          Gift Cards que compraste y las que recibiste.
        </p>
      </div>

      {/* Purchased */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-text">Gift Cards compradas</h2>
        {purchased.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-center">
            <p className="text-sm text-text-tertiary">No has comprado Gift Cards aún.</p>
            <Link href="/gift-cards" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
              Comprar Gift Card
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchased.map((gc) => {
              const status = STATUS_LABELS[gc.status] || { label: gc.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div key={gc.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text">
                        {formatCLP(gc.amount)} → {gc.recipientEmail}
                      </p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        {gc.recipientName ? `Para: ${gc.recipientName} · ` : ""}
                        {gc.createdAt.toLocaleDateString("es-CL")}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Received */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-text">Gift Cards recibidas</h2>
        {received.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-6 text-center">
            <p className="text-sm text-text-tertiary">No has recibido Gift Cards.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {received.map((gc) => {
              const status = STATUS_LABELS[gc.status] || { label: gc.status, color: "bg-gray-100 text-gray-600" };
              const hasBalance = gc.balance > 0 && (gc.status === "ACTIVE" || gc.status === "PARTIALLY_USED");
              const expiresLabel = gc.expiresAt.toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });

              return (
                <div key={gc.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text">
                          Saldo: {formatCLP(gc.balance)}
                          {gc.balance < gc.amount && (
                            <span className="ml-1 text-text-tertiary">/ {formatCLP(gc.amount)}</span>
                          )}
                        </p>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs tracking-wider text-text-secondary">
                        {formatGiftCardCode(gc.code)}
                      </p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        Expira: {expiresLabel}
                      </p>
                    </div>
                    {hasBalance && (
                      <Link
                        href="/coleccion"
                        className="flex-shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
                      >
                        Usar ahora →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
