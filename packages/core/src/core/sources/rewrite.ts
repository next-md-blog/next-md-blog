/**
 * Rewrite URLs in a markdown document without re-serializing it.
 *
 * Handles inline links / images (`[t](url)`, `![a](url "title")`), reference
 * definitions (`[id]: url`) and raw HTML `<a href>` / `<img src>`. Fenced code
 * blocks and inline code spans are left untouched. The document is otherwise
 * preserved byte for byte.
 */

export type UrlKind = 'link' | 'image';

/** Return the replacement URL, or the input unchanged. */
export type UrlRewriter = (url: string, kind: UrlKind) => string;

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp)$/i;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** `true` for URLs that are relative to the current document (no scheme, not `//`, not `#…`). */
export function isRelativeUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('#') || url.startsWith('//')) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

/** Guess the kind of a reference-definition target from its extension. */
function kindFromUrl(url: string): UrlKind {
  const pathOnly = url.split(/[?#]/)[0] ?? '';
  return IMAGE_EXT.test(pathOnly) ? 'image' : 'link';
}

/** Rewrite a destination that may be wrapped in `<…>`. */
function rewriteDestination(dest: string, kind: UrlKind, fn: UrlRewriter): string {
  if (dest.startsWith('<') && dest.endsWith('>')) {
    return `<${fn(dest.slice(1, -1), kind)}>`;
  }
  return fn(dest, kind);
}

/** Find the `[` matching the `]` at `closeIdx`, or -1. */
function matchingOpenBracket(text: string, closeIdx: number): number {
  let depth = 0;
  for (let i = closeIdx; i >= 0; i--) {
    const ch = text[i];
    if (text[i - 1] === '\\') continue;
    if (ch === ']') depth++;
    else if (ch === '[') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Rewrite inline links / images and raw HTML in a code-free text segment. */
function rewriteSegment(text: string, fn: UrlRewriter): string {
  // Inline `](dest` — decide link vs image by looking for `![` at the matching `[`.
  let out = '';
  let last = 0;
  const inline = /\]\(\s*(<[^>\n]*>|[^\s()]+(?:\([^\s()]*\)[^\s()]*)*)/g;
  let m: RegExpExecArray | null;
  while ((m = inline.exec(text)) !== null) {
    const open = matchingOpenBracket(text, m.index);
    const kind: UrlKind = open > 0 && text[open - 1] === '!' ? 'image' : 'link';
    const dest = m[1]!;
    const destStart = m.index + m[0].length - dest.length;
    out += text.slice(last, destStart) + rewriteDestination(dest, kind, fn);
    last = destStart + dest.length;
  }
  out += text.slice(last);

  // Raw HTML attributes.
  out = out.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])(.*?)\2/gi,
    (_all, pre: string, q: string, url: string) => `${pre}${q}${fn(url, 'image')}${q}`,
  );
  out = out.replace(
    /(<a\b[^>]*?\bhref\s*=\s*)(["'])(.*?)\2/gi,
    (_all, pre: string, q: string, url: string) => `${pre}${q}${fn(url, 'link')}${q}`,
  );
  return out;
}

/** Split a line on inline code spans and rewrite only the non-code parts. */
function rewriteLine(line: string, fn: UrlRewriter): string {
  const def = /^( {0,3}\[[^\]]+\]:[ \t]*)(<[^>]*>|\S+)/.exec(line);
  if (def) {
    const dest = def[2]!;
    const bare = dest.startsWith('<') ? dest.slice(1, -1) : dest;
    return (
      def[1] +
      rewriteDestination(dest, kindFromUrl(bare), fn) +
      line.slice(def[0].length)
    );
  }
  let out = '';
  let i = 0;
  while (i < line.length) {
    const tick = line.indexOf('`', i);
    if (tick === -1) {
      out += rewriteSegment(line.slice(i), fn);
      break;
    }
    out += rewriteSegment(line.slice(i, tick), fn);
    let run = 1;
    while (line[tick + run] === '`') run++;
    const fence = '`'.repeat(run);
    const close = line.indexOf(fence, tick + run);
    if (close === -1) {
      // Unclosed span: the backticks are literal.
      out += fence;
      i = tick + run;
      continue;
    }
    out += line.slice(tick, close + run);
    i = close + run;
  }
  return out;
}

export function rewriteMarkdownUrls(markdown: string, fn: UrlRewriter): string {
  const lines = markdown.split('\n');
  let fence: string | null = null;
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx]!;
    const f = FENCE.exec(line);
    if (fence) {
      if (f && f[1]![0] === fence[0] && f[1]!.length >= fence.length && line.trim() === f[1]) {
        fence = null;
      }
      continue;
    }
    if (f) {
      fence = f[1]!;
      continue;
    }
    lines[idx] = rewriteLine(line, fn);
  }
  return lines.join('\n');
}

/** First ATX `# H1` outside fenced code, with simple inline markdown stripped. */
export function firstHeading(markdown: string): string | null {
  let fence: string | null = null;
  for (const line of markdown.split('\n')) {
    const f = FENCE.exec(line);
    if (fence) {
      if (f && f[1]![0] === fence[0] && f[1]!.length >= fence.length) fence = null;
      continue;
    }
    if (f) {
      fence = f[1]!;
      continue;
    }
    const h = /^ {0,3}#[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/.exec(line);
    if (h) {
      const text = h[1]!
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[`*_]/g, '')
        .trim();
      if (text) return text;
    }
  }
  return null;
}

/** Humanize a file path into a title: `guides/getting-started.md` → `Getting started`. */
export function titleFromPath(filePath: string): string {
  const parts = filePath.split('/').filter(Boolean);
  let base = (parts.pop() ?? '').replace(/\.(md|mdx)$/i, '');
  if (/^(readme|index)$/i.test(base) && parts.length > 0) {
    base = parts.pop()!;
  }
  const words = base.replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
