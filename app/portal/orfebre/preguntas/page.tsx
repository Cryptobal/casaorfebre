import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { answerQuestion } from "@/lib/actions/questions";
import { AnswerForm } from "@/components/questions/answer-form";
import Link from "next/link";

export default async function PreguntasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const showAnswered = filter === "respondidas";

  const questions = await prisma.productQuestion.findMany({
    where: {
      artisanId: artisan.id,
      ...(showAnswered ? { answer: { not: null } } : { answer: null }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-serif text-2xl font-semibold text-text">Preguntas</h1>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        <Link
          href="/portal/orfebre/preguntas"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !showAnswered
              ? "bg-accent text-white"
              : "bg-background text-text-secondary hover:bg-background/80 hover:text-text"
          }`}
        >
          Sin responder
        </Link>
        <Link
          href="/portal/orfebre/preguntas?filter=respondidas"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            showAnswered
              ? "bg-accent text-white"
              : "bg-background text-text-secondary hover:bg-background/80 hover:text-text"
          }`}
        >
          Respondidas
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-text-secondary">
            {showAnswered
              ? "No tienes preguntas respondidas"
              : "No tienes preguntas pendientes"}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-text-tertiary">
                    {q.user.name ?? "Usuario"} pregunto sobre{" "}
                    <span className="font-medium text-text-secondary">{q.product.name}</span>
                  </p>
                  <p className="mt-2 text-sm text-text">{q.question}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {new Date(q.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>

              {q.answer ? (
                <div className="mt-4 rounded-md bg-background p-3">
                  <p className="text-xs font-medium text-text-secondary">Tu respuesta:</p>
                  <p className="mt-1 text-sm text-text">{q.answer}</p>
                  {q.answeredAt && (
                    <p className="mt-1 text-xs text-text-tertiary">
                      Respondida el {new Date(q.answeredAt).toLocaleDateString("es-CL")}
                    </p>
                  )}
                </div>
              ) : (
                <AnswerForm
                  questionId={q.id}
                  answerAction={async (formData: FormData) => {
                    "use server";
                    await answerQuestion(q.id, formData);
                  }}
                />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
