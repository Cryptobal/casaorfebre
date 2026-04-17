const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

/* ─── Breadcrumb ─── */

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return buildBreadcrumbJsonLd(items);
}

/* ─── Product ─── */

interface ProductForJsonLd {
  id?: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  stock?: number;
  images?: { url: string }[];
  artisan?: { displayName: string; slug?: string };
  productionType?: string;
}

export function generateProductJsonLd(product: ProductForJsonLd) {
  const productUrl = `${BASE_URL}/coleccion/${product.slug}`;
  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [`${BASE_URL}/casaorfebre-og-image.png`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — joyería artesanal disponible en Casa Orfebre.`,
    image: images,
    url: productUrl,
    sku: product.slug,
    ...(product.id ? { mpn: product.id } : {}),
    brand: {
      "@type": "Brand",
      name: "Casa Orfebre",
    },
    ...(product.artisan
      ? {
          manufacturer: {
            "@type": "Person",
            name: product.artisan.displayName,
            ...(product.artisan.slug
              ? { url: `${BASE_URL}/orfebres/${product.artisan.slug}` }
              : {}),
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CLP",
      url: productUrl,
      availability:
        product.stock !== undefined && product.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Casa Orfebre",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "CLP" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "CL" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
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
  };
}

/* ─── FAQ ─── */

interface FAQ {
  question: string;
  answer: string;
}

export function generateFAQJsonLd(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/* ─── Shared merchant fields for Product offers ─── */

// TODO(Carlos): confirmar política de envío. Si NO es siempre gratis, actualizar este valor o dejar que Merchant Center sea fuente de verdad. Hardcodear shippingRate:0 cuando realmente se cobra envío causa "datos inconsistentes" en Google Merchant.
const MERCHANT_SHIPPING: Record<string, unknown> = {
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "CLP" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "CL" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
  },
};

const MERCHANT_RETURN_POLICY: Record<string, unknown> = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "CL",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

/* ─── ItemList ─── */

interface ProductItem {
  name: string;
  slug: string;
  description?: string | null;
  images?: { url: string }[];
  price?: number;
  artisan?: { displayName: string } | null;
}

function buildProductListItem(p: ProductItem) {
  return {
    "@type": "Product",
    name: p.name,
    description: p.description || `${p.name} — joyería artesanal disponible en Casa Orfebre.`,
    url: `${BASE_URL}/coleccion/${p.slug}`,
    sku: p.slug,
    image: p.images?.[0]?.url || `${BASE_URL}/casaorfebre-og-image.png`,
    brand: { "@type": "Brand", name: "Casa Orfebre" },
    ...(p.price
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "CLP",
            availability: "https://schema.org/InStock",
            shippingDetails: MERCHANT_SHIPPING,
            hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
          },
        }
      : {}),
  };
}

export function generateItemListJsonLd(products: ProductItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: buildProductListItem(p),
    })),
  };
}

/* ─── Organization ─── */

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${BASE_URL}/#organization`,
    name: "Casa Orfebre",
    alternateName: "Casa Orfebre · Joyería de Autor",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/casaorfebre-logo-compact.svg`,
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/casaorfebre-og-image.png`,
    description:
      "Marketplace curado de joyería artesanal chilena. Anillos, aros, cadenas, pulseras, colgantes y collares hechos a mano por orfebres verificados en plata 925, 950, oro 18k, cobre y bronce con certificado de autenticidad digital.",
    slogan: "Joyería de Autor",
    foundingDate: "2024",
    areaServed: {
      "@type": "Country",
      name: "Chile",
    },
    knowsAbout: [
      "joyería artesanal",
      "orfebrería",
      "plata 925",
      "plata 950",
      "oro 18k",
      "joyería de autor",
      "anillos artesanales",
      "piedras naturales chilenas",
      "lapislázuli",
      "filigrana",
    ],
    sameAs: [
      "https://www.instagram.com/casaorfebre.cl",
      "https://www.pinterest.com/casaorfebrecl/",
      "https://www.facebook.com/casaorfebre",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contacto@casaorfebre.cl",
      telephone: "+56968780089",
      availableLanguage: ["Spanish", "es-CL"],
      areaServed: "CL",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CL",
    },
  };
}

/* ─── LocalBusiness ─── */

