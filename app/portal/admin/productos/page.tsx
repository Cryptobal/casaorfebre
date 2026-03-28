import { getPendingProducts } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { ProductModerationActions } from "./product-moderation-actions";

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collar",
  ANILLO: "Anillo",
  PULSERA: "Pulsera",
  BROCHE: "Broche",
  COLGANTE: "Colgante",
  OTRO: "Otro",
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

export default async function ProductosModeracionPage() {
  const products = await getPendingProducts();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">
        Moderacion de Productos
      </h1>

      {products.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">
          No hay productos pendientes de aprobacion
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {products.map((product) => (
            <Card key={product.id} className="space-y-5">
              {/* Header: name, artisan, price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-medium">
                    {product.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    por {product.artisan.displayName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">
                    {formatCLP(product.price)}
                  </p>
                  {product.compareAtPrice && (
                    <p className="text-sm text-text-tertiary line-through">
                      {formatCLP(product.compareAtPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <DetailRow
                  label="Categoria"
                  value={CATEGORY_LABELS[product.category] ?? product.category}
                />
                <DetailRow
                  label="Tipo"
                  value={
                    product.isUnique
                      ? "Pieza unica"
                      : product.isCustomMade
                        ? "Pieza personalizada"
                        : "Produccion"
                  }
                />
                <DetailRow label="Tecnica" value={product.technique} />
                <DetailRow label="Dimensiones" value={product.dimensions} />
                <DetailRow label="Peso" value={product.weight ? `${product.weight}g` : null} />
                <DetailRow label="Coleccion" value={product.coleccion} />
                <DetailRow
                  label="Tallas"
                  value={product.tallas.length > 0 ? product.tallas.join(", ") : null}
                />
                <DetailRow label="Guia de tallas" value={product.guiaTallas} />
                <DetailRow
                  label="Largo cadena"
                  value={product.largoCadenaCm ? `${product.largoCadenaCm} cm` : null}
                />
                <DetailRow
                  label="Diametro"
                  value={product.diametroMm ? `${product.diametroMm} mm` : null}
                />
                <DetailRow
                  label="Personalizable"
                  value={product.personalizable ? "Si" : null}
                />
                <DetailRow label="Detalle personalizacion" value={product.detallePersonalizacion} />
                <DetailRow
                  label="Tiempo elaboracion"
                  value={product.tiempoElaboracionDias ? `${product.tiempoElaboracionDias} dias` : null}
                />
                <DetailRow
                  label="Stock"
                  value={product.isUnique ? "Pieza unica" : `${product.stock} unidades`}
                />
                {!product.isUnique && product.editionSize && (
                  <DetailRow label="Edicion limitada" value={`${product.editionSize} piezas`} />
                )}
              </div>

              {/* Materials */}
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

              {/* Description */}
              <div>
                <p className="mb-1 text-sm font-medium text-text-tertiary">Descripcion</p>
                <p className="whitespace-pre-line text-sm text-text-secondary">
                  {product.description}
                </p>
              </div>

              {/* Story */}
              {product.story && (
                <div>
                  <p className="mb-1 text-sm font-medium text-text-tertiary">Historia</p>
                  <p className="whitespace-pre-line text-sm text-text-secondary">
                    {product.story}
                  </p>
                </div>
              )}

              {/* Care, packaging, warranty */}
              {(product.cuidados || product.empaque || product.garantia) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {product.cuidados && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-text-tertiary">Cuidados</p>
                      <p className="whitespace-pre-line text-sm text-text-secondary">
                        {product.cuidados}
                      </p>
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

              {/* Images */}
              <div>
                <p className="mb-2 text-sm font-medium text-text-tertiary">
                  Imagenes ({product.images.length})
                </p>
                <ImageLightbox
                  productName={product.name}
                  images={product.images
                    .filter((img) => !img.url.startsWith("r2://"))
                    .map((img) => ({
                      id: img.id,
                      url: img.url,
                      alt: img.altText ?? product.name,
                    }))}
                />
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-4">
                <ProductModerationActions productId={product.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
