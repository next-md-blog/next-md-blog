/**
 * High-level query helpers built on top of getBlogPost / getAllBlogPosts.
 *
 * These cover the patterns app code keeps reinventing:
 *  - looking up the same slug across every locale (for hreflang)
 *  - filtering posts by author or series
 *  - enumerating slugs for `generateStaticParams`
 */
import type {
  BlogPost,
  BlogPostMetadata,
  GetBlogPostOptions,
} from './types.js';
import { getAllBlogPosts, getBlogPost } from './file-utils.js';
import { resolveFrontmatterField } from './type-guards.js';

export function slugifyAuthor(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function slugifySeries(value: string): string {
  return slugifyAuthor(value);
}

function authorNameFrom(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return null;
}

/**
 * Collect every author name referenced in a post's frontmatter (`author` and `authors`).
 */
export function authorNamesFromFrontmatter(
  fm: Record<string, unknown>
): string[] {
  const out = new Set<string>();
  const author = fm.author;
  if (Array.isArray(author)) {
    for (const a of author) {
      const n = authorNameFrom(a);
      if (n) out.add(n);
    }
  } else {
    const n = authorNameFrom(author);
    if (n) out.add(n);
  }
  const authors = fm.authors;
  if (Array.isArray(authors)) {
    for (const a of authors) {
      const n = authorNameFrom(a);
      if (n) out.add(n);
    }
  }
  return [...out];
}

/**
 * Look up the same slug across every locale. Returned map preserves locale insertion order.
 * Useful for building `alternates.languages` in `generateMetadata` without writing a loop.
 */
export async function getPostInAllLocales(
  slug: string,
  locales: readonly string[],
  options: Omit<GetBlogPostOptions, 'locale'> = {}
): Promise<Map<string, BlogPost | null>> {
  const entries = await Promise.all(
    locales.map(async (locale) => {
      try {
        return [locale, await getBlogPost(slug, { ...options, locale })] as const;
      } catch {
        return [locale, null] as const;
      }
    })
  );
  return new Map(entries);
}

/**
 * Returns posts authored (or co-authored) by `authorSlug`. Slugification matches
 * `slugifyAuthor` so the same convention is used everywhere.
 */
export async function getPostsByAuthor(
  authorSlug: string,
  options: GetBlogPostOptions = {}
): Promise<BlogPostMetadata[]> {
  const posts = await getAllBlogPosts(options);
  return posts.filter((p) =>
    authorNamesFromFrontmatter(p.frontmatter).some(
      (name) => slugifyAuthor(name) === authorSlug
    )
  );
}

/**
 * Returns posts that share a `series` frontmatter value. Sorted by `seriesOrder`,
 * falling back to publish date (ascending).
 */
export async function getPostsBySeries(
  seriesSlug: string,
  options: GetBlogPostOptions = {}
): Promise<BlogPostMetadata[]> {
  const posts = await getAllBlogPosts(options);
  const inSeries = posts.filter((p) => {
    const raw = resolveFrontmatterField<string>(['series'], p.frontmatter);
    return raw ? slugifySeries(raw) === seriesSlug : false;
  });
  return inSeries.sort((a, b) => {
    const oa = resolveFrontmatterField<number>(['seriesOrder'], a.frontmatter);
    const ob = resolveFrontmatterField<number>(['seriesOrder'], b.frontmatter);
    if (typeof oa === 'number' && typeof ob === 'number') return oa - ob;
    if (typeof oa === 'number') return -1;
    if (typeof ob === 'number') return 1;
    const da = (a.frontmatter.date as string) || '';
    const db = (b.frontmatter.date as string) || '';
    return da.localeCompare(db);
  });
}

/** Enumerate every author slug across the provided locales (or the default locale only). */
export async function getAllAuthorSlugs(
  options: GetBlogPostOptions = {},
  locales?: readonly string[]
): Promise<string[]> {
  const localeList = locales && locales.length > 0 ? locales : [options.locale ?? undefined];
  const out = new Set<string>();
  for (const locale of localeList) {
    const opts: GetBlogPostOptions = { ...options };
    if (locale) opts.locale = locale;
    const posts = await getAllBlogPosts(opts);
    for (const p of posts) {
      for (const name of authorNamesFromFrontmatter(p.frontmatter)) {
        out.add(slugifyAuthor(name));
      }
    }
  }
  // Also include authors defined in config but with no posts yet — useful for
  // dedicated author landing pages.
  for (const a of options.config?.authors ?? []) {
    if (a.name) out.add(slugifyAuthor(a.name));
  }
  return [...out];
}

/** Enumerate every series slug across the provided locales. */
export async function getAllSeriesSlugs(
  options: GetBlogPostOptions = {},
  locales?: readonly string[]
): Promise<string[]> {
  const localeList = locales && locales.length > 0 ? locales : [options.locale ?? undefined];
  const out = new Set<string>();
  for (const locale of localeList) {
    const opts: GetBlogPostOptions = { ...options };
    if (locale) opts.locale = locale;
    const posts = await getAllBlogPosts(opts);
    for (const p of posts) {
      const raw = resolveFrontmatterField<string>(['series'], p.frontmatter);
      if (raw) out.add(slugifySeries(raw));
    }
  }
  return [...out];
}
