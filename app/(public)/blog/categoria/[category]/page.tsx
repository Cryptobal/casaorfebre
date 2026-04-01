import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { BlogImage } from "@/components/shared/blog-image";
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

function findCategoryKey(slug: string): string | undefined {
  return Object.entries(categoryLabels).find(
    ([key, label]) => slugify(label) === slug || key.toLowerCase() === slug,
  )?.[0];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { category: true },
    distinct: ["category"],
  });
  return posts.map((p) => ({
    category: slugify(categoryLabels[p.category] || p.category),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const key = findCategoryKey(slug);
  const label = key ? categoryLabels[key] : slug;

  return {
    title: `${label} — Blog`,
    description: `Artículos sobre ${label.toLowerCase()} en el blog de Casa Orfebre. Joyería artesanal chilena.`,
    alternates: { canonical: `https://casaorfebre.cl/blog/categoria/${slug}` },
    openGraph: {
      title: `Artículos sobre ${label} | Blog Casa Orfebre`,
      description: `Artículos sobre ${label.toLowerCase()} en el blog de Casa Orfebre.`,
      siteName: "Casa Orfebre",
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const key = findCategoryKey(slug);
  if (!key) notFound();

  const label = categoryLabels[key];

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", category: key as never },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <section className="pt-20 pb-12 text-center">
        <FadeIn>
          <nav className="mb-6 text-sm text-text-tertiary">
            <Link href="/blog" className="hover:text-accent transition-colors">
              ← Volver al blog
            </Link>
          </nav>
          <SectionHeading
            title={`Artículos sobre ${label}`}
            subtitle={`${posts.length} ${posts.length === 1 ? "artículo" : "artículos"}`}
          />
        </FadeIn>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
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
                <h2 className="font-serif text-xl font-light text-text group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-text-tertiary">
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
