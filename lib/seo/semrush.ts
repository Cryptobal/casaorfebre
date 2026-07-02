/**
 * Integración Semrush — investigación de keywords para el blog (funnel COMPRADOR).
 *
 * Endpoint: https://api.semrush.com/ (Analytics API v3, formato CSV `;`-separado).
 * Requiere `SEMRUSH_API_KEY` en el entorno. Base de datos fija: `cl` (Chile).
 *
 * Reports usados (verificados 2026-07-02):
 *  - phrase_this      → volumen/CPC/competencia de una keyword
 *  - phrase_these     → batch de keywords (hasta 100), separadas por `;`
 *  - phrase_questions → preguntas reales (para FAQs y ángulos de post)
 *  - phrase_related   → keywords semánticamente adyacentes (ideación)
 *
 * Diseño: fail-soft. Si no hay API key o la llamada falla, devuelve arrays vacíos
 * y deja que el llamador caiga al pool heurístico. NUNCA lanza y rompe el cron.
 *
 * Gobernanza: ver docs/seo/estrategia-keywords.md. El filtrado de keywords
 * negativas (intención no-compradora) vive en `isBuyerIntent()` más abajo y DEBE
 * aplicarse a todo resultado antes de usarlo para generar contenido.
 */

const SEMRUSH_BASE = "https://api.semrush.com/";
const DB = "cl";

export interface SemrushKeyword {
  phrase: string;
  volume: number;
  cpc: number;
  competition: number;
  /** Índice del mes de peak (0-11) derivado de la serie de tendencia, o null. */
  peakMonthIndex: number | null;
}

// ─── Keywords negativas: intención que NO convierte (comprador) ──────────────
// Fuente de verdad: docs/seo/estrategia-keywords.md §3. Mantener sincronizado.
const NEGATIVE_PATTERNS: RegExp[] = [
  /\bcurso(s)?\b/i,
  /\bclases?\b/i,
  /\baprender\b/i,
  /\bc[oó]mo\s+hacer\b/i,
  /\bhazlo\s+t[uú]\b/i,
  /\bdiy\b/i,
  /\btutorial\b/i,
  /\bherramient/i,
  /\bsoplete\b/i,
  /\blaminadora\b/i,
  /\binsumos?\b/i,
  /\bproveedor/i,
  /\bal\s+por\s+mayor\b/i,
  /\bmayorista\b/i,
  /\bempleo\b/i,
  /\bsueldo\b/i,
  /\baprendiz\b/i,
  // Intención de VENDEDOR (orfebre que quiere vender, no comprador)
  /\bvender\s+(joyas|mis\s+joyas|joyer[ií]a)\b/i,
  /\bd[oó]nde\s+vender\b/i,
  /\bc[oó]mo\s+vender\b/i,
  /\bplataforma\s+para\s+orfebres\b/i,
];

/** True si la keyword sirve a un comprador (no matchea ningún patrón negativo). */
export function isBuyerIntent(phrase: string): boolean {
  return !NEGATIVE_PATTERNS.some((re) => re.test(phrase));
}

function getApiKey(): string | null {
  return process.env.SEMRUSH_API_KEY || null;
}

/** Deriva el índice de mes de peak a partir de la serie de trend de Semrush. */
function parsePeakMonth(trends: string | undefined): number | null {
  if (!trends) return null;
  const values = trends.split(",").map((v) => parseFloat(v));
  if (values.length === 0 || values.some((v) => Number.isNaN(v))) return null;
  // La serie de Semrush es de los últimos 12 meses, del más antiguo al más reciente.
  let maxIdx = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[maxIdx]) maxIdx = i;
  const now = new Date();
  // values[length-1] ≈ mes actual; retrocedemos para mapear a mes calendario.
  const monthsAgo = values.length - 1 - maxIdx;
  return (now.getMonth() - monthsAgo + 12) % 12;
}

/** Parser genérico del CSV de Semrush a filas objeto por header. */
function parseCsv(body: string): Record<string, string>[] {
  const lines = body.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(";");
  return lines.slice(1).map((line) => {
    const cells = line.split(";");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h.trim()] = (cells[i] ?? "").trim()));
    return row;
  });
}

