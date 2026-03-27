import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { CuratorActions } from "./curator-actions";
import { CuratorPickButton } from "./curator-pick-button";

async function getCuratorPicksAdmin() {
  return prisma.product.findMany({
    where: { isCuratorPick: true },
    orderBy: { curatorPickAt: "desc" },
    include: {
      artisan: { select: { displayName: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

async function getApprovedProductsForCuration() {
  return prisma.product.findMany({
    where: { status: "APPROVED", isCuratorPick: false },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      artisan: { select: { displayName: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
    },
  });
}

export default async function CuraduriaPage() {
  const [picks, approvedProducts] = await Promise.all([
    getCuratorPicksAdmin(),
    getApprovedProductsForCuration(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Curaduría</h1>
      <p className="mt-2 text-sm text-text-secondary">
        {picks.length} {picks.length === 1 ? "producto seleccionado" : "productos seleccionados"}
      </p>

      {picks.length > 12 && (
        <div className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Recomendamos mantener 6–12 selecciones activas para que la curaduría se sienta exclusiva.
          Actualmente hay {picks.length}.
        </div>
      )}

      {/* Current curator picks */}
      {picks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Selecciones activas
          </h2>
          {picks.map((product) => (
            <Card key={product.id} className="flex gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                {product.images[0]?.url && !product.images[0].url.startsWith("r2://") ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlaceholder name={product.name} className="h-full w-full" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-base font-medium">{product.name}</h3>
                    <p className="text-xs text-text-secondary">
                      por {product.artisan.displayName} · {formatCLP(product.price)}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {product.curatorPickAt
                      ? new Date(product.curatorPickAt).toLocaleDateString("es-CL")
                      : "—"}
                  </span>
                </div>

                {product.curatorNote && (
                  <p className="text-sm italic text-text-secondary">
                    「{product.curatorNote}」
                  </p>
                )}

                <CuratorActions
                  productId={product.id}
                  curatorNote={product.curatorNote ?? ""}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Browse approved products to add */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
          Productos aprobados — marcar como selección
        </h2>

        {approvedProducts.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            No hay productos aprobados disponibles para curar.
          </p>
        ) : (
          <div className="space-y-3">
            {approvedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-md border border-border px-4 py-3"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                  {product.images[0]?.url && !product.images[0].url.startsWith("r2://") ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder name={product.name} className="h-full w-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-text-tertiary">
                    {product.artisan.displayName} · {formatCLP(product.price)}
                  </p>
                </div>
                <CuratorPickButton
                  productId={product.id}
                  isCuratorPick={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
