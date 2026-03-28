import { getPendingProducts, getAllProductsForAdmin } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { ProductModerationActions } from "./product-moderation-actions";
import { AdminProductActions } from "./admin-product-actions";
import Image from "next/image";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collar",
  ANILLO: "Anillo",
  PULSERA: "Pulsera",
  BROCHE: "Broche",
  COLGANTE: "Colgante",
  OTRO: "Otro",
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PAUSED: "bg-orange-100 text-orange-800",
  SOLD_OUT: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Publicado",
  REJECTED: "Rechazado",
  PAUSED: "Pausado",
  SOLD_OUT: "Agotado",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="text-sm">
      <span className="text-text-tertiary">{label}: </span>
      <span className="text-text">{value}</span>
    </div>
  );
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosAdminPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = (params.view as string) || "moderation";
  const statusFilter = (params.status as string) || "APPROVED";

  const [pendingProducts, allProducts] = await Promise.all([
    getPendingProducts(),
    view === "manage" ? getAllProductsForAdmin(statusFilter) : Promise.resolve([]),
  ]);

  const TAB_ITEMS = [
    { key: "moderation", label: "Moderación", count: pendingProducts.length },
    { key: "manage", label: "Gestión de Productos" },
  ];

  const STATUS_TABS = [
    { key: "APPROVED", label: "Publicados" },
    { key: "PAUSED", label: "Pausados" },
    { key: "REJECTED", label: "Rechazados" },
    { key: "DRAFT", label: "Borradores" },
    { key: "all", label: "Todos" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Productos</h1>

      {/* Main tabs */}
      <div className="mt-4 flex gap-1 border-b border-border">
        {TAB_ITEMS.map((tab) => (
          <Link
            key={tab.key}
            href={`/portal/admin/productos?view=${tab.key}`}
            className={`px-4 py-2 text-sm transition-colors ${
              view === tab.key
                ? "border-b-2 border-accent font-medium text-text"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                {tab.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ─── Moderation view (existing) ─── */}
      {view === "moderation" && (
        <>
          {pendingProducts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-text-tertiary">
              No hay productos pendientes de aprobación
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {pendingProducts.map((product) => (
                <Card key={product.id} className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-lg font-medium">{product.name}</h2>
                      <p className="text-sm text-text-secondary">por {product.artisan.displayName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">{formatCLP(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-sm text-text-tertiary line-through">{formatCLP(product.compareAtPrice)}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    <DetailRow label="Categoría" value={CATEGORY_LABELS[product.category] ?? product.category} />
                    <DetailRow
                      label="Tipo"
                      value={product.isUnique ? "Pieza única" : product.isCustomMade ? "Pieza personalizada" : "Producción"}
                    />
                    <DetailRow label="Técnica" value={product.technique} />
                    <DetailRow label="Dimensiones" value={product.dimensions} />
                    <DetailRow label="Peso" value={product.weight ? `${product.weight}g` : null} />
                    <DetailRow label="Colección" value={product.coleccion} />
                    <DetailRow label="Tallas" value={product.tallas.length > 0 ? product.tallas.join(", ") : null} />
                    <DetailRow label="Guía de tallas" value={product.guiaTallas} />
                    <DetailRow label="Largo cadena" value={product.largoCadenaCm ? `${product.largoCadenaCm} cm` : null} />
                    <DetailRow label="Diámetro" value={product.diametroMm ? `${product.diametroMm} mm` : null} />
                    <DetailRow label="Personalizable" value={product.personalizable ? "Sí" : null} />
                    <DetailRow label="Detalle personalización" value={product.detallePersonalizacion} />
                    <DetailRow label="Tiempo elaboración" value={product.tiempoElaboracionDias ? `${product.tiempoElaboracionDias} días` : null} />
                    <DetailRow label="Stock" value={product.isUnique ? "Pieza única" : `${product.stock} unidades`} />
                    {!product.isUnique && product.editionSize && (
                      <DetailRow label="Edición limitada" value={`${product.editionSize} piezas`} />
                    )}
                  </div>

                  {product.materials.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-sm text-text-tertiary">Materiales</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.materials.map((m) => (
                          <MaterialBadge key={m} material={m} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-sm font-medium text-text-tertiary">Descripción</p>
                    <p className="whitespace-pre-line text-sm text-text-secondary">{product.description}</p>
                  </div>

                  {product.story && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-text-tertiary">Historia</p>
                      <p className="whitespace-pre-line text-sm text-text-secondary">{product.story}</p>
                    </div>
                  )}

                  {(product.cuidados || product.empaque || product.garantia) && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {product.cuidados && (
                        <div>
                          <p className="mb-1 text-sm font-medium text-text-tertiary">Cuidados</p>
                          <p className="whitespace-pre-line text-sm text-text-secondary">{product.cuidados}</p>
                        </div>
                      )}
                      {product.empaque && (
                        <div>
                          <p className="mb-1 text-sm font-medium text-text-tertiary">Empaque</p>
                          <p className="text-sm text-text-secondary">{product.empaque}</p>
                        </div>
                      )}
                      {product.garantia && (
                        <div>
                          <p className="mb-1 text-sm font-medium text-text-tertiary">Garantía</p>
                          <p className="text-sm text-text-secondary">{product.garantia}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="mb-2 text-sm font-medium text-text-tertiary">Imágenes ({product.images.length})</p>
                    <ImageLightbox
                      productName={product.name}
                      images={product.images
                        .filter((img) => !img.url.startsWith("r2://"))
                        .map((img) => ({ id: img.id, url: img.url, alt: img.altText ?? product.name }))}
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <ProductModerationActions productId={product.id} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Management view (new) ─── */}
      {view === "manage" && (
        <>
          {/* Status sub-tabs */}
          <div className="mt-4 flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/portal/admin/productos?view=manage&status=${tab.key}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-accent/10 text-accent"
                    : "bg-background text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {allProducts.length === 0 ? (
            <p className="mt-8 text-center text-sm text-text-tertiary">
              No hay productos en esta categoría
            </p>
          ) : (
            <>
              <p className="mt-4 text-xs text-text-tertiary">{allProducts.length} producto{allProducts.length !== 1 ? "s" : ""}</p>
              <div className="mt-2 hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-widest text-text-tertiary">
                      <th className="pb-3 pr-3 font-medium">Imagen</th>
                      <th className="pb-3 pr-3 font-medium">Producto</th>
                      <th className="pb-3 pr-3 font-medium">Orfebre</th>
                      <th className="pb-3 pr-3 font-medium">Precio</th>
                      <th className="pb-3 pr-3 font-medium">Ventas</th>
                      <th className="pb-3 pr-3 font-medium">Estado</th>
                      <th className="pb-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allProducts.map((product) => {
                      const thumb = product.images[0];
                      return (
                        <tr key={product.id}>
                          <td className="py-3 pr-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border">
                              {thumb && !thumb.url.startsWith("r2://") ? (
                                <Image src={thumb.url} alt={product.name} fill className="object-cover" sizes="48px" />
                              ) : (
                                <ImagePlaceholder name={product.name} className="h-full w-full text-[8px]" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-3">
                            <Link href={`/coleccion/${product.slug}`} target="_blank" className="font-medium text-accent hover:underline">
                              {product.name}
                            </Link>
                          </td>
                          <td className="py-3 pr-3 text-text-secondary">{product.artisan.displayName}</td>
                          <td className="py-3 pr-3">{formatCLP(product.price)}</td>
                          <td className="py-3 pr-3">{product._count.orderItems}</td>
                          <td className="py-3 pr-3">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[product.status] ?? "bg-gray-100 text-gray-800"}`}>
                              {STATUS_LABELS[product.status] ?? product.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <AdminProductActions
                              productId={product.id}
                              status={product.status}
                              hasSales={product._count.orderItems > 0}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mt-4 space-y-3 md:hidden">
                {allProducts.map((product) => {
                  const thumb = product.images[0];
                  return (
                    <div key={product.id} className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border">
                          {thumb && !thumb.url.startsWith("r2://") ? (
                            <Image src={thumb.url} alt={product.name} fill className="object-cover" sizes="64px" />
                          ) : (
                            <ImagePlaceholder name={product.name} className="h-full w-full text-[8px]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-xs text-text-secondary">{product.artisan.displayName}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-medium">{formatCLP(product.price)}</span>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[product.status] ?? "bg-gray-100 text-gray-800"}`}>
                              {STATUS_LABELS[product.status] ?? product.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-border pt-3">
                        <AdminProductActions
                          productId={product.id}
                          status={product.status}
                          hasSales={product._count.orderItems > 0}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
