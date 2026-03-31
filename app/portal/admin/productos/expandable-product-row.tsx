"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";
import {
  approveProduct,
  rejectProduct,
  approvePhoto,
  rejectPhoto,
  adminSuspendProduct,
  adminReactivateProduct,
  adminDeleteProduct,
} from "@/lib/actions/admin";
import { ConfirmDestructiveModal } from "@/components/shared/confirm-destructive-modal";

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

const IMG_STATUS_STYLES: Record<string, string> = {
  PENDING_REVIEW: "bg-amber-500/90",
  APPROVED: "bg-green-500/90",
  REJECTED: "bg-red-500/90",
  REPLACED: "bg-gray-500/90",
};

const IMG_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  REPLACED: "Reemplazada",
};

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  status: string;
  rejectionReason: string | null;
}

interface ProductVideo {
  id: string;
  cloudflareStreamUid: string;
  status: string;
  muted: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  status: string;
  description: string;
  story: string | null;
  productionType: string;
  technique: string | null;
  dimensions: string | null;
  weight: number | null;
  stock: number;
  tallas: string[];
  largoCadenaCm: number | null;
  diametroMm: number | null;
  personalizable: boolean;
  cuidados: string | null;
  empaque: string | null;
  garantia: string | null;
  audiencia: string;
  pendantWidth: number | null;
  pendantHeight: number | null;
  earringWidth: number | null;
  earringDrop: number | null;
  broochWidth: number | null;
  broochHeight: number | null;
  artisan: { displayName: string; slug: string };
  categories: { name: string }[];
  materials: { id: string; name: string }[];
  collection: { name: string } | null;
  images: ProductImage[];
  video: ProductVideo | null;
  stones: { id: string; stoneType: string; stoneCarat: number | null; stoneColor: string | null; quantity: number }[];
  _count: { orderItems: number; images: number };
}

interface ExpandableProductRowProps {
  product: Product;
}

