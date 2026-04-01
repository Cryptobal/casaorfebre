import { NextResponse } from "next/server";
import { pinterestClient } from "@/lib/pinterest";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    !process.env.PINTEREST_ACCESS_TOKEN &&
    !process.env.PINTEREST_APP_ID
  ) {
    return NextResponse.json({ message: "Pinterest not configured" });
  }

  // Verify current token
  const isValid = await pinterestClient.verifyToken();

  if (isValid) {
    // Token still works — refresh proactively to extend expiry
    const refreshed = await pinterestClient.refreshToken();
    return NextResponse.json({
      status: refreshed ? "ok" : "refresh_failed",
      message: refreshed
        ? "Token válido y refrescado proactivamente"
        : "Token válido pero no se pudo refrescar",
    });
  }

  // Token invalid — attempt recovery
  const recovered = await pinterestClient.refreshToken();
  return NextResponse.json({
    status: recovered ? "recovered" : "failed",
    message: recovered
      ? "Token expirado, recuperado exitosamente"
      : "Token expirado, no se pudo recuperar",
  });
}
