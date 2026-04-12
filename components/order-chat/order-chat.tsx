"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sendOrderMessage } from "@/lib/actions/order-messages";

interface Message {
  id: string;
  senderRole: "ARTISAN" | "BUYER" | "ADMIN";
  content: string;
  createdAt: Date | string;
  readAt: Date | string | null;
  sender: {
    name: string | null;
    image: string | null;
  };
  senderId: string;
}

interface OrderChatProps {
  orderItemId: string;
  currentUserId: string;
  currentUserRole: "ARTISAN" | "BUYER" | "ADMIN";
  messages: Message[];
  readOnly?: boolean;
  artisanName?: string;
  buyerName?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ARTISAN: "Orfebre",
  BUYER: "Comprador",
  ADMIN: "Casa Orfebre",
};

const ROLE_COLORS: Record<string, string> = {
  ARTISAN: "bg-amber-50 border-amber-200",
  BUYER: "bg-blue-50 border-blue-200",
  ADMIN: "bg-purple-50 border-purple-200",
};

export function OrderChat({
  orderItemId,
  currentUserId,
  currentUserRole,
  messages: initialMessages,
  readOnly = false,
}: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit() {
    if (!content.trim() || isPending) return;
    setError(null);

    const formData = new FormData();
    formData.set("orderItemId", orderItemId);
    formData.set("content", content.trim());

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      senderRole: currentUserRole,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      readAt: null,
      sender: { name: "Tú", image: null },
      senderId: currentUserId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setContent("");

    startTransition(async () => {
      const result = await sendOrderMessage(formData);
      if (result.error) {
        setError(result.error);
        // Remover mensaje optimista
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      }
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = content.length;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-text">
          Mensajes del pedido
        </h3>
        <span className="text-xs text-text-tertiary">
          {messages.length} {messages.length === 1 ? "mensaje" : "mensajes"}
        </span>
      </div>

      {/* Messages area */}
      <div className="max-h-80 min-h-[120px] overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">
            {readOnly
              ? "No hay mensajes en este pedido."
              : "Inicia una conversación sobre este pedido."}
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg border px-3 py-2 ${
                      isMine
                        ? "border-accent/30 bg-accent/5"
                        : ROLE_COLORS[msg.senderRole] || "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-text-secondary">
                        {isMine ? "Tú" : (msg.sender.name || ROLE_LABELS[msg.senderRole])}
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        {ROLE_LABELS[msg.senderRole]}
                      </span>
                    </div>
                    <p className="text-sm text-text whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-[10px] text-text-tertiary">
                        {new Date(msg.createdAt).toLocaleString("es-CL", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMine && msg.readAt && (
                        <span className="text-[10px] text-green-600">✓ Leído</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Input area (no readOnly) */}
      {!readOnly && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              maxLength={1000}
              rows={2}
              className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
              className="self-end rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "..." : "Enviar"}
            </button>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[10px] text-text-tertiary">
              No se permite compartir datos de contacto
            </p>
            <span className={`text-[10px] ${charCount > 900 ? "text-red-500" : "text-text-tertiary"}`}>
              {charCount}/1000
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
