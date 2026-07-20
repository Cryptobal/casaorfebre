"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProductCard {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  artisanName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  productSlugs?: string[];
  products?: ProductCard[];
}

interface RawStreamEvent {
  type?: string;
  delta?: string;
  reply?: string;
  products?: ProductCard[];
  message?: string;
}

/* ------------------------------------------------------------------ */
/*  Open API — abre el asistente desde cualquier parte (misma idea     */
/*  que OPEN_SEARCH_EVENT del search-modal)                            */
/* ------------------------------------------------------------------ */

export const OPEN_CHAT_EVENT = "casaorfebre:open-chat";

/** Abre el asistente desde cualquier parte. Si se pasa initialMessage, lo envía al abrir. */
export function openShoppingChat(initialMessage?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(OPEN_CHAT_EVENT, { detail: { initialMessage } }),
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Identidad                                                          */
/* ------------------------------------------------------------------ */

/** Nombre del asistente — cambiar aquí si Carlos y Camila prefieren otro. */
const ASSISTANT_NAME = "Aura";

/** Avatar reutilizable (header, tarjeta de bienvenida y fila IA del buscador). */
export function AssistantAvatar({ size = 32 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background:
          "radial-gradient(circle at 32% 26%, var(--color-accent-light), var(--color-accent) 58%, var(--color-accent-dark))",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1.5px 3px rgba(0,0,0,0.2)",
      }}
    >
      ✦
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Cards within chat                                          */
/* ------------------------------------------------------------------ */

function ChatProductCards({ products }: { products: ProductCard[] }) {
  if (products.length === 0) return null;

  return (
    <div className="relative pt-2">
      <div
        className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 scrollbar-thin"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {products.map((p) => (
          <a
            key={p.slug}
            href={`/coleccion/${p.slug}`}
            className="flex w-[164px] min-w-[164px] snap-start flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-surface-alt">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="164px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-text-tertiary">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-2.5">
              <p className="line-clamp-2 font-serif text-[13px] leading-snug text-text">
                {p.name}
              </p>
              <p className="mt-0.5 text-[10px] text-text-tertiary">
                {p.artisanName}
              </p>
              <div className="mt-auto flex items-center justify-between pt-1.5">
                <span className="text-[13px] font-medium text-accent">
                  {formatCLP(p.price)}
                </span>
                <span aria-hidden className="text-text-tertiary">
                  →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      {products.length > 2 && (
        <p className="mt-1 text-center text-[10px] text-text-tertiary">
          Desliza para ver más →
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Simple markdown-to-text stripper (removes ** and *)                */
/* ------------------------------------------------------------------ */

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1");
}

/* ------------------------------------------------------------------ */
/*  Typing dots (mientras aún no llega texto)                          */
/* ------------------------------------------------------------------ */

function TypingDots() {
  return (
    <span className="flex gap-1 py-0.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Follow-up suggestions                                              */
/* ------------------------------------------------------------------ */

const FOLLOWUP_POOL = [
  ["¿Te gustó algo?", "¿Quieres ver más opciones?"],
  ["¿Buscas otro estilo?", "¿Puedo ayudarte con algo más?"],
  ["¿Quieres más detalles?", "¿Seguimos buscando?"],
];

function getFollowups(msgIndex: number): string[] {
  return FOLLOWUP_POOL[msgIndex % FOLLOWUP_POOL.length];
}

/* ------------------------------------------------------------------ */
/*  Welcome + suggestions                                              */
/* ------------------------------------------------------------------ */

const WELCOME_MESSAGE =
  "¡Hola! Soy tu asistente de Casa Orfebre. ¿Buscas una joya especial o necesitas ayuda para elegir un regalo? ✨";

const ALL_SUGGESTIONS = [
  "Anillos de plata",
  "Regalo para ella",
  "Aros minimalistas",
  "Colgantes de autor",
  "Collares artesanales",
  "Pulseras de plata",
  "Joyas para regalar",
  "Plata 950",
  "Joyas rústicas",
  "Aros de plata",
  "Anillos orgánicos",
  "Regalo de aniversario",
];

/** Chips de intención rápida — envían el mensaje literal a Aura. */
const INTENT_CHIPS: { label: string; message: string }[] = [
  { label: "Regalo bajo $30.000", message: "Quiero un regalo bajo $30.000" },
  { label: "Novedades", message: "Muéstrame las novedades" },
  { label: "Sorpréndeme ✦", message: "Sorpréndeme con algo especial" },
];

function pickSuggestions(count: number): string[] {
  const shuffled = [...ALL_SUGGESTIONS];
  // Fisher-Yates shuffle seeded by the current hour so it rotates
  const seed = new Date().getHours();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 7 + 13) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/* ------------------------------------------------------------------ */
/*  Main Chatbot Component                                             */
/* ------------------------------------------------------------------ */

export function ShoppingChatbot() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingText, setPendingText] = useState<string | null>(null);
  const [productCache, setProductCache] = useState<Record<string, ProductCard>>({});
  const [suggestions] = useState(() => pickSuggestions(4));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* -------------------- callbacks -------------------- */

  const cacheProducts = useCallback((prods: ProductCard[]) => {
    if (prods.length === 0) return;
    setProductCache((prev) => {
      const next = { ...prev };
      for (const p of prods) next[p.slug] = p;
      return next;
    });
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      if (!text || loading) return;

      const userMessage: ChatMessage = { role: "user", content: text };
      const payloadMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Push del mensaje de usuario + placeholder del asistente (para streaming).
      setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
      setInput("");
      setLoading(true);

      // Actualiza en sitio el último mensaje del asistente (el placeholder).
      const updateLast = (updater: (m: ChatMessage) => ChatMessage) => {
        setMessages((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].role === "assistant") {
              next[i] = updater(next[i]);
              break;
            }
          }
          return next;
        });
      };

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payloadMessages }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let msg = "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?";
          try {
            const err = await res.json();
            if (err?.error) msg = err.error;
          } catch {
            /* ignore */
          }
          updateLast((m) => ({ ...m, content: msg }));
          return;
        }

        const contentType = res.headers.get("content-type") ?? "";

        // Fallback: shape JSON antiguo (si por algo no es event-stream).
        if (!contentType.includes("text/event-stream") || !res.body) {
          const data = await res.json();
          const prods: ProductCard[] = data.products ?? [];
          cacheProducts(prods);
          updateLast((m) => ({
            ...m,
            content: data.reply ?? "",
            products: prods,
            productSlugs: prods.length ? prods.map((p) => p.slug) : data.productSlugs,
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr) continue;

            let evt: RawStreamEvent;
            try {
              evt = JSON.parse(jsonStr) as RawStreamEvent;
            } catch {
              continue;
            }

            if (evt.type === "text") {
              acc += evt.delta ?? "";
              // Oculta el tag [PRODUCTS:…] mientras llega parcialmente.
              const visible = acc.replace(/\[PRODUCTS:[^\]]*\]?\s*$/i, "").trimEnd();
              updateLast((m) => ({ ...m, content: visible }));
            } else if (evt.type === "done") {
              const prods: ProductCard[] = evt.products ?? [];
              cacheProducts(prods);
              updateLast((m) => ({
                ...m,
                content: evt.reply ?? acc,
                products: prods,
                productSlugs: prods.map((p) => p.slug),
              }));
            } else if (evt.type === "error") {
              updateLast((m) => ({
                ...m,
                content:
                  evt.message ?? "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?",
              }));
            }
          }
        }
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        updateLast((m) => ({
          ...m,
          content: "Lo siento, tuve un problema. ¿Puedes intentar de nuevo?",
        }));
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, messages, cacheProducts],
  );

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendText(text);
  }, [input, sendText]);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setMessages([{ role: "assistant", content: WELCOME_MESSAGE }]);
    try {
      sessionStorage.removeItem("co-chat-messages");
    } catch {
      /* ignore */
    }
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    setOpen(false);
  }, []);

  /* -------------------- effects -------------------- */

  // Show button after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Restore messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("co-chat-messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
      const savedProducts = sessionStorage.getItem("co-chat-products");
      if (savedProducts) setProductCache(JSON.parse(savedProducts));
    } catch {
      /* ignore */
    }
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("co-chat-messages", JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem("co-chat-products", JSON.stringify(productCache));
    } catch {
      /* ignore */
    }
  }, [productCache]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Abrir el asistente vía evento global (gema del tab bar, buscador, etc.)
  useEffect(() => {
    function handleOpen(e: Event) {
      const detail = (e as CustomEvent<{ initialMessage?: string }>).detail;
      setOpen(true);
      setVisible(true);
      if (detail?.initialMessage) setPendingText(detail.initialMessage);
    }
    window.addEventListener(OPEN_CHAT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handleOpen);
  }, []);

  // Despacha el mensaje pendiente una sola vez cuando el panel está abierto.
  useEffect(() => {
    if (open && pendingText && !loading) {
      const text = pendingText;
      setPendingText(null);
      sendText(text);
    }
  }, [open, pendingText, loading, sendText]);

  // Aborta cualquier stream en curso al desmontar.
  useEffect(() => () => abortRef.current?.abort(), []);

  /* -------------------- derived -------------------- */

  const assistantCount = messages.filter((m) => m.role === "assistant").length;
  const lastMsg = messages[messages.length - 1];
  const showFollowups =
    !loading &&
    lastMsg?.role === "assistant" &&
    messages.length > 1 &&
    (lastMsg?.content ?? "") !== "";
  const showWelcomeCard =
    messages.length === 1 && messages[0]?.role === "assistant";

  return (
    <>
      {/* Floating button (solo desktop; en móvil el punto de entrada es la gema del tab bar) */}
      <div
        className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 transition-all duration-500 md:flex"
        style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
      >
        {!open && (
          <span className="hidden rounded-full border border-border/60 bg-surface/90 px-3 py-1.5 text-[11px] text-accent/70 shadow-sm backdrop-blur-sm sm:block">
            ¿Buscas algo? Pregúntame
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Asistente de compras con IA"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg transition-all hover:scale-105 sm:h-14 sm:w-14"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <span className="text-lg font-medium text-white">✦</span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl
            max-md:inset-0 max-md:rounded-none max-md:border-0
            md:bottom-24 md:right-6 md:h-[500px] md:w-[400px]"
          style={{ maxHeight: "100dvh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <AssistantAvatar size={30} />
              <div className="flex flex-col">
                <span className="font-serif text-sm text-text">
                  {ASSISTANT_NAME} · Casa Orfebre
                </span>
                <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3E7C59]" />
                  En línea
                </span>
              </div>
            </div>
            <div className="-mr-1.5 flex items-center">
              <button
                type="button"
                onClick={clearConversation}
                className="flex h-11 w-11 items-center justify-center rounded-full text-text-tertiary transition-colors hover:text-text"
                aria-label="Nueva conversación"
                title="Nueva conversación"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-11 w-11 items-center justify-center rounded-full text-text-tertiary transition-colors hover:text-text"
                aria-label="Cerrar chat"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3">
            {showWelcomeCard ? (
              /* Tarjeta de bienvenida */
              <div className="rounded-2xl border border-border bg-surface-alt/60 p-4">
                <AssistantAvatar size={40} />
                <p className="mt-3 font-serif text-base text-text">
                  Hola, soy {ASSISTANT_NAME} ✦
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  Tu asesora personal de Casa Orfebre. Cuéntame qué buscas —una joya, un
                  regalo, un estilo— y te muestro piezas de nuestros orfebres.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendText(s)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex flex-wrap gap-2">
                  {INTENT_CHIPS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => sendText(c.message)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                const cards =
                  msg.products ??
                  (msg.productSlugs
                    ? msg.productSlugs
                        .map((slug) => productCache[slug])
                        .filter(Boolean)
                    : []);
                const streamingEmpty =
                  isLast && loading && msg.role === "assistant" && msg.content === "";

                return (
                  <div key={i}>
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-accent text-white"
                            : "bg-surface-alt text-text"
                        }`}
                      >
                        {streamingEmpty ? (
                          <TypingDots />
                        ) : (
                          <>
                            {stripMarkdown(msg.content)}
                            {isLast &&
                              loading &&
                              msg.role === "assistant" &&
                              msg.content !== "" && (
                                <span className="ml-0.5 animate-pulse">▍</span>
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    {cards.length > 0 && <ChatProductCards products={cards} />}

                    {/* Follow-up suggestions after each assistant response */}
                    {isLast && i > 0 && msg.role === "assistant" && showFollowups && (
                      <div className="mt-2 flex flex-wrap gap-2 px-1">
                        {getFollowups(assistantCount).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => sendText(s)}
                            className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] text-text-secondary transition-colors hover:border-accent hover:text-accent"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 border-t border-border bg-surface px-3 py-2"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
          >
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
                placeholder="Escribe tu mensaje..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary outline-none focus:border-accent"
                style={{ fontSize: "16px" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
