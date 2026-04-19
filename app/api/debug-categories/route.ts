/**
 * Endpoint temporal de diagnóstico — por qué /coleccion?category=<slug> no
 * devuelve productos aunque en admin se vea que el producto tiene la
 * categoría asignada.
 *
 * Uso:
 *   GET /api/_debug-categories?slug=anillo
 *
 * Remover este archivo después de confirmar la causa raíz.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApprovedProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") ?? "anillo").toLowerCase();

  const [categoryBySlug, allCategories, productsWithSlug, productsWithSlugAny, sampleWithCat, allApprovedCount, filteredCount] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true },
    }),
    prisma.category.findMany({
      select: { id: true, slug: true, name: true, isActive: true },
      orderBy: { position: "asc" },
    }),
    prisma.product.count({
      where: {
        status: "APPROVED",
        artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
        categories: { some: { slug } },
      },
    }),
    prisma.product.count({
      where: { categories: { some: { slug } } },
    }),
    prisma.product.findMany({
      where: { categories: { some: { slug } } },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        artisan: { select: { slug: true, displayName: true } },
        categories: { select: { slug: true, name: true } },
      },
      take: 5,
    }),
    prisma.product.count({
      where: {
        status: "APPROVED",
        artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
      },
    }),
    prisma.product.findMany({
      where: {
        status: "APPROVED",
        artisan: { NOT: { slug: { startsWith: "admin-test-" } } },
        categories: { some: { slug } },
      },
      select: { id: true, slug: true, name: true },
      take: 10,
    }),
  ]);

  // Muestra productos APPROVED cuyo nombre contenga la palabra raíz (ej. anillo)
  // pero que no tengan ninguna Category conectada — diagnóstico alternativo.
  const productsByName = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      name: { contains: slug.slice(0, 5), mode: "insensitive" },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      categories: { select: { slug: true, name: true } },
      artisan: { select: { slug: true } },
    },
    take: 10,
  });

  // Llama la MISMA función que usa /coleccion/page.tsx para comparar.
  let viaGetApprovedProducts:
    | { count: number; names: string[] }
    | { error: string } = { count: 0, names: [] };
  try {
    const products = await getApprovedProducts({ categorySlug: slug });
    viaGetApprovedProducts = {
      count: products.length,
      names: products.slice(0, 10).map((p) => p.name),
    };
  } catch (e) {
    viaGetApprovedProducts = {
      error: e instanceof Error ? `${e.name}: ${e.message}` : String(e),
    };
  }

  return NextResponse.json({
    slugRequested: slug,
    categoryExistsInDB: categoryBySlug,
    allCategoriesInDB: allCategories,
    productsMatchingStrictQuery: filteredCount,
    productCountWithSlug_AllStatuses: productsWithSlugAny,
    productCountWithSlug_ApprovedNonAdmin: productsWithSlug,
    totalApprovedNonAdmin: allApprovedCount,
    sampleProductsWithThisCategory: sampleWithCat,
    productsApprovedByName: productsByName,
    viaGetApprovedProducts,
  });
}
