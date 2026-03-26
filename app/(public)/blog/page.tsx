import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre joyería artesanal chilena, orfebrería, cuidado de plata y el movimiento de joyería de autor en Chile.",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* ─── Hero ─── */}
      <section className="pt-20 pb-16 text-center">
        <FadeIn>
          <SectionHeading
            title="Blog"
            subtitle="Historias, guías y cultura del mundo de la orfebrería artesanal chilena"
          />
        </FadeIn>
      </section>

      {/* ─── Post Grid ─── */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <FadeIn key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
            >
              {/* Cover image placeholder */}
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-border via-surface to-border" />

              <div className="p-6 sm:p-8">
                {/* Category badge */}
                <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  {post.category}
                </span>

                {/* Title */}
                <h2 className="mt-3 font-serif text-xl font-light text-text group-hover:text-accent transition-colors sm:text-2xl">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Date + Read more */}
                <div className="mt-6 flex items-center justify-between">
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs text-text-tertiary"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="text-sm font-light text-accent group-hover:underline">
                    Leer más &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </section>
    </div>
  );
}
