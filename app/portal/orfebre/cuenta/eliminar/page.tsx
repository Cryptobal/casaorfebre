import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata = {
  title: "Eliminar cuenta",
};

export default async function DeleteAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      _count: {
        select: {
          products: true,
          orderItems: { where: { fulfillmentStatus: "PENDING" } },
        },
      },
    },
  });

  if (!artisan) redirect("/portal");

  const hasPendingOrders = artisan._count.orderItems > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-2xl font-light text-text">
        Eliminar cuenta
      </h1>
      <p className="mt-4 font-light leading-relaxed text-text-secondary">
        Al eliminar tu cuenta de orfebre en Casa Orfebre, se procederá
        conforme a la Ley N° 21.719 de Protección de Datos Personales:
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
        <li>
          Todos tus datos personales, fotografías de productos y contenido de
          perfil serán eliminados de forma permanente.
        </li>
        <li>
          Tus imágenes serán removidas de todos nuestros sistemas de
          almacenamiento.
        </li>
        <li>
          Los registros de transacciones completadas se anonimizarán y
          conservarán exclusivamente por obligación tributaria (6 años).
        </li>
        <li>
          La licencia de uso de tus imágenes se extinguirá automáticamente.
        </li>
        <li>Esta acción es irreversible.</li>
      </ul>

      {hasPendingOrders && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Tienes pedidos pendientes de despacho. Debes completar o cancelar
            todos los pedidos antes de poder eliminar tu cuenta.
          </p>
        </div>
      )}

      <div className="mt-8">
        <DeleteAccountForm
          artisanName={artisan.displayName}
          productCount={artisan._count.products}
          disabled={hasPendingOrders}
        />
      </div>
    </div>
  );
}
