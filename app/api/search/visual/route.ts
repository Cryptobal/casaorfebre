import { NextRequest } from "next/server";
import { searchByImage } from "@/lib/ai/visual-search";

// Simple in-memory rate limiting (5 visual searches per IP per hour)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Has alcanzado el límite de búsquedas visuales. Intenta en una hora." },
      { status: 429 },
    );
  }

  try {
    const { image, mediaType } = await req.json();

    if (!image || typeof image !== "string") {
      return Response.json({ error: "image (base64) required" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!mediaType || !validTypes.includes(mediaType)) {
      return Response.json({ error: "Invalid mediaType" }, { status: 400 });
    }

    // Limit image size (~5MB in base64)
    if (image.length > 7_000_000) {
      return Response.json({ error: "Imagen demasiado grande. Máximo 5MB." }, { status: 400 });
    }

    const result = await searchByImage(image, mediaType);

    return Response.json(result);
  } catch (e) {
    console.error("Visual search error:", e);
    return Response.json(
      { error: "Error procesando la búsqueda visual" },
      { status: 500 },
    );
  }
}
