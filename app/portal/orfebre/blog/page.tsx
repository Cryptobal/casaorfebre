import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { BlogCategory, BlogStatus } from "@prisma/client";

const CATEGORY_LABELS: Record<BlogCategory, string> = {
  GUIAS: "Guías",
  TENDENCIAS: "Tendencias",
  ORFEBRES: "Orfebres",
  CUIDADOS: "Cuidados",
  MATERIALES: "Materiales",
  CULTURA: "Cultura",
};

const STATUS_LABELS: Record<BlogStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado",
};

const STATUS_STYLES: Record<BlogStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BlogOrfebrePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      status: true,
      publishedAt: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light">Blog</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Escribe artículos sobre tu oficio y comparte tu conocimiento
          </p>
        </div>
        <Link
          href="/portal/orfebre/blog/nuevo"
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-dark"
        >
          + Nuevo artículo
        </Link>
      </div>

      <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Los artículos se envían como borrador. El equipo de Casa Orfebre los
        revisa y publica.
      </div>

      {posts.length === 0 ? (
        <Card className="mt-6 flex flex-col items-center py-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-4 h-12 w-12 text-text-secondary/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
            />
          </svg>
          <h2 className="font-serif text-lg font-medium text-text">
            Aún no has escrito artículos
          </h2>
          <p className="mt-2 max-w-sm text-sm text-text-secondary">
            Comparte tu experiencia como orfebre: técnicas, materiales, historias
            detrás de tus piezas. Tu conocimiento inspira a otros.
          </p>
          <Link
            href="/portal/orfebre/blog/nuevo"
            className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
          >
            Escribir mi primer artículo
          </Link>
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/orfebre/blog/${post.id}`}
                    className="truncate font-medium text-text hover:underline"
                  >
                    {post.title}
                  </Link>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-600">
                    {CATEGORY_LABELS[post.category]}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-medium ${STATUS_STYLES[post.status]}`}
                  >
                    {STATUS_LABELS[post.status]}
                  </span>
                  <span>
                    {post.status === "PUBLISHED" && post.publishedAt
                      ? formatDate(post.publishedAt)
                      : formatDate(post.updatedAt)}
                  </span>
                  {post.status === "PUBLISHED" && (
                    <span>{post.viewCount.toLocaleString("es-CL")} vistas</span>
                  )}
                </div>
              </div>
              <Link
                href={`/portal/orfebre/blog/${post.id}`}
                className="ml-4 shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-zinc-50 hover:text-text"
              >
                Editar
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
