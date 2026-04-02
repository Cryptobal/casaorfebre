import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogEditor } from "@/app/portal/admin/blog/_components/blog-editor";

export default async function EditarArticuloOrfebrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  // Only allow editing own posts
  if (!post || post.authorId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl font-light">Editar artículo</h1>
      <div className="mt-8">
        <BlogEditor
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            category: post.category,
            tags: post.tags,
            status: post.status,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            readingTime: post.readingTime,
            featured: post.featured,
          }}
        />
      </div>
    </div>
  );
}
