import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/oauth/mercadopago/callback
 * MercadoPago redirects here after the artisan authorizes the app.
 * Exchanges the authorization code for access + refresh tokens.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // artisan ID

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Validate session — the artisan must be logged in
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  if (!code || !state) {
    console.error("[oauth/mp/callback] Missing code or state");
    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_error=missing_params", appUrl)
    );
  }

  // Verify the artisan belongs to the logged-in user
  const artisan = await prisma.artisan.findUnique({
    where: { id: state },
    select: { id: true, userId: true },
  });

  if (!artisan || artisan.userId !== session.user.id) {
    console.error("[oauth/mp/callback] Artisan mismatch or not found");
    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_error=unauthorized", appUrl)
    );
  }

  // Exchange authorization code for tokens
  try {
    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.MP_APP_ID,
        client_secret: process.env.MP_APP_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.MP_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("[oauth/mp/callback] Token exchange failed:", tokenResponse.status, errorBody);
      return NextResponse.redirect(
        new URL("/portal/orfebre?mp_error=token_exchange", appUrl)
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, user_id, expires_in } = tokenData;

    if (!access_token) {
      console.error("[oauth/mp/callback] No access_token in response");
      return NextResponse.redirect(
        new URL("/portal/orfebre?mp_error=no_token", appUrl)
      );
    }

    // Save tokens to the artisan record
    await prisma.artisan.update({
      where: { id: artisan.id },
      data: {
        mpAccessToken: access_token,
        mpRefreshToken: refresh_token || null,
        mpUserId: user_id ? String(user_id) : null,
        mpOnboarded: true,
        mpTokenExpiresAt: expires_in
          ? new Date(Date.now() + expires_in * 1000)
          : null,
      },
    });

    console.log(`[oauth/mp/callback] Artisan ${artisan.id} connected MP user ${user_id}`);

    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_success=true", appUrl)
    );
  } catch (error) {
    console.error("[oauth/mp/callback] Error:", error);
    return NextResponse.redirect(
      new URL("/portal/orfebre?mp_error=server_error", appUrl)
    );
  }
}
