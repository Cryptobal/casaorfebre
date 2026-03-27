import { handlers } from "@/lib/auth";
import { authLimiter } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  // Rate limit: 5 auth attempts/min per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { success } = await authLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  return handlers.POST(request);
}
