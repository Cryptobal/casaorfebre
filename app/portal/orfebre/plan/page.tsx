import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PlanSelector } from "./plan-selector";
import Link from "next/link";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: { plan: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan) redirect("/");

  const [plans, activeProductCount] = await Promise.all([
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    prisma.product.count({
      where: { artisanId: artisan.id, status: "APPROVED" },
    }),
  ]);

  const currentPlanId = artisan.subscriptions[0]?.planId ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-text">
            Mi Plan
          </h1>
          <p className="mt-1 text-text-secondary">
            Gestiona tu suscripción y beneficios
          </p>
        </div>
        <Link
          href="/portal/orfebre"
          className="text-sm text-accent transition-colors hover:text-accent-dark"
        >
          &larr; Volver al taller
        </Link>
      </div>

      {/* Current plan summary */}
      {artisan.subscriptions[0] && (
        <div className="mt-6 rounded-md border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-text-secondary">
          Plan actual:{" "}
          <strong className="text-text">
            {artisan.subscriptions[0].plan.name.charAt(0).toUpperCase() +
              artisan.subscriptions[0].plan.name.slice(1)}
          </strong>{" "}
          · {activeProductCount} de{" "}
          {artisan.subscriptions[0].plan.maxProducts === 0
            ? "∞"
            : artisan.subscriptions[0].plan.maxProducts}{" "}
          productos activos · Comisión{" "}
          {Math.round(
            (artisan.commissionOverride ?? artisan.commissionRate) * 100
          )}
          %
        </div>
      )}

      {!artisan.subscriptions[0] && (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No tienes un plan activo. Estás usando el plan Esencial por defecto.
          Selecciona un plan para acceder a más beneficios.
        </div>
      )}

      {/* Payment feedback */}
      {params.sub_payment === "success" && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Pago procesado exitosamente. Tu suscripción ha sido activada.
        </div>
      )}
      {params.sub_payment === "failure" && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          El pago no pudo ser procesado. Intenta nuevamente o elige otro medio de pago.
        </div>
      )}
      {params.sub_payment === "pending" && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tu pago está pendiente de confirmación. Te notificaremos por email cuando se confirme.
        </div>
      )}

      {/* Plan selector */}
      <div className="mt-8">
        <PlanSelector
          currentPlanId={currentPlanId}
          plans={plans}
          activeProductCount={activeProductCount}
        />
      </div>
    </div>
  );
}
