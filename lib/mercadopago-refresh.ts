import { prisma } from "@/lib/prisma";

/**
 * Refreshes an artisan's MercadoPago OAuth tokens using their refresh_token.
 * Returns true if successful, false otherwise.
 */
export async function refreshArtisanToken(artisanId: string): Promise<boolean> {
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: { mpRefreshToken: true },
  });

  if (!artisan?.mpRefreshToken) {
    console.warn(`[mp-refresh] No refresh token for artisan ${artisanId}`);
    return false;
  }

  try {
    const refreshBody = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.MP_APP_ID!,
      client_secret: process.env.MP_APP_SECRET!,
      refresh_token: artisan.mpRefreshToken,
    });

    const res = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: refreshBody.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[mp-refresh] Token refresh failed for artisan ${artisanId}:`, res.status, body);
      return false;
    }

    const data = await res.json();

    await prisma.artisan.update({
      where: { id: artisanId },
      data: {
        mpAccessToken: data.access_token,
        mpRefreshToken: data.refresh_token || artisan.mpRefreshToken,
        mpTokenExpiresAt: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000)
          : null,
      },
    });

    console.log(`[mp-refresh] Token refreshed for artisan ${artisanId}`);
    return true;
  } catch (err) {
    console.error(`[mp-refresh] Error refreshing token for artisan ${artisanId}:`, err);
    return false;
  }
}

/**
 * Ensures the artisan has a valid (non-expired) access token.
 * Refreshes proactively if expiring within 7 days.
 * Returns the valid access token or null if refresh fails.
 */
export async function ensureValidToken(artisanId: string): Promise<string | null> {
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: { mpAccessToken: true, mpTokenExpiresAt: true },
  });

  if (!artisan?.mpAccessToken) return null;

  // If no expiry tracked, assume valid (legacy tokens before this feature)
  if (!artisan.mpTokenExpiresAt) return artisan.mpAccessToken;

  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (artisan.mpTokenExpiresAt > sevenDaysFromNow) {
    return artisan.mpAccessToken;
  }

  // Token expiring soon — try to refresh
  console.log(`[mp-refresh] Token expiring soon for artisan ${artisanId}, refreshing...`);
  const refreshed = await refreshArtisanToken(artisanId);

  if (refreshed) {
    const updated = await prisma.artisan.findUnique({
      where: { id: artisanId },
      select: { mpAccessToken: true },
    });
    return updated?.mpAccessToken ?? null;
  }

  // Refresh failed but token might still be valid
  if (artisan.mpTokenExpiresAt > new Date()) {
    console.warn(`[mp-refresh] Refresh failed but token still valid for artisan ${artisanId}`);
    return artisan.mpAccessToken;
  }

  return null;
}
