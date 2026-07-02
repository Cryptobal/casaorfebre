/**
 * Sistema de seeds de blog — puente entre la rutina remota (que genera archivos
 * revisables en un PR) y la tabla `blog_posts` (que sirve el blog en producción).
 *
 * Flujo:
 *   1. La rutina remota escribe `prisma/blog-seeds/pendientes/<slug>.md` con
 *      frontmatter completo + cuerpo Markdown, y abre un PR.
 *   2. Un humano revisa y mergea el PR.
 *   3. El cron `blog-publish-seeds` (o `prisma/seed-blog-pending.ts`) llama a
 *      `publishPendingSeeds()`, que inserta cada seed en `blog_posts` y lo mueve
 *      a `prisma/blog-seeds/publicados/`.
 *
 * Por qué archivos y no escritura directa a la DB desde la rutina: respeta el
 * guardrail "SIEMPRE PR, NUNCA publicar directo" y da revisión humana antes de
 * que el contenido sea público. Ver docs/automations/BLOG_PIPELINE.md §0.
 *
 * Sin dependencias nuevas: parser de frontmatter propio (el repo no usa gray-matter).
 * Migración de schema en este repo: `prisma db push` (NO migrate dev).
 */

import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { BlogCategory } from "@prisma/client";

const SEEDS_DIR = path.join(process.cwd(), "prisma", "blog-seeds");
const PENDING_DIR = path.join(SEEDS_DIR, "pendientes");
const PUBLISHED_DIR = path.join(SEEDS_DIR, "publicados");

const VALID_CATEGORIES = new Set<BlogCategory>([
  "GUIAS", "TENDENCIAS", "ORFEBRES", "CUIDADOS", "MATERIALES", "CULTURA",
] as BlogCategory[]);

export interface BlogSeed {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  tags: string[];
  coverImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Keyword objetivo (para trazabilidad; se agrega a tags). */
  targetKeyword?: string;
}

export interface PublishResult {
  slug: string;
  status: "published" | "skipped-duplicate" | "error";
  postId?: string;
  reason?: string;
}

// ─── Parser de frontmatter YAML mínimo (solo lo que necesitamos) ─────────────
// Soporta: strings, strings entre comillas, y listas inline `[a, b]` o `["a","b"]`.
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const [, fm, body] = match;
  const data: Record<string, unknown> = {};
  for (const line of fm.split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val: string = kv[2].trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      // Lista inline
      data[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      // String (quitar comillas envolventes)
      val = val.replace(/^["']|["']$/g, "");
      data[key] = val === "" || val === "null" ? null : val;
    }
  }
  return { data, body: body.trim() };
}

function coerceSeed(fileName: string, data: Record<string, unknown>, body: string): BlogSeed {
  const asString = (v: unknown): string | null =>
    v == null ? null : String(v);
  const asStringReq = (v: unknown, field: string): string => {
    if (v == null || String(v).trim() === "") {
      throw new Error(`Campo requerido faltante en frontmatter: "${field}"`);
    }
    return String(v);
  };

  const rawCategory = String(data.category || "").toUpperCase() as BlogCategory;
  if (!VALID_CATEGORIES.has(rawCategory)) {
    throw new Error(
      `Categoría inválida "${data.category}". Debe ser una de: ${[...VALID_CATEGORIES].join(", ")}`,
    );
  }

  const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
  const targetKeyword = asString(data.targetKeyword) || undefined;

  return {
    slug: asString(data.slug) || slugify(fileName.replace(/\.md$/, "")),
    title: asStringReq(data.title, "title"),
    excerpt: asStringReq(data.excerpt, "excerpt"),
    content: body,
    category: rawCategory,
    tags: [...new Set([...tags, ...(targetKeyword ? [slugify(targetKeyword), "revisado-semrush"] : [])])],
    coverImage: asString(data.coverImage),
    seoTitle: asString(data.seoTitle),
    seoDescription: asString(data.seoDescription),
    targetKeyword,
  };
}

/** Lee y valida todos los seeds en pendientes/. No inserta nada. */
export async function readPendingSeeds(): Promise<BlogSeed[]> {
  let files: string[];
  try {
    files = await fs.readdir(PENDING_DIR);
  } catch {
    return []; // La carpeta no existe aún → nada pendiente.
  }
  const seeds: BlogSeed[] = [];
  for (const file of files) {
    if (!file.endsWith(".md") || file.startsWith(".")) continue;
    const raw = await fs.readFile(path.join(PENDING_DIR, file), "utf-8");
    const { data, body } = parseFrontmatter(raw);
    seeds.push(coerceSeed(file, data, body));
  }
  return seeds;
}

/**
 * Inserta los seeds pendientes en `blog_posts` y los mueve a publicados/.
 * Idempotente: si el slug ya existe en la DB, lo salta (no duplica).
 */
export async function publishPendingSeeds(
  opts: { moveFiles?: boolean } = {},
): Promise<PublishResult[]> {
  const { moveFiles = true } = opts;
  const seeds = await readPendingSeeds();
  if (seeds.length === 0) return [];

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (!adminUser) {
    return seeds.map((s) => ({ slug: s.slug, status: "error" as const, reason: "No admin user" }));
  }

  const results: PublishResult[] = [];
  for (const seed of seeds) {
    try {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: seed.slug },
        select: { id: true },
      });
      if (existing) {
        results.push({ slug: seed.slug, status: "skipped-duplicate", reason: "slug ya existe" });
        if (moveFiles) await moveSeedFile(seed.slug);
        continue;
      }

      const now = new Date();
      const readingTime = Math.max(1, Math.ceil(seed.content.split(/\s+/).length / 200));
      const post = await prisma.blogPost.create({
        data: {
          slug: seed.slug,
          title: seed.title,
          excerpt: seed.excerpt,
          content: seed.content,
          category: seed.category,
          tags: [...seed.tags, "auto-generado"],
          authorId: adminUser.id,
          status: "PUBLISHED",
          publishedAt: now,
          seoTitle: seed.seoTitle,
          seoDescription: seed.seoDescription,
          coverImage: seed.coverImage,
          readingTime,
        },
      });

      // Registrar URL para que el cron gsc-indexing la envíe a Google.
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://casaorfebre.cl";
      await prisma.systemSetting.upsert({
        where: { key: "LAST_BLOG_URL_GENERATED" },
        update: { value: `${appUrl}/blog/${seed.slug}` },
        create: { key: "LAST_BLOG_URL_GENERATED", value: `${appUrl}/blog/${seed.slug}` },
      });

      results.push({ slug: seed.slug, status: "published", postId: post.id });
      if (moveFiles) await moveSeedFile(seed.slug);
    } catch (err) {
      results.push({
        slug: seed.slug,
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }
  return results;
}

async function moveSeedFile(slug: string): Promise<void> {
  try {
    await fs.mkdir(PUBLISHED_DIR, { recursive: true });
    const src = path.join(PENDING_DIR, `${slug}.md`);
    const dest = path.join(PUBLISHED_DIR, `${slug}.md`);
    await fs.rename(src, dest).catch(() => {
      // En entorno serverless el FS puede ser read-only; no es fatal.
    });
  } catch {
    /* no-op: mover archivos es best-effort */
  }
}
