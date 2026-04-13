import Link from "next/link";
import {
  getContactSubmissions,
} from "@/lib/actions/contact-submissions";
import { ReplyButton } from "./reply-button";
import { StatusButton } from "./status-button";

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminContactPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const statusFilter = sp.status || "";
  const search = sp.q || "";

  const submissions = await getContactSubmissions({
    status: statusFilter,
    search,
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Formularios de contacto</h1>
      <p className="mt-1 text-sm text-text-secondary">
        {submissions.length} formularios
      </p>

      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          type="text"
          placeholder="Buscar por nombre, email o mensaje..."
          defaultValue={search}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px] w-full sm:w-64"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="REPLIED">Respondidos</option>
          <option value="CLOSED">Cerrados</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark min-h-[44px]"
        >
          Filtrar
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {submissions.map((s) => (
          <div key={s.id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{s.name}</p>
                  {s.user ? (
                    <Link
                      href={`/portal/admin/compradores/${s.user.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Ver ficha
                    </Link>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Sin cuenta
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{s.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    s.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : s.status === "REPLIED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {s.status === "PENDING" ? "Pendiente" : s.status === "REPLIED" ? "Respondido" : "Cerrado"}
                </span>
                <span className="text-xs text-text-tertiary">
                  {new Date(s.createdAt).toLocaleDateString("es-CL")}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs font-medium text-text-tertiary">{s.subject}</p>
              <p className="mt-1 text-sm text-text-secondary whitespace-pre-wrap">{s.message}</p>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              {s.status === "PENDING" && s.user && (
                <ReplyButton submissionId={s.id} />
              )}
              {s.conversation && (
                <Link
                  href={`/portal/admin/mensajes/${s.conversation.id}`}
                  className="text-sm text-accent hover:underline"
                >
                  Ver conversación
                </Link>
              )}
              {s.status !== "CLOSED" && (
                <StatusButton submissionId={s.id} targetStatus="CLOSED" label="Cerrar" />
              )}
              {s.status === "PENDING" && !s.user && (
                <StatusButton submissionId={s.id} targetStatus="REPLIED" label="Marcar respondido" />
              )}
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <p className="mt-8 text-center text-sm text-text-tertiary">
            No se encontraron formularios de contacto.
          </p>
        )}
      </div>
    </div>
  );
}
