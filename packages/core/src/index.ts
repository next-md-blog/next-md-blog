// Components
export { MarkdownContent } from './components/MarkdownContent.js';
export type { MarkdownContentProps, MarkdownComponents } from './components/MarkdownContent.js';
export { defaultMarkdownComponents } from './components/markdown/defaults.js';
export { OgImage } from './components/OgImage.js';
export type { OgImageProps } from './components/OgImage.js';
export { BlogPostSEO } from './components/BlogPostSEO.js';
export type { BlogPostSEOProps } from './components/BlogPostSEO.js';

// Utilities
export { getBlogPost, getAllBlogPosts, getAllBlogPostSlugs } from './core/file-utils.js';

// SEO
export {
  generateBlogPostMetadata,
  generateBlogListMetadata,
  generateBlogPostSchema,
  generateBreadcrumbsSchema,
  generateBlogPostSchemaGraph,
  generateRSSFeed,
  generateOrganizationSchema,
  getBlogSitemapEntries,
} from './core/seo.js';
export type { BlogPostSchemaOptions, BlogSitemapEntry } from './core/seo.js';

export {
  getBlogSitemap,
  getBlogRobots,
  createRssFeedResponse,
} from './next.js';

// Config
export { createConfig, loadConfig, getConfig } from './core/config.js';

// Types
export type {
  BlogPost,
  BlogPostMetadata,
  BlogPostFrontmatter,
  GetBlogPostOptions,
  Author,
  Config,
  SiteOrganization,
} from './core/types.js';

// Errors
export {
  MdxBlogError,
  BlogPostNotFoundError,
  FileReadError,
  DirectoryError,
} from './core/errors.js';

// Constants
export { POSTS_DIR_NAME, getPostsDirectory } from './core/constants.js';

// Utilities
export { calculateReadingTime, calculateWordCount, normalizeAuthors } from './core/utils.js';

