import type { BlogPostFrontmatter } from './types';

/**
 * Validates that a slug is safe and valid
 * @param slug - The slug to validate
 * @returns True if valid, throws error if invalid
 * @throws {Error} If slug is invalid
 */
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Slug must be a non-empty string');
  }

  if (slug.trim().length === 0) {
    throw new Error('Slug cannot be empty or whitespace');
  }

  // Prevent directory traversal and invalid characters
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    throw new Error('Slug cannot contain path separators or directory traversal sequences');
  }

  // Prevent null bytes
  if (slug.includes('\0')) {
    throw new Error('Slug cannot contain null bytes');
  }

  return true;
}

/**
 * Validates frontmatter data
 * @param frontmatter - The frontmatter to validate
 * @returns Validated frontmatter
 */
export function validateFrontmatter(frontmatter: unknown): BlogPostFrontmatter {
  if (!frontmatter || typeof frontmatter !== 'object') {
    return {};
  }

  // Ensure it's a plain object
  if (Array.isArray(frontmatter)) {
    return {};
  }

  return frontmatter as BlogPostFrontmatter;
}

/**
 * Validates markdown content
 * @param content - The content to validate
 * @returns True if valid
 * @throws {Error} If content is invalid
 */
export function validateContent(content: string): boolean {
  if (typeof content !== 'string') {
    throw new Error('Content must be a string');
  }
  return true;
}

