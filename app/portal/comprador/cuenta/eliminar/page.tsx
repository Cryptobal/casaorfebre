import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteBuyerAccountForm } from "./delete-buyer-account-form";

export const metadata = {
  title: "Eliminar cuenta",
};

export default async function DeleteBuyerAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pendingOrders = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: { in: ["PENDING_PAYMENT", "PAID", "PARTIALLY_SHIPPED"] },
    },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-light text-text">
        Eliminar cuenta
      </h1>
      <p className="mt-4 font-light leading-relaxed text-text-secondary">
        Al eliminar tu cuenta, conforme a la Ley N° 21.719:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
        <li>Todos tus datos personales serán eliminados permanentemente.</li>
        <li>
          Tu historial de favoritos, listas de deseos y reseñas será eliminado.
        </li>
        <li>Los registros de compras se anonimizarán (obligación tributaria).</li>
        <li>Esta acción es irreversible.</li>
      </ul>

      {pendingOrders > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Tienes {pendingOrders} pedido{pendingOrders !== 1 ? "s" : ""} pendiente
            {pendingOrders !== 1 ? "s" : ""}. Debes esperar a que se completen
            antes de eliminar tu cuenta.
          </p>
        </div>
      )}

      <div className="mt-8">
        <DeleteBuyerAccountForm disabled={pendingOrders > 0} />
      </div>
    </div>
  );
}
