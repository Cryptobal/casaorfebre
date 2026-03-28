import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

interface PageProps {
  searchParams: Promise<{ bypass?: string; status?: string; q?: string }>;
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const bypassFilter = sp.bypass === "true";
  const statusFilter = sp.status || "";
  const searchQuery = sp.q || "";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalActive, messagesToday, totalBlocked, bypassConversations, conversations] =
    await Promise.all([
      prisma.conversation.count({ where: { status: "ACTIVE" } }),
      prisma.message.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.message.count({ where: { isBlocked: true } }),
      prisma.conversation.count({ where: { hasBypassAttempt: true } }),
      prisma.conversation.findMany({
        where: {
          deletedAt: null,
          ...(bypassFilter ? { hasBypassAttempt: true } : {}),
          ...(statusFilter ? { status: statusFilter as "ACTIVE" | "BLOCKED" } : {}),
        },
        orderBy: { lastMessageAt: "desc" },
        include: {
          buyer: { select: { name: true, email: true } },
          artisan: {
            select: {
              displayName: true,
              subscriptions: {
                where: { status: "ACTIVE" },
                include: { plan: { select: { name: true } } },
                take: 1,
              },
            },
          },
          product: { select: { name: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true },
          },
        },
        take: 200,
      }),
    ]);

  // Client-side search filter
  const filtered = searchQuery
    ? conversations.filter(
        (c) =>
          c.buyer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.buyer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.artisan.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  const stats = [
    { label: "Conversaciones activas", value: totalActive },
    { label: "Mensajes hoy", value: messagesToday },
    { label: "Mensajes bloqueados", value: totalBlocked },
    { label: "Intentos de bypass", value: bypassConversations },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Mensajes</h1>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs uppercase tracking-widest text-text-tertiary">{s.label}</p>
            <p className="mt-1 text-2xl font-medium">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <form className="mt-6 flex flex-wrap items-center gap-3">
        <input
          name="q"
          type="text"
          placeholder="Buscar por nombre o email..."
          defaultValue={searchQuery}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none min-h-[44px] w-full sm:w-64"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activas</option>
          <option value="BLOCKED">Bloqueadas</option>
        </select>
        <label className="flex items-center gap-2 text-sm min-h-[44px]">
          <input type="checkbox" name="bypass" value="true" defaultChecked={bypassFilter} />
          Solo con bypass
        </label>
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark min-h-[44px]"
        >
          Filtrar
        </button>
      </form>

      {/* Conversation list */}
      {/* Desktop: table / Mobile: cards */}
      <div className="mt-6">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-text-tertiary">
                <th className="pb-2 pr-4">Comprador</th>
                <th className="pb-2 pr-4">Orfebre</th>
                <th className="pb-2 pr-4">Producto</th>
                <th className="pb-2 pr-4">Último mensaje</th>
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2 pr-4">Estado</th>
                <th className="pb-2">Bypass</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={`border-b border-border/50 ${c.hasBypassAttempt ? "bg-red-50/50" : ""}`}>
                  <td className="py-3 pr-4">
                    <Link href={`/portal/admin/mensajes/${c.id}`} className="text-accent hover:underline">
                      {c.buyer.name || c.buyer.email}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{c.artisan.displayName}</td>
                  <td className="py-3 pr-4 text-text-secondary">{c.product?.name || "—"}</td>
                  <td className="max-w-[200px] truncate py-3 pr-4 text-text-secondary">
                    {c.messages[0]?.content.slice(0, 50) || "—"}
                  </td>
                  <td className="py-3 pr-4 text-text-tertiary">
                    {c.messages[0] ? timeAgo(c.messages[0].createdAt) : "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.status === "BLOCKED"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {c.status === "BLOCKED" ? "Bloqueada" : "Activa"}
                    </span>
                  </td>
                  <td className="py-3">
                    {c.hasBypassAttempt && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Bypass
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 sm:hidden">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/portal/admin/mensajes/${c.id}`}
              className={`block rounded-lg border border-border p-4 ${c.hasBypassAttempt ? "border-red-200 bg-red-50/50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{c.buyer.name || c.buyer.email}</p>
                  <p className="text-sm text-text-secondary">&harr; {c.artisan.displayName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === "BLOCKED" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.status === "BLOCKED" ? "Bloqueada" : "Activa"}
                  </span>
                  {c.hasBypassAttempt && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Bypass
                    </span>
                  )}
                </div>
              </div>
              {c.product && (
                <p className="mt-1 text-xs text-text-tertiary">Producto: {c.product.name}</p>
              )}
              {c.messages[0] && (
                <p className="mt-1 truncate text-sm text-text-secondary">
                  {c.messages[0].content.slice(0, 60)}
                </p>
              )}
              {c.messages[0] && (
                <p className="mt-1 text-xs text-text-tertiary">{timeAgo(c.messages[0].createdAt)}</p>
              )}
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-tertiary">No hay conversaciones.</p>
        )}
      </div>
    </div>
  );
}
