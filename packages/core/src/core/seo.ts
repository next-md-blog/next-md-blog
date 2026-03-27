/**
 * SEO utilities and generators for next-md-blog
 * 
 * This module provides functions for generating metadata, schema.org structured data,
 * RSS feeds, and sitemap entry builders for blog posts.
 */

// Re-export all SEO functions from their respective modules
export {
  generateBlogPostMetadata,
  generateBlogListMetadata,
} from './seo-metadata.js';

export {
  generateBlogPostSchema,
  generateBreadcrumbsSchema,
  generateBlogPostSchemaGraph,
} from './seo-schema.js';
export type { BlogPostSchemaOptions } from './seo-schema.js';

export { generateRSSFeed } from './seo-feeds.js';

export { generateOrganizationSchema } from './organization-schema.js';

export { getBlogSitemapEntries } from './sitemap-data.js';
export type { BlogSitemapEntry } from './sitemap-data.js';

// Re-export utility functions that might be useful
export {
  normalizeKeywords,
  getAuthorName,
  getAuthorNames,
  ensureAuthorsResolved,
  resolveDefaultAuthor,
  buildRobotsMeta,
  resolveCanonicalUrl,
  resolvePostUrl,
  resolvePostUrlWithConfig,
  getBlogPostPathSegment,
  resolveHreflangMap,
  resolveBlogIndexUrl,
  escapeXml,
} from './seo-utils.js';
