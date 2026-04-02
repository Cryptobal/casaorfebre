import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function IAPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const artisan = await prisma.artisan.findUnique({
    where: { userId: session.user.id },
  });

  if (!artisan) redirect("/");

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    unansweredQuestions,
    staleDrafts,
    highViewProducts,
    recentFavoritesCount,
    mostViewedProduct,
  ] = await Promise.all([
    // Unanswered questions older than 24h
    prisma.productQuestion.findMany({
      where: {
        artisanId: artisan.id,
        answer: null,
        createdAt: { lt: twentyFourHoursAgo },
      },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),

    // Draft products older than 7 days
    prisma.product.findMany({
      where: {
        artisanId: artisan.id,
        status: "DRAFT",
        createdAt: { lt: sevenDaysAgo },
      },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Products with high views (>50) and APPROVED status — we'll filter by 0 sales below
    prisma.product.findMany({
      where: {
        artisanId: artisan.id,
        status: "APPROVED",
        viewCount: { gt: 50 },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        viewCount: true,
        _count: { select: { orderItems: true } },
      },
    }),

    // Recent favorites count (last 7 days) across artisan's products
    prisma.favorite.count({
      where: {
        product: { artisanId: artisan.id },
        createdAt: { gte: sevenDaysAgo },
      },
    }),

    // Most viewed product this week
    prisma.product.findFirst({
      where: {
        artisanId: artisan.id,
        status: "APPROVED",
      },
      select: { id: true, name: true, slug: true, viewCount: true },
      orderBy: { viewCount: "desc" },
    }),
  ]);

  // Filter to only products with 0 sales
  const highViewNoSale = highViewProducts.filter(
    (p) => p._count.orderItems === 0
  );

  const hasAlerts =
    unansweredQuestions.length > 0 ||
    staleDrafts.length > 0 ||
    highViewNoSale.length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-2xl font-light">Asistente IA</h1>
      <p className="text-sm text-text-secondary mt-2 mb-8">
        Herramientas de inteligencia artificial para potenciar tu taller
      </p>

      {/* Section 1: Alerts */}
      <section className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Atención requerida
        </h2>

        {hasAlerts ? (
          <div className="space-y-3">
            {unansweredQuestions.length > 0 && (
              <Link href="/portal/orfebre/preguntas" className="block">
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span className="font-medium">
                    {unansweredQuestions.length}{" "}
                    {unansweredQuestions.length === 1
                      ? "pregunta sin responder"
                      : "preguntas sin responder"}
                  </span>{" "}
                  con más de 24 horas de antigüedad. Responder rápido mejora tu
                  tasa de conversión.
                </div>
              </Link>
            )}

            {staleDrafts.length > 0 && (
              <Link href="/portal/orfebre/productos" className="block">
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span className="font-medium">
                    {staleDrafts.length}{" "}
                    {staleDrafts.length === 1
                      ? "borrador pendiente"
                      : "borradores pendientes"}
                  </span>{" "}
                  con más de 7 días. Considera publicarlos o eliminarlos para
                  mantener tu catálogo ordenado.
                </div>
              </Link>
            )}

            {highViewNoSale.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span className="font-medium">
                  {highViewNoSale.length}{" "}
                  {highViewNoSale.length === 1
                    ? "producto con muchas visitas pero sin ventas"
                    : "productos con muchas visitas pero sin ventas"}
                </span>
                : {highViewNoSale.map((p) => p.name).join(", ")}. Revisa el
                precio, fotos o descripción para mejorar la conversión.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
            Todo al día. No hay acciones pendientes por ahora.
          </div>
        )}
      </section>

      {/* Section 2: Quick tools grid */}
      <section className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Herramientas rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/portal/orfebre/productos/nuevo" className="block">
            <Card className="transition-colors hover:border-accent/40 h-full">
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">
                  ✨
                </span>
                <div>
                  <p className="font-medium text-sm text-text">
                    Crear pieza con IA
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Genera descripciones, títulos y etiquetas optimizadas
                    automáticamente
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/portal/orfebre/blog" className="block">
            <Card className="transition-colors hover:border-accent/40 h-full">
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">
                  📝
                </span>
                <div>
                  <p className="font-medium text-sm text-text">
                    Escribir artículo
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Comparte tu proceso creativo y conecta con compradores
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/portal/orfebre/estadisticas" className="block">
            <Card className="transition-colors hover:border-accent/40 h-full">
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">
                  📊
                </span>
                <div>
                  <p className="font-medium text-sm text-text">
                    Ver mis estadísticas
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Analiza ventas, visitas y rendimiento de tus productos
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link
            href="/portal/orfebre/herramientas/calculadora"
            className="block"
          >
            <Card className="transition-colors hover:border-accent/40 h-full">
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">
                  🧮
                </span>
                <div>
                  <p className="font-medium text-sm text-text">
                    Calculadora de precios
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Calcula costos de materiales, mano de obra y margen
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Section 3: Weekly summary */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-text-tertiary mb-4">
          Resumen de esta semana
        </h2>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide">
                Nuevos favoritos
              </p>
              <p className="text-2xl font-light mt-1">{recentFavoritesCount}</p>
            </div>

            {mostViewedProduct && (
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">
                  Producto más visto
                </p>
                <Link
                  href={`/productos/${mostViewedProduct.slug}`}
                  className="mt-1 block text-sm font-medium text-accent hover:underline"
                >
                  {mostViewedProduct.name}
                </Link>
                <p className="text-xs text-text-secondary">
                  {mostViewedProduct.viewCount} visitas
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
