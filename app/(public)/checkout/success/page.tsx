import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const externalReference = params.external_reference as string | undefined;

  let orderNumber: string | null = null;
  if (externalReference) {
    const order = await prisma.order.findUnique({
      where: { id: externalReference },
      select: { orderNumber: true },
    });
    orderNumber = order?.orderNumber ?? null;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-serif text-text">
          ¡Gracias por tu compra!
        </h1>
        <p className="mb-1 text-text-secondary">
          Tu pedido está siendo procesado.
        </p>
        {orderNumber && (
          <p className="mb-6 text-sm text-text-secondary">
            Número de pedido: <span className="font-medium">{orderNumber}</span>
          </p>
        )}
        <Link
          href="/portal/comprador/pedidos"
          className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}
