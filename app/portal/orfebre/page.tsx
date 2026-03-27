import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
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
          Hubo un error al conectar Mercado Pago. Por favor intenta nuevamente.
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
