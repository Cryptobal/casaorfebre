import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArtisanBadge } from "@/components/artisans/artisan-badge";
import { MpConnectionBanner } from "./mp-connection-banner";

export default async function ArtisanDashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      mpAccessToken: true,
      mpOnboarded: true,
      commissionRate: true,
      commissionOverride: true,
      maxProductsOverride: true,
      subscriptions: {
        where: { status: "ACTIVE" },
        select: {
          endDate: true,
          startDate: true,
          plan: {
            select: {
              name: true,
              badgeText: true,
              badgeType: true,
              maxProducts: true,
              commissionRate: true,
            },
          },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan) redirect("/");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [activeProducts, pendingOrders, unansweredQuestions, monthlySales] =
    await Promise.all([
      prisma.product.count({
        where: { artisanId: artisan.id, status: "APPROVED" },
      }),
      prisma.orderItem.count({
        where: { artisanId: artisan.id, fulfillmentStatus: "PENDING" },
      }),
      prisma.productQuestion.count({
        where: { artisanId: artisan.id, answer: null },
      }),
      prisma.orderItem.count({
        where: {
          artisanId: artisan.id,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

  const stats = [
    {
      label: "Productos Activos",
      value: activeProducts,
      highlight: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      label: "Pedidos Pendientes",
      value: pendingOrders,
      highlight: pendingOrders > 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      label: "Ventas del Mes",
      value: monthlySales,
      highlight: false,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Preguntas sin Responder",
      value: unansweredQuestions,
      highlight: unansweredQuestions > 0,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* MercadoPago OAuth feedback */}
      {params.mp_success === "true" && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Mercado Pago conectado exitosamente. Ahora recibirás tus pagos directamente.
        </div>
      )}
      {params.mp_error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {params.mp_error === "config"
            ? "Error de configuración: MP_APP_ID no está configurado en el servidor."
            : params.mp_error === "not_approved"
              ? "Tu cuenta de orfebre debe estar aprobada antes de conectar Mercado Pago."
              : "Hubo un error al conectar Mercado Pago. Por favor intenta nuevamente."}
        </div>
      )}

      {/* MercadoPago connection status */}
      <MpConnectionBanner
        isConnected={artisan.mpOnboarded && !!artisan.mpAccessToken}
      />

      {/* Alert banners */}
      {pendingOrders > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes <strong>{pendingOrders}</strong> pedido
          {pendingOrders > 1 ? "s" : ""} pendiente
          {pendingOrders > 1 ? "s" : ""} de envio.
        </div>
      )}
      {unansweredQuestions > 0 && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tienes <strong>{unansweredQuestions}</strong> pregunta
          {unansweredQuestions > 1 ? "s" : ""} sin responder.
        </div>
      )}

      <h1 className="font-serif text-3xl font-semibold text-text">
        Mi Taller
      </h1>
      <p className="mt-1 text-text-secondary">
        Bienvenida, {artisan.displayName}
      </p>

      {/* Plan indicator */}
      <PlanIndicator
        subscription={artisan.subscriptions?.[0] ?? null}
        activeProducts={activeProducts}
        commissionRate={artisan.commissionOverride ?? artisan.commissionRate}
        maxProductsOverride={artisan.maxProductsOverride}
      />

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`flex flex-col items-start gap-3 ${
              stat.highlight ? "border-amber-300 bg-amber-50/50" : ""
            }`}
          >
            <div
              className={`${
                stat.highlight ? "text-amber-600" : "text-text-secondary"
              }`}
            >
              {stat.icon}
            </div>
            <div>
              <p
                className={`text-2xl font-semibold ${
                  stat.highlight ? "text-amber-700" : "text-text"
                }`}
              >
                {stat.value}
              </p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Plan Indicator ─── */

function PlanIndicator({
  subscription,
  activeProducts,
  commissionRate,
  maxProductsOverride,
}: {
  subscription: {
    endDate: Date | null;
    startDate: Date;
    plan: {
      name: string;
      badgeText: string | null;
      badgeType: string | null;
      maxProducts: number;
      commissionRate: number;
    };
  } | null;
  activeProducts: number;
  commissionRate: number;
  maxProductsOverride: number | null;
}) {
  const plan = subscription?.plan;
  const planLabel = plan
    ? plan.name.charAt(0).toUpperCase() + plan.name.slice(1)
    : "Esencial";

  const maxProducts =
    maxProductsOverride !== null && maxProductsOverride !== undefined
      ? maxProductsOverride
      : plan?.maxProducts ?? 10;
  const isUnlimited = maxProducts === 0;
  const usagePercent = isUnlimited
    ? 0
    : Math.min(Math.round((activeProducts / maxProducts) * 100), 100);
  const nearLimit = !isUnlimited && usagePercent >= 80;

  // Subscription time info
  const endDate = subscription?.endDate;
  const now = new Date();
  const daysRemaining = endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const totalDays =
    subscription && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(subscription.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;
  const timePercent =
    daysRemaining !== null && totalDays
      ? Math.min(Math.round(((totalDays - daysRemaining) / totalDays) * 100), 100)
      : null;
  const nearExpiry = daysRemaining !== null && daysRemaining <= 7;
  const isExpired = daysRemaining !== null && daysRemaining === 0;

  return (
    <Card className="mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Plan badge + name */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text">
                Plan {planLabel}
              </span>
              {plan?.badgeType && (
                <ArtisanBadge
                  badgeType={plan.badgeType}
                  badgeText={plan.badgeText}
                />
              )}
            </div>
            <p className="mt-0.5 text-xs text-text-tertiary">
              Comisión: {Math.round(commissionRate * 100)}%
            </p>
            {/* Subscription status */}
            {endDate && (
              <p className={`mt-0.5 text-xs ${isExpired ? "text-red-600 font-medium" : nearExpiry ? "text-amber-600" : "text-text-tertiary"}`}>
                {isExpired
                  ? "Expirada"
                  : `Activa hasta el ${new Date(endDate).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}`}
              </p>
            )}
          </div>
        </div>

        {/* Product usage + subscription time */}
        <div className="flex-1 sm:max-w-xs space-y-3">
          {/* Product usage bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>Productos activos</span>
              <span>
                {activeProducts} de {isUnlimited ? "∞" : maxProducts}
              </span>
            </div>
            {!isUnlimited && (
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all ${
                    nearLimit ? "bg-amber-500" : "bg-accent"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
            {nearLimit && (
              <p className="mt-1 text-xs text-amber-600">
                Estás cerca del límite de tu plan.{" "}
                <Link
                  href="/portal/orfebre/plan"
                  className="font-medium underline"
                >
                  Sube de plan
                </Link>
              </p>
            )}
          </div>

          {/* Subscription time bar */}
          {daysRemaining !== null && timePercent !== null && (
            <div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Tiempo restante</span>
                <span>
                  {isExpired ? "Expirada" : `${daysRemaining} días`}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all ${
                    isExpired ? "bg-red-500" : nearExpiry ? "bg-amber-500" : "bg-accent"
                  }`}
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Link to plan page */}
        <div className="flex flex-col items-end gap-2">
          {(nearExpiry || isExpired) && (
            <Link
              href="/portal/orfebre/plan"
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
            >
              {isExpired ? "Renovar ahora" : "Renovar plan"}
            </Link>
          )}
          <Link
            href="/portal/orfebre/plan"
            className="text-xs font-medium text-accent transition-colors hover:text-accent-dark"
          >
            Cambiar plan &rarr;
          </Link>
        </div>
      </div>

      {/* Renewal warning banner */}
      {nearExpiry && !isExpired && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tu suscripción se renueva pronto. Quedan <strong>{daysRemaining}</strong> día{daysRemaining !== 1 ? "s" : ""}.
        </div>
      )}
      {isExpired && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          Tu suscripción ha expirado. <Link href="/portal/orfebre/plan" className="font-medium underline">Renueva tu plan</Link> para mantener tus beneficios.
        </div>
      )}
    </Card>
  );
}
