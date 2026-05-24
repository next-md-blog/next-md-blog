/**
 * Next.js-specific helpers exposed at `@next-md-blog/core/next`.
 *
 * Most output (sitemap, RSS) is now collection-scoped; this entry point
 * keeps only the site-level robots helper, plus re-exports for ergonomics.
 */
import type { MetadataRoute } from 'next';
import type { SiteConfig } from './core/site.js';

/**
 * Default `robots.txt` rules for `app/robots.ts`.
 *
 * @example
 *   // app/robots.ts
 *   import { getRobots } from '@next-md-blog/core/next';
 *   import site from '@/site.config';
 *   export default () => getRobots(site);
 */
export function getRobots(site: SiteConfig): MetadataRoute.Robots {
  const base = site.siteUrl.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}

export { generateWebsiteSchema } from './core/website-schema.js';
export type { WebsiteSchemaOptions } from './core/website-schema.js';
export { composeSitemap, composeLlmsTxt, composeLlmsFullTxt } from './core/compose.js';
export type {
  ComposeSitemapOptions,
  ComposeLlmsTxtOptions,
} from './core/compose.js';
