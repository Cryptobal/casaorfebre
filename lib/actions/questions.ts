"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  checkContactInfo,
  CONTACT_FILTER_MESSAGE,
} from "@/lib/contact-filter";
import {
  sendNewQuestionEmail,
  sendQuestionAnsweredEmail,
} from "@/lib/emails/templates";

export async function submitQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const productId = formData.get("productId") as string;
  const artisanId = formData.get("artisanId") as string;
  const question = formData.get("question") as string;

  if (!productId || !artisanId || !question?.trim()) {
    return { error: "Todos los campos son requeridos" };
  }

  // Contact filter
  const filter = checkContactInfo(question);
  if (!filter.isClean) return { error: CONTACT_FILTER_MESSAGE };

  await prisma.productQuestion.create({
    data: {
      productId,
      artisanId,
      userId: session.user.id,
      question: question.trim(),
      isPublic: true,
      isBlocked: false,
    },
  });

  // Send notification email to artisan
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      user: { select: { email: true } },
    },
  });
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });
  if (artisan?.user?.email && product) {
    try {
      await sendNewQuestionEmail(artisan.user.email, {
        artisanName: artisan.displayName,
        productName: product.name,
        question: question.trim(),
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath(`/coleccion`);
  return { success: true };
}

export async function answerQuestion(questionId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const answer = formData.get("answer") as string;
  if (!answer?.trim()) return { error: "La respuesta no puede estar vacia" };

  // Contact filter
  const filter = checkContactInfo(answer);
  if (!filter.isClean) return { error: CONTACT_FILTER_MESSAGE };

  const artisan = await prisma.artisan.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return { error: "No autorizado" };

  const questionRecord = await prisma.productQuestion.findFirst({
    where: { id: questionId, artisanId: artisan.id },
    include: {
      user: { select: { email: true, name: true } },
      product: { select: { name: true } },
    },
  });
  if (!questionRecord) return { error: "Pregunta no encontrada" };

  await prisma.productQuestion.update({
    where: { id: questionId },
    data: { answer: answer.trim(), answeredAt: new Date() },
  });

  // Send notification email to buyer
  if (questionRecord.user.email) {
    try {
      await sendQuestionAnsweredEmail(questionRecord.user.email, {
        buyerName: questionRecord.user.name || "Cliente",
        productName: questionRecord.product.name,
        answer: answer.trim(),
      });
    } catch (e) {
      console.error("Email failed:", e);
    }
  }

  revalidatePath("/portal/orfebre/preguntas");
  return { success: true };
}
