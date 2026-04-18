import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import type { BlogPost } from "@prisma/client";

interface StoriesSectionProps {
  posts: Pick<BlogPost, "id" | "slug" | "title" | "excerpt" | "category" | "coverImage" | "publishedAt">[];
}

/**
 * Historias — 3 últimos posts del blog. Cada card: imagen 3:2, categoría
 * en uppercase tracked, título en Cormorant italic, fecha + autor.
 */
export function StoriesSection({ posts }: StoriesSectionProps) {
  if (posts.length === 0) return null;
  const visible = posts.slice(0, 3);

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 border-b border-[color:var(--color-border-soft)] pb-10 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-serif text-4xl font-light text-text sm:text-5xl">
            Historias
          </h2>
          <Link
            href="/blog"
            className="text-xs font-light uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent-dark"
          >
            Leer todas las historias →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-20 lg:grid-cols-3 lg:gap-x-12">
          {visible.map((post, i) => (
            <FadeIn key={post.id} delay={Math.min(i, 2) * 100}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden bg-background">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="font-serif text-2xl italic text-text-tertiary">
                        {post.title.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-light uppercase tracking-[0.2em] text-accent">
                    {post.category}
                  </p>
                  <h3 className="font-serif text-xl font-light italic leading-snug text-text transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  {post.publishedAt && (
                    <p className="text-xs font-light text-text-tertiary">
                      {new Date(post.publishedAt).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
