import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiSuggestLimiter } from "@/lib/rate-limit";
import { suggestAnswer } from "@/lib/ai/response-assistant";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  // Only approved artisans or admins
  const isAdmin = session.user.role === "ADMIN";
  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, displayName: true, status: true },
  });

  if (!isAdmin && (!artisan || artisan.status !== "APPROVED")) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  const { success } = await aiSuggestLimiter.limit(session.user.id);
  if (!success) {
    return Response.json(
      { error: "Demasiadas sugerencias. Máximo 30 por día." },
      { status: 429 },
    );
  }

  const body = await req.json() as { questionId: string };

  if (!body.questionId) {
    return Response.json({ error: "Se requiere questionId" }, { status: 400 });
  }

  // Fetch the question with product data
  const question = await prisma.productQuestion.findFirst({
    where: {
      id: body.questionId,
      ...(artisan ? { artisanId: artisan.id } : {}),
    },
    include: {
      product: {
        select: {
          name: true,
          description: true,
          materials: { select: { name: true } },
          categories: { select: { name: true } },
        },
      },
    },
  });

  if (!question) {
    return Response.json({ error: "Pregunta no encontrada" }, { status: 404 });
  }

  // Fetch recent answers from this artisan for style matching
  const recentAnswers = await prisma.productQuestion.findMany({
    where: {
      artisanId: question.artisanId,
      answer: { not: null },
    },
    select: { answer: true },
    orderBy: { answeredAt: "desc" },
    take: 5,
  });

  try {
    const suggestion = await suggestAnswer({
      question: question.question,
      productName: question.product.name,
      productDescription: question.product.description,
      productMaterials: question.product.materials.map((m) => m.name),
      productCategory: question.product.categories[0]?.name || "Joyería",
      artisanName: artisan?.displayName || "Orfebre",
      previousAnswers: recentAnswers
        .map((r) => r.answer)
        .filter((a): a is string => !!a),
    });

    return Response.json({ suggestion });
  } catch (error) {
    console.error("AI suggest-answer failed:", error);
    return Response.json(
      { error: "No pudimos generar la sugerencia. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