export function ExpandableProductRow({ product }: ExpandableProductRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectProduct, setShowRejectProduct] = useState(false);
  const [rejectingImageId, setRejectingImageId] = useState<string | null>(null);
  const [rejectImageReason, setRejectImageReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pendingImages = product.images.filter((img) => img.status === "PENDING_REVIEW");
  const thumbUrl = product.images[0]?.url;
  const showThumb = thumbUrl && !thumbUrl.startsWith("r2://");
  const cfCustomerCode = process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE;

  function doAction(action: () => Promise<{ error?: string; success?: boolean }>, successMsg: string) {
    setFeedback(null);
    startTransition(async () => {
      const r = await action();
      if (r.error) setFeedback({ type: "error", message: r.error });
      else setFeedback({ type: "success", message: successMsg });
      router.refresh();
    });
  }

  return (
    <>
      {/* ── Summary row (clickable) ── */}
      <div
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:bg-background/80"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Thumbnail */}
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border">
          {showThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background text-text-tertiary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text">{product.name}</p>
          <p className="text-xs text-text-secondary">{product.artisan.displayName}</p>
        </div>

        {/* Metadata badges */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs text-text-secondary">{formatCLP(product.price)}</span>
          <span className="text-xs text-text-tertiary">{product._count.images} foto{product._count.images !== 1 ? "s" : ""}</span>
          {product.video && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">Video</span>
          )}
          {pendingImages.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              {pendingImages.length} foto{pendingImages.length !== 1 ? "s" : ""} pendiente{pendingImages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Status */}
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[product.status] ?? "bg-gray-100 text-gray-800"}`}>
          {STATUS_LABELS[product.status] ?? product.status}
        </span>

        {/* Chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-text-tertiary transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Mobile meta (visible below summary on small screens) */}
      {!expanded && (
        <div className="flex items-center gap-2 px-3 pb-1 sm:hidden">
          <span className="text-[11px] text-text-tertiary">{formatCLP(product.price)}</span>
          <span className="text-[11px] text-text-tertiary">{product._count.images} fotos</span>
          {product.video && <span className="rounded bg-blue-100 px-1 py-0.5 text-[9px] font-medium text-blue-700">Video</span>}
          {pendingImages.length > 0 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
              {pendingImages.length} pendiente{pendingImages.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="rounded-b-lg border border-t-0 border-border bg-surface px-4 pb-4 pt-2">
          {/* Feedback */}
          {feedback && (
            <p className={`mb-3 text-xs ${feedback.type === "success" ? "text-green-700" : "text-red-700"}`}>
              {feedback.message}
            </p>
          )}

          {/* Product details grid */}
          <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
            <Detail label="Categoria" value={product.categories.map((c) => c.name).join(", ")} />
            <Detail label="Tipo" value={product.productionType === "UNIQUE" ? "Pieza unica" : product.productionType === "MADE_TO_ORDER" ? "Por encargo" : "Limitada"} />
            <Detail label="Tecnica" value={product.technique} />
            <Detail label="Stock" value={product.productionType === "UNIQUE" ? "1" : String(product.stock)} />
            <Detail label="Ventas" value={String(product._count.orderItems)} />
            {product.collection && <Detail label="Coleccion" value={product.collection.name} />}
            {product.tallas.length > 0 && <Detail label="Tallas" value={product.tallas.join(", ")} />}
            {product.largoCadenaCm && <Detail label="Largo cadena" value={`${product.largoCadenaCm} cm`} />}
            {product.diametroMm && <Detail label="Diametro" value={`${product.diametroMm} mm`} />}
            {product.dimensions && <Detail label="Dimensiones" value={product.dimensions} />}
            {product.weight && <Detail label="Peso" value={`${product.weight}g`} />}
            {product.audiencia !== "SIN_ESPECIFICAR" && (
              <Detail label="Publico" value={
                product.audiencia === "MUJER" ? "Mujer" :
                product.audiencia === "HOMBRE" ? "Hombre" :
                product.audiencia === "UNISEX" ? "Unisex" :
                product.audiencia === "NINOS" ? "Niños" : ""
              } />
            )}
            {product.pendantWidth && product.pendantHeight && <Detail label="Colgante" value={`${product.pendantWidth} × ${product.pendantHeight} mm`} />}
            {product.earringWidth && <Detail label="Ancho aro" value={`${product.earringWidth} mm`} />}
            {product.earringDrop && <Detail label="Caida" value={`${product.earringDrop} mm`} />}
            {product.broochWidth && product.broochHeight && <Detail label="Broche" value={`${product.broochWidth} × ${product.broochHeight} mm`} />}
            {product.stones?.length > 0 && (
              <Detail label="Piedras" value={
                product.stones.map((s) =>
                  `${s.quantity > 1 ? s.quantity + "× " : ""}${s.stoneType}${s.stoneCarat ? ` (${s.stoneCarat}ct)` : ""}`
                ).join(", ")
              } />
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Descripcion</p>
            <p className="line-clamp-3 text-xs text-text-secondary">{product.description}</p>
          </div>

          {/* ── Images section ── */}
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Imagenes ({product.images.length})
            </p>
            {product.images.length === 0 ? (
              <p className="text-xs text-red-600">Sin imagenes</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {product.images
                  .filter((img) => !img.url.startsWith("r2://"))
                  .map((img, i) => (
                    <div key={img.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-md border border-border"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        <span className={`absolute bottom-0 left-0 right-0 py-0.5 text-center text-[9px] font-medium text-white ${IMG_STATUS_STYLES[img.status] ?? "bg-gray-500/90"}`}>
                          {IMG_STATUS_LABELS[img.status] ?? img.status}
                        </span>
                      </button>

                      {/* Quick actions on each image */}
                      {img.status === "PENDING_REVIEW" && (
                        <div className="mt-1 flex gap-1">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => doAction(() => approvePhoto(img.id), "Foto aprobada")}
                            className="flex-1 rounded bg-green-600 px-1 py-1 text-[10px] font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => {
                              setRejectingImageId(img.id);
                              setRejectImageReason("");
                            }}
                            className="flex-1 rounded bg-red-600 px-1 py-1 text-[10px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                      {img.status === "REJECTED" && img.rejectionReason && (
                        <p className="mt-0.5 text-[9px] text-red-600 line-clamp-2">{img.rejectionReason}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {/* Reject image modal inline */}
            {rejectingImageId && (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3">
                <p className="mb-1 text-xs font-medium text-red-800">Razon de rechazo de foto</p>
                <textarea
                  className="w-full rounded border border-red-200 bg-white px-2 py-1 text-xs text-text placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-red-300"
                  rows={2}
                  placeholder="Motivo (opcional)"
                  value={rejectImageReason}
                  onChange={(e) => setRejectImageReason(e.target.value)}
                />
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const fd = new FormData();
                      fd.set("reason", rejectImageReason);
                      doAction(() => rejectPhoto(rejectingImageId, fd), "Foto rechazada");
                      setRejectingImageId(null);
                    }}
                    className="rounded bg-red-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirmar rechazo
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingImageId(null)}
                    className="rounded border border-border px-3 py-1 text-[11px] text-text-secondary hover:bg-background"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Video section ── */}
          {product.video && cfCustomerCode && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Video</p>
              <div className="aspect-video max-w-sm overflow-hidden rounded-md border border-border">
                <iframe
                  src={`https://${cfCustomerCode}/${product.video.cloudflareStreamUid}/iframe?autoplay=false&muted=true&controls=true`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
              <p className="mt-1 text-[10px] text-text-tertiary">
                Estado: {product.video.status === "READY" ? "Listo" : product.video.status}
                {product.video.muted && " (silenciado)"}
              </p>
            </div>
          )}

          {/* ── Product actions ── */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            {product.status === "PENDING_REVIEW" && (
              <>
                <Button
                  size="sm"
                  className="bg-green-700 text-white hover:bg-green-800"
                  disabled={pending}
                  onClick={() => doAction(() => approveProduct(product.id), "Producto aprobado")}
                >
                  Aprobar producto
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowRejectProduct(!showRejectProduct)}
                  disabled={pending}
                >
                  Rechazar
                </Button>
              </>
            )}

            {product.status === "APPROVED" && (
              <Button
                size="sm"
                variant="secondary"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                disabled={pending}
                onClick={() => doAction(() => adminSuspendProduct(product.id), "Producto pausado")}
              >
                Pausar
              </Button>
            )}

            {product.status === "PAUSED" && (
              <Button
                size="sm"
                variant="secondary"
                className="border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                disabled={pending}
                onClick={() => doAction(() => adminReactivateProduct(product.id), "Producto reactivado")}
              >
                Reactivar
              </Button>
            )}

            <Button
              size="sm"
              variant="secondary"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
              disabled={pending}
            >
              Eliminar
            </Button>

            <a
              href={`/coleccion/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Ver en tienda
            </a>
          </div>

          {/* Reject product form */}
          {showRejectProduct && (
            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
                rows={3}
                placeholder="Notas de rechazo (opcional)"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
              <Button
                size="sm"
                variant="secondary"
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={pending}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("notes", rejectNotes);
                  doAction(() => rejectProduct(product.id, fd), "Producto rechazado");
                  setShowRejectProduct(false);
                }}
              >
                Confirmar rechazo
              </Button>
            </div>
          )}

          <ConfirmDestructiveModal
            open={deleteOpen}
            title="Eliminar producto"
            description={
              product._count.orderItems > 0
                ? "Este producto tiene ventas registradas. No se puede eliminar."
                : "Se eliminara permanentemente este producto y todas sus imagenes."
            }
            confirmLabel={product._count.orderItems > 0 ? "Entendido" : "Eliminar"}
            onCancel={() => setDeleteOpen(false)}
            onConfirm={product._count.orderItems > 0 ? () => setDeleteOpen(false) : () => {
              doAction(() => adminDeleteProduct(product.id), "Producto eliminado");
              setDeleteOpen(false);
            }}
            pending={pending}
          />
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (() => {
        const visibleImages = product.images.filter((img) => !img.url.startsWith("r2://"));
        const img = visibleImages[lightboxIndex];
        if (!img) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {visibleImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)); }}
                  disabled={lightboxIndex === 0}
                  className="absolute left-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i !== null && i < visibleImages.length - 1 ? i + 1 : i)); }}
                  disabled={lightboxIndex === visibleImages.length - 1}
                  className="absolute right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 disabled:opacity-30"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </>
            )}

            <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.altText ?? product.name}
                className="max-h-[80vh] w-auto rounded-lg object-contain"
              />
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-sm text-white/70">{lightboxIndex + 1} / {visibleImages.length}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium text-white ${IMG_STATUS_STYLES[img.status] ?? "bg-gray-500/90"}`}>
                  {IMG_STATUS_LABELS[img.status] ?? img.status}
                </span>
              </div>
              {/* Lightbox approve/reject buttons */}
              {img.status === "PENDING_REVIEW" && (
                <div className="mt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={(e) => {
                      e.stopPropagation();
                      doAction(() => approvePhoto(img.id), "Foto aprobada");
                      // Move to next image or close
                      if (lightboxIndex < visibleImages.length - 1) setLightboxIndex(lightboxIndex + 1);
                      else setLightboxIndex(null);
                    }}
                    className="rounded bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprobar foto
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRejectingImageId(img.id);
                      setLightboxIndex(null);
                    }}
                    className="rounded bg-red-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Rechazar foto
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-text-tertiary">{label}: </span>
      <span className="text-text">{value}</span>
    </div>
  );
}
