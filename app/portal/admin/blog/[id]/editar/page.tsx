import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogEditor } from "../../_components/blog-editor";

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl font-light">Editar artículo</h1>
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
