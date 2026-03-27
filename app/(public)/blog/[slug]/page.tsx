import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { FadeIn } from "@/components/shared/fade-in";
import type { Metadata } from "next";

/* ─── Content modules map ─── */
const contentModules: Record<
  string,
  () => Promise<{ PostContent: React.ComponentType }>
> = {
  "joyeria-de-autor-chile-renacimiento-orfebreria-artesanal": () =>
    import(
      "@/content/blog/joyeria-de-autor-chile-renacimiento-orfebreria-artesanal"
    ),
  "guia-elegir-cuidar-joyas-artesanales-plata": () =>
    import("@/content/blog/guia-elegir-cuidar-joyas-artesanales-plata"),
  "anillo-compromiso-artesanal-hecho-a-mano-chile": () =>
    import("@/content/blog/anillo-compromiso-artesanal-hecho-a-mano-chile"),
  "joyeria-sustentable-slow-fashion-chile": () =>
    import("@/content/blog/joyeria-sustentable-slow-fashion-chile"),
  "lapislazuli-piedra-nacional-chile-joyas": () =>
    import("@/content/blog/lapislazuli-piedra-nacional-chile-joyas"),
  "guia-regalar-joyeria-artesanal-mujer-chile": () =>
    import("@/content/blog/guia-regalar-joyeria-artesanal-mujer-chile"),
  "como-vender-joyeria-artesanal-online-chile": () =>
    import("@/content/blog/como-vender-joyeria-artesanal-online-chile"),
  "joyas-con-significado-simbolismo-joyeria-artesanal": () =>
    import("@/content/blog/joyas-con-significado-simbolismo-joyeria-artesanal"),
  "piedras-naturales-chilenas-joyeria-cuarzo-turquesa": () =>
    import("@/content/blog/piedras-naturales-chilenas-joyeria-cuarzo-turquesa"),
};

/* ─── Helpers ─── */
function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* ─── Static params ─── */
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

/* ─── Metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: post.seoTitle,
      description: post.seoDescription,
    },
  };
}

/* ─── Page ─── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const loader = contentModules[slug];
  if (!loader) notFound();

  const { PostContent } = await loader();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    image: `${appUrl}${post.coverImage}`,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: post.author,
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Casa Orfebre",
      url: appUrl,
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/casaorfebre-logo-compact.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${appUrl}/blog/${post.slug}`,
    },
  };

  /* Related posts: all posts except the current one */
  const relatedPosts = getAllPosts().filter((p) => p.slug !== slug);

  return (
    <>
      {/* JSON-LD structured data — content is fully controlled, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* ─── Hero Image Placeholder ─── */}
      <div className="w-full bg-gradient-to-br from-border via-surface to-border aspect-[21/9]" />

      <article className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="pt-8 pb-6 text-sm font-light text-text-tertiary">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-accent transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/blog"
                className="hover:text-accent transition-colors"
              >
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-text-secondary truncate max-w-[200px] sm:max-w-none">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* ─── Header ─── */}
        <FadeIn>
          <header className="text-center pb-12 border-b border-border">
            <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              {post.category}
            </span>

            <h1 className="mt-6 font-serif text-3xl font-light text-text sm:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-text-tertiary">
              <span className="font-medium text-text-secondary">
                {post.author}
              </span>
              <span aria-hidden="true">&middot;</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </header>
        </FadeIn>

        {/* ─── Article Content ─── */}
        <FadeIn>
          <div className="pt-8">
            <PostContent />
          </div>
        </FadeIn>
      </article>

      {/* ─── Related Posts ─── */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <h2 className="text-center font-serif text-2xl font-light text-text mb-12">
              Artículos relacionados
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/9] w-full bg-gradient-to-br from-border via-surface to-border" />
                  <div className="p-6">
                    <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      {related.category}
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

      {/* ─── Bottom CTA ─── */}
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
