import { Suspense } from "react";
import { getApprovedProducts } from "@/lib/queries/products";
import { buildCollectionWithItemsJsonLd, generateFAQJsonLd, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ProductCard } from "@/components/products/product-card";
import { FadeIn } from "@/components/shared/fade-in";
import { CategoryFilters } from "./category-filters";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedLink {
  label: string;
  href: string;
}

interface CategoryLandingProps {
  categorySlug: string;
  breadcrumbLabel: string;
  basePath: string;
  h1: string;
  subtitle: string;
  seoContent: React.ReactNode;
  faqs: FAQ[];
  relatedCategories: RelatedLink[];
  relatedPosts: RelatedLink[];
  searchParams: Record<string, string | string[] | undefined>;
}

export async function CategoryLanding({
  categorySlug,
  breadcrumbLabel,
  basePath,
  h1,
  subtitle,
  seoContent,
  faqs,
  relatedCategories,
  relatedPosts,
  searchParams,
}: CategoryLandingProps) {
  const material =
    typeof searchParams.material === "string" ? searchParams.material : undefined;
  const sortParam =
    typeof searchParams.orden === "string" ? searchParams.orden : undefined;
  const sort =
    sortParam === "price_asc" || sortParam === "price_desc"
      ? sortParam
      : undefined;

  const priceParam =
    typeof searchParams.precio === "string" ? searchParams.precio : undefined;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceParam?.includes("-")) {
    const [lo, hi] = priceParam.split("-").map(Number);
    if (!Number.isNaN(lo) && lo > 0) minPrice = lo;
    if (!Number.isNaN(hi) && hi < 999999) maxPrice = hi;
  }

    const products = await getApprovedProducts({ categorySlug, material, minPrice, maxPrice, sort });

  const collectionJsonLd = buildCollectionWithItemsJsonLd({
    name: h1,
    description: subtitle,
    url: basePath,
    products,
  });
  const faqJsonLd = generateFAQJsonLd(faqs);

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Colección", href: "/coleccion" },
            { label: breadcrumbLabel },
          ]}
        />

        {/* Hero */}
        <div className="mb-10 max-w-3xl">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text sm:text-5xl">
            {h1}
          </h1>
          <div className="mt-2 h-px w-16 bg-accent" />
          <p className="mt-4 font-sans text-lg font-light leading-relaxed text-text-secondary">
            {subtitle}
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <CategoryFilters basePath={basePath} />
        </Suspense>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 60}>
                <ProductCard
                  product={product}
                  listName={breadcrumbLabel}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-sm text-text-secondary">
              Próximamente nuevas piezas en esta categoría.
            </p>
          </div>
        )}

        {/* SEO Content */}
        <div className="mx-auto mt-20 max-w-3xl">
          {seoContent}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
            Preguntas Frecuentes
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />
          <dl className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <dt className="font-sans text-base font-medium text-text">
                  {faq.question}
                </dt>
                <dd className="mt-2 font-sans text-sm leading-relaxed text-text-secondary">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Internal Links */}
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-serif text-2xl font-light text-text">
            Explora más
          </h2>
          <div className="mt-2 h-px w-12 bg-accent" />

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                Categorías relacionadas
              </h3>
              <ul className="mt-3 space-y-2">
                {relatedCategories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="font-sans text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  En nuestro blog
                </h3>
                <ul className="mt-3 space-y-2">
                  {relatedPosts.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-sans text-sm text-text-secondary transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
