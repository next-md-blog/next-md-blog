/**
 * @next-md-blog/core public surface — 1.2.
 *
 * The shape changed: the old single-collection direct API (`getBlogPost`,
 * `generateBlogPostMetadata`, etc.) is gone. Everything content-related is now
 * collection-scoped — define one collection per content surface (blog,
 * glossary, docs, changelog, …) via `defineCollection`, then call methods on
 * the returned object. Site-wide concerns (Organization, robots, sitemap
 * composition) take a `SiteConfig`.
 */

// Site
export { defineSite } from './core/site.js';
export { generateOrganizationSchema } from './core/organization-schema.js';
export { generateWebsiteSchema } from './core/website-schema.js';
export type { WebsiteSchemaOptions } from './core/website-schema.js';
export type {
  SiteConfig,
  Author,
  SiteOrganization,
  PostalAddress,
  ContactPoint,
} from './core/site.js';

// Collections
export { defineCollection } from './core/collection.js';
export type {
  Collection,
  CollectionConfig,
  CollectionDefaults,
  ResolvedCollectionConfig,
  ContentDoc,
  ContentMetadata,
  BaseFrontmatter,
  Breadcrumb,
  ReadOptions,
  MetadataOptions,
  SchemaOptions,
  SchemaGraphOptions,
  SchemaBuilder,
  SchemaBuilderContext,
  RssOptions,
} from './core/collection.js';
export {
  slugifyAuthor,
  slugifySeries,
  authorNamesFromFrontmatter,
} from './core/collection.js';

// Composition
export {
  composeSitemap,
  composeLlmsTxt,
  composeLlmsFullTxt,
} from './core/compose.js';
export type {
  ComposeSitemapOptions,
  ComposeLlmsTxtOptions,
} from './core/compose.js';

// Shared frontmatter type — used as the default `TFrontmatter` parameter.
export type { BlogPostFrontmatter } from './core/types.js';

// Components (unchanged)
export { MarkdownContent } from './components/MarkdownContent.js';
export type {
  MarkdownContentProps,
  MarkdownComponents,
} from './components/MarkdownContent.js';
export { defaultMarkdownComponents } from './components/markdown/defaults.js';
export { OgImage } from './components/OgImage.js';
export type { OgImageProps } from './components/OgImage.js';

// Errors
export {
  MdxBlogError,
  BlogPostNotFoundError,
  FileReadError,
  DirectoryError,
} from './core/errors.js';

// Utilities
export {
  calculateReadingTime,
  calculateWordCount,
  normalizeAuthors,
} from './core/utils.js';
