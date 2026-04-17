import { marked } from "marked";

marked.setOptions({
  breaks: false,
  gfm: true,
});

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
 * Strip JSX artifacts that may remain from TSX-to-Markdown conversion.
 * Runs before marked so they don't leak into the rendered HTML.
 */
function stripJsxArtifacts(md: string): string {
  let cleaned = md;

  // JSX comments: {/* ... */}
  cleaned = cleaned.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // Remaining React component tags: <Link ...>...</Link>, <FadeIn>, etc.
  cleaned = cleaned.replace(/<Link\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/Link>/g, "[$2]($1)");
  cleaned = cleaned.replace(/<\/?(?:Link|FadeIn|SectionHeading|BlogImage)[^>]*>/g, "");

  // Remaining <div> blocks with className (JSX artifacts, not markdown)
  cleaned = cleaned.replace(/<div\s+className="[^"]*"[^>]*>[\s\S]*?<\/div>/g, "");
  // Stray opening/closing div tags
  cleaned = cleaned.replace(/<\/?div[^>]*>/g, "");

  // className attributes on any remaining tags
  cleaned = cleaned.replace(/\s*className="[^"]*"/g, "");

  // JSX expression spacers: {" "}
  cleaned = cleaned.replace(/\{"\s*"\}/g, " ");

  // &nbsp; entities
  cleaned = cleaned.replace(/&nbsp;/g, " ");

  // Clean up excessive whitespace left after stripping
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

// Shift all heading levels in rendered HTML down by one so article content
// never emits <h1> (the page title already uses the only <h1>).
function downshiftHeadings(html: string): string {
  return html
    .replace(/<h5(\s[^>]*)?>/gi, "<h6$1>")
    .replace(/<\/h5>/gi, "</h6>")
    .replace(/<h4(\s[^>]*)?>/gi, "<h5$1>")
    .replace(/<\/h4>/gi, "</h5>")
    .replace(/<h3(\s[^>]*)?>/gi, "<h4$1>")
    .replace(/<\/h3>/gi, "</h4>")
    .replace(/<h2(\s[^>]*)?>/gi, "<h3$1>")
    .replace(/<\/h2>/gi, "</h3>")
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

/**
 * Render Markdown to sanitized HTML for blog content.
 * Strips JSX artifacts and XSS vectors.
 */
export function renderMarkdown(content: string): string {
  const cleaned = stripJsxArtifacts(content);
  const html = marked.parse(cleaned) as string;

  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\bon\w+\s*=\s*'[^']*'/gi, "");

  return downshiftHeadings(sanitized);
}

/**
 * Calculate estimated reading time in minutes.
 */
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
