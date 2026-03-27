import { marked } from "marked";

// Configure marked for safe HTML output
marked.setOptions({
  breaks: false,
  gfm: true,
});

// Custom renderer for blog-specific styling
const renderer = new marked.Renderer();

renderer.link = ({ href, text }) => {
  const isExternal =
    href.startsWith("http") && !href.includes("casaorfebre.cl");
  const attrs = isExternal
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";
  return `<a href="${href}" class="text-accent hover:underline"${attrs}>${text}</a>`;
};

renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : "";
  return `<img src="${href}" alt="${text}" loading="lazy" class="rounded-lg w-full my-6"${titleAttr} />`;
};

marked.use({ renderer });

/**
 * Render Markdown to sanitized HTML for blog content.
 * Strips <script> tags and event handlers to prevent XSS.
 */
export function renderMarkdown(content: string): string {
  const html = marked.parse(content) as string;

  // Basic XSS sanitization: remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, "");
}

/**
 * Calculate estimated reading time in minutes.
 */
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
