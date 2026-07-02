import { NextResponse } from "next/server";
import { publishPendingSeeds } from "@/lib/blog/seeds";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Publica los seeds de blog revisados y mergeados (prisma/blog-seeds/pendientes/).
 *
 * Este es el paso 3 del flujo de la rutina remota: la rutina genera seeds en un PR,
 * un humano revisa y mergea, y este cron drena la carpeta insertándolos en `blog_posts`.
 * Idempotente: seeds con slug ya existente se saltan.
 *
 * Auth: mismo patrón Bearer fail-closed que el resto de crons.
 * Ver docs/automations/BLOG_PIPELINE.md.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await publishPendingSeeds();
    const published = results.filter((r) => r.status === "published");
    const skipped = results.filter((r) => r.status === "skipped-duplicate");
    const errored = results.filter((r) => r.status === "error");

    if (results.length === 0) {
      return NextResponse.json({ message: "Sin seeds pendientes", published: 0 });
    }

    console.log(
      `[CRON] blog-publish-seeds: ${published.length} publicados, ${skipped.length} saltados, ${errored.length} errores`,
    );

    return NextResponse.json({
      message: "Seeds procesados",
      published: published.length,
      skipped: skipped.length,
      errored: errored.length,
      results,
    });
  } catch (error) {
    console.error("[CRON] blog-publish-seeds error:", error);
    return NextResponse.json({ error: "Error publicando seeds" }, { status: 500 });
  }
}
