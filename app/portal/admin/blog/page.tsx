import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publishBlogPost, archiveBlogPost, toggleFeaturedBlogPost } from "@/lib/actions/blog";

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Borrador", color: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Publicado", color: "bg-green-100 text-green-700" },
  ARCHIVED: { label: "Archivado", color: "bg-amber-100 text-amber-700" },
};

const categoryLabels: Record<string, string> = {
  GUIAS: "Guías",
  TENDENCIAS: "Tendencias",
  ORFEBRES: "Orfebres",
  CUIDADOS: "Cuidados",
  MATERIALES: "Materiales",
  CULTURA: "Cultura",
};

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "";
  const categoryFilter = params.category || "";
  const search = params.q || "";

  const posts = await prisma.blogPost.findMany({
    where: {
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(categoryFilter ? { category: categoryFilter as never } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-light">Blog</h1>
        <Link
          href="/portal/admin/blog/nuevo"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-dark transition-colors"
        >
          + Nuevo artículo
        </Link>
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap gap-3" method="GET">
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="ARCHIVED">Archivado</option>
        </select>
        <select
          name="category"
          defaultValue={categoryFilter}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input
          name="q"
          type="text"
          placeholder="Buscar por título..."
          defaultValue={search}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <button
          type="submit"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-background transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-tertiary">
              <th className="pb-3 font-medium">Título</th>
              <th className="pb-3 font-medium">Categoría</th>
              <th className="pb-3 font-medium">Estado</th>
              <th className="pb-3 font-medium">Publicado</th>
              <th className="pb-3 font-medium text-right">Views</th>
              <th className="pb-3 font-medium text-center">Destacado</th>
              <th className="pb-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const st = statusLabels[post.status] || statusLabels.DRAFT;
              return (
                <tr key={post.id} className="border-b border-border/50">
                  <td className="py-4 pr-4">
                    <Link
                      href={`/portal/admin/blog/${post.id}/editar`}
                      className="font-medium text-text hover:text-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-text-tertiary mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="py-4">
                    <span className="text-xs">{categoryLabels[post.category] || post.category}</span>
                  </td>
                  <td className="py-4">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="py-4 text-text-tertiary text-xs">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("es-CL")
                      : "—"}
                  </td>
                  <td className="py-4 text-right text-text-tertiary">
                    {post.viewCount.toLocaleString("es-CL")}
                  </td>
                  <td className="py-4 text-center">
                    <form action={async () => { "use server"; await toggleFeaturedBlogPost(post.id); }}>
                      <button
                        type="submit"
                        className={`text-lg ${post.featured ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}
                        title={post.featured ? "Quitar destacado" : "Destacar"}
                      >
                        ★
                      </button>
                    </form>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "DRAFT" && (
                        <form action={async () => { "use server"; await publishBlogPost(post.id); }}>
                          <button className="rounded border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100">
                            Publicar
                          </button>
                        </form>
                      )}
                      {post.status === "PUBLISHED" && (
                        <form action={async () => { "use server"; await archiveBlogPost(post.id); }}>
                          <button className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700 hover:bg-amber-100">
                            Archivar
                          </button>
                        </form>
                      )}
                      <Link
                        href={`/portal/admin/blog/${post.id}/editar`}
                        className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {posts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-tertiary">
                  No se encontraron artículos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-text-tertiary">
        {posts.length} artículo{posts.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
