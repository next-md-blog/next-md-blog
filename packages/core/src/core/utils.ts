import type { Author } from './types.js';

// Regex patterns for markdown stripping (compiled once at module level)
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g;
const INLINE_CODE_REGEX = /`[^`]*`/g;
const LINK_REGEX = /\[([^\]]*)]\([^)]*\)/g;
const IMAGE_REGEX = /!\[([^\]]*)]\([^)]*\)/g;
const HTML_TAG_REGEX = /<[^>]*>/g;
const HEADER_REGEX = /#+\s+/g;
const HORIZONTAL_RULE_REGEX = /---+/g;
const LIST_MARKER_REGEX = /^[\s]*[-*+]\s+/gm;
const BLOCKQUOTE_REGEX = /^>\s+/gm;
const WHITESPACE_REGEX = /\s+/g;

// Constants
const WORDS_PER_MINUTE = 200;
const MIN_READING_TIME = 1;

/**
 * Strips markdown syntax from content to get plain text
 * @param content - The markdown content
 * @param options - Options for what to strip
 * @returns Plain text with markdown syntax removed
 */
function stripMarkdownSyntax(
  content: string,
  options: {
    includeHeaders?: boolean;
    includeLists?: boolean;
    includeBlockquotes?: boolean;
    includeHorizontalRules?: boolean;
  } = {}
): string {
  let plainText = content
    // Remove code blocks
    .replace(CODE_BLOCK_REGEX, '')
    // Remove inline code
    .replace(INLINE_CODE_REGEX, '')
    // Remove links but keep text
    .replace(LINK_REGEX, '$1')
    // Remove images
    .replace(IMAGE_REGEX, '')
    // Remove HTML tags
    .replace(HTML_TAG_REGEX, '');

  // Conditionally remove additional markdown elements
  if (options.includeHeaders) {
    plainText = plainText.replace(HEADER_REGEX, '');
  }
  if (options.includeHorizontalRules) {
    plainText = plainText.replace(HORIZONTAL_RULE_REGEX, '');
  }
  if (options.includeLists) {
    plainText = plainText.replace(LIST_MARKER_REGEX, '');
  }
  if (options.includeBlockquotes) {
    plainText = plainText.replace(BLOCKQUOTE_REGEX, '');
  }

  // Remove extra whitespace
  return plainText.replace(WHITESPACE_REGEX, ' ').trim();
}

/**
 * Calculates reading time in minutes from markdown content
 * Assumes average reading speed of 200 words per minute
 * @param content - The markdown content
 * @returns Reading time in minutes (rounded up)
 */
export function calculateReadingTime(content: string): number {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // Strip all markdown syntax including headers, lists, blockquotes, etc.
  const plainText = stripMarkdownSyntax(content, {
    includeHeaders: true,
    includeLists: true,
    includeBlockquotes: true,
    includeHorizontalRules: true,
  });

  // Count words (split by whitespace)
  const wordCount = plainText.split(/\s+/).filter((word) => word.length > 0).length;

  // Calculate reading time
  const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Minimum reading time is 1 minute
  return Math.max(MIN_READING_TIME, readingTime);
}

/**
 * Calculates word count from markdown content
 * @param content - The markdown content
 * @returns Word count
 */
export function calculateWordCount(content: string): number {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // Strip basic markdown syntax (no headers, lists, etc. for word count)
  const plainText = stripMarkdownSyntax(content);

  // Count words (split by whitespace)
  return plainText.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Resolves author names to full Author objects from config
 * Matches by full name only (case-insensitive)
 * @param authorName - Author name to resolve
 * @param configAuthors - Array of authors from config
 * @returns Author object if found, otherwise returns the name as string
 */
export function resolveAuthorFromConfig(
  authorName: string,
  configAuthors?: Author[]
): string | Author {
  // If no config authors, return name as-is (backward compatibility)
  if (!configAuthors || configAuthors.length === 0) {
    return authorName;
  }

  // Match by full name (case-insensitive)
  const found = configAuthors.find(
    (a) => a.name.toLowerCase() === authorName.toLowerCase()
  );

  return found || authorName;
}

/**
 * Extracts author name from various formats (string, object with name property, etc.)
 * @param item - Author item that could be a string or object
 * @returns Author name as string, or undefined if invalid
 */
function extractAuthorName(item: unknown): string | undefined {
  if (typeof item === 'string') {
    return item.trim() || undefined;
  }
  
  if (typeof item === 'object' && item !== null) {
    // Handle objects with name property: { name: "John Doe" }
    if ('name' in item && typeof item.name === 'string') {
      return item.name.trim() || undefined;
    }
  }
  
  return undefined;
}

/**
 * Normalizes authors to an array of strings or Author objects
 * Supports:
 * - author: "John Doe" (string)
 * - author: { name: "John Doe", affiliation: "..." } (single object with name property - Quarto format)
 * - author: ["John Doe", "Jane Smith"] (array of strings)
 * - author: [{ name: "John Doe" }, { name: "Jane Smith" }] (array of objects with name)
 * - authors: ["John Doe", "Jane Smith"] (array of strings)
 * - authors: [{ name: "John Doe" }, { name: "Jane Smith" }] (array of objects with name)
 * If configAuthors is provided, resolves author names to full Author objects by matching full name
 * Falls back to string names if authors array is not configured (backward compatible)
 * @param author - Author field from frontmatter (string, object with name, string[], or array of objects with name)
 * @param authors - Authors field from frontmatter (string[] or array of objects with name)
 * @param configAuthors - Optional array of authors from config to resolve against
 * @returns Normalized array of author names or Author objects
 */
export function normalizeAuthors(
  author?: string | { name: string; [key: string]: unknown } | (string | { name: string; [key: string]: unknown })[],
  authors?: (string | { name: string; [key: string]: unknown })[],
  configAuthors?: Author[]
): (string | Author)[] {
  const authorList: string[] = [];
  
  // First, collect from authors field
  if (Array.isArray(authors) && authors.length > 0) {
    authors.forEach((a) => {
      const name = extractAuthorName(a);
      if (name) {
        authorList.push(name);
      }
    });
  }
  
  // Then, collect from author field
  if (author) {
    if (Array.isArray(author)) {
      author.forEach((a) => {
        const name = extractAuthorName(a);
        if (name) {
          authorList.push(name);
        }
      });
    } else if (typeof author === 'string' && author.trim().length > 0) {
      authorList.push(author.trim());
    } else if (typeof author === 'object' && author !== null && 'name' in author) {
      // Handle single object: { name: "John Doe" }
      const name = extractAuthorName(author);
      if (name) {
        authorList.push(name);
      }
    }
  }
  
  // Remove duplicates while preserving order
  const uniqueAuthors = authorList.filter((a, i, arr) => arr.indexOf(a) === i);
  
  // Resolve authors from config if available
  if (configAuthors && configAuthors.length > 0) {
    return uniqueAuthors.map((name) => resolveAuthorFromConfig(name, configAuthors));
  }
  
  return uniqueAuthors;
}
