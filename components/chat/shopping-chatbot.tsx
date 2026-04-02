"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatCLP } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  productSlugs?: string[];
}

interface ProductCard {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  artisanName: string;
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
            className="flex w-[150px] min-w-[150px] snap-start flex-col overflow-hidden rounded-lg border border-[#e8e5df] bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square w-full bg-[#f5f3ef]">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#9e9a90]">
                  Sin imagen
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 font-serif text-xs leading-tight text-[#1a1a18]">
                {p.name}
              </p>
              <p className="mt-0.5 text-[10px] text-[#9e9a90]">{p.artisanName}</p>
              <p className="mt-1 text-xs font-medium text-[#8B7355]">
                {formatCLP(p.price)}
              </p>
            </div>
          </a>
        ))}
      </div>
      {products.length > 2 && (
        <div className="mt-1 flex justify-center gap-1">
          {products.map((p, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-[#8B7355]/30"
            />
          ))}
        </div>
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
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8B7355]/50" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Chatbot Component                                             */
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

export function ShoppingChatbot() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [productCache, setProductCache] = useState<Record<string, ProductCard>>({});
  const [suggestions] = useState(() => pickSuggestions(4));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    } catch { /* ignore */ }
  }, []);

  // Save messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("co-chat-messages", JSON.stringify(messages));
    } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem("co-chat-products", JSON.stringify(productCache));
    } catch { /* ignore */ }
  }, [productCache]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const fetchProductCards = useCallback(
    async (slugs: string[]) => {
      const missing = slugs.filter((s) => !productCache[s]);
      if (missing.length === 0) return;

      try {
        const res = await fetch(
          `/api/public/products?${missing.map((s) => `slug=${encodeURIComponent(s)}`).join("&")}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const newCache: Record<string, ProductCard> = { ...productCache };
        for (const p of data.products ?? []) {
          newCache[p.slug] = {
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.mainImage,
            artisanName: p.artisanName,
          };
        }
        setProductCache(newCache);
      } catch { /* ignore */ }
    },
    [productCache],
  );

  const sendText = useCallback(async (text: string) => {
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error");
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
        productSlugs: data.productSlugs,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.productSlugs?.length) {
        fetchProductCards(data.productSlugs);
      }
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
  }, [loading, messages, fetchProductCards]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    sendText(text);
  }, [input, sendText]);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Abrir chat de compras"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-500 hover:scale-105 sm:h-14 sm:w-14"
        style={{
          backgroundColor: "#8B7355",
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span className="text-lg text-white font-medium">✦</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden rounded-xl border border-[#e8e5df] bg-white shadow-2xl
            max-md:inset-0 max-md:rounded-none max-md:border-0
            md:bottom-24 md:right-6 md:h-[500px] md:w-[400px]"
          style={{ maxHeight: "100dvh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e8e5df] bg-[#FAFAF8] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[#8B7355]">✦</span>
              <span className="font-serif text-sm font-medium text-[#1a1a18]">
                Casa Orfebre
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#9e9a90] hover:text-[#1a1a18] transition-colors"
              aria-label="Cerrar chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#8B7355] text-white"
                        : "bg-[#f5f3ef] text-[#1a1a18]"
                    }`}
                    style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)" }}
                  >
                    {stripMarkdown(msg.content)}
                  </div>
                </div>
                {msg.productSlugs && msg.productSlugs.length > 0 && (
                  <ChatProductCards
                    products={msg.productSlugs
                      .map((slug) => productCache[slug])
                      .filter(Boolean)}
                  />
                )}
                {i === 0 && msg.role === "assistant" && !loading && messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 px-1 mt-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => sendText(suggestion)}
                        className="rounded-full border border-[#e8e5df] bg-white px-3 py-1.5 text-xs text-[#6b6860] hover:border-[#8B7355] hover:text-[#8B7355] transition-colors"
                      >
                        {suggestion}
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
          <div
            className="shrink-0 border-t border-[#e8e5df] bg-[#FAFAF8] px-3 py-2"
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
                className="flex-1 rounded-lg border border-[#e8e5df] bg-white px-3 py-2 text-sm text-[#1a1a18] placeholder:text-[#9e9a90] outline-none focus:border-[#8B7355]/50"
                style={{ fontFamily: "var(--font-outfit, Outfit, sans-serif)", fontSize: "16px" }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8B7355] text-white transition-colors hover:bg-[#7a6549] disabled:opacity-50"
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
