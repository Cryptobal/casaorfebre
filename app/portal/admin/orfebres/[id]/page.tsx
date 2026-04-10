import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { OnboardingActions } from "../onboarding-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminArtisanDetailPage({ params }: PageProps) {
  const { id } = await params;

  const artisan = await prisma.artisan.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: { select: { name: true } } },
        take: 1,
      },
      _count: { select: { products: true, orderItems: true, reviews: true } },
    },
  });

  if (!artisan) notFound();

  // Get financial data
  const orderItems = await prisma.orderItem.findMany({
    where: { artisanId: id, order: { status: { not: "PENDING_PAYMENT" } } },
    select: { productPrice: true, quantity: true, commissionAmount: true, artisanPayout: true },
  });

  const totalRevenue = orderItems.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const activeProducts = await prisma.product.count({
    where: { artisanId: id, status: "APPROVED" },
  });

  // Recent conversations
  const conversations = await prisma.conversation.findMany({
    where: { artisanId: id },
    orderBy: { lastMessageAt: "desc" },
    take: 5,
    include: {
      buyer: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, createdAt: true } },
    },
  });

  // Blocked messages (bypass history)
  const blockedMessages = await prisma.message.findMany({
    where: {
      conversation: { artisanId: id },
      isBlocked: true,
      senderRole: "ARTISAN",
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { content: true, blockedReason: true, createdAt: true },
  });

  const planName = artisan.subscriptions?.[0]?.plan?.name || "Esencial";
  const commission = artisan.commissionOverride ?? artisan.commissionRate;
  const hasMp = !!artisan.mpAccessToken;

  return (
    <div>
      <Link href="/portal/admin/orfebres" className="text-sm text-text-secondary hover:text-accent">
        &larr; Orfebres
      </Link>

      <h1 className="mt-4 font-serif text-2xl font-light sm:text-3xl">
        {artisan.displayName}
      </h1>
      <p className="text-sm text-text-secondary">{artisan.location}</p>

      {/* Contact info */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Datos de contacto
        </h2>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-text-tertiary">Email</dt>
            <dd className="select-all">{artisan.user.email}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Teléfono</dt>
            <dd className="select-all">{artisan.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Ubicación</dt>
            <dd>{artisan.location}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Región</dt>
            <dd>{artisan.region || "—"}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">RUT</dt>
            <dd className="select-all">{artisan.rut || "—"}</dd>
          </div>
        </dl>
      </Card>

      {/* Metrics */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Métricas
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <dt className="text-text-tertiary">Registro</dt>
            <dd>{new Date(artisan.createdAt).toLocaleDateString("es-CL")}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Aprobación</dt>
            <dd>{artisan.approvedAt ? new Date(artisan.approvedAt).toLocaleDateString("es-CL") : "—"}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Ventas (cantidad)</dt>
            <dd className="font-medium">{artisan._count.orderItems}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Ventas (monto)</dt>
            <dd className="font-medium">{formatCLP(totalRevenue)}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Productos activos</dt>
            <dd>{activeProducts}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Rating</dt>
            <dd>{artisan.rating > 0 ? `★ ${artisan.rating.toFixed(1)} (${artisan.reviewCount})` : "Sin reseñas"}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Plan</dt>
            <dd>{planName}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Comisión</dt>
            <dd>
              {Math.round(commission * 100)}%
              {artisan.commissionOverride !== null && (
                <span className="ml-1 text-xs text-amber-600">(override)</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Estado</dt>
            <dd>
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                artisan.status === "APPROVED" ? "bg-green-100 text-green-700"
                  : artisan.status === "SUSPENDED" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
              }`}>
                {artisan.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Mercado Pago</dt>
            <dd>
              <span className={`rounded-full px-2 py-0.5 text-xs ${hasMp ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {hasMp ? "Conectado" : "No conectado"}
              </span>
            </dd>
          </div>
        </dl>
      </Card>

      {/* Onboarding tracking */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Seguimiento de onboarding
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <dt className="text-text-tertiary">Paso actual</dt>
            <dd>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                artisan.onboardingStep === "ACTIVE" ? "bg-green-100 text-green-700"
                  : artisan.onboardingStep === "NEEDS_ATTENTION" ? "bg-red-100 text-red-700"
                    : artisan.onboardingStep === "WELCOME" ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
              }`}>
                {artisan.onboardingStep === "WELCOME" ? "Esperando 1ra pieza"
                  : artisan.onboardingStep === "FIRST_PRODUCT" ? "Primera pieza subida"
                    : artisan.onboardingStep === "ACTIVE" ? "Activo"
                      : artisan.onboardingStep === "NEEDS_ATTENTION" ? "Requiere atención"
                        : artisan.onboardingStep ?? "—"}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Emails enviados</dt>
            <dd className="font-medium">{artisan.onboardingEmailsSent} / 3</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Último email</dt>
            <dd>{artisan.lastOnboardingEmailAt ? new Date(artisan.lastOnboardingEmailAt).toLocaleDateString("es-CL") : "Ninguno"}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Emails enviados</dt>
            <dd className="space-y-0.5">
              {[
                { n: 1, label: "Bienvenida (día 1)" },
                { n: 2, label: "Ayuda (día 3)" },
                { n: 3, label: "Personal (día 7)" },
              ].map((e) => (
                <div key={e.n} className="flex items-center gap-1.5 text-xs">
                  <span className={artisan.onboardingEmailsSent >= e.n ? "text-green-600" : "text-text-tertiary"}>
                    {artisan.onboardingEmailsSent >= e.n ? "✓" : "○"}
                  </span>
                  <span className={artisan.onboardingEmailsSent >= e.n ? "text-text" : "text-text-tertiary"}>
                    {e.label}
                  </span>
                </div>
              ))}
            </dd>
          </div>
        </dl>

        {/* Action buttons */}
        {artisan.onboardingStep !== "ACTIVE" && (
          <div className="mt-4 border-t border-border pt-4">
            <OnboardingActions
              artisanId={artisan.id}
              artisanName={artisan.displayName}
              phone={artisan.phone}
              emailsSent={artisan.onboardingEmailsSent}
            />
          </div>
        )}
      </Card>

      {/* Recent conversations */}
      <Card className="mt-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Conversaciones recientes ({conversations.length})
        </h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-text-tertiary">Sin conversaciones</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/portal/admin/mensajes/${c.id}`}
                className="flex items-center justify-between rounded-md border border-border/50 p-3 text-sm hover:bg-background"
              >
                <span>{c.buyer.name || c.buyer.email}</span>
                <span className="truncate ml-2 text-text-secondary">
                  {c.messages[0]?.content.slice(0, 40) || "Sin mensajes"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Bypass history */}
      {blockedMessages.length > 0 && (
        <Card className="mt-6 !border-red-200 !bg-red-50/30">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-red-700">
            Historial de bypass ({blockedMessages.length})
          </h2>
          <div className="space-y-2">
            {blockedMessages.map((m, i) => (
              <div key={i} className="rounded-md border border-red-200 bg-white p-3 text-sm">
                <p className="text-xs text-red-600">{new Date(m.createdAt).toLocaleDateString("es-CL")}</p>
                <p className="text-red-800">{m.blockedReason}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
