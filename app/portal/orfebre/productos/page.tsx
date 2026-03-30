import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { togglePauseProduct } from "@/lib/actions/products";
import { DeleteProductButton } from "./delete-product-button";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "En revision",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  PAUSED: "Pausado",
  SOLD_OUT: "Agotado",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PAUSED: "bg-blue-100 text-blue-700",
  SOLD_OUT: "bg-zinc-200 text-zinc-500",
};

export default async function ProductosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const products = await prisma.product.findMany({
    where: { artisanId: artisan.id },
    include: {
      categories: { select: { name: true } },
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      _count: { select: { images: true, orderItems: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-text">
          Mis Piezas
        </h1>
        <Link href="/portal/orfebre/productos/nuevo">
          <Button>Crear nueva pieza</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-text-secondary">
            Aun no tienes piezas publicadas.
          </p>
          <p className="mt-1 text-sm text-text-tertiary">
            Crea tu primera pieza para comenzar a vender.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Pieza</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Categoria</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Precio</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Estado</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Stock</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => {
                  const thumbnail = product.images[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-background/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border bg-background">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-text">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {product.categories.map((c) => c.name).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-text">{formatCLP(product.price)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? "bg-zinc-100 text-zinc-700"}`}
                        >
                          {STATUS_LABELS[product.status] ?? product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/portal/orfebre/productos/${product.id}`}
                            className="text-accent hover:underline"
                          >
                            Editar
                          </Link>
                          {(product.status === "APPROVED" || product.status === "PAUSED") && (
                            <form action={async () => {
                              "use server";
                              await togglePauseProduct(product.id);
                            }}>
                              <button
                                type="submit"
                                className="text-xs text-text-secondary hover:text-text"
                              >
                                {product.status === "APPROVED" ? "Pausar" : "Reanudar"}
                              </button>
                            </form>
                          )}
                          {product.status === "REJECTED" && (
                            <Link
                              href={`/portal/orfebre/productos/${product.id}`}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Ver razon
                            </Link>
                          )}
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                            hasSales={product._count.orderItems > 0}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((product) => {
              const thumbnail = product.images[0]?.url;
              return (
                <div key={product.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-border bg-background">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text">{product.name}</p>
                      <p className="text-sm text-text-secondary">{formatCLP(product.price)}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? "bg-zinc-100 text-zinc-700"}`}
                    >
                      {STATUS_LABELS[product.status] ?? product.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-text-tertiary">Stock: {product.stock}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/portal/orfebre/productos/${product.id}`}
                        className="min-h-[44px] inline-flex items-center text-accent hover:underline"
                      >
                        Editar
                      </Link>
                      {(product.status === "APPROVED" || product.status === "PAUSED") && (
                        <form action={async () => {
                          "use server";
                          await togglePauseProduct(product.id);
                        }}>
                          <button
                            type="submit"
                            className="min-h-[44px] text-xs text-text-secondary hover:text-text"
                          >
                            {product.status === "APPROVED" ? "Pausar" : "Reanudar"}
                          </button>
                        </form>
                      )}
                      {product.status === "REJECTED" && (
                        <Link
                          href={`/portal/orfebre/productos/${product.id}`}
                          className="min-h-[44px] inline-flex items-center text-xs text-red-600 hover:underline"
                        >
                          Ver razon
                        </Link>
                      )}
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                        hasSales={product._count.orderItems > 0}
                        className="min-h-[44px] inline-flex items-center"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
