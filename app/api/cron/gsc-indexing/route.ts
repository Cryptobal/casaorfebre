import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getGoogleAccessToken,
  submitUrlToGSC,
  submitToIndexNow,
  pingSitemaps,
} from "@/lib/seo/gsc-indexing";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<{
    url: string;
    source: string;
    gsc: boolean;
    gscStatus?: number;
    error?: string;
  }> = [];

  // ── 1. Recopila URLs nuevas de las últimas 25 horas ──────────────────────
  const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000);
  const urlSet = new Set<string>();

  // Blog posts publicados hoy
  const newPosts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: cutoff } },
    select: { slug: true },
  });
  newPosts.forEach((p) => urlSet.add(`${BASE_URL}/blog/${p.slug}`));

  // Productos aprobados hoy
  const newProducts = await prisma.product.findMany({
    where: { status: "APPROVED", publishedAt: { gte: cutoff } },
    select: { slug: true },
  });
  newProducts.forEach((p) => urlSet.add(`${BASE_URL}/coleccion/${p.slug}`));

  // Orfebres aprobados hoy
  const newArtisans = await prisma.artisan.findMany({
    where: { status: "APPROVED", createdAt: { gte: cutoff } },
    select: { slug: true },
  });
  newArtisans.forEach((a) => urlSet.add(`${BASE_URL}/orfebres/${a.slug}`));

  // URL guardada por el blog-auto-generate (máxima prioridad)
  const lastBlogSetting = await prisma.systemSetting.findUnique({
    where: { key: "LAST_BLOG_URL_GENERATED" },
  });
  if (lastBlogSetting?.value) {
    urlSet.add(lastBlogSetting.value);
  }

  const urlsToIndex = Array.from(urlSet);

  if (urlsToIndex.length === 0) {
    // Aun sin URLs nuevas: pingea el sitemap para mantener el crawl activo
    await pingSitemaps();
    return NextResponse.json({
      message: "Sin URLs nuevas — sitemap pingeado",
      skipped: true,
    });
  }

  // ── 2. Obtiene token de Google (una vez para todas las URLs) ──────────────
  const token = await getGoogleAccessToken();
  let gscSubmitted = 0;
  let gscFailed = 0;

  // ── 3. Envía cada URL a GSC + respeta rate limit (200 req/día) ───────────
  for (const url of urlsToIndex) {
    const source = url.includes("/blog/")
      ? "blog"
      : url.includes("/coleccion/")
        ? "product"
        : url.includes("/orfebres/")
          ? "artisan"
          : "other";

    let gscOk = false;
    let gscStatus: number | undefined;
    let error: string | undefined;

    if (token) {
      const result = await submitUrlToGSC(token, url);
      gscOk = result.ok;
      gscStatus = result.status;
      error = result.error;
      if (gscOk) gscSubmitted++;
      else gscFailed++;
    }

    results.push({ url, source, gsc: gscOk, gscStatus, error });

    // Pausa 500ms entre requests para no saturar la API
    if (urlsToIndex.indexOf(url) < urlsToIndex.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // ── 4. IndexNow (Bing, Yandex, otros motores simultáneamente) ────────────
  const indexNowOk = await submitToIndexNow(urlsToIndex);

  // ── 5. Ping sitemap a Google y Bing ──────────────────────────────────────
  await pingSitemaps();

  // ── 6. Limpia el registro de última URL para evitar re-envíos ────────────
  await prisma.systemSetting.upsert({
    where: { key: "LAST_BLOG_URL_GENERATED" },
    update: { value: "" },
    create: { key: "LAST_BLOG_URL_GENERATED", value: "" },
  });

  // ── 7. Log resumen ────────────────────────────────────────────────────────
  console.log(
    `[CRON] gsc-indexing: ${urlsToIndex.length} URLs | GSC: ${gscSubmitted} ok / ${gscFailed} err | IndexNow: ${indexNowOk}`
  );

  return NextResponse.json({
    message: "Indexing sweep completado",
    urlsProcessed: urlsToIndex.length,
    gscSubmitted,
    gscFailed,
    gscEnabled: !!token,
    indexNow: indexNowOk,
    sitemapPinged: true,
    results,
  });
}
