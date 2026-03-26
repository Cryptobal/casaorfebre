import { getPendingProducts } from "@/lib/queries/admin";
import { formatCLP } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MaterialBadge } from "@/components/shared/material-badge";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { ProductModerationActions } from "./product-moderation-actions";

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
        <div className="mt-6 space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-lg font-medium">
                    {product.name}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    por {product.artisan.displayName}
                  </p>
                </div>
                <p className="text-lg font-medium">
                  {formatCLP(product.price)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-text-tertiary">Categoria: </span>
                  <span>{product.category}</span>
                </div>
                <div>
                  <span className="text-text-tertiary">Imagenes: </span>
                  <span>
                    {product.images.length > 0
                      ? `${product.images.length} imagenes`
                      : "Sin imagenes"}
                  </span>
                </div>
              </div>

              <p className="text-sm text-text-secondary">
                {product.description.length > 200
                  ? `${product.description.slice(0, 200)}...`
                  : product.description}
              </p>

              {product.materials.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.materials.map((m) => (
                    <MaterialBadge key={m} material={m} />
                  ))}
                </div>
              )}

              {/* Image thumbnails */}
              {product.images.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((img) =>
                    img.url.startsWith("r2://") ? (
                      <ImagePlaceholder
                        key={img.id}
                        name={product.name}
                        className="h-20 w-20 flex-shrink-0 rounded"
                      />
                    ) : (
                      <Image
                        key={img.id}
                        src={img.url}
                        alt={img.altText ?? product.name}
                        width={80}
                        height={80}
                        className="flex-shrink-0 rounded object-cover"
                      />
                    )
                  )}
                </div>
              ) : null}

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
