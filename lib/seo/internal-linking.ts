interface InternalLink {
  text: string;
  url: string;
  pattern: RegExp;
}

const LINK_PATTERNS: InternalLink[] = [
  // Materials
  { text: "plata 925", url: "/materiales/plata-925", pattern: /plata 925/gi },
  { text: "plata 950", url: "/materiales/plata-950", pattern: /plata 950/gi },
  { text: "oro", url: "/materiales/oro", pattern: /\boro\b/gi },
  { text: "cobre", url: "/materiales/cobre", pattern: /\bcobre\b/gi },
  { text: "lapislázuli", url: "/materiales/lapislazuli", pattern: /lapislázuli/gi },
  // Cities
  { text: "Santiago", url: "/joyerias/santiago", pattern: /\bSantiago\b/g },
  { text: "Valparaíso", url: "/joyerias/valparaiso", pattern: /\bValparaíso\b/g },
  // Categories
  { text: "anillos", url: "/coleccion/anillos-de-plata", pattern: /\banillos\b/gi },
  { text: "aros", url: "/coleccion/aros-de-plata", pattern: /\baros\b/gi },
  { text: "collares", url: "/coleccion/collares-de-plata", pattern: /\bcollares\b/gi },
  { text: "pulseras", url: "/coleccion/pulseras-de-plata", pattern: /\bpulseras\b/gi },
  { text: "cadenas", url: "/coleccion/cadenas-de-plata", pattern: /\bcadenas\b/gi },
];

/**
 * Check whether a match at `index` in `content` is already inside a markdown
 * link `[text](url)` or an HTML `<a ...>...</a>` tag.
 */
function isInsideExistingLink(
  content: string,
  matchStart: number,
  matchEnd: number,
): boolean {
  // Check for markdown link: [text](url) — the match would be between [ and ]
  // Walk backwards from matchStart to find an unmatched [
  let bracketDepth = 0;
  for (let i = matchStart - 1; i >= 0; i--) {
    if (content[i] === "]") {
      bracketDepth++;
    } else if (content[i] === "[") {
      if (bracketDepth === 0) {
        // Found an unmatched [ before us — check if there's a ](url) after the
        // closing ] that follows our match
        const afterMatch = content.indexOf("]", matchEnd);
        if (afterMatch !== -1 && content[afterMatch + 1] === "(") {
          return true;
        }
      } else {
        bracketDepth--;
      }
    }
    // Stop scanning if we hit a newline (markdown links don't span lines)
    if (content[i] === "\n") break;
  }

  // Check for HTML <a> tag: find the nearest <a before the match and see if
  // there's no </a> between <a and the match
  const before = content.slice(0, matchStart);
  const lastAOpen = before.lastIndexOf("<a ");
  const lastAOpenSelf = before.lastIndexOf("<a>");
  const lastOpenTag = Math.max(lastAOpen, lastAOpenSelf);

  if (lastOpenTag !== -1) {
    const lastCloseTag = before.lastIndexOf("</a>");
    // If the last <a> is after the last </a>, we're inside a link
    if (lastCloseTag < lastOpenTag) {
      return true;
    }
  }

  return false;
}

/**
 * Scan content for text that could be turned into internal links.
 * Returns unique suggestions with occurrence count, excluding text already linked.
 */
export function suggestInternalLinks(
  content: string,
): { text: string; url: string; count: number }[] {
  const suggestions: { text: string; url: string; count: number }[] = [];

  for (const link of LINK_PATTERNS) {
    // Reset lastIndex for global regexes
    link.pattern.lastIndex = 0;

    let count = 0;
    let match: RegExpExecArray | null;

    while ((match = link.pattern.exec(content)) !== null) {
      if (!isInsideExistingLink(content, match.index, match.index + match[0].length)) {
        count++;
      }
    }

    if (count > 0) {
      suggestions.push({ text: link.text, url: link.url, count });
    }
  }

  return suggestions;
}

/**
 * Replace the first N occurrences of each pattern with a markdown link.
 * Skips text that is already inside a markdown link or HTML `<a>` tag.
 *
 * @param content       - The markdown/HTML content string
 * @param maxLinksPerPattern - Max replacements per pattern (default 1)
 * @returns             - Content with internal links inserted
 */
export function autoLinkContent(
  content: string,
  maxLinksPerPattern: number = 1,
): string {
  let result = content;

  for (const link of LINK_PATTERNS) {
    let linksInserted = 0;
    // We need a fresh regex for each pass since we're rebuilding the string
    const pattern = new RegExp(link.pattern.source, link.pattern.flags);
    let newResult = "";
    let lastIndex = 0;

    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(result)) !== null) {
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;

      if (
        linksInserted < maxLinksPerPattern &&
        !isInsideExistingLink(result, matchStart, matchEnd)
      ) {
        // Append everything before the match, then the linked version
        newResult += result.slice(lastIndex, matchStart);
        newResult += `[${match[0]}](${link.url})`;
        lastIndex = matchEnd;
        linksInserted++;
      }

      // For non-global patterns, break to avoid infinite loop
      if (!pattern.global) break;
    }

    // Append the rest of the string
    newResult += result.slice(lastIndex);
    result = newResult;
  }

  return result;
}
