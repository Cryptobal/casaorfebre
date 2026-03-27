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
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });

  if (!artisan || artisan.status !== "APPROVED") {
    return NextResponse.redirect(new URL("/portal/orfebre", process.env.NEXT_PUBLIC_APP_URL));
  }

  const appId = process.env.MP_APP_ID;
  const redirectUri = process.env.MP_REDIRECT_URI;

  if (!appId || !redirectUri) {
    console.error("[oauth/mp] MP_APP_ID or MP_REDIRECT_URI not configured");
    return NextResponse.redirect(
      new URL("/portal/orfebre?error=config", process.env.NEXT_PUBLIC_APP_URL)
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
