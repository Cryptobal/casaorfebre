"use client";

import { useEffect, useRef, useTransition } from "react";

interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string | null;
  content: string;
  isBlocked: boolean;
  blockedReason: string | null;
  isOwn: boolean;
  createdAt: Date | string;
  visibleTo?: string | null;
}

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

export function ChatMessages({
  messages,
  isAdmin = false,
  onDeleteMessage,
}: {
  messages: ChatMessage[];
  isAdmin?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-text-tertiary">
        No hay mensajes aún. ¡Envía el primero!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        // Admin message
        if (msg.senderRole === "ADMIN") {
          return (
            <div key={msg.id} className="flex justify-center group">
              <div className="max-w-[85%] rounded-lg bg-amber-50 px-4 py-2.5 text-center text-sm relative">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-xs font-medium text-amber-800">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Casa Orfebre
                  {isAdmin && msg.visibleTo && (
                    <span className="ml-1 text-[10px] text-amber-600">
                      (solo {msg.visibleTo === "BUYER" ? "comprador" : "orfebre"})
                    </span>
                  )}
                </div>
                <p className="text-amber-900">{msg.content}</p>
                <p className="mt-1 text-xs text-amber-600">{timeAgo(msg.createdAt)}</p>
                {isAdmin && onDeleteMessage && (
                  <button
                    onClick={() => startTransition(() => onDeleteMessage(msg.id))}
                    disabled={isPending}
                    className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white opacity-80 hover:opacity-100 group-hover:block disabled:opacity-30"
                    title="Eliminar mensaje"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
            </div>
          );
        }

        // Blocked message (only visible to sender)
        if (msg.isBlocked && msg.isOwn) {
          return (
            <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] rounded-lg bg-red-50 px-4 py-2.5 text-sm">
                <p className="mb-1 font-medium text-red-700">[Mensaje no enviado]</p>
                <p className="text-red-600">No está permitido compartir datos de contacto.</p>
                <p className="mt-1 text-xs text-red-400">{timeAgo(msg.createdAt)}</p>
              </div>
            </div>
          );
        }

        // Skip blocked messages for non-sender
        if (msg.isBlocked) return null;

        // Normal message
        return (
          <div key={msg.id} className={`flex group ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`relative max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                msg.isOwn
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-text"
              }`}
            >
              {isAdmin && !msg.isOwn && (
                <p className="mb-0.5 text-[10px] font-medium opacity-60">{msg.senderName}</p>
              )}
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`mt-1 text-xs ${msg.isOwn ? "text-white/60" : "text-text-tertiary"}`}>
                {timeAgo(msg.createdAt)}
              </p>
              {isAdmin && onDeleteMessage && (
                <button
                  onClick={() => startTransition(() => onDeleteMessage(msg.id))}
                  disabled={isPending}
                  className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white opacity-80 hover:opacity-100 group-hover:block disabled:opacity-30"
                  title="Eliminar mensaje"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
