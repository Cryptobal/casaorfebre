import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/oauth/mercadopago
 * Redirects the artisan to MercadoPago's OAuth authorization page.
 * The artisan's ID is passed as `state` so we can link the tokens on callback.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl"));
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_error=not_approved", process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl")
    );
  }

  const appId = process.env.MP_APP_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
  // Use MP_REDIRECT_URI if explicitly set, otherwise build from app URL
  const redirectUri =
    process.env.MP_REDIRECT_URI && !process.env.MP_REDIRECT_URI.includes("localhost")
      ? process.env.MP_REDIRECT_URI
      : `${appUrl}/api/oauth/mercadopago/callback`;

  if (!appId) {
    console.error("[oauth/mp] MP_APP_ID not configured");
    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_error=config", appUrl)
    );
  }

  const authUrl = new URL("https://auth.mercadopago.cl/authorization");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("platform_id", "mp");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", artisan.id);

  return NextResponse.redirect(authUrl.toString());
}
