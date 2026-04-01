import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { incrementViewCount } from "@/lib/actions/blog";
import { FadeIn } from "@/components/shared/fade-in";
import { BlogImage } from "@/components/shared/blog-image";
import { ShareButtons } from "@/components/shared/share-buttons";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { RelatedProducts } from "@/components/blog/related-products";
import { slugify } from "@/lib/utils";
import type { Metadata } from "next";

export const revalidate = 300;

const categoryLabels: Record<string, string> = {
  GUIAS: "Guías",
  TENDENCIAS: "Tendencias",
  ORFEBRES: "Orfebres",
  CUIDADOS: "Cuidados",
  MATERIALES: "Materiales",
  CULTURA: "Cultura",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* Static params */
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

/* Metadata */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) return { title: "Artículo no encontrado" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: ["Casa Orfebre"],
      ...(post.coverImage ? { images: [{ url: post.coverImage.startsWith("http") ? post.coverImage : `${appUrl}${post.coverImage}` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      creator: "@casaorfebre",
      site: "@casaorfebre",
    },
  };
}

/* Page */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
  });
  if (!post) notFound();

  // Fire-and-forget view count increment
  incrementViewCount(post.id).catch(() => {});

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  // Content is admin-authored Markdown. renderMarkdown() strips script tags and event handlers.
  const contentHtml = renderMarkdown(post.content);

  // Related posts: same category, exclude current, max 3
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      category: post.category,
      id: { not: post.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Sidebar: posts sharing tags (different from category-based related)
  const allPublished = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", id: { not: post.id } },
    select: { slug: true, title: true, publishedAt: true, category: true, tags: true },
    orderBy: { publishedAt: "desc" },
  });
  const sidebarPosts = allPublished
    .filter((p) => p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);
  const allTags = Array.from(
    new Set(allPublished.flatMap((p) => p.tags).concat(post.tags)),
  ).sort();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    ...(post.coverImage ? { image: post.coverImage.startsWith("http") ? post.coverImage : `${appUrl}${post.coverImage}` } : {}),
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Casa Orfebre",
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Casa Orfebre",
      url: appUrl,
      logo: { "@type": "ImageObject", url: `${appUrl}/casaorfebre-logo-compact.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${appUrl}/blog/${post.slug}` },
  };

  // JSON-LD contains only controlled data — no user input
  const jsonLdHtml = JSON.stringify(jsonLdData);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml }}
      />

      {/* Hero Image */}
      <BlogImage
        src={post.coverImage}
        alt={post.title}
        className="w-full aspect-[21/9] object-cover"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-12">
      <article className="lg:col-span-8 pb-24">
        {/* Breadcrumb */}
        <nav className="pt-8 pb-6 text-sm font-light text-text-tertiary">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-secondary truncate max-w-[200px] sm:max-w-none">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <FadeIn>
          <header className="text-center pb-12 border-b border-border">
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {categoryLabels[post.category] || post.category}
            </span>

            <h1 className="mt-6 font-serif text-3xl font-light text-text sm:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-text-tertiary">
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {post.publishedAt && post.readingTime != null && post.readingTime > 0 && (
                <span aria-hidden="true">&middot;</span>
              )}
              {post.readingTime != null && post.readingTime > 0 && (
                <span>{post.readingTime} min lectura</span>
              )}
            </div>

            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${slugify(tag)}`}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-tertiary hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>
        </FadeIn>

        {/* Article Content — contentHtml is sanitized by renderMarkdown() which strips scripts/event handlers */}
        <FadeIn>
          <div
            className="prose-blog pt-8"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </FadeIn>

        {/* Share buttons */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-xs text-text-tertiary mb-3">Compartir este artículo</p>
          <ShareButtons
            url={`https://casaorfebre.cl/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt}
            imageUrl={post.coverImage?.startsWith("http") ? post.coverImage : undefined}
            type="product"
          />
        </div>

        {/* Related products from the collection */}
        <RelatedProducts tags={post.tags} maxProducts={4} />
      </article>

      {/* Sidebar */}
      <aside className="mt-12 lg:col-span-4 lg:mt-32">
        <div className="lg:sticky lg:top-24">
          <BlogSidebar relatedPosts={sidebarPosts} allTags={allTags} />
        </div>
      </aside>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-2xl font-light text-text mb-12">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <BlogImage
                    src={related.coverImage}
                    alt={related.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {categoryLabels[related.category] || related.category}
                    </span>
                    <h3 className="mt-3 font-serif text-lg font-light text-text group-hover:text-accent transition-colors">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="font-serif text-2xl font-light text-text sm:text-3xl">
              Explora nuestra colección
            </h2>
            <p className="mt-4 text-text-secondary font-light text-lg max-w-xl mx-auto">
              Piezas únicas de orfebres chilenos independientes, cada una con
              certificado de autenticidad.
            </p>
            <Link
              href="/coleccion"
              className="mt-8 inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Ver la colección
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
