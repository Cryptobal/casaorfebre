export const revalidate = 300;

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/queries/products";
import { ImageGallery } from "./image-gallery";
import { PriceDisplay } from "@/components/shared/price-display";
import { MaterialBadge } from "@/components/shared/material-badge";
import { AddToCart } from "./add-to-cart";
import { ReviewList } from "@/components/reviews/review-list";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Casa Orfebre`,
      description: product.description.slice(0, 160),
      images: product.images?.[0]?.url ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const artisan = product.artisan;
  const initials = artisan.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img: any) => img.url),
    brand: {
      "@type": "Brand",
      name: "Casa Orfebre",
    },
    manufacturer: {
      "@type": "Person",
      name: artisan.displayName,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CLP",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Casa Orfebre",
      },
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left column — gallery */}
          <div className="lg:col-span-3">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right column — info */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            {/* Type badge */}
            {product.isCustomMade && (
              <span className="inline-block rounded-full border border-accent px-3 py-1 text-xs font-medium text-accent">
                Pieza Personalizada &middot; Sin devoluci&oacute;n
              </span>
            )}
            {!product.isCustomMade && product.isUnique && (
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                Pieza &Uacute;nica
              </span>
            )}
            {!product.isCustomMade && !product.isUnique && product.editionSize && (
              <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                Edici&oacute;n Limitada
              </span>
            )}

            {/* Product name */}
            <h1 className="font-serif text-2xl font-light sm:text-3xl">
              {product.name}
            </h1>

            {/* Artisan link */}
            <p className="text-sm text-text-secondary">
              por{" "}
              <Link
                href={`/orfebres/${artisan.slug}`}
                className="text-accent hover:underline"
              >
                {artisan.displayName}
              </Link>
            </p>

            {/* Specialty badge */}
            {product.specialty && (
              <span className="inline-block rounded-full bg-accent/5 border border-accent/20 px-3 py-1 text-xs font-medium text-accent">
                {product.specialty.name}
              </span>
            )}

            {/* Occasion badges */}
            {product.occasions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-text-tertiary">Ideal para:</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.occasions.map((o: { id: string; name: string }) => (
                    <span key={o.id} className="inline-block rounded-full bg-background border border-border px-2.5 py-0.5 text-xs text-text-secondary">
                      {o.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              className="text-xl"
            />

            {/* Materials */}
            {product.materials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.materials.map((m: string) => (
                  <MaterialBadge key={m} material={m} />
                ))}
              </div>
            )}

            {/* Technique & dimensions */}
            {(product.technique || product.dimensions) && (
              <div className="space-y-1 text-sm text-text-secondary">
                {product.technique && (
                  <p>
                    <span className="font-medium text-text">T&eacute;cnica:</span>{" "}
                    {product.technique}
                  </p>
                )}
                {product.dimensions && (
                  <p>
                    <span className="font-medium text-text">Dimensiones:</span>{" "}
                    {product.dimensions}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <p className="font-light leading-relaxed text-text-secondary">
              {product.description}
            </p>

            {/* Stock */}
            {!product.isUnique && product.stock > 0 && (
              <p className="text-sm text-text-secondary">
                Stock: {product.stock} disponibles
              </p>
            )}

            {/* Add to cart button */}
            <AddToCart
              productId={product.id}
              price={product.price}
              isUnique={product.isUnique}
              stock={product.stock}
            />

            {/* Trust icons */}
            <div className="flex items-center justify-between gap-4">
              {product.isCustomMade ? (
                <TrustItem icon={<NoReturnIcon />} text="Sin devoluci&oacute;n" />
              ) : (
                <Link href="/garantia" className="hover:opacity-80 transition-opacity">
                  <TrustItem icon={<ShieldIcon />} text="Garant&iacute;a 14 d&iacute;as" />
                </Link>
              )}
              <TrustItem icon={<CertificateIcon />} text="Certificado Digital" />
              <TrustItem icon={<TruckIcon />} text="Env&iacute;o 3-7 d&iacute;as" />
            </div>
          </div>
        </div>

        {/* Below columns */}
        <div className="mt-16 space-y-12">
          {/* Artisan mini-card */}
          <div className="rounded-lg border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 font-serif text-lg font-medium text-accent">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg">{artisan.displayName}</p>
                {artisan.location && (
                  <p className="text-sm text-text-secondary">{artisan.location}</p>
                )}
                {artisan.specialty && (
                  <p className="text-sm text-text-tertiary">{artisan.specialty}</p>
                )}
              </div>
              <Link
                href={`/orfebres/${artisan.slug}`}
                className="flex-shrink-0 text-sm text-accent hover:underline"
              >
                Ver perfil completo &rarr;
              </Link>
            </div>
          </div>

          {/* Story */}
          {product.story && (
            <div className="rounded-lg bg-background p-6">
              <h3 className="mb-3 font-serif text-sm uppercase tracking-widest text-text-tertiary">La Historia de esta Pieza</h3>
              <p className="font-serif text-lg font-light italic leading-relaxed text-text-secondary">
                {product.story}
              </p>
            </div>
          )}

          {/* Q&A placeholder */}
          <div className="rounded-lg border border-border p-6">
            <h2 className="mb-2 font-serif text-lg">Preguntas y Respuestas</h2>
            <p className="text-sm text-text-tertiary">
              Las preguntas estar&aacute;n disponibles pr&oacute;ximamente
            </p>
          </div>

          {/* Reviews */}
          <ReviewList productId={product.id} />
        </div>
      </div>
    </>
  );
}

/* ─── Trust row helpers ─── */

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-text-tertiary">{icon}</span>
      <span className="text-xs text-text-tertiary">{text}</span>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function NoReturnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2" />
      <path d="M3 7h18" />
      <path d="M7 21l5-3 5 3v-5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
