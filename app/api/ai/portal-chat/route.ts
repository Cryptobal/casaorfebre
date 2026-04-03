import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { portalChat } from "@/lib/ai/portal-assistant";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!checkRateLimit(session.user.id)) {
    return Response.json(
      { error: "Has alcanzado el límite de mensajes. Intenta de nuevo en una hora." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { messages, portalContext } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Messages required" }, { status: 400 });
    }

    if (!["orfebre", "comprador", "admin"].includes(portalContext)) {
      return Response.json({ error: "Invalid portal context" }, { status: 400 });
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || !["user", "assistant"].includes(msg.role)) {
        return Response.json({ error: "Invalid message format" }, { status: 400 });
      }
    }

    const result = await portalChat({ messages, portalContext });
    return Response.json(result);
  } catch (e) {
    console.error("Portal chat error:", e);
    return Response.json(
      { error: "Error procesando tu mensaje. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
