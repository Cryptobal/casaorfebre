import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import { BlogImage } from "@/components/shared/blog-image";
import type { Metadata } from "next";

export const revalidate = 300;
export const dynamic = "force-static";

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getAllTags(): Promise<string[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

async function getPostsByTagSlug(tagSlug: string) {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  return posts.filter((p) =>
    p.tags.some((t) => slugify(t) === tagSlug),
  );
}

function findTagLabel(tagSlug: string, allTags: string[]): string {
  return allTags.find((t) => slugify(t) === tagSlug) || tagSlug;
}

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({ tag: slugify(tag) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const tags = await getAllTags();
  const label = findTagLabel(tagSlug, tags);

  return {
    title: `${label} — Blog`,
    description: `Artículos sobre ${label} en el blog de Casa Orfebre. Joyería artesanal chilena.`,
    alternates: { canonical: `https://casaorfebre.cl/blog/tag/${tagSlug}` },
    openGraph: {
      title: `Artículos sobre ${label} | Blog Casa Orfebre`,
      description: `Artículos sobre ${label} en el blog de Casa Orfebre.`,
      siteName: "Casa Orfebre",
    },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: tagSlug } = await params;
  const [tags, posts] = await Promise.all([
    getAllTags(),
    getPostsByTagSlug(tagSlug),
  ]);
  const label = findTagLabel(tagSlug, tags);

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
            title={`Artículos sobre "${label}"`}
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
          No hay artículos con este tag todavía.
        </p>
      )}
    </div>
  );
}
