export const revalidate = 3600;
export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { ProductCard } from "@/components/products/product-card";
import { generateBreadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

/* ─── helpers ─── */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Descriptions for well-known materials */
const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  "plata-925":
    "La plata 925, también llamada plata esterlina o sterling silver, contiene un 92,5 % de plata pura y un 7,5 % de cobre. Es el estándar internacional de la joyería de plata de calidad: duradera, hipoalergénica y con un brillo inconfundible.",
  "plata-950":
    "La plata 950 contiene un 95 % de plata pura, ofreciendo un brillo más blanco y una mayor pureza que la plata 925. Es especialmente apreciada en la tradición orfebre chilena y sudamericana.",
  oro: "El oro es el metal precioso por excelencia. En joyería artesanal chilena se trabaja en distintas purezas — 18K, 14K y 10K — para crear piezas de alto valor y durabilidad.",
  cobre:
    "El cobre es un metal cálido y versátil con una larga tradición en la orfebrería chilena. Con el tiempo desarrolla una pátina natural que le otorga carácter único a cada pieza.",
  lapislazuli:
    "El lapislázuli es la piedra nacional de Chile. Extraído en la cordillera de los Andes, su intenso color azul lo convierte en una gema única para joyería con identidad chilena.",
  bronce:
    "El bronce es una aleación de cobre y estaño usada desde la antigüedad. En joyería artesanal aporta tonos dorados cálidos y una resistencia excepcional.",
};

function getMaterialDescription(name: string, slug: string): string {
  return (
    MATERIAL_DESCRIPTIONS[slug] ??
    `Descubre piezas artesanales elaboradas en ${name} por orfebres chilenos verificados en Casa Orfebre.`
  );
}

/* ─── static params ─── */

export async function generateStaticParams() {
  const materials = await prisma.material.findMany({
    where: { isActive: true },
    select: { name: true },
  });
  return materials.map((m) => ({ material: slugify(m.name) }));
}

/* ─── metadata ─── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ material: string }>;
}): Promise<Metadata> {
  const { material } = await params;

  const allMats = await prisma.material.findMany({
    where: { isActive: true },
    select: { name: true },
  });

  const mat = allMats.find((m) => slugify(m.name) === material);
  if (!mat) return { title: "Material no encontrado" };

  return {
    title: `${mat.name} — Joyería Artesanal | Casa Orfebre`,
    description: `Descubre piezas artesanales en ${mat.name}. Orfebres chilenos verificados trabajando con ${mat.name} en Casa Orfebre.`,
    alternates: { canonical: `/materiales/${material}` },
  };
}

/* ─── page ─── */

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ material: string }>;
}) {
  const { material: slug } = await params;

  // Look up material by matching slugified name
  const allMaterials = await prisma.material.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const mat = allMaterials.find((m) => slugify(m.name) === slug);
  if (!mat) notFound();

  // Authenticated user favorites
  // removed userFavIds (favorites are now client-side)

  // Products with this material
  const products = await prisma.product.findMany({
    where: {
      status: "APPROVED",
      materials: { some: { id: mat.id } },
    },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: {
      images: {
        where: { status: "APPROVED" },
        orderBy: { position: "asc" },
        take: 1,
      },
      artisan: { select: { displayName: true, slug: true } },
      materials: { select: { id: true, name: true } },
    },
  });

  // Artisans who work with this material (from artisan.materials string array)
  const artisans = await prisma.artisan.findMany({
    where: {
      status: "APPROVED",
      materials: { has: mat.name },
    },
    select: {
      id: true,
      displayName: true,
      slug: true,
      specialty: true,
      location: true,
      profileImage: true,
    },
    take: 12,
  });

  const description = getMaterialDescription(mat.name, slug);

  // Schema.org breadcrumbs
  const breadcrumbItems = [
    { name: "Inicio", url: "/" },
    { name: "Materiales", url: "/materiales" },
    { name: mat.name, url: `/materiales/${slug}` },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm">
          <ol className="flex gap-2">
            {breadcrumbItems.map((item, index) => (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && <span className="text-text-tertiary">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-text font-medium">{item.name}</span>
                ) : (
                  <Link href={item.url} className="text-accent hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Hero */}
        <div className="mb-16">
          <h1 className="font-serif text-4xl sm:text-5xl font-light mb-6 text-text">
            Joyería en {mat.name}
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>

        {/* Products grid */}
        {products.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-light text-text mb-8">
              Piezas en {mat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                />
              ))}
            </div>
          </div>
        )}

        {/* Artisans section */}
        {artisans.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-2xl font-light text-text mb-8">
              Orfebres que trabajan con {mat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artisans.map((artisan) => (
                <Link
                  key={artisan.id}
                  href={`/orfebres/${artisan.slug}`}
                  className="group block rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
                >
                  <div className="font-serif text-lg font-light text-text group-hover:text-accent">
                    {artisan.displayName}
                  </div>
                  {artisan.specialty && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {artisan.specialty}
                    </p>
                  )}
                  {artisan.location && (
                    <p className="mt-1 text-xs text-text-tertiary">
                      {artisan.location}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {products.length === 0 && artisans.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg mb-4">
              Aún no hay piezas publicadas en {mat.name}.
            </p>
            <Link
              href="/coleccion"
              className="inline-flex items-center gap-2 text-accent hover:underline font-light"
            >
              Explorar toda la colección
            </Link>
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-text-secondary mb-4">
            Descubre más materiales y técnicas de joyería artesanal
          </p>
          <Link
            href="/coleccion"
            className="inline-flex items-center gap-2 text-accent hover:underline font-light"
          >
            Ver toda la colección
          </Link>
        </div>
      </div>
    </>
  );
}
