import Link from "next/link";
import { slugify } from "@/lib/utils";

interface SidebarPost {
  slug: string;
  title: string;
  publishedAt: Date | null;
  category: string;
}

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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogSidebar({
  relatedPosts,
  allTags,
}: {
  relatedPosts: SidebarPost[];
  allTags: string[];
}) {
  return (
    <div className="space-y-10">
      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            También te puede interesar
          </h3>
          <div className="mt-4 space-y-4">
            {relatedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-lg border border-border p-4 transition-colors hover:border-accent/30"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                  {categoryLabels[post.category] || post.category}
                </span>
                <h4 className="mt-1 text-sm font-light text-text group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h4>
                {post.publishedAt && (
                  <time className="mt-1 block text-xs text-text-tertiary">
                    {formatDate(post.publishedAt)}
                  </time>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Tags
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${slugify(tag)}`}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent/30 hover:text-accent"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-lg bg-accent/5 border border-accent/10 p-6 text-center">
        <p className="font-serif text-lg font-light text-text">
          ¿Buscas joyas artesanales?
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          Explora piezas únicas de orfebres chilenos verificados.
        </p>
        <Link
          href="/coleccion"
          className="mt-4 inline-block rounded-lg bg-accent px-6 py-2 text-sm text-white transition-colors hover:bg-accent-dark"
        >
          Ver colección
        </Link>
      </div>
    </div>
  );
}
