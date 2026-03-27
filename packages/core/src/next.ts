import type { MetadataRoute } from 'next';
import { NextResponse } from 'next/server';
import type { BlogPost, BlogPostMetadata, Config } from './core/types.js';
import { getBlogSitemapEntries } from './core/sitemap-data.js';
import { getConfig } from './core/config.js';
import { generateRSSFeed } from './core/seo-feeds.js';

/**
 * Blog URLs for `app/sitemap.ts` (`export default` should return this or merge with static routes).
 */
export function getBlogSitemap(
  posts: BlogPostMetadata[],
  config?: Config
): MetadataRoute.Sitemap {
  return getBlogSitemapEntries(posts, config ?? getConfig()) as MetadataRoute.Sitemap;
}

/**
 * Default robots rules + sitemap URL for `app/robots.ts`.
 */
export function getBlogRobots(config?: Config): MetadataRoute.Robots {
  const c = config ?? getConfig();
  const base = c.siteUrl?.replace(/\/$/, '') || '';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}

/**
 * `NextResponse` for `app/feed.xml/route.ts` with RSS XML from `generateRSSFeed`.
 */
export function createRssFeedResponse(
  posts: BlogPost[],
  config?: Config,
  init?: ResponseInit
): NextResponse {
  const xml = generateRSSFeed(posts, config);
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/xml; charset=utf-8');
  }
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');
  }
  return new NextResponse(xml, {
    status: 200,
    ...init,
    headers,
  });
}

export { getBlogSitemapEntries } from './core/sitemap-data.js';
export type { BlogSitemapEntry } from './core/sitemap-data.js';
export { generateOrganizationSchema } from './core/organization-schema.js';
