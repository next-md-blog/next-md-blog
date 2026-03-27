import type { BlogPost, Author, Config, BlogPostFrontmatter } from './types.js';
import { resolveAuthorFromConfig } from './utils.js';

/**
 * Normalizes keywords to an array of strings
 * Handles both string (comma-separated) and array formats
 * @param keywords - Keywords as string (comma-separated) or array of strings
 * @returns Array of normalized keyword strings
 */
export function normalizeKeywords(keywords?: string | string[]): string[] {
  if (!keywords) return [];
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === 'string') {
    return keywords.split(',').map((k) => k.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Extracts author name from string or Author object
 * @param author - Author as string or Author object
 * @returns Author name as string
 */
export function getAuthorName(author: string | Author): string {
  return typeof author === 'string' ? author : author.name;
}

/**
 * Converts authors array (string | Author)[] to array of author names
 * @param authors - Array of authors (strings or Author objects)
 * @returns Array of author names as strings
 */
export function getAuthorNames(authors: (string | Author)[]): string[] {
  return authors.map(getAuthorName);
}

/**
 * Ensures all authors in the array are resolved from config
 * This is a safety net to ensure authors are resolved even if they weren't resolved earlier
 * @param authors - Array of authors (strings or Author objects)
 * @param configAuthors - Array of authors from config
 * @returns Array of resolved authors (Author objects or strings)
 */
export function ensureAuthorsResolved(
  authors: (string | Author)[],
  configAuthors?: Author[]
): (string | Author)[] {
  if (!configAuthors || configAuthors.length === 0) {
    return authors;
  }
  
  return authors.map((author) => {
    // If already an Author object, return as-is
    if (typeof author === 'object') {
      return author;
    }
    
    // If it's a string, try to resolve it from config
    return resolveAuthorFromConfig(author, configAuthors);
  });
}

/**
 * Resolves defaultAuthor from config.authors array if available
 * @param defaultAuthor - Default author name from config
 * @param configAuthors - Array of authors from config
 * @returns Author object if found, otherwise returns the name as string
 */
export function resolveDefaultAuthor(
  defaultAuthor: string | undefined,
  configAuthors?: Author[]
): string | Author | undefined {
  if (!defaultAuthor) return undefined;
  
  return resolveAuthorFromConfig(defaultAuthor, configAuthors);
}

/**
 * Builds robots meta string from frontmatter
 * Combines robots directive string with boolean flags (noindex, nofollow)
 * @param frontmatter - Blog post frontmatter containing robots directives
 * @returns Robots meta string (e.g., 'noindex, nofollow') or undefined
 */
export function buildRobotsMeta(frontmatter: BlogPost['frontmatter']): string | undefined {
  const directives: string[] = [];
  const robots = typeof frontmatter.robots === 'string' ? frontmatter.robots : undefined;
  
  if (frontmatter.noindex || (robots && robots.includes('noindex'))) {
    directives.push('noindex');
  }
  if (frontmatter.nofollow || (robots && robots.includes('nofollow'))) {
    directives.push('nofollow');
  }
  
  // If explicit robots string is provided, use it (unless overridden by boolean flags)
  if (robots && !frontmatter.noindex && !frontmatter.nofollow) {
    return robots;
  }
  
  if (directives.length > 0) {
    return directives.join(', ');
  }
  
  return undefined;
}

/**
 * Resolves a URL to an absolute URL
 * If the URL is already absolute (starts with http:// or https://), returns it as-is
 * If the URL is relative (starts with /), resolves it against siteUrl
 * @param url - The URL to resolve (can be absolute or relative)
 * @param siteUrl - The base site URL to resolve relative URLs against
 * @returns Absolute URL
 */
export function resolveCanonicalUrl(url: string, siteUrl: string): string {
  // If already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If relative, resolve against siteUrl
  if (url.startsWith('/')) {
    // Remove trailing slash from siteUrl if present
    const baseUrl = siteUrl.replace(/\/$/, '');
    return `${baseUrl}${url}`;
  }
  
  // If it's a relative path without leading slash, treat it as relative to root
  const baseUrl = siteUrl.replace(/\/$/, '');
  return `${baseUrl}/${url}`;
}

/**
 * Default path segment for post URLs (no leading/trailing slashes).
 */
export function getBlogPostPathSegment(config?: Config): string {
  const raw = config?.blogPostPathSegment?.trim();
  if (!raw) return 'blog';
  return raw.replace(/^\/+|\/+$/g, '') || 'blog';
}

/**
 * Resolves a post URL from canonical URL or generates default `/{segment}/{slug}` under siteUrl.
 */
export function resolvePostUrl(
  canonicalUrl: string | undefined,
  slug: string,
  siteUrl: string,
  blogPostPathSegment = 'blog'
): string {
  const seg = blogPostPathSegment.replace(/^\/+|\/+$/g, '') || 'blog';
  const base = siteUrl.replace(/\/$/, '');
  const urlRaw =
    canonicalUrl || (base ? `${base}/${seg}/${slug}` : `/${seg}/${slug}`);
  return siteUrl ? resolveCanonicalUrl(urlRaw, siteUrl) : urlRaw;
}

/**
 * Resolves post URL using optional blog config for path segment.
 */
export function resolvePostUrlWithConfig(
  canonicalUrl: string | undefined,
  slug: string,
  siteUrl: string,
  config?: Config
): string {
  return resolvePostUrl(
    canonicalUrl,
    slug,
    siteUrl,
    getBlogPostPathSegment(config)
  );
}

/**
 * Default blog listing URL for breadcrumbs (config.blogIndexPath or `{siteUrl}/blogs`).
 */
/**
 * Per-post hreflang map: frontmatter.alternateLanguages overrides config.alternateLanguages.
 */
export function resolveHreflangMap(
  fm: BlogPostFrontmatter,
  config?: Config
): Record<string, string> | undefined {
  const fmAlt = fm.alternateLanguages;
  if (fmAlt && typeof fmAlt === 'object' && !Array.isArray(fmAlt)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(fmAlt)) {
      if (typeof v === 'string' && v.trim()) out[k] = v;
    }
    if (Object.keys(out).length > 0) return out;
  }
  const cfgAlt = config?.alternateLanguages;
  if (cfgAlt && typeof cfgAlt === 'object') {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(cfgAlt)) {
      if (typeof v === 'string' && v.trim()) out[k] = v;
    }
    if (Object.keys(out).length > 0) return out;
  }
  return undefined;
}

export function resolveBlogIndexUrl(siteUrl: string, config?: Config): string {
  const custom = config?.blogIndexPath?.trim();
  if (!custom) {
    const base = siteUrl.replace(/\/$/, '');
    return base ? `${base}/blogs` : '/blogs';
  }
  if (custom.startsWith('http://') || custom.startsWith('https://')) {
    return custom;
  }
  if (custom.startsWith('/')) {
    const base = siteUrl.replace(/\/$/, '');
    return base ? `${base}${custom}` : custom;
  }
  const base = siteUrl.replace(/\/$/, '');
  return base ? `${base}/${custom.replace(/^\/+|\/+$/g, '')}` : `/${custom.replace(/^\/+|\/+$/g, '')}`;
}

/**
 * Escapes XML special characters to prevent injection attacks
 * @param unsafe - String that may contain XML special characters
 * @returns Escaped string safe for XML output
 */
export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

