import type { BlogPostMetadata, Config } from './types.js';
import { getConfig } from './config.js';
import { resolveFrontmatterField } from './type-guards.js';
import {
  resolvePostUrlWithConfig,
  resolveHreflangMap,
  resolveCanonicalUrl,
} from './seo-utils.js';

function absolutizeLanguageMap(
  langs: Record<string, string>,
  siteUrl: string
): Record<string, string> {
  if (!siteUrl) return langs;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(langs)) {
    out[k] =
      v.startsWith('http://') || v.startsWith('https://')
        ? v
        : resolveCanonicalUrl(v, siteUrl);
  }
  return out;
}

/**
 * One sitemap row compatible with Next.js `MetadataRoute.Sitemap` entries.
 */
export type BlogSitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { languages?: Record<string, string> };
};

/**
 * Builds sitemap entries for blog posts (use with `app/sitemap.ts` via `@next-md-blog/core/next`).
 */
export function getBlogSitemapEntries(
  posts: BlogPostMetadata[],
  config?: Config
): BlogSitemapEntry[] {
  const blogConfig = config || getConfig();
  const { siteUrl = '' } = blogConfig;

  return posts.map((post) => {
    const url = resolvePostUrlWithConfig(
      resolveFrontmatterField<string>(['canonicalUrl'], post.frontmatter),
      post.slug,
      siteUrl,
      blogConfig
    );

    const dateStr =
      resolveFrontmatterField<string>(['modifiedDate', 'date'], post.frontmatter) ||
      new Date().toISOString().split('T')[0];
    const parsed = new Date(dateStr);
    const lastModified = Number.isNaN(parsed.getTime()) ? dateStr : parsed;

    const languagesRaw = resolveHreflangMap(post.frontmatter, blogConfig);

    const entry: BlogSitemapEntry = {
      url,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    };

    if (languagesRaw && Object.keys(languagesRaw).length > 0) {
      entry.alternates = {
        languages: absolutizeLanguageMap(languagesRaw, siteUrl),
      };
    }

    return entry;
  });
}