export function generateLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: "Casa Orfebre",
    url: BASE_URL,
    logo: `${BASE_URL}/casaorfebre-logo-compact.svg`,
    image: `${BASE_URL}/casaorfebre-og-image.png`,
    description:
      "Joyería artesanal de plata hecha a mano por orfebres chilenos verificados. Plata 925 y 950 con certificado de autenticidad.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CL",
    },
    priceRange: "$$",
    currenciesAccepted: "CLP",
    paymentAccepted: "Tarjeta de crédito, Tarjeta de débito",
  };
}

export function generateDetailedLocalBusinessJsonLd(opts: {
  name: string;
  description: string;
  streetAddress: string;
  city: string;
  region: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: opts.name,
    description: opts.description,
    url: BASE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: opts.streetAddress,
      addressLocality: opts.city,
      addressRegion: opts.region,
      ...(opts.postalCode && { postalCode: opts.postalCode }),
      addressCountry: "CL",
    },
    ...(opts.lat !== undefined && opts.lng !== undefined && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: opts.lat,
        longitude: opts.lng,
      },
    }),
  };
}

/* ─── Collection page (existing, updated to return object) ─── */

export function buildCollectionWithItemsJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  products: ProductItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith("http") ? opts.url : `${BASE_URL}${opts.url}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.products.length,
      itemListElement: opts.products.slice(0, 30).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: buildProductListItem(p),
      })),
    },
  };
}

/* ─── Category helpers ─── */

const CATEGORY_LABELS: Record<string, string> = {
  AROS: "Aros",
  COLLAR: "Collares",
  ANILLO: "Anillos",
  PULSERA: "Pulseras",
  BROCHE: "Broches",
  COLGANTE: "Colgantes",
  CADENA: "Cadenas",
  OTRO: "Otros",
};

const CATEGORY_SLUGS: Record<string, string> = {
  AROS: "aros",
  COLLAR: "collares",
  ANILLO: "anillos",
  PULSERA: "pulseras",
  BROCHE: "coleccion",
  COLGANTE: "colgantes",
  CADENA: "cadenas",
  OTRO: "coleccion",
};

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export function getCategorySlug(category: string): string {
  return CATEGORY_SLUGS[category] || "coleccion";
}

export function canonicalUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/* ─── WebSite ─── */

export function generateWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Casa Orfebre",
    alternateName: "Casa Orfebre · Joyería de Autor",
    description:
      "Marketplace curado de joyería artesanal chilena hecha a mano por orfebres verificados.",
    inLanguage: "es-CL",
    publisher: { "@id": `${BASE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/coleccion?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/* ─── Article (para blog) ─── */

interface ArticleJsonLdOpts {
  title: string;
  description: string;
  slug: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author?: string;
  category?: string;
  tags?: string[];
  wordCount?: number;
}

export function generateArticleJsonLd(opts: ArticleJsonLdOpts) {
  const url = `${BASE_URL}/blog/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.title,
    description: opts.description,
    ...(opts.image ? { image: [opts.image.startsWith("http") ? opts.image : `${BASE_URL}${opts.image}`] } : {}),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    author: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: opts.author || "Casa Orfebre",
      url: BASE_URL,
    },
    publisher: { "@id": `${BASE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "es-CL",
    isAccessibleForFree: true,
    ...(opts.category ? { articleSection: opts.category } : {}),
    ...(opts.tags && opts.tags.length > 0 ? { keywords: opts.tags.join(", ") } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
  };
}

/* ─── HowTo (para guías) ─── */

interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export function generateHowToJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  image?: string;
  totalTime?: string;
  steps: HowToStep[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.totalTime ? { totalTime: opts.totalTime } : {}),
    inLanguage: "es-CL",
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
}

/* ─── Person (Jeweler) — para orfebres ─── */

interface JewelerPersonOpts {
  name: string;
  slug: string;
  bio?: string;
  image?: string;
  location?: string;
  region?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  foundingYear?: number | null;
}

export function generateJewelerPersonJsonLd(opts: JewelerPersonOpts) {
  const url = `${BASE_URL}/orfebres/${opts.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: opts.name,
    url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.bio ? { description: opts.bio } : {}),
    jobTitle: "Orfebre",
    worksFor: { "@id": `${BASE_URL}/#organization` },
    ...(opts.specialties && opts.specialties.length > 0
      ? { knowsAbout: opts.specialties }
      : {}),
    ...(opts.location
      ? {
          workLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: opts.location,
              ...(opts.region ? { addressRegion: opts.region } : {}),
              addressCountry: "CL",
            },
          },
        }
      : {}),
    ...(opts.rating && opts.reviewCount && opts.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: opts.rating,
            reviewCount: opts.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
