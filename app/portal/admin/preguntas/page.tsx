import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { AdminQuestionActions } from "./question-actions";

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function AdminPreguntasPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const filter = sp.filter || "pendientes";
  const search = sp.q || "";

  const whereBase = {
    ...(filter === "pendientes" ? { answer: null } : {}),
    ...(filter === "respondidas" ? { answer: { not: null } } : {}),
    ...(filter === "bloqueadas" ? { isBlocked: true } : {}),
  };

  const [questions, counts] = await Promise.all([
    prisma.productQuestion.findMany({
      where: {
        ...whereBase,
        ...(search
          ? {
              OR: [
                { question: { contains: search, mode: "insensitive" as const } },
                { product: { name: { contains: search, mode: "insensitive" as const } } },
                { user: { name: { contains: search, mode: "insensitive" as const } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
        artisan: { select: { displayName: true, slug: true } },
      },
      take: 100,
    }),
    Promise.all([
      prisma.productQuestion.count({ where: { answer: null } }),
      prisma.productQuestion.count({ where: { answer: { not: null } } }),
      prisma.productQuestion.count({ where: { isBlocked: true } }),
    ]),
  ]);

  const [pendingCount, answeredCount, blockedCount] = counts;

  const tabs = [
    { key: "pendientes", label: "Pendientes", count: pendingCount },
    { key: "respondidas", label: "Respondidas", count: answeredCount },
    { key: "bloqueadas", label: "Bloqueadas", count: blockedCount },
    { key: "todas", label: "Todas", count: null },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Preguntas y Respuestas</h1>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/portal/admin/preguntas?filter=${tab.key}${search ? `&q=${search}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-accent text-white"
                : "bg-background text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
            )}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mt-4">
        <input type="hidden" name="filter" value={filter} />
        <input
          name="q"
          type="text"
          placeholder="Buscar por pregunta, producto o usuario..."
          defaultValue={search}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none sm:w-80 min-h-[44px]"
        />
      </form>

      {/* Questions */}
      {questions.length === 0 ? (
        <p className="mt-8 text-center text-sm text-text-tertiary">No hay preguntas.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                    <span className="font-medium text-text-secondary">{q.user.name || q.user.email}</span>
                    <span>preguntó sobre</span>
                    <Link
                      href={`/coleccion/${q.product.slug}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {q.product.name}
                    </Link>
                    <span>de</span>
                    <Link
                      href={`/orfebres/${q.artisan.slug}`}
                      className="font-medium text-text-secondary hover:underline"
                    >
                      {q.artisan.displayName}
                    </Link>
                  </div>
                  <p className="mt-2 text-sm text-text">{q.question}</p>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {new Date(q.createdAt).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {q.isBlocked && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Bloqueada</span>
                  )}
                  {!q.answer && !q.isBlocked && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Pendiente</span>
                  )}
                  {q.answer && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Respondida</span>
                  )}
                </div>
              </div>

              {q.answer && (
                <div className="mt-3 rounded-md bg-background p-3">
                  <p className="text-xs font-medium text-text-secondary">
                    Respuesta de {q.artisan.displayName}:
                  </p>
                  <p className="mt-1 text-sm text-text">{q.answer}</p>
                  {q.answeredAt && (
                    <p className="mt-1 text-xs text-text-tertiary">
                      {new Date(q.answeredAt).toLocaleDateString("es-CL")}
                    </p>
                  )}
                </div>
              )}

              <AdminQuestionActions questionId={q.id} isBlocked={q.isBlocked} isPublic={q.isPublic} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
