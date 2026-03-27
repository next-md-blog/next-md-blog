import path from 'path';

/**
 * Default directory name for blog posts
 */
export const POSTS_DIR_NAME = 'posts';

/**
 * Markdown file extension
 */
export const MARKDOWN_EXTENSION = '.md';

/**
 * MDX file extension
 */
export const MDX_EXTENSION = '.mdx';

/**
 * Array of supported file extensions
 */
export const SUPPORTED_EXTENSIONS = [MARKDOWN_EXTENSION, MDX_EXTENSION];

/**
 * Regular expression to match markdown and MDX files
 */
export const MARKDOWN_FILE_REGEX = /\.(md|mdx)$/;

/**
 * Default configuration values
 */
export const DEFAULT_SITE_NAME = 'My Blog';
export const DEFAULT_BLOG_ROUTE = 'blog';
export const DEFAULT_BLOGS_ROUTE = 'blogs';
export const DEFAULT_LANG = 'en';
export const RSS_POST_LIMIT = 20;

/**
 * Gets the posts directory path relative to the current working directory
 * @param customPath - Optional custom path to posts directory
 * @param locale - Optional locale code. If provided, appends /{locale} to the posts directory path
 * @returns The full path to the posts directory
 */
export function getPostsDirectory(customPath?: string, locale?: string): string {
  const baseDir = customPath || POSTS_DIR_NAME;
  const postsDir = path.join(process.cwd(), baseDir);
  
  // If locale is provided, append it to the path (e.g., posts/en/)
  if (locale) {
    return path.join(postsDir, locale);
  }
  
  return postsDir;
}
