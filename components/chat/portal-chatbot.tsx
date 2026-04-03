"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGES: Record<string, string> = {
  orfebre:
    "Hola, soy tu asistente AI del portal. Puedo ayudarte a gestionar tus piezas, entender tus estadísticas, usar las herramientas AI y más. ¿En qué te ayudo?",
  comprador:
    "Hola, soy tu asistente AI. Puedo ayudarte con tus pedidos, favoritos, mensajes y cualquier duda sobre tu cuenta. ¿En qué te ayudo?",
  admin:
    "Hola, soy tu asistente AI de administración. Puedo ayudarte con finanzas, ventas, pedidos, orfebres, productos y cualquier consulta operativa. ¿En qué te ayudo?",
};

const SUGGESTIONS: Record<string, string[]> = {
  orfebre: [
    "¿Cómo creo una pieza?",
    "¿Qué herramientas AI tengo?",
    "¿Cómo veo mis ventas?",
    "¿Cómo respondo preguntas?",
  ],
  comprador: [
    "¿Cómo sigo mi pedido?",
    "¿Cómo contacto al orfebre?",
    "¿Cómo uso gift cards?",
    "¿Cómo funcionan los favoritos?",
  ],
  admin: [
    "¿Cómo van las finanzas?",
    "¿Cómo gestiono pedidos?",
    "¿Cómo modero productos?",
    "¿Cómo veo las ventas?",
  ],
};

const FOLLOWUP_SUGGESTIONS: Record<string, string[][]> = {
  orfebre: [
    ["¿Algo más sobre mis piezas?", "¿Cómo mejoro mis ventas?"],
    ["¿Necesitas más detalles?", "¿Tienes otra consulta?"],
    ["¿Te ayudo con otra cosa?", "¿Quieres saber sobre las herramientas AI?"],
  ],
  comprador: [
    ["¿Te fue útil?", "¿Tienes otra pregunta?"],
    ["¿Necesitas más ayuda?", "¿Quieres saber algo más?"],
    ["¿Algo más sobre tu pedido?", "¿Puedo ayudarte con otra cosa?"],
  ],
  admin: [
    ["¿Te fue útil?", "¿Consultar otra área?"],
    ["¿Necesitas más detalle?", "¿Otra consulta operativa?"],
    ["¿Algo más sobre finanzas?", "¿Ver otra métrica?"],
  ],
};

function getFollowups(context: string, msgIndex: number): string[] {
  const pool = FOLLOWUP_SUGGESTIONS[context] || FOLLOWUP_SUGGESTIONS.comprador;
  return pool[msgIndex % pool.length];
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export function PortalChatbot({ portalContext }: { portalContext: "orfebre" | "comprador" | "admin" }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGES[portalContext] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendText = useCallback(
    async (text: string) => {
      if (!text || loading) return;

      const userMsg: ChatMessage = { role: "user", content: text };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai/portal-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updated.map((m) => ({ role: m.role, content: m.content })),
            portalContext,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Error");
        }

        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              e instanceof Error && e.message.includes("límite")
                ? e.message
                : "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, portalContext],
  );

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (text) sendText(text);
  }, [input, sendText]);

  const label =
    portalContext === "orfebre"
      ? "Asistente del Taller"
      : portalContext === "admin"
        ? "Asistente Admin"
        : "Asistente";

  const buttonHint =
    portalContext === "orfebre"
      ? "¿Dudas? Pregúntame"
      : portalContext === "admin"
        ? "Consultas operativas aquí"
        : "¿Necesitas ayuda? Escríbeme";

  // Count assistant messages (excluding welcome) to rotate follow-ups
  const assistantCount = messages.filter((m) => m.role === "assistant").length;
  const lastMsg = messages[messages.length - 1];
  const showFollowups = !loading && lastMsg?.role === "assistant" && messages.length > 1;

  return (
    <>
      {/* Floating button with subtle hint */}
      <div
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      >
        {!open && (
          <span className="hidden rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] text-[#8B7355]/70 shadow-sm border border-[#e8e5df]/60 sm:block">
            {buttonHint}
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={label}
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 sm:h-14 sm:w-14"
          style={{ backgroundColor: "#8B7355" }}
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <span className="text-lg text-white font-medium">✦</span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-[#e8e5df] bg-white shadow-2xl max-md:inset-0 max-md:rounded-none max-md:border-0 md:bottom-24 md:right-6 md:h-[500px] md:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e8e5df] bg-[#FAFAF8] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B7355] text-[10px] font-bold text-white">
                AI
              </span>
              <span className="font-serif text-sm font-medium text-[#1a1a18]">{label}</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#9e9a90] hover:text-[#1a1a18] transition-colors"
              aria-label="Cerrar chat"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#8B7355] text-white"
                        : "bg-[#f5f3ef] text-[#1a1a18]"
                    }`}
                    style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                  >
                    {msg.content}
                  </div>
                </div>
                {/* Initial suggestions on welcome message */}
                {i === 0 &&
                  msg.role === "assistant" &&
                  !loading &&
                  messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 px-1 mt-2">
                      {SUGGESTIONS[portalContext].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => sendText(s)}
                          className="rounded-full border border-[#e8e5df] bg-white px-3 py-1.5 text-xs text-[#6b6860] hover:border-[#8B7355] hover:text-[#8B7355] transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                {/* Follow-up suggestions after each assistant response (except welcome) */}
                {i === messages.length - 1 &&
                  i > 0 &&
                  msg.role === "assistant" &&
                  showFollowups && (
                    <div className="flex flex-wrap gap-2 px-1 mt-2">
                      {getFollowups(portalContext, assistantCount).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => sendText(s)}
                          className="rounded-full border border-[#e8e5df]/80 bg-[#FAFAF8] px-3 py-1.5 text-[11px] text-[#8B7355]/70 hover:border-[#8B7355]/50 hover:text-[#8B7355] transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e8e5df] bg-[#FAFAF8] px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Pregunta lo que necesites..."
                className="flex-1 rounded-lg border border-[#e8e5df] bg-white px-3 py-2 text-sm text-[#1a1a18] placeholder:text-[#9e9a90] outline-none focus:border-[#8B7355]/50"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B7355] text-white transition-colors hover:bg-[#7a6549] disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
