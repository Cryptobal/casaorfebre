import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { aiBlogLimiter } from "@/lib/rate-limit";
import { generateBlogArticle, suggestBlogTopics } from "@/lib/ai/blog-generator";
import { prisma } from "@/lib/prisma";
import type { BlogCategory } from "@prisma/client";

const VALID_CATEGORIES: BlogCategory[] = [
  "GUIAS", "TENDENCIAS", "ORFEBRES", "CUIDADOS", "MATERIALES", "CULTURA",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const { success } = await aiBlogLimiter.limit(session.user.id ?? "admin");
  if (!success) {
    return Response.json(
      { error: "Demasiadas generaciones. Máximo 5 por hora." },
      { status: 429 },
    );
  }

  const body = await req.json() as {
    action: string;
    topic?: string;
    keywords?: string[];
    category?: string;
    includeProductLinks?: boolean;
  };

  try {
    if (body.action === "generate") {
      if (!body.topic) {
        return Response.json({ error: "Se requiere un tema" }, { status: 400 });
      }

      const category = VALID_CATEGORIES.includes(body.category as BlogCategory)
        ? (body.category as BlogCategory)
        : "GUIAS";

      const result = await generateBlogArticle({
        topic: body.topic,
        keywords: body.keywords ?? [],
        targetCategory: category,
        includeProductLinks: body.includeProductLinks ?? false,
      });

      return Response.json(result);
    }

    if (body.action === "suggest-topics") {
      const existingPosts = await prisma.blogPost.findMany({
        select: { title: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const topics = await suggestBlogTopics(existingPosts.map((p) => p.title));
      return Response.json({ topics });
    }

    return Response.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err) {
    console.error("AI blog generation error:", err);
    const message = err instanceof Error ? err.message : "Error al generar contenido";
    return Response.json({ error: message }, { status: 500 });
  }
}
