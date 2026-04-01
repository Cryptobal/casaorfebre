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
import { ShareButtons } from "@/components/shared/share-buttons";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  const url = `${baseUrl}/coleccion/${slug}`;
  const imageUrl = product.images[0]?.url;
  const description = product.description.slice(0, 160);
  const title = `${product.name} por ${product.artisan.displayName} | Casa Orfebre`;
  const priceFormatted = new Intl.NumberFormat("es-CL").format(product.price);
  const ogImageUrl = `${baseUrl}/api/og/product?name=${encodeURIComponent(product.name)}&artisan=${encodeURIComponent(product.artisan.displayName)}&price=${encodeURIComponent(priceFormatted)}${imageUrl ? `&image=${encodeURIComponent(imageUrl)}` : ""}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website" as const,
      title,
      description,
      url,
      siteName: "Casa Orfebre",
      locale: "es_CL",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
        ...(imageUrl
          ? [
              {
                url: imageUrl,
                width: 1200,
                height: 1600,
                alt: product.images[0]?.altText ?? product.name,
              },
            ]
          : []),
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImageUrl],
      creator: "@casaorfebre",
      site: "@casaorfebre",
    },
    other: {
      "og:price:amount": product.price.toString(),
      "og:price:currency": "CLP",
      "product:price:amount": product.price.toString(),
      "product:price:currency": "CLP",
      "product:availability": product.stock > 0 ? "instock" : "oos",
      "product:condition": "new",
      "product:brand": "Casa Orfebre",
      "product:retailer_item_id": product.id,
      "pin:media": imageUrl ?? "",
      "pin:description": `${product.name} — ${product.description.slice(0, 200)} | Joyería artesanal chilena en Casa Orfebre`,
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

  // ── Build additionalProperty for JSON-LD ──
  const additionalProps: Record<string, unknown>[] = [];
  if (product.tallas?.length > 0) {
    additionalProps.push({ "@type": "PropertyValue", propertyID: "size", name: "Talla Europea (EU)", value: product.tallas.join(", ") });
  }
  if (product.tallaUnica) {
    additionalProps.push({ "@type": "PropertyValue", propertyID: "size", name: "Talla Europea (EU)", value: product.tallaUnica });
  }
  if (product.largoCadenaCm) {
    additionalProps.push({ "@type": "PropertyValue", name: "Largo de cadena", value: `${product.largoCadenaCm} cm`, unitCode: "CMT" });
  }
  if (product.pendantWidth && product.pendantHeight) {
    additionalProps.push({ "@type": "PropertyValue", name: "Dimensiones colgante", value: `${product.pendantWidth} × ${product.pendantHeight} mm` });
  }
  if (product.earringDrop) {
    additionalProps.push({ "@type": "PropertyValue", name: "Largo de caída", value: `${product.earringDrop} mm` });
  }
  if (product.stones?.length > 0) {
    product.stones.forEach((stone: any) => {
      additionalProps.push({
        "@type": "PropertyValue",
        name: "Piedra",
        value: [stone.quantity > 1 ? `${stone.quantity}×` : "", stone.stoneType, stone.stoneCarat ? `${stone.stoneCarat} ct` : "", stone.stoneOrigin === "natural" ? "natural" : ""].filter(Boolean).join(" "),
      });
    });
  }
  if (product.technique) {
    additionalProps.push({ "@type": "PropertyValue", name: "Técnica", value: product.technique });
  }

  const genderMap: Record<string, string> = { MUJER: "female", HOMBRE: "male", UNISEX: "unisex" };
  const gender = genderMap[product.audiencia] ?? undefined;

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
    ...(product.weight ? { weight: { "@type": "QuantitativeValue", value: product.weight, unitCode: "GRM" } } : {}),
    ...(gender ? { audience: { "@type": "PeopleAudience", suggestedGender: gender } } : {}),
    ...(product.stones?.[0]?.stoneColor ? { color: product.stones[0].stoneColor } : {}),
    ...(additionalProps.length > 0 ? { additionalProperty: additionalProps } : {}),
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
    isHandmade: true,
    countryOfOrigin: "Chile",
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
            <ImageGallery images={product.images} productName={product.name} productSlug={product.slug} video={product.video} />
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
              {product.audiencia && product.audiencia !== "SIN_ESPECIFICAR" && (
                <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
                  {product.audiencia === "MUJER" ? "Mujer" :
                   product.audiencia === "HOMBRE" ? "Hombre" :
                   product.audiencia === "UNISEX" ? "Unisex" :
                   product.audiencia === "NINOS" ? "Niños" : ""}
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

            {/* Favorite count social proof */}
            {product.favoriteCount > 0 && (
              <span className="text-xs text-text-tertiary">
                ❤️ {product.favoriteCount} {product.favoriteCount === 1 ? "persona guardó" : "personas guardaron"} esta pieza
              </span>
            )}

            {/* Specialty + technique badges */}
            {(product.specialties.length > 0 || product.technique) && (
              <div className="flex flex-wrap gap-1.5">
                {product.specialties.map((s: { id: string; name: string }) => (
                  <span key={s.id} className="inline-block rounded-full bg-accent/5 border border-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    {s.name}
                  </span>
                ))}
                {product.technique && (product.technique as string).split(/[,\n]/).map((t: string) => t.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).filter((t: string) => !product.specialties.some((s: { name: string }) => s.name.toLowerCase() === t.toLowerCase())).map((t: string) => (
                  <span key={t} className="inline-block rounded-full bg-accent/5 border border-accent/20 px-3 py-1 text-xs font-medium text-accent">
                    {t}
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

            {/* Dimensions */}
            {product.dimensions && (
              <p className="text-sm text-text-secondary">
                <span className="font-medium text-text">Dimensiones:</span>{" "}
                {product.dimensions}
              </p>
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

            {/* Share buttons */}
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-xs text-text-tertiary mb-2">Compartir esta pieza</p>
              <ShareButtons
                url={`https://casaorfebre.cl/coleccion/${product.slug}`}
                title={product.name}
                description={product.description.slice(0, 120)}
                imageUrl={product.images[0]?.url}
                type="product"
              />
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
              <div className="flex flex-wrap gap-2">
                {(product.cuidados as string).split("\n").map((l: string) => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).map((item: string) => (
                  <span key={item} className="inline-block rounded-full bg-background border border-border px-3 py-1.5 text-xs text-text-secondary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Empaque */}
          {product.empaque && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-3 font-serif text-lg">Empaque</h2>
              <div className="flex flex-wrap gap-2">
                {(product.empaque as string).split("\n").map((l: string) => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).map((item: string) => (
                  <span key={item} className="inline-block rounded-full bg-background border border-border px-3 py-1.5 text-xs text-text-secondary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Garantía */}
          {product.garantia && (
            <div className="rounded-lg border border-border p-6">
              <h2 className="mb-3 font-serif text-lg">Garant&iacute;a del orfebre</h2>
              <div className="flex flex-wrap gap-2">
                {(product.garantia as string).split("\n").map((l: string) => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean).map((item: string) => (
                  <span key={item} className="inline-block rounded-full bg-background border border-border px-3 py-1.5 text-xs text-text-secondary">
                    {item}
                  </span>
                ))}
              </div>
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

function ProductDetails({ product }: { product: Record<string, unknown> & { materials: { id: string; name: string }[]; tallas: string[]; categories: { name: string; slug: string }[]; collection: { name: string } | null; stones?: { id: string; stoneType: string; stoneCarat: number | null; stoneColor: string | null; stoneCut: string | null; stoneOrigin: string | null; stoneClarity: string | null; quantity: number }[] } }) {
  const rows: { label: string; value: string }[] = [];

  if (product.materials.length > 0)
    rows.push({ label: "Materiales", value: product.materials.map((m) => m.name).join(", ") });
  if (product.weight)
    rows.push({ label: "Peso", value: `${product.weight} g` });
  if (product.dimensions)
    rows.push({ label: "Dimensiones", value: product.dimensions as string });

  // Category-specific measurements
  if ((product.pendantWidth as number | null) && (product.pendantHeight as number | null))
    rows.push({ label: "Colgante", value: `${product.pendantWidth} × ${product.pendantHeight} mm` });
  if (product.earringWidth as number | null)
    rows.push({ label: "Ancho del aro", value: `${product.earringWidth} mm` });
  if (product.earringDrop as number | null)
    rows.push({ label: "Largo de caída", value: `${product.earringDrop} mm` });
  if ((product.broochWidth as number | null) && (product.broochHeight as number | null))
    rows.push({ label: "Dimensiones", value: `${product.broochWidth} × ${product.broochHeight} mm` });

  if (product.tallaUnica) {
    let tallaValue = `Europea (EU) ${product.tallaUnica}`;
    if (product.tallaAjusteAbajo || product.tallaAjusteArriba) {
      tallaValue += ` (ajustable: ${product.tallaAjusteAbajo ?? 0} abajo, ${product.tallaAjusteArriba ?? 0} arriba)`;
    }
    rows.push({ label: "Talla", value: tallaValue });
  } else if (product.tallas.length > 0) {
    rows.push({ label: "Tallas disponibles", value: `Europeas (EU): ${product.tallas.join(", ")}` });
  }
  if (product.guiaTallas)
    rows.push({ label: "Guía de tallas", value: product.guiaTallas as string });
  // Chain info for pendants
  const categorySlugs = product.categories.map((c) => c.slug);
  if (categorySlugs.includes("colgante")) {
    rows.push({ label: "Cadena", value: product.tieneCadena ? "Incluye cadena" : "Sin cadena (solo colgante)" });
  }
  if (product.largoCadenaCm)
    rows.push({ label: "Largo de cadena", value: `${product.largoCadenaCm} cm` });
  if (product.espesorCadenaMm)
    rows.push({ label: "Espesor de cadena", value: `${product.espesorCadenaMm} mm` });
  if (product.diametroMm)
    rows.push({ label: "Diámetro", value: `${product.diametroMm} mm` });
  if (product.collection)
    rows.push({ label: "Colección", value: product.collection.name });
  if (product.elaborationDays)
    rows.push({ label: "Tiempo de elaboración", value: `${product.elaborationDays} días` });
  if (product.personalizable)
    rows.push({ label: "Personalizable", value: (product.detallePersonalizacion as string) || "Sí" });
  if (product.cantidadEdicion)
    rows.push({ label: "Edición", value: `${product.stock} de ${product.cantidadEdicion}` });
  if (product.categories.length > 0) {
    rows.push({ label: "Categoría", value: product.categories.map((c) => c.name).join(", ") });
  }

  if (rows.length === 0 && (!product.stones || product.stones.length === 0)) return null;

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

      {/* Piedras */}
      {product.stones && product.stones.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
            Piedra{product.stones.length > 1 ? "s" : ""}
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {product.stones.map((stone) => (
                <tr key={stone.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-text">
                    {stone.quantity > 1 ? `${stone.quantity}× ` : ""}{stone.stoneType}
                  </td>
                  <td className="py-2 text-text-secondary">
                    {[
                      stone.stoneCarat ? `${stone.stoneCarat} ct` : null,
                      stone.stoneColor,
                      stone.stoneCut ? (stone.stoneCut === "cabujon" ? "Cabujón" : stone.stoneCut === "facetado" ? "Facetado" : stone.stoneCut === "briolette" ? "Briolette" : stone.stoneCut === "rosa" ? "Rosa" : stone.stoneCut === "bruta" ? "Bruta" : stone.stoneCut) : null,
                      stone.stoneOrigin === "natural" ? "Natural" : stone.stoneOrigin === "laboratorio" ? "Laboratorio" : stone.stoneOrigin === "sintetica" ? "Sintética" : null,
                    ].filter(Boolean).join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