async function callSemrush(params: Record<string, string>): Promise<Record<string, string>[]> {
  const key = getApiKey();
  if (!key) return [];
  const url = new URL(SEMRUSH_BASE);
  url.searchParams.set("key", key);
  url.searchParams.set("database", DB);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`[SEMRUSH] HTTP ${res.status} para type=${params.type}`);
      return [];
    }
    const text = await res.text();
    // Semrush devuelve "ERROR ##" en texto plano ante fallos de cuota/params.
    if (text.startsWith("ERROR") || text.includes("NOTHING FOUND")) return [];
    return parseCsv(text);
  } catch (err) {
    console.warn(`[SEMRUSH] fallo de red type=${params.type}:`, err);
    return [];
  }
}

function rowToKeyword(row: Record<string, string>): SemrushKeyword {
  return {
    phrase: row["Keyword"] || row["Ph"] || "",
    volume: parseInt(row["Search Volume"] || row["Nq"] || "0", 10) || 0,
    cpc: parseFloat(row["CPC"] || row["Cp"] || "0") || 0,
    competition: parseFloat(row["Competition"] || row["Co"] || "0") || 0,
    peakMonthIndex: parsePeakMonth(row["Trends"] || row["Td"]),
  };
}

/** Métricas de una sola keyword. */
export async function getKeywordMetrics(phrase: string): Promise<SemrushKeyword | null> {
  const rows = await callSemrush({
    type: "phrase_this",
    phrase,
    export_columns: "Ph,Nq,Cp,Co,Td",
  });
  return rows.length ? rowToKeyword(rows[0]) : null;
}

/** Métricas batch (hasta 100 keywords). Filtra automáticamente por intención de compra. */
export async function getBatchMetrics(phrases: string[]): Promise<SemrushKeyword[]> {
  if (phrases.length === 0) return [];
  const rows = await callSemrush({
    type: "phrase_these",
    phrase: phrases.slice(0, 100).join(";"),
    export_columns: "Ph,Nq,Cp,Co,Td",
  });
  return rows.map(rowToKeyword).filter((k) => k.phrase && isBuyerIntent(k.phrase));
}

/** Preguntas reales sobre una semilla (para FAQs y ángulos). Filtra por volumen e intención. */
export async function getQuestions(
  seed: string,
  minVolume = 10,
): Promise<SemrushKeyword[]> {
  const rows = await callSemrush({
    type: "phrase_questions",
    phrase: seed,
    export_columns: "Ph,Nq,Cp,Co,Td",
    display_limit: "30",
    display_sort: "nq_desc",
  });
  return rows
    .map(rowToKeyword)
    .filter((k) => k.phrase && k.volume >= minVolume && isBuyerIntent(k.phrase));
}

/** Keywords relacionadas para ideación. Filtra por volumen e intención. */
export async function getRelated(
  seed: string,
  minVolume = 10,
): Promise<SemrushKeyword[]> {
  const rows = await callSemrush({
    type: "phrase_related",
    phrase: seed,
    export_columns: "Ph,Nq,Cp,Co,Td",
    display_limit: "30",
    display_sort: "nq_desc",
  });
  return rows
    .map(rowToKeyword)
    .filter((k) => k.phrase && k.volume >= minVolume && isBuyerIntent(k.phrase));
}

/**
 * Puntúa una keyword para estacionalidad: alto si el peak está a 4-8 semanas.
 * Devuelve 0-3 (compatible con el bloque "demanda/estacionalidad" del scoring).
 */
export function seasonalityScore(kw: SemrushKeyword): number {
  const volScore = kw.volume >= 5000 ? 2 : kw.volume >= 1000 ? 1.5 : kw.volume >= 100 ? 1 : 0.5;
  if (kw.peakMonthIndex === null) return Math.min(3, volScore);
  const now = new Date().getMonth();
  const monthsToPeak = (kw.peakMonthIndex - now + 12) % 12;
  // Peak en 1-2 meses = ventana ideal de publicación anticipada.
  const seasonalBonus = monthsToPeak >= 1 && monthsToPeak <= 2 ? 1 : 0;
  return Math.min(3, volScore + seasonalBonus);
}
