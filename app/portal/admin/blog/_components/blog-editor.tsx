"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBlogPost, updateBlogPost, uploadBlogCover, checkSlugAvailability } from "@/lib/actions/blog";
import { slugify } from "@/lib/utils";
import { renderMarkdown, calculateReadingTime } from "@/lib/markdown";

const categories = [
  { value: "GUIAS", label: "Guías" },
  { value: "TENDENCIAS", label: "Tendencias" },
  { value: "ORFEBRES", label: "Orfebres" },
  { value: "CUIDADOS", label: "Cuidados" },
  { value: "MATERIALES", label: "Materiales" },
  { value: "CULTURA", label: "Cultura" },
];

interface BlogEditorProps {
  post?: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    category: string;
    tags: string[];
    status: string;
    seoTitle: string | null;
    seoDescription: string | null;
    readingTime: number | null;
    featured: boolean;
  };
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugManual, setSlugManual] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || "GUIAS");
  const [tagsInput, setTagsInput] = useState(post?.tags.join(", ") || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [featured, setFeatured] = useState(post?.featured || false);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || "");
  const [readingTime, setReadingTime] = useState(post?.readingTime || 0);
  const [showSeo, setShowSeo] = useState(false);
  const [previewTab, setPreviewTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }, [slugManual]);

  const handleSlugChange = useCallback((value: string) => {
    setSlugManual(true);
    setSlug(slugify(value));
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setReadingTime(calculateReadingTime(value));
  }, []);

  const checkSlug = useCallback(async () => {
    if (!slug) return;
    const result = await checkSlugAvailability(slug, post?.id);
    setSlugError(result.available ? "" : "Slug ya en uso");
  }, [slug, post?.id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadBlogCover(fd);
    if (result.url) setCoverImage(result.url);
    setUploading(false);
  };

  const handleSubmit = (targetStatus: string) => {
    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", title);
      fd.set("slug", slug);
      fd.set("content", content);
      fd.set("excerpt", excerpt || content.slice(0, 160));
      fd.set("category", category);
      fd.set("tags", tagsInput);
      fd.set("coverImage", coverImage);
      fd.set("status", targetStatus);
      fd.set("featured", featured ? "true" : "false");
      fd.set("seoTitle", seoTitle);
      fd.set("seoDescription", seoDescription);
      fd.set("readingTime", String(readingTime || calculateReadingTime(content)));

      let result;
      if (isEditing) {
        result = await updateBlogPost(post.id, fd);
      } else {
        result = await createBlogPost(fd);
      }

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/portal/admin/blog");
        router.refresh();
      }
    });
  };

  // Markdown preview is rendered from admin-authored content only (behind auth).
  // renderMarkdown() strips script tags and event handlers.
  const previewHtml = previewTab === "preview" ? renderMarkdown(content) : "";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título del artículo"
          className="w-full border-0 border-b border-border bg-transparent py-3 font-serif text-3xl font-light text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none"
        />

        {/* Slug */}
        <div>
          <label className="text-xs text-text-tertiary">Slug</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={checkSlug}
              className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
            />
          </div>
          {slugError && <p className="mt-1 text-xs text-red-600">{slugError}</p>}
        </div>

        {/* Content tabs */}
        <div>
          <div className="flex gap-1 border-b border-border">
            <button
              type="button"
              onClick={() => setPreviewTab("write")}
              className={`px-4 py-2 text-sm ${previewTab === "write" ? "border-b-2 border-accent text-accent" : "text-text-tertiary hover:text-text"}`}
            >
              Escribir
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab("preview")}
              className={`px-4 py-2 text-sm ${previewTab === "preview" ? "border-b-2 border-accent text-accent" : "text-text-tertiary hover:text-text"}`}
            >
              Vista previa
            </button>
          </div>

          {previewTab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Escribe tu artículo en Markdown..."
              rows={24}
              className="mt-3 w-full rounded-lg border border-border bg-surface p-4 font-mono text-sm leading-relaxed focus:border-accent focus:outline-none"
            />
          ) : (
            <div
              className="prose-blog mt-3 min-h-[400px] rounded-lg border border-border bg-surface p-6"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">Estado</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="DRAFT">Borrador</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">Tags (separados por coma)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="plata, artesanía, guía"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          {tagsInput && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">Imagen de portada</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={uploading}
            className="mt-1 w-full text-sm"
          />
          {uploading && <p className="mt-1 text-xs text-text-tertiary">Subiendo...</p>}
          {coverImage && (
            <div className="mt-2 overflow-hidden rounded-lg border border-border">
              <img src={coverImage} alt="Cover" className="aspect-video w-full object-cover" />
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">
            Excerpt <span className="text-text-tertiary">({excerpt.length}/300)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="Resumen corto para cards y SEO (auto-generado si vacío)"
            rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm">Artículo destacado</span>
        </label>

        {/* SEO */}
        <div>
          <button
            type="button"
            onClick={() => setShowSeo(!showSeo)}
            className="text-xs text-accent hover:underline"
          >
            {showSeo ? "▼" : "▶"} SEO overrides
          </button>
          {showSeo && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs text-text-tertiary">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Si vacío, usa el título"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-text-tertiary">SEO Description</label>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Si vacío, usa el excerpt"
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Reading time */}
        <div>
          <label className="text-xs font-medium text-text-tertiary">
            Tiempo de lectura (min)
          </label>
          <input
            type="number"
            min={1}
            value={readingTime}
            onChange={(e) => setReadingTime(parseInt(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          {status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isPending || !title}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-background transition-colors disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar borrador"}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={isPending || !title}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {isPending
              ? "Guardando..."
              : isEditing && status === "PUBLISHED"
                ? "Actualizar"
                : "Publicar"}
          </button>
          {isEditing && status === "PUBLISHED" && (
            <button
              type="button"
              onClick={() => handleSubmit("ARCHIVED")}
              disabled={isPending}
              className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              Archivar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
