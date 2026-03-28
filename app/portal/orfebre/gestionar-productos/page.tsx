import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductSelectionClient } from "./product-selection-client";

export default async function GestionarProductosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: { in: ["ACTIVE", "GRACE_PERIOD"] } },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!artisan) redirect("/");

  const currentSub = artisan.subscriptions[0];
  const isGracePeriod = currentSub?.status === "GRACE_PERIOD";

  // Target plan limit
  const essentialPlan = await prisma.membershipPlan.findFirst({
    where: { name: "esencial" },
  });
  const maxProducts = isGracePeriod
    ? (essentialPlan?.maxProducts ?? 10)
    : (currentSub?.plan.maxProducts ?? 10);

  // All products that can be managed (APPROVED or PAUSED by downgrade)
  const products = await prisma.product.findMany({
    where: {
      artisanId: artisan.id,
      status: { in: ["APPROVED", "PAUSED"] },
    },
    include: {
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
    orderBy: [{ viewCount: "desc" }, { createdAt: "asc" }],
  });

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    status: p.status,
    viewCount: p.viewCount,
    imageUrl: p.images[0]?.url ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-2xl font-light">Gestionar Productos</h1>

      {isGracePeriod && currentSub?.graceEndsAt && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800">
            Tu plan ha finalizado. Tienes hasta el{" "}
            <strong>
              {new Intl.DateTimeFormat("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(currentSub.graceEndsAt)}
            </strong>{" "}
            para elegir qué {maxProducts} productos mantener activos.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Los demás quedarán pausados (no se eliminan) y podrás reactivarlos
            cuando actualices tu plan.
          </p>
        </div>
      )}

      <ProductSelectionClient
        products={serializedProducts}
        maxProducts={maxProducts}
        isGracePeriod={isGracePeriod}
      />
    </div>
  );
}
