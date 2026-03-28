import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { BlogImage } from "@/components/shared/blog-image";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  alternates: { canonical: "/blog" },
  description:
    "Artículos sobre joyería artesanal chilena, orfebrería, cuidado de plata y el movimiento de joyería de autor en Chile.",
  openGraph: {
    title: "Blog | Casa Orfebre",
    description:
      "Artículos sobre joyería artesanal chilena, orfebrería, cuidado de plata y el movimiento de joyería de autor en Chile.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Casa Orfebre",
    description:
      "Artículos sobre joyería artesanal chilena, orfebrería, cuidado de plata y el movimiento de joyería de autor en Chile.",
    images: ["/casaorfebre-og-image.png"],
  },
};

const categoryLabels: Record<string, string> = {
  GUIAS: "Guías",
  TENDENCIAS: "Tendencias",
  ORFEBRES: "Orfebres",
  CUIDADOS: "Cuidados",
  MATERIALES: "Materiales",
  CULTURA: "Cultura",
};

const allCategories = Object.entries(categoryLabels);

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.categoria || "";

  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      ...(categoryFilter ? { category: categoryFilter as never } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });

  // Featured post: most recent featured one (only when showing all)
  const featuredPost = !categoryFilter
    ? posts.find((p) => p.featured)
    : null;
  const regularPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <FadeIn>
          <SectionHeading
            title="Blog"
            subtitle="Historias, guías y cultura del mundo de la orfebrería artesanal chilena"
          />
        </FadeIn>
      </section>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        <Link
          href="/blog"
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            !categoryFilter
              ? "bg-accent text-white"
              : "bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent"
          }`}
        >
          Todas
        </Link>
        {allCategories.map(([key, label]) => (
          <Link
            key={key}
            href={`/blog?categoria=${key}`}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              categoryFilter === key
                ? "bg-accent text-white"
                : "bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Featured hero card */}
      {featuredPost && (
        <FadeIn>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group mb-12 block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
          >
            <div className="grid md:grid-cols-2">
              <BlogImage
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                className="aspect-[16/9] w-full object-cover md:aspect-auto md:h-full"
              />
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <span className="inline-block w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {categoryLabels[featuredPost.category] || featuredPost.category}
                </span>
                <h2 className="mt-4 font-serif text-2xl font-light text-text group-hover:text-accent transition-colors sm:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-3 text-xs text-text-tertiary">
                  {featuredPost.readingTime && <span>{featuredPost.readingTime} min lectura</span>}
                  {featuredPost.publishedAt && (
                    <>
                      <span>·</span>
                      <time dateTime={featuredPost.publishedAt.toISOString()}>
                        {formatDate(featuredPost.publishedAt)}
                      </time>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </FadeIn>
      )}

      {/* Post Grid - 3 columns */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {regularPosts.map((post) => (
          <FadeIn key={post.slug} className="h-full">
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
            >
              <BlogImage
                src={post.coverImage}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <span className="inline-block w-fit rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {categoryLabels[post.category] || post.category}
                </span>

                <h2 className="mt-3 font-serif text-xl font-light text-text group-hover:text-accent transition-colors sm:text-2xl">
                  {post.title}
                </h2>

                <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary line-clamp-3">
                  {post.excerpt.length > 120
                    ? post.excerpt.slice(0, 120) + "..."
                    : post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    {post.readingTime && <span>{post.readingTime} min</span>}
                    {post.publishedAt && (
                      <>
                        <span>·</span>
                        <time dateTime={post.publishedAt.toISOString()}>
                          {formatDate(post.publishedAt)}
                        </time>
                      </>
                    )}
                  </div>
                  <span className="text-sm font-light text-accent group-hover:underline">
                    Leer más →
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </section>

      {posts.length === 0 && (
        <p className="text-center text-text-tertiary py-20">
          No hay artículos en esta categoría todavía.
        </p>
      )}
    </div>
  );
}
