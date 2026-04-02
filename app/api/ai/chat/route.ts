import { NextRequest } from "next/server";
import { chat } from "@/lib/ai/shopping-assistant";

// Simple in-memory rate limiting (per IP, 20 messages/hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  console.log("[Chat] OPENAI_API_KEY configured:", !!process.env.OPENAI_API_KEY);
  console.log("[Chat] ANTHROPIC_API_KEY configured:", !!process.env.ANTHROPIC_API_KEY);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Has alcanzado el límite de mensajes. Intenta de nuevo en una hora." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { messages, sessionContext } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content || !["user", "assistant"].includes(msg.role)) {
        return Response.json({ error: "Invalid message format" }, { status: 400 });
      }
    }

    const result = await chat({ messages, sessionContext });

    return Response.json(result);
  } catch (e) {
    console.error("Chat API error:", e);
    return Response.json(
      { error: "Error procesando tu mensaje. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
