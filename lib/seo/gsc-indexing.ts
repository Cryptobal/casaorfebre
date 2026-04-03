import { createSign } from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const INDEXING_API = "https://indexing.googleapis.com/v3/urlNotifications:publish";

// ── JWT con Service Account de Google ────────────────────────────────────────
export async function getGoogleAccessToken(): Promise<string | null> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !rawKey) {
    console.warn("[GSC] GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY no configurados");
    return null;
  }

  // Vercel escapa los saltos de línea — los restauramos
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const signingInput = `${header}.${payload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(privateKey, "base64url");
  const jwt = `${signingInput}.${signature}`;

  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[GSC] Token error ${res.status}: ${err}`);
      return null;
    }

    const data = await res.json();
    return data.access_token as string;
  } catch (err) {
    console.error("[GSC] Token fetch failed:", err);
    return null;
  }
}

// ── Envía una URL a la GSC Indexing API ────────────────────────────────────
export async function submitUrlToGSC(
  token: string,
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(INDEXING_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[GSC] Submit error ${res.status} for ${url}: ${err}`);
      return { ok: false, status: res.status, error: err };
    }

    console.log(`[GSC] Indexado: ${url}`);
    return { ok: true, status: res.status };
  } catch (err) {
    console.error(`[GSC] Submit failed for ${url}:`, err);
    return { ok: false, error: String(err) };
  }
}

// ── IndexNow: notifica a Bing, Yandex y otros motores ─────────────────────
export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return false;

  const host = new URL(BASE_URL).hostname;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, urlList: urls.slice(0, 10000) }),
    });

    if (!res.ok) {
      console.warn(`[IndexNow] Error ${res.status}: ${await res.text()}`);
      return false;
    }

    console.log(`[IndexNow] ${urls.length} URLs enviadas`);
    return true;
  } catch (err) {
    console.error("[IndexNow] Failed:", err);
    return false;
  }
}

// ── Ping de sitemap a Google y Bing ────────────────────────────────────────
export async function pingSitemaps(): Promise<void> {
  const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
  await Promise.allSettled([
    fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
    fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
  ]);
  console.log("[Sitemap] Pings enviados a Google y Bing");
}
