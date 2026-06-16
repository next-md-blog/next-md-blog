/**
 * Minimal YAML frontmatter parser.
 *
 * Replaces gray-matter, whose pinned js-yaml 3.x is affected by a
 * quadratic-complexity DoS advisory (GHSA, fixed only in js-yaml 4.2.0 — a
 * line gray-matter cannot adopt because it relies on the removed `safeLoad`
 * API). We only consume `data` and `content`, so a focused splitter backed by
 * the patched js-yaml 4.x is sufficient and keeps the tree on a supported line.
 */
import { load } from 'js-yaml';

export interface ParsedFrontmatter {
  /** Parsed YAML frontmatter, or `{}` when absent/empty. */
  data: Record<string, unknown>;
  /** Document body following the closing delimiter. */
  content: string;
}

const OPEN = /^---[ \t]*\r?\n/;
const IMMEDIATE_CLOSE = /^---[ \t]*(?:\r?\n|$)/;
const CLOSE = /\r?\n---[ \t]*(?:\r?\n|$)/;

/**
 * Split a `---` delimited YAML frontmatter block from a markdown document.
 * Mirrors the subset of gray-matter's behaviour this package depends on.
 */
export function parseFrontmatter(input: string): ParsedFrontmatter {
  let str = input;
  // Strip a leading UTF-8 BOM if present.
  if (str.charCodeAt(0) === 0xfeff) str = str.slice(1);

  // Frontmatter must open with a `---` line at the very start of the file.
  if (!OPEN.test(str)) {
    return { data: {}, content: input };
  }

  const afterOpen = str.replace(OPEN, '');

  let rawYaml: string;
  let body: string;
  if (IMMEDIATE_CLOSE.test(afterOpen)) {
    // Empty frontmatter: `---\n---\n…`
    rawYaml = '';
    body = afterOpen.replace(IMMEDIATE_CLOSE, '');
  } else {
    const close = CLOSE.exec(afterOpen);
    if (!close) {
      // No closing delimiter — treat the whole file as content.
      return { data: {}, content: input };
    }
    rawYaml = afterOpen.slice(0, close.index);
    body = afterOpen.slice(close.index + close[0].length);
  }

  let data: Record<string, unknown> = {};
  if (rawYaml.trim().length > 0) {
    const parsed = load(rawYaml);
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  }

  return { data, content: body };
}
