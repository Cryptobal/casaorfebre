"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import { calculateReadingTime } from "@/lib/markdown";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

export async function createBlogPost(formData: FormData) {
  const session = await requireAdmin();

  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string) || slugify(title);
  const content = (formData.get("content") as string) || "";
  const excerpt = (formData.get("excerpt") as string) || content.slice(0, 160);
  const category = formData.get("category") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const coverImage = (formData.get("coverImage") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const featured = formData.get("featured") === "true";
  const status = (formData.get("status") as string) || "DRAFT";
  const readingTime = parseInt(formData.get("readingTime") as string) || calculateReadingTime(content);

  // Check slug uniqueness
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Ya existe un artículo con ese slug" };
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      category: category as never,
      tags,
      coverImage,
      seoTitle,
      seoDescription,
      featured,
      readingTime,
      status: status as never,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      authorId: session.user.id!,
    },
  });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  return { success: true, id: post.id };
}

export async function updateBlogPost(id: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = (formData.get("content") as string) || "";
  const excerpt = (formData.get("excerpt") as string) || content.slice(0, 160);
  const category = formData.get("category") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const coverImage = (formData.get("coverImage") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const featured = formData.get("featured") === "true";
  const status = (formData.get("status") as string) || "DRAFT";
  const readingTime = parseInt(formData.get("readingTime") as string) || calculateReadingTime(content);

  // Check slug uniqueness (exclude self)
  if (slug) {
    const existing = await prisma.blogPost.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return { error: "Ya existe un artículo con ese slug" };
    }
  }

  const current = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt,
      category: category as never,
      tags,
      coverImage,
      seoTitle,
      seoDescription,
      featured,
      readingTime,
      status: status as never,
      // Set publishedAt on first publish
      publishedAt:
        status === "PUBLISHED" && !current?.publishedAt
          ? new Date()
          : current?.publishedAt,
    },
  });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { success: true };
}

export async function publishBlogPost(id: string) {
  await requireAdmin();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Artículo no encontrado" };

  await prisma.blogPost.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: post.publishedAt || new Date(),
    },
  });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

export async function archiveBlogPost(id: string) {
  await requireAdmin();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Artículo no encontrado" };

  await prisma.blogPost.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Artículo no encontrado" };

  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function toggleFeaturedBlogPost(id: string) {
  await requireAdmin();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return { error: "Artículo no encontrado" };

  await prisma.blogPost.update({
    where: { id },
    data: { featured: !post.featured },
  });

  revalidatePath("/portal/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}

export async function uploadBlogCover(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) return { error: "No se recibió archivo" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "jpg";
  const key = `blog/${Date.now()}.${ext}`;
  const url = await uploadToR2(buffer, key, file.type);

  return { success: true, url };
}

export async function checkSlugAvailability(slug: string, excludeId?: string) {
  const existing = await prisma.blogPost.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
  return { available: !existing };
}

export async function incrementViewCount(id: string) {
  await prisma.blogPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}
