import { getPendingProducts, getAllProductsForAdmin } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { ProductModerationActions } from "./product-moderation-actions";
import { ExpandableProductRow } from "./expandable-product-row";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";


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
    { key: "moderation", label: "Moderacion", count: pendingProducts.length },
    { key: "manage", label: "Gestion de Productos" },
  ];

  const STATUS_TABS = [
    { key: "APPROVED", label: "Publicados" },
    { key: "PAUSED", label: "Pausados" },
    { key: "REJECTED", label: "Rechazados" },
    { key: "DRAFT", label: "Borradores" },
    { key: "PENDING_REVIEW", label: "Pendientes" },
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
              No hay productos pendientes de aprobacion
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
                    <DetailRow label="Categoria" value={(product as unknown as { categories?: { name: string }[] }).categories?.map((c) => c.name).join(", ") ?? "—"} />
                    <DetailRow
                      label="Tipo"
                      value={product.productionType === "UNIQUE" ? "Pieza unica" : product.productionType === "MADE_TO_ORDER" ? "Hecha por encargo" : "Produccion limitada"}
                    />
                    <DetailRow label="Tecnica" value={product.technique} />
                    <DetailRow label="Dimensiones" value={product.dimensions} />
                    <DetailRow label="Peso" value={product.weight ? `${product.weight}g` : null} />
                    <DetailRow label="Coleccion" value={(product as unknown as { collection?: { name: string } | null }).collection?.name} />
                    <DetailRow label="Tallas" value={product.tallas.length > 0 ? product.tallas.join(", ") : null} />
                    <DetailRow label="Guia de tallas" value={product.guiaTallas} />
                    <DetailRow label="Largo cadena" value={product.largoCadenaCm ? `${product.largoCadenaCm} cm` : null} />
                    <DetailRow label="Diametro" value={product.diametroMm ? `${product.diametroMm} mm` : null} />
                    <DetailRow label="Personalizable" value={product.personalizable ? "Si" : null} />
                    <DetailRow label="Detalle personalizacion" value={product.detallePersonalizacion} />
                    <DetailRow label="Tiempo elaboracion" value={product.tiempoElaboracionDias ? `${product.tiempoElaboracionDias} dias` : null} />
                    <DetailRow label="Stock" value={product.productionType === "UNIQUE" ? "Pieza unica" : product.productionType === "MADE_TO_ORDER" ? "Por encargo" : `${product.stock} unidades`} />
                  </div>

                  {product.materials.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-sm text-text-tertiary">Materiales</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.materials.map((m: { id: string; name: string }) => (
                          <MaterialBadge key={m.id} material={m.name} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-sm font-medium text-text-tertiary">Descripcion</p>
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
                          <p className="mb-1 text-sm font-medium text-text-tertiary">Garantia</p>
                          <p className="text-sm text-text-secondary">{product.garantia}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-sm font-medium text-text-tertiary">Imagenes ({product.images.length})</p>
                      {product.images.some((img: { status: string }) => img.status === "PENDING_REVIEW") && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          {product.images.filter((img: { status: string }) => img.status === "PENDING_REVIEW").length} por revisar
                        </span>
                      )}
                      {product.images.some((img: { status: string }) => img.status === "REJECTED") && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          {product.images.filter((img: { status: string }) => img.status === "REJECTED").length} rechazadas
                        </span>
                      )}
                    </div>
                    <ImageLightbox
                      productName={product.name}
                      images={product.images
                        .filter((img: { url: string }) => !img.url.startsWith("r2://"))
                        .map((img: { id: string; url: string; altText: string | null; status: string }) => ({ id: img.id, url: img.url, alt: img.altText ?? product.name, status: img.status }))}
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

      {/* ─── Management view (expandable list) ─── */}
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
              No hay productos en esta categoria
            </p>
          ) : (
            <>
              <p className="mt-4 text-xs text-text-tertiary">{allProducts.length} producto{allProducts.length !== 1 ? "s" : ""}</p>
              <div className="mt-2 space-y-2">
                {allProducts.map((product) => (
                  <ExpandableProductRow
                    key={product.id}
                    product={product as unknown as Parameters<typeof ExpandableProductRow>[0]["product"]}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
