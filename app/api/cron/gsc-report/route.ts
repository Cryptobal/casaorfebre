import { NextRequest, NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/seo/gsc-indexing";
import { getResend, FROM_EMAIL } from "@/lib/resend";
import { getAdminEmails } from "@/lib/config";

export const runtime = "nodejs";
export const maxDuration = 60;

const SITE_URL = "sc-domain:casaorfebre.cl";
const GSC_API = "https://searchconsole.googleapis.com/webmasters/v3/sites";

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function queryGSC(
  token: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 100,
): Promise<GscRow[]> {
  const encodedSite = encodeURIComponent(SITE_URL);
  const res = await fetch(
    `${GSC_API}/${encodedSite}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`[GSC-Report] API error ${res.status}: ${err}`);
    return [];
  }

  const data = await res.json();
  return (data.rows ?? []) as GscRow[];
}

function formatDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function pos(value: number): string {
  return value.toFixed(1);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getGoogleAccessToken();
  if (!token) {
    return NextResponse.json({ error: "No se pudo obtener token de Google" }, { status: 500 });
  }

  // Periodos de comparación
  const endA   = formatDate(3);    // hace 3 días (evita el delay de GSC)
  const startA = formatDate(10);   // últimos 7 días
  const endB   = formatDate(10);   // semana anterior
  const startB = formatDate(17);

  const [rowsA, rowsB, rowsPages] = await Promise.all([
    queryGSC(token, startA, endA, ["query"], 200),
    queryGSC(token, startB, endB, ["query"], 200),
    queryGSC(token, startA, endA, ["page"], 50),
  ]);

  // Mapas para comparación
  const mapA = new Map(rowsA.map((r) => [r.keys[0], r]));
  const mapB = new Map(rowsB.map((r) => [r.keys[0], r]));

  // Keywords ganando posición (bajó el número de posición = mejora)
  const improving = rowsA
    .filter((r) => {
      const prev = mapB.get(r.keys[0]);
      return prev && prev.position - r.position > 1 && r.impressions > 10;
    })
    .sort((a, b) => {
      const pa = mapB.get(a.keys[0])?.position ?? a.position;
      const pb = mapB.get(b.keys[0])?.position ?? b.position;
      return (pa - a.position) - (pb - b.position);
    })
    .slice(0, 10)
    .map((r) => ({
      query: r.keys[0],
      pos: pos(r.position),
      prevPos: pos(mapB.get(r.keys[0])?.position ?? r.position),
      clicks: r.clicks,
      impressions: r.impressions,
    }));

  // Keywords perdiendo posición
  const declining = rowsA
    .filter((r) => {
      const prev = mapB.get(r.keys[0]);
      return prev && r.position - prev.position > 1 && r.impressions > 10;
    })
    .sort((a, b) => {
      const pa = mapB.get(a.keys[0])?.position ?? a.position;
      const pb = mapB.get(b.keys[0])?.position ?? b.position;
      return (a.position - pa) - (b.position - pb);
    })
    .slice(0, 10)
    .map((r) => ({
      query: r.keys[0],
      pos: pos(r.position),
      prevPos: pos(mapB.get(r.keys[0])?.position ?? r.position),
      clicks: r.clicks,
      impressions: r.impressions,
    }));

  // Quick wins: posición 11-20 con buenas impresiones
  const quickWins = rowsA
    .filter((r) => r.position >= 11 && r.position <= 20 && r.impressions > 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10)
    .map((r) => ({
      query: r.keys[0],
      pos: pos(r.position),
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: pct(r.ctr),
    }));

  // Páginas con CTR bajo (oportunidad de mejorar title/meta)
  const lowCtr = rowsPages
    .filter((r) => r.impressions > 50 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map((r) => ({
      page: r.keys[0].replace("https://casaorfebre.cl", ""),
      ctr: pct(r.ctr),
      impressions: r.impressions,
      clicks: r.clicks,
    }));

  // Totales
  const totalClicks = rowsA.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = rowsA.reduce((s, r) => s + r.impressions, 0);
  const prevClicks = rowsB.reduce((s, r) => s + r.clicks, 0);
  const prevImpressions = rowsB.reduce((s, r) => s + r.impressions, 0);
  const clicksDiff = prevClicks > 0
    ? (((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1)
    : "N/A";

  const now = new Date().toLocaleDateString("es-CL", {
    year: "numeric", month: "long", day: "numeric",
  });

  // ── HTML del reporte ──────────────────────────────────────────────────────
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;color:#6b6860;font-size:13px">${label}</td><td style="padding:6px 12px;font-weight:500;font-size:13px">${value}</td></tr>`;

  const tableHeader = (cols: string[]) =>
    `<tr>${cols.map((c) => `<th style="padding:6px 10px;text-align:left;font-size:12px;color:#9e9a90;font-weight:400;border-bottom:1px solid #e8e5df">${c}</th>`).join("")}</tr>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Reporte SEO — casaorfebre.cl</title></head>
<body style="font-family:system-ui,sans-serif;color:#1a1a18;background:#FAFAF8;margin:0;padding:24px">
  <div style="max-width:680px;margin:0 auto">
    <div style="border-bottom:2px solid #8B7355;padding-bottom:12px;margin-bottom:24px">
      <h1 style="font-size:22px;font-weight:400;margin:0">Reporte SEO semanal</h1>
      <p style="color:#8B7355;font-size:13px;margin:4px 0 0">casaorfebre.cl — ${now}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
      ${row("Clicks esta semana", `${totalClicks.toLocaleString("es-CL")} (${clicksDiff}% vs semana anterior)`)}
      ${row("Impresiones esta semana", `${totalImpressions.toLocaleString("es-CL")}`)}
      ${row("Impresiones semana anterior", `${prevImpressions.toLocaleString("es-CL")}`)}
      ${row("Keywords en top 20", `${rowsA.filter((r) => r.position <= 20).length}`)}
      ${row("Quick wins (pos 11–20)", `${quickWins.length} keywords`)}
    </table>

    ${improving.length > 0 ? `
    <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">Subiendo posición esta semana</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
      ${tableHeader(["Keyword", "Pos. actual", "Pos. anterior", "Clicks", "Impresiones"])}
      ${improving.map((r) => `<tr>
        <td style="padding:6px 10px;font-size:13px">${r.query}</td>
        <td style="padding:6px 10px;font-size:13px;color:#3B6D11;font-weight:500">${r.pos}</td>
        <td style="padding:6px 10px;font-size:13px;color:#9e9a90">${r.prevPos}</td>
        <td style="padding:6px 10px;font-size:13px">${r.clicks}</td>
        <td style="padding:6px 10px;font-size:13px">${r.impressions}</td>
      </tr>`).join("")}
    </table>` : ""}

    ${declining.length > 0 ? `
    <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">Bajando posición — requieren atención</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
      ${tableHeader(["Keyword", "Pos. actual", "Pos. anterior", "Clicks", "Impresiones"])}
      ${declining.map((r) => `<tr>
        <td style="padding:6px 10px;font-size:13px">${r.query}</td>
        <td style="padding:6px 10px;font-size:13px;color:#A32D2D;font-weight:500">${r.pos}</td>
        <td style="padding:6px 10px;font-size:13px;color:#9e9a90">${r.prevPos}</td>
        <td style="padding:6px 10px;font-size:13px">${r.clicks}</td>
        <td style="padding:6px 10px;font-size:13px">${r.impressions}</td>
      </tr>`).join("")}
    </table>` : ""}

    ${quickWins.length > 0 ? `
    <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">Quick wins — posición 11 a 20</h2>
    <p style="font-size:13px;color:#6b6860;margin:0 0 8px">Estas keywords están cerca de la primera página. Refuerza el contenido existente.</p>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
      ${tableHeader(["Keyword", "Posición", "Impresiones", "CTR", "Clicks"])}
      ${quickWins.map((r) => `<tr>
        <td style="padding:6px 10px;font-size:13px">${r.query}</td>
        <td style="padding:6px 10px;font-size:13px;color:#8B7355;font-weight:500">${r.pos}</td>
        <td style="padding:6px 10px;font-size:13px">${r.impressions}</td>
        <td style="padding:6px 10px;font-size:13px">${r.ctr}</td>
        <td style="padding:6px 10px;font-size:13px">${r.clicks}</td>
      </tr>`).join("")}
    </table>` : ""}

    ${lowCtr.length > 0 ? `
    <h2 style="font-size:15px;font-weight:500;margin:0 0 8px">CTR bajo — mejorar title y meta description</h2>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e8e5df;border-radius:8px;margin-bottom:24px">
      ${tableHeader(["Página", "CTR", "Impresiones", "Clicks"])}
      ${lowCtr.map((r) => `<tr>
        <td style="padding:6px 10px;font-size:12px;color:#6b6860">${r.page}</td>
        <td style="padding:6px 10px;font-size:13px;color:#A32D2D">${r.ctr}</td>
        <td style="padding:6px 10px;font-size:13px">${r.impressions}</td>
        <td style="padding:6px 10px;font-size:13px">${r.clicks}</td>
      </tr>`).join("")}
    </table>` : ""}

    <p style="font-size:12px;color:#9e9a90;border-top:1px solid #e8e5df;padding-top:12px;margin-top:24px">
      Generado automáticamente por Casa Orfebre SEO System · casaorfebre.cl
    </p>
  </div>
</body>
</html>`;

  // ── Envío por email ───────────────────────────────────────────────────────
  const resend = getResend();
  const adminEmails = getAdminEmails();

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmails,
    subject: `Reporte SEO — ${totalClicks} clicks esta semana · casaorfebre.cl`,
    html,
  });

  console.log(`[CRON] gsc-report enviado a ${adminEmails.join(", ")}`);

  return NextResponse.json({
    message: "Reporte enviado",
    period: `${startA} → ${endA}`,
    totalClicks,
    totalImpressions,
    improving: improving.length,
    declining: declining.length,
    quickWins: quickWins.length,
    lowCtr: lowCtr.length,
    sentTo: adminEmails,
  });
}
