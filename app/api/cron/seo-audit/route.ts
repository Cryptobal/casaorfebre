import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { getAdminEmails } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 120;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

interface CoreWebVitals {
  url: string;
  performance: number;
  lcp: string;
  cls: string;
  fcp: string;
  status: "good" | "needs-improvement" | "poor";
}

interface BrokenLink {
  url: string;
  status: number;
  type: string;
}

interface MetaIssue {
  url: string;
  issue: string;
  value: string;
}

async function checkCoreWebVitals(url: string): Promise<CoreWebVitals | null> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY ?? "";
    const params = new URLSearchParams({
      url,
      strategy: "mobile",
      category: "performance",
      ...(apiKey ? { key: apiKey } : {}),
    });

    const res = await fetch(`${PSI_API}?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const cats = data.lighthouseResult?.categories;
    const audits = data.lighthouseResult?.audits;

    const score = Math.round((cats?.performance?.score ?? 0) * 100);
    const lcp = audits?.["largest-contentful-paint"]?.displayValue ?? "N/A";
    const cls = audits?.["cumulative-layout-shift"]?.displayValue ?? "N/A";
    const fcp = audits?.["first-contentful-paint"]?.displayValue ?? "N/A";

    const status: CoreWebVitals["status"] =
      score >= 90 ? "good" : score >= 50 ? "needs-improvement" : "poor";

    return { url, performance: score, lcp, cls, fcp, status };
  } catch {
    return null;
  }
}

async function checkBrokenLinks(urls: string[]): Promise<BrokenLink[]> {
  const broken: BrokenLink[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(6000),
        redirect: "follow",
      });

      if (res.status === 404 || res.status === 410 || res.status === 500) {
        const type = url.includes("/blog/")
          ? "blog"
          : url.includes("/coleccion/")
            ? "product"
            : url.includes("/orfebres/")
              ? "artisan"
              : "other";
        broken.push({ url, status: res.status, type });
      }
    } catch {
      broken.push({ url, status: 0, type: "timeout" });
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  return broken;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 1. Core Web Vitals en páginas clave ───────────────────────────────────
  const cwvUrls = [
    BASE_URL,
    `${BASE_URL}/coleccion`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/para-orfebres`,
  ];

  const cwvResults: CoreWebVitals[] = [];
  for (const url of cwvUrls) {
    const result = await checkCoreWebVitals(url);
    if (result) cwvResults.push(result);
    await new Promise((r) => setTimeout(r, 1000));
  }

  // ── 2. Broken links — productos y blogs recientes ─────────────────────────
  const [recentProducts, recentPosts, recentArtisans] = await Promise.all([
    prisma.product.findMany({
      where: { status: "APPROVED" },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
    }),
    prisma.artisan.findMany({
      where: { status: "APPROVED" },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const urlsToCheck = [
    ...recentProducts.map((p) => `${BASE_URL}/coleccion/${p.slug}`),
    ...recentPosts.map((p) => `${BASE_URL}/blog/${p.slug}`),
    ...recentArtisans.map((a) => `${BASE_URL}/orfebres/${a.slug}`),
  ];

  const brokenLinks = await checkBrokenLinks(urlsToCheck);

  // ── 3. Meta issues — titles y descriptions fuera de rango ─────────────────
  const metaIssues: MetaIssue[] = [];

  const postsWithMeta = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, seoTitle: true, seoDescription: true, title: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  for (const post of postsWithMeta) {
    const url = `/blog/${post.slug}`;
    const title = post.seoTitle ?? post.title;

    if (title.length > 60) {
      metaIssues.push({ url, issue: "Title demasiado largo", value: `${title.length} chars (máx 60)` });
    }
    if (title.length < 30) {
      metaIssues.push({ url, issue: "Title demasiado corto", value: `${title.length} chars (mín 30)` });
    }
    if (post.seoDescription && post.seoDescription.length > 160) {
      metaIssues.push({ url, issue: "Meta description larga", value: `${post.seoDescription.length} chars (máx 160)` });
    }
    if (!post.seoDescription || post.seoDescription.length < 50) {
      metaIssues.push({ url, issue: "Meta description ausente o muy corta", value: post.seoDescription ? `${post.seoDescription.length} chars` : "vacío" });
    }
  }

  // ── 4. Productos sin descripción SEO ──────────────────────────────────────
  const productsSeoIssues = await prisma.product.count({
    where: {
      status: "APPROVED",
      description: "",
    },
  });

  // ── 5. Imágenes sin alt text ───────────────────────────────────────────────
  const imagesWithoutAlt = await prisma.productImage.count({
    where: {
      OR: [{ altText: null }, { altText: "" }],
      status: "APPROVED",
      product: { status: "APPROVED" },
    },
  });

  // ── 6. Stats generales ────────────────────────────────────────────────────
  const [totalProducts, totalPosts, totalArtisans] = await Promise.all([
    prisma.product.count({ where: { status: "APPROVED" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.artisan.count({ where: { status: "APPROVED" } }),
  ]);

  // ── 7. Genera reporte HTML ────────────────────────────────────────────────
  const now = new Date().toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric",
  });

  const scoreColor = (score: number) =>
    score >= 90 ? "#3B6D11" : score >= 50 ? "#854F0B" : "#A32D2D";

  const statusBadge = (s: CoreWebVitals["status"]) => {
    const map = { good: ["#3B6D11", "Bueno"], "needs-improvement": ["#854F0B", "Mejorar"], poor: ["#A32D2D", "Crítico"] };
    const [color, label] = map[s];
    return `<span style="font-size:11px;color:${color};font-weight:500">${label}</span>`;
  };

  const cwvRows = cwvResults
    .map(
      (r) => `<tr>
      <td style="padding:6px 10px;font-size:12px;color:#6b6860">${r.url.replace(BASE_URL, "") || "/"}</td>
      <td style="padding:6px 10px;font-size:13px;font-weight:500;color:${scoreColor(r.performance)}">${r.performance}</td>
      <td style="padding:6px 10px;font-size:12px">${r.lcp}</td>
      <td style="padding:6px 10px;font-size:12px">${r.cls}</td>
      <td style="padding:6px 10px;font-size:12px">${r.fcp}</td>
      <td style="padding:6px 10px">${statusBadge(r.status)}</td>
    </tr>`,
    )
    .join("");

  const brokenRows = brokenLinks
    .map(
      (l) => `<tr>
      <td style="padding:6px 10px;font-size:12px;color:#6b6860">${l.url.replace(BASE_URL, "")}</td>
      <td style="padding:6px 10px;font-size:13px;font-weight:500;color:#A32D2D">${l.status || "Timeout"}</td>
      <td style="padding:6px 10px;font-size:12px">${l.type}</td>
    </tr>`,
    )
    .join("");

  const metaRows = metaIssues
    .slice(0, 15)
    .map(
      (m) => `<tr>
      <td style="padding:6px 10px;font-size:12px;color:#6b6860">${m.url}</td>
      <td style="padding:6px 10px;font-size:12px">${m.issue}</td>
      <td style="padding:6px 10px;font-size:12px;color:#854F0B">${m.value}</td>
    </tr>`,
    )
    .join("");

  const th = (label: string) =>
    `<th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">${label}</th>`;

  const statCard = (label: string, value: string | number, color = "#1a1a18") =>
    `<div style="background:#fff;border:1px solid #e8e5df;border-radius:8px;padding:12px 16px;text-align:center">
      <div style="font-size:22px;font-weight:500;color:${color}">${value}</div>
      <div style="font-size:12px;color:#6b6860;margin-top:2px">${label}</div>
    </div>`;

  const hasCritical = brokenLinks.length > 0 || cwvResults.some((r) => r.status === "poor");

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#1a1a18;background:#FAFAF8;margin:0;padding:24px">
<div style="max-width:700px;margin:0 auto">
  <div style="border-bottom:2px solid #8B7355;padding-bottom:12px;margin-bottom:24px">
    <h1 style="font-size:20px;font-weight:400;margin:0">Auditoría SEO mensual</h1>
    <p style="color:#8B7355;font-size:13px;margin:4px 0 0">casaorfebre.cl — ${now}</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px">
    ${statCard("Productos activos", totalProducts, "#8B7355")}
    ${statCard("Posts publicados", totalPosts, "#8B7355")}
    ${statCard("Orfebres activos", totalArtisans, "#8B7355")}
    ${statCard("Imágenes sin alt text", imagesWithoutAlt, imagesWithoutAlt > 0 ? "#854F0B" : "#3B6D11")}
  </div>

  ${cwvResults.length > 0 ? `
  <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">Core Web Vitals (mobile)</h2>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
    <tr>${th("Página")}${th("Score")}${th("LCP")}${th("CLS")}${th("FCP")}${th("Estado")}</tr>
    ${cwvRows}
  </table>` : ""}

  ${brokenLinks.length > 0 ? `
  <h2 style="font-size:15px;font-weight:500;margin:0 0 8px;color:#A32D2D">Links rotos — acción requerida</h2>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
    <tr>${th("URL")}${th("Status")}${th("Tipo")}</tr>
    ${brokenRows}
  </table>` : `
  <p style="font-size:14px;color:#3B6D11;margin-bottom:24px">Sin links rotos detectados.</p>`}

  ${metaIssues.length > 0 ? `
  <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">Issues de title y meta description</h2>
  <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
    <tr>${th("Página")}${th("Problema")}${th("Valor")}</tr>
    ${metaRows}
  </table>` : ""}

  ${productsSeoIssues > 0 ? `
  <p style="font-size:13px;color:#854F0B;margin-bottom:16px">
    ${productsSeoIssues} productos aprobados sin descripción SEO — el cron enrich-descriptions los procesará automáticamente.
  </p>` : ""}

  <p style="font-size:12px;color:#9e9a90;margin-top:24px;border-top:1px solid #e8e5df;padding-top:12px">
    Casa Orfebre SEO Audit System · casaorfebre.cl
  </p>
</div>
</body></html>`;

  const resend = getResend();
  const subject = hasCritical
    ? `ALERTA Auditoría SEO — issues críticos en casaorfebre.cl`
    : `Auditoría SEO mensual — ${now}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: getAdminEmails(),
    subject,
    html,
  });

  console.log(`[CRON] seo-audit: CWV=${cwvResults.length} | broken=${brokenLinks.length} | meta issues=${metaIssues.length}`);

  return NextResponse.json({
    message: "Auditoría completada y enviada",
    cwv: cwvResults.length,
    brokenLinks: brokenLinks.length,
    metaIssues: metaIssues.length,
    imagesWithoutAlt,
    productsSeoIssues,
    emailSent: true,
  });
}
