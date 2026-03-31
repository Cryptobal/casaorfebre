export const revalidate = 300;

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductBySlug, getSimilarProducts } from "@/lib/queries/products";
import { ProductCard } from "@/components/products/product-card";
import { canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ImageGallery } from "./image-gallery";
import { PriceDisplay } from "@/components/shared/price-display";
import { MaterialBadge } from "@/components/shared/material-badge";
import { AddToCart } from "./add-to-cart";
import { ReviewList } from "@/components/reviews/review-list";
import { ViewTracker } from "./view-tracker";
import { MessageArtisanButton } from "./message-artisan-button";
import { ProductQuestions } from "./product-questions";
import { SizeGuide } from "@/components/products/size-guide";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  const desc = product.description.slice(0, 155);
  const images = product.images?.[0]?.url ? [{ url: product.images[0].url }] : undefined;
  return {
    title: `${product.name} · Plata Artesanal`,
    description: desc,
    alternates: { canonical: `/coleccion/${slug}` },
    openGraph: {
      title: `${product.name} · Plata Artesanal | Casa Orfebre`,
      description: desc,
      images,
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${product.name} · Plata Artesanal | Casa Orfebre`,
      description: desc,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const similarProducts = await getSimilarProducts({
    id: product.id,
    categorySlugs: product.categories.map((c: { slug: string }) => c.slug),
    materials: product.materials as { id: string; name: string }[],
    price: product.price,
    artisanId: product.artisanId,
  });

  const artisan = product.artisan;
  const initials = artisan.displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [reviewAgg, reviewList, questions] = await Promise.all([
    prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } } },
    }),
    prisma.productQuestion.findMany({
      where: { productId: product.id, isPublic: true, isBlocked: false },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        artisan: { select: { displayName: true } },
      },
    }),
  ]);

  const primaryCategory = product.categories[0];
  const categoryLabel = primaryCategory?.name ?? "Otro";
  const categorySlug = primaryCategory?.slug ?? "coleccion";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const productImages = product.images.map((img: any) => img.url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImages.length > 0 ? productImages : [`${baseUrl}/casaorfebre-og-image.png`],
    category: product.categories.map((c: { name: string }) => c.name).join(", ") || "Otro",
    ...(product.materials.length > 0
      ? { material: product.materials.map((m: { name: string }) => m.name).join(", ") }
      : {}),
    brand: {
      "@type": "Brand",
      name: "Casa Orfebre",
    },
    manufacturer: {
      "@type": "Person",
      name: artisan.displayName,
      url: `${baseUrl}/orfebres/${artisan.slug}`,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CLP",
      url: canonicalUrl(`/coleccion/${slug}`),
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Casa Orfebre",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "CLP",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CL",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CL",
        returnPolicyCategory: product.productionType === "MADE_TO_ORDER"
          ? "https://schema.org/MerchantReturnNotPermitted"
          : "https://schema.org/MerchantReturnFiniteReturnWindow",
        ...(product.productionType !== "MADE_TO_ORDER" && {
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        }),
      },
    },
    ...(reviewAgg._count > 0 && reviewAgg._avg.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewAgg._avg.rating,
            reviewCount: reviewAgg._count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviewList.length > 0
      ? {
          review: reviewList.map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: {
              "@type": "Person",
              name: r.user.name || "Cliente verificado",
            },
            datePublished: r.createdAt.toISOString().split("T")[0],
            reviewBody: r.comment,
          })),
        }
      : {}),
  };

  return (
    <>
      <ViewTracker
        slug={slug}
        ga4Item={{
          item_id: product.id,
          item_name: product.name,
          item_category: categoryLabel,
          item_brand: artisan.displayName,
          price: product.price,
          quantity: 1,
        }}
      />
      <JsonLd data={jsonLd} />

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Colección", href: "/coleccion" },
            { label: categoryLabel, href: `/coleccion/${categorySlug}` },
            { label: product.name },
          ]}
        />
        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
          {/* Left column — gallery */}
          <div className="lg:col-span-3">
            <ImageGallery images={product.images} productName={product.name} video={product.video} />
          </div>

          {/* Right column — info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Type badges */}
            <div className="flex flex-wrap gap-2">
              {product.productionType === "UNIQUE" && (
                <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                  Pieza &Uacute;nica
                </span>
              )}
              {product.productionType === "MADE_TO_ORDER" && (
                <span className="inline-block rounded-full border border-accent px-3 py-1 text-xs font-medium text-accent">
                  Hecha por Encargo{product.elaborationDays ? ` · ${product.elaborationDays} días` : ""}
                </span>
              )}
              {product.productionType === "LIMITED" && product.stock > 0 && product.stock < 10 && (
                <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                  Quedan {product.stock} unidades
                </span>
              )}
              {product.isCustomizable && (
                <span className="inline-block rounded-full border border-accent/40 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Personalizable
                </span>
              )}
            </div>

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

            {/* Specialty badges */}
            {product.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.specialties.map((s: { id: string; name: string }) => (
                  <span key={s.id} className="inline-block rounded-full bg-accent/5 border border-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    {s.name}
                  </span>
                ))}
              </div>
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
                {product.materials.map((m: { id: string; name: string }) => (
                  <MaterialBadge key={m.id} material={m.name} />
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

            {/* Size guide */}
            <SizeGuide
              categorySlugs={product.categories.map((c: { slug: string }) => c.slug)}
              tallas={product.tallas}
              tallaUnica={product.tallaUnica}
              tallaAjusteArriba={product.tallaAjusteArriba}
              tallaAjusteAbajo={product.tallaAjusteAbajo}
              guiaTallas={product.guiaTallas}
              largoCadenaCm={product.largoCadenaCm}
              diametroMm={product.diametroMm}
            />

            {/* Description */}
            <p className="font-light leading-relaxed text-text-secondary">
              {product.description}
            </p>

            {/* Stock */}
            {product.productionType === "LIMITED" && product.stock > 0 && (
              <p className="text-sm text-text-secondary">
                Stock: {product.stock} disponibles
              </p>
            )}
            {product.productionType === "MADE_TO_ORDER" && (
              <p className="text-sm text-amber-700">
                Sin devolución · Se fabrica tras la compra
              </p>
            )}

            {/* Add to cart button */}
            <AddToCart
              productId={product.id}
              price={product.price}
              productionType={product.productionType}
              stock={product.stock}
              ga4Item={{
                item_id: product.id,
                item_name: product.name,
                item_category: categoryLabel,
                item_brand: artisan.displayName,
                price: product.price,
              }}
            />

            {/* Trust icons */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {product.productionType === "MADE_TO_ORDER" ? (
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
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-border bg-accent/10">
                {artisan.profileImage ? (
                  <Image
                    src={artisan.profileImage}
                    alt={artisan.displayName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-serif text-lg font-medium text-accent">
                    {initials}
                  </span>
                )}
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
            <MessageArtisanButton artisanId={artisan.id} productId={product.id} />
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

          {/* Detalles y medidas */}
          <ProductDetails product={product} />

          {/* Cuidados */}
          {product.cuidados && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-3 font-serif text-lg">Cuidados</h2>
              <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-line">{product.cuidados}</p>
            </div>
          )}

          {/* Q&A */}
          <ProductQuestions
            productId={product.id}
            artisanId={artisan.id}
            questions={questions}
          />

          {/* Reviews */}
          <ReviewList productId={product.id} />

          {/* Similar products */}
          {similarProducts.length > 0 && (
            <div>
              <h2 className="mb-6 font-serif text-xl">También te puede gustar</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {similarProducts.slice(0, 12).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
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

/* ─── Product Details & Measurements ─── */

function ProductDetails({ product }: { product: Record<string, unknown> & { materials: { id: string; name: string }[]; tallas: string[]; categories: { name: string }[]; collection: { name: string } | null } }) {
  const rows: { label: string; value: string }[] = [];

  if (product.materials.length > 0)
    rows.push({ label: "Materiales", value: product.materials.map((m) => m.name).join(", ") });
  if (product.technique)
    rows.push({ label: "Técnica", value: product.technique as string });
  if (product.weight)
    rows.push({ label: "Peso", value: `${product.weight} g` });
  if (product.dimensions)
    rows.push({ label: "Dimensiones", value: product.dimensions as string });
  if (product.tallaUnica) {
    let tallaValue = `Talla ${product.tallaUnica}`;
    if (product.tallaAjusteAbajo || product.tallaAjusteArriba) {
      tallaValue += ` (ajustable: ${product.tallaAjusteAbajo ?? 0} abajo, ${product.tallaAjusteArriba ?? 0} arriba)`;
    }
    rows.push({ label: "Talla", value: tallaValue });
  } else if (product.tallas.length > 0) {
    rows.push({ label: "Tallas disponibles", value: product.tallas.join(", ") });
  }
  if (product.guiaTallas)
    rows.push({ label: "Guía de tallas", value: product.guiaTallas as string });
  if (product.largoCadenaCm)
    rows.push({ label: "Largo de cadena", value: `${product.largoCadenaCm} cm` });
  if (product.diametroMm)
    rows.push({ label: "Diámetro", value: `${product.diametroMm} mm` });
  if (product.collection)
    rows.push({ label: "Colección", value: product.collection.name });
  if (product.elaborationDays)
    rows.push({ label: "Tiempo de elaboración", value: `${product.elaborationDays} días` });
  if (product.empaque)
    rows.push({ label: "Empaque", value: product.empaque as string });
  if (product.garantia)
    rows.push({ label: "Garantía", value: product.garantia as string });
  if (product.personalizable)
    rows.push({ label: "Personalizable", value: (product.detallePersonalizacion as string) || "Sí" });
  if (product.cantidadEdicion)
    rows.push({ label: "Edición", value: `${product.stock} de ${product.cantidadEdicion}` });
  if (product.categories.length > 0) {
    rows.push({ label: "Categoría", value: product.categories.map((c) => c.name).join(", ") });
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-border p-6">
      <h2 className="mb-4 font-serif text-lg">Detalles y Medidas</h2>
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/50 last:border-0">
              <td className="py-2.5 pr-4 font-medium text-text">{row.label}</td>
              <td className="py-2.5 text-text-secondary whitespace-pre-line">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
