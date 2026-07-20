import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_SONNET } from "@/lib/ai/models";
import {
  prepareChat,
  parseProductSlugs,
  fetchProductCards,
} from "@/lib/ai/shopping-assistant";

export const maxDuration = 60;

let _anthropic: Anthropic | null = null;
function getAnthropic() {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _anthropic;
}

const hasUpstash = Boolean(
  (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
  (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN),
);

// Fallback en memoria SOLO para dev sin Upstash (20/h por IP)
const memMap = new Map<string, { count: number; resetAt: number }>();
function memAllow(ip: string): boolean {
  const now = Date.now();
  const e = memMap.get(ip);
  if (!e || now > e.resetAt) { memMap.set(ip, { count: 1, resetAt: now + 3600_000 }); return true; }
  if (e.count >= 20) return false;
  e.count++; return true;
}

async function allowRequest(ip: string): Promise<boolean> {
  if (!hasUpstash) return memAllow(ip);
  const { aiShoppingChatLimiter } = await import("@/lib/rate-limit");
  const { success } = await aiShoppingChatLimiter.limit(ip);
  return success;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!(await allowRequest(ip))) {
    return Response.json(
      { error: "Has alcanzado el límite de mensajes. Intenta de nuevo en una hora." },
      { status: 429 },
    );
  }

  let body: { messages?: unknown; sessionContext?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 });
  }
  for (const msg of messages) {
    if (!msg?.role || typeof msg.content !== "string" || !["user", "assistant"].includes(msg.role)) {
      return Response.json({ error: "Invalid message format" }, { status: 400 });
    }
  }

  const prepared = await prepareChat({
    messages,
    sessionContext: body.sessionContext as { viewingProductId?: string } | undefined,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        const stream = getAnthropic().messages.stream({
          model: CLAUDE_SONNET,
          max_tokens: 512,
          system: prepared.system,
          messages: prepared.anthropicMessages,
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ type: "text", delta: event.delta.text });
          }
        }

        const final = await stream.finalMessage();
        const fullText = final.content[0]?.type === "text" ? final.content[0].text : "";
        const { cleanReply, slugs } = parseProductSlugs(fullText);
        const products = slugs.length > 0 ? await fetchProductCards(slugs) : [];
        send({ type: "done", reply: cleanReply, products });
      } catch (e) {
        console.error("Chat stream error:", e);
        send({ type: "error", message: "Tuve un problema. ¿Puedes intentar de nuevo?" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
