"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function answerQuestion(questionId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const answer = formData.get("answer") as string;
  if (!answer?.trim()) return { error: "La respuesta no puede estar vacia" };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const question = await prisma.productQuestion.findFirst({
    where: { id: questionId, artisanId: artisan.id },
  });
  if (!question) return { error: "Pregunta no encontrada" };

  await prisma.productQuestion.update({
    where: { id: questionId },
    data: { answer: answer.trim(), answeredAt: new Date() },
  });

  revalidatePath("/portal/orfebre/preguntas");
  return { success: true };
}
