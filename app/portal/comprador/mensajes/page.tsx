import Link from "next/link";
import { getConversations } from "@/lib/actions/chat";

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

export default async function BuyerMessagesPage() {
  const conversations = await getConversations();

  return (
    <div>
      <h1 className="font-serif text-2xl font-light sm:text-3xl">Mensajes</h1>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border p-8 text-center">
          <p className="text-text-secondary">
            Aún no tienes mensajes. Visita una pieza y escribe al orfebre.
          </p>
          <Link
            href="/coleccion"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            Explorar colección &rarr;
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {conversations.map((c) => {
            const isAdminConv = c.isAdminConversation;
            const badge = !isAdminConv ? c.artisan?.subscriptions?.[0]?.plan : null;
            const displayName = isAdminConv ? "Casa Orfebre" : (c.artisan?.displayName || "Orfebre");
            const initials = isAdminConv ? "CO" : displayName.slice(0, 2).toUpperCase();

            return (
              <Link
                key={c.id}
                href={`/portal/comprador/mensajes/${c.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-background sm:gap-4 sm:p-4"
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-serif text-sm font-medium ${
                  isAdminConv ? "bg-amber-100 text-amber-700" : "bg-accent/10 text-accent"
                }`}>
                  {initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-text">{displayName}</p>
                    {isAdminConv && (
                      <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Soporte</span>
                    )}
                    {badge?.badgeText && (
                      <span className="flex-shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{badge.badgeText}</span>
                    )}
                  </div>
                  {c.lastMessage && (
                    <p className="mt-0.5 truncate text-sm text-text-secondary">{c.lastMessage.content.slice(0, 60)}</p>
                  )}
                </div>

                <div className="flex flex-shrink-0 flex-col items-end gap-1">
                  {c.lastMessage && (
                    <span className="text-xs text-text-tertiary">{timeAgo(c.lastMessage.createdAt)}</span>
                  )}
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">{c.unreadCount}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
