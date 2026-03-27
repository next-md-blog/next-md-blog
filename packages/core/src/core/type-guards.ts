import type { BlogPostFrontmatter, Author } from './types.js';

/**
 * Type guard to check if a value is a non-empty string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard to check if a value is a string array
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is an Author object
 */
export function isAuthorObject(
  value: unknown
): value is { name: string; [key: string]: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as { name: unknown }).name === 'string'
  );
}

/**
 * Type guard to check if a value is an Author
 */
export function isAuthor(value: unknown): value is Author {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof (value as Author).name === 'string'
  );
}

/**
 * Gets a string field from frontmatter with fallback
 * @param frontmatter - Blog post frontmatter object
 * @param field - Field name to extract
 * @param fallback - Optional fallback value if field is missing or invalid
 * @returns String value or undefined
 */
export function getStringField(
  frontmatter: BlogPostFrontmatter,
  field: keyof BlogPostFrontmatter,
  fallback?: string
): string | undefined {
  const value = frontmatter[field];
  return isString(value) ? value : fallback;
}

/**
 * Gets a number field from frontmatter with fallback
 * @param frontmatter - Blog post frontmatter object
 * @param field - Field name to extract
 * @param fallback - Optional fallback value if field is missing or invalid
 * @returns Number value or undefined
 */
export function getNumberField(
  frontmatter: BlogPostFrontmatter,
  field: keyof BlogPostFrontmatter,
  fallback?: number
): number | undefined {
  const value = frontmatter[field];
  return isNumber(value) ? value : fallback;
}

/**
 * Resolves a frontmatter field from multiple possible field names
 * Checks fields in order and returns the first valid value found
 * @param fields - Array of field names to check (in priority order)
 * @param frontmatter - Blog post frontmatter object
 * @param fallback - Optional fallback value if no fields are found
 * @returns First valid field value or fallback
 * @example
 * ```typescript
 * const title = resolveFrontmatterField<string>(
 *   ['seoTitle', 'title'],
 *   frontmatter,
 *   'Default Title'
 * );
 * ```
 */
export function resolveFrontmatterField<T>(
  fields: Array<keyof BlogPostFrontmatter>,
  frontmatter: BlogPostFrontmatter,
  fallback?: T
): T | undefined {
  for (const field of fields) {
    const value = frontmatter[field];
    if (value !== undefined && value !== null && value !== '') {
      return value as T;
    }
  }
  return fallback;
}


