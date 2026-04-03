import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { getAdminEmails } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";

interface SchemaIssue {
  url: string;
  schemaType: string;
  severity: "ERROR" | "WARNING";
  message: string;
}

// Extrae todos los bloques JSON-LD de un HTML
function extractJsonLd(html: string): unknown[] {
  const results: unknown[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      results.push(JSON.parse(match[1].trim()));
    } catch {
      // JSON inválido — ya se reporta como error
    }
  }
  return results;
}

// Valida un bloque de schema según su tipo
function validateSchema(schema: unknown, url: string): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  if (typeof schema !== "object" || schema === null) return issues;

  const s = schema as Record<string, unknown>;
  const type = String(s["@type"] ?? "");

  if (type === "Product") {
    if (!s.name) issues.push({ url, schemaType: "Product", severity: "ERROR", message: "Falta campo requerido: name" });
    if (!s.description) issues.push({ url, schemaType: "Product", severity: "ERROR", message: "Falta campo requerido: description" });
    if (!s.image) issues.push({ url, schemaType: "Product", severity: "ERROR", message: "Falta campo requerido: image" });
    if (!s.offers) issues.push({ url, schemaType: "Product", severity: "ERROR", message: "Falta campo requerido: offers" });
    if (s.offers && typeof s.offers === "object") {
      const offers = s.offers as Record<string, unknown>;
      if (!offers.price && offers.price !== 0) issues.push({ url, schemaType: "Product", severity: "ERROR", message: "offers.price no definido" });
      if (!offers.priceCurrency) issues.push({ url, schemaType: "Product", severity: "WARNING", message: "Falta offers.priceCurrency" });
    }
  }

  if (type === "BlogPosting" || type === "Article") {
    if (!s.headline) issues.push({ url, schemaType: type, severity: "ERROR", message: "Falta campo requerido: headline" });
    if (!s.author) issues.push({ url, schemaType: type, severity: "ERROR", message: "Falta campo requerido: author" });
    if (!s.datePublished) issues.push({ url, schemaType: type, severity: "WARNING", message: "Falta campo recomendado: datePublished" });
    if (!s.image) issues.push({ url, schemaType: type, severity: "WARNING", message: "Falta campo recomendado: image" });
  }

  if (type === "BreadcrumbList") {
    const items = s.itemListElement;
    if (!Array.isArray(items) || items.length === 0) {
      issues.push({ url, schemaType: "BreadcrumbList", severity: "ERROR", message: "itemListElement vacío o no es array" });
    }
  }

  if (type === "FAQPage") {
    const items = s.mainEntity;
    if (!Array.isArray(items) || items.length === 0) {
      issues.push({ url, schemaType: "FAQPage", severity: "ERROR", message: "mainEntity vacío o no es array" });
    }
  }

  if (type === "Organization" || type === "LocalBusiness") {
    if (!s.name) issues.push({ url, schemaType: type, severity: "WARNING", message: "Falta campo: name" });
    if (!s.url) issues.push({ url, schemaType: type, severity: "WARNING", message: "Falta campo: url" });
  }

  return issues;
}

async function checkPage(url: string): Promise<SchemaIssue[]> {
  const issues: SchemaIssue[] = [];

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CasaOrfebre-SchemaBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      issues.push({
        url,
        schemaType: "HTTP",
        severity: "ERROR",
        message: `HTTP ${res.status} — página no accesible`,
      });
      return issues;
    }

    const html = await res.text();
    const schemas = extractJsonLd(html);

    if (schemas.length === 0) {
      issues.push({
        url,
        schemaType: "JSON-LD",
        severity: "WARNING",
        message: "No se encontró ningún bloque JSON-LD",
      });
      return issues;
    }

    for (const schema of schemas) {
      issues.push(...validateSchema(schema, url));
    }
  } catch (err) {
    issues.push({
      url,
      schemaType: "FETCH",
      severity: "ERROR",
      message: `Error al acceder: ${String(err).slice(0, 100)}`,
    });
  }

  return issues;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // URLs estáticas críticas
  const staticUrls = [
    BASE_URL,
    `${BASE_URL}/coleccion`,
    `${BASE_URL}/blog`,
    `${BASE_URL}/para-orfebres`,
    `${BASE_URL}/para-compradores`,
  ];

  // 3 productos recientes
  const recentProducts = await prisma.product.findMany({
    where: { status: "APPROVED" },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const productUrls = recentProducts.map((p) => `${BASE_URL}/coleccion/${p.slug}`);

  // 2 blog posts recientes
  const recentPosts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: 2,
  });
  const blogUrls = recentPosts.map((p) => `${BASE_URL}/blog/${p.slug}`);

  const allUrls = [...staticUrls, ...productUrls, ...blogUrls];
  const allIssues: SchemaIssue[] = [];

  for (const url of allUrls) {
    const pageIssues = await checkPage(url);
    allIssues.push(...pageIssues);
    await new Promise((r) => setTimeout(r, 400));
  }

  const errorIssues = allIssues.filter((i) => i.severity === "ERROR");
  const warningIssues = allIssues.filter((i) => i.severity === "WARNING");

  console.log(`[CRON] schema-validator: ${allUrls.length} páginas | ${errorIssues.length} errores | ${warningIssues.length} warnings`);

  // Solo envía email si hay issues
  if (allIssues.length > 0) {
    const issueRows = allIssues
      .map((i) => {
        const color = i.severity === "ERROR" ? "#A32D2D" : "#854F0B";
        const badge = i.severity === "ERROR" ? "ERROR" : "WARNING";
        return `<tr>
          <td style="padding:6px 10px;font-size:12px;color:#6b6860">${i.url.replace(BASE_URL, "")}</td>
          <td style="padding:6px 10px;font-size:12px">${i.schemaType}</td>
          <td style="padding:6px 10px"><span style="font-size:11px;color:${color};font-weight:500">${badge}</span></td>
          <td style="padding:6px 10px;font-size:12px">${i.message}</td>
        </tr>`;
      })
      .join("");

    const subject = errorIssues.length > 0
      ? `ALERTA Schema — ${errorIssues.length} errores en casaorfebre.cl`
      : `Schema OK con ${warningIssues.length} warnings — casaorfebre.cl`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;color:#1a1a18;background:#FAFAF8;margin:0;padding:24px">
  <div style="max-width:700px;margin:0 auto">
    <div style="border-bottom:2px solid #8B7355;padding-bottom:12px;margin-bottom:24px">
      <h1 style="font-size:20px;font-weight:400;margin:0">Validación de Schema Markup</h1>
      <p style="color:#8B7355;font-size:13px;margin:4px 0 0">casaorfebre.cl — ${new Date().toLocaleDateString("es-CL")}</p>
    </div>
    <p style="font-size:14px;margin:0 0 16px">
      ${allUrls.length} páginas revisadas ·
      <strong style="color:#A32D2D">${errorIssues.length} errores</strong> ·
      <strong style="color:#854F0B">${warningIssues.length} warnings</strong>
    </p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px">
      <tr>
        <th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">Página</th>
        <th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">Schema</th>
        <th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">Nivel</th>
        <th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">Detalle</th>
      </tr>
      ${issueRows}
    </table>
    <p style="font-size:12px;color:#9e9a90;margin-top:24px">Casa Orfebre SEO System</p>
  </div>
</body>
</html>`;

    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: getAdminEmails(),
      subject,
      html,
    });
  }

  return NextResponse.json({
    pagesChecked: allUrls.length,
    errors: errorIssues.length,
    warnings: warningIssues.length,
    emailSent: allIssues.length > 0,
    issues: allIssues,
  });
}
