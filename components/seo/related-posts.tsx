import Link from "next/link";
import Image from "next/image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

interface RelatedPost {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: Date;
  image?: { url: string; altText?: string } | null;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  title?: string;
  className?: string;
}

export function RelatedPosts({
  posts,
  title = "Artículos relacionados",
  className = "",
}: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="font-serif text-lg font-light text-text">
        {title}
      </h3>
      <div className="mt-2 h-px w-8 bg-accent" />
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface/50 transition-all hover:border-accent hover:shadow-md"
          >
            {/* Image */}
            <div className="relative aspect-video overflow-hidden bg-background">
              {post.image?.url ? (
                <Image
                  src={post.image.url}
                  alt={post.image.altText || post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <ImagePlaceholder
                  name={post.title}
                  className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between p-4">
              <div>
                <h4 className="font-sans text-sm font-medium text-text line-clamp-2 group-hover:text-accent">
                  {post.title}
                </h4>
                {post.excerpt && (
                  <p className="mt-2 font-sans text-xs text-text-secondary line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
              {post.publishedAt && (
                <p className="mt-3 font-sans text-xs text-text-tertiary">
                  {new Date(post.publishedAt).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
