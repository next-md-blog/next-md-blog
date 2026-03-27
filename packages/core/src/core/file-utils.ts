import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getPostsDirectory, SUPPORTED_EXTENSIONS, MARKDOWN_FILE_REGEX } from './constants.js';
import type { BlogPost, BlogPostMetadata, GetBlogPostOptions, Config } from './types.js';
import { validateSlug, validateFrontmatter, validateContent } from './validation.js';
import { BlogPostNotFoundError, FileReadError, DirectoryError } from './errors.js';
import { calculateReadingTime, calculateWordCount, normalizeAuthors } from './utils.js';
import { getConfig } from './config.js';

/**
 * Safely reads a file and returns its contents
 * @param filePath - Path to the file
 * @returns File contents or null if file doesn't exist
 * @throws {FileReadError} If file exists but cannot be read
 */
function readFileSafe(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return null;
    }

    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new FileReadError(
      filePath,
      error instanceof Error ? error : undefined,
      { operation: 'readFileSafe' }
    );
  }
}

/**
 * Safely reads directory contents
 * @param dirPath - Path to the directory
 * @returns Array of filenames or empty array if directory doesn't exist
 * @throws {DirectoryError} If directory exists but cannot be read
 */
function readDirectorySafe(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      return [];
    }

    return fs.readdirSync(dirPath);
  } catch (error) {
    throw new DirectoryError(
      dirPath,
      error instanceof Error ? error : undefined,
      { operation: 'readDirectorySafe' }
    );
  }
}

/**
 * Parses a markdown or MDX file and extracts frontmatter and content
 * @param filePath - Path to the markdown or MDX file
 * @param slug - The slug for the post
 * @param config - Optional blog configuration for author resolution
 * @returns Parsed blog post
 * @throws {FileReadError} If file cannot be read or parsed
 */
function parseMarkdownFile(filePath: string, slug: string, config?: Config): BlogPost {
  const fileContents = readFileSafe(filePath);
  
  if (fileContents === null) {
    throw new BlogPostNotFoundError(slug);
  }

  try {
    const { data: frontmatter, content } = matter(fileContents);
    validateContent(content);
    
    const trimmedContent = content.trim();
    const validatedFrontmatter = validateFrontmatter(frontmatter);
    
    // Automatically calculate reading time and word count
    // Use frontmatter value if provided, otherwise calculate
    const readingTime = (validatedFrontmatter.readingTime as number) || calculateReadingTime(trimmedContent);
    const wordCount = calculateWordCount(trimmedContent);
    
    // Use provided config or fallback to defaults
    const blogConfig = config || getConfig();
    
    // Normalize authors (resolve from config if available)
    const authors = normalizeAuthors(
      validatedFrontmatter.author as string | string[] | undefined,
      validatedFrontmatter.authors as string[] | undefined,
      blogConfig.authors
    );
    
    return {
      slug,
      content: trimmedContent,
      frontmatter: validatedFrontmatter,
      readingTime,
      wordCount,
      authors,
    };
  } catch (error) {
    throw new FileReadError(
      filePath,
      error instanceof Error ? error : new Error('Failed to parse markdown'),
      { operation: 'parseMarkdownFile', slug }
    );
  }
}

/**
 * Gets a single blog post by slug
 * @param slug - The slug of the blog post (filename without .md or .mdx extension)
 * @param options - Optional configuration
 * @returns The blog post or null if not found
 * @throws {Error} If slug is invalid or file cannot be read
 */
export async function getBlogPost(
  slug: string,
  options: GetBlogPostOptions = {}
): Promise<BlogPost | null> {
  try {
    validateSlug(slug);
    const postsDir = getPostsDirectory(options.postsDir, options.locale);
    
    // Try both .md and .mdx extensions
    for (const ext of SUPPORTED_EXTENSIONS) {
      const filePath = path.join(postsDir, `${slug}${ext}`);
      const fileContents = readFileSafe(filePath);
      
      if (fileContents !== null) {
        return parseMarkdownFile(filePath, slug, options.config);
      }
    }
    
    return null;
  } catch (error) {
    if (error instanceof BlogPostNotFoundError || error instanceof FileReadError) {
      throw error;
    }
    // Re-throw validation errors
    throw error;
  }
}

/**
 * Gets all blog posts from the posts directory
 * @param options - Optional configuration
 * @returns Array of blog post metadata, sorted by date (newest first)
 */
export async function getAllBlogPosts(
  options: GetBlogPostOptions = {}
): Promise<BlogPostMetadata[]> {
  try {
    const postsDir = getPostsDirectory(options.postsDir, options.locale);
    const files = readDirectorySafe(postsDir);

    const mdFiles = files.filter((file) => MARKDOWN_FILE_REGEX.test(file));

    const blogConfig = options.config || getConfig();

    const posts = mdFiles
      .map((file) => {
        try {
          // Remove both .md and .mdx extensions
          const slug = file.replace(MARKDOWN_FILE_REGEX, '');
          const filePath = path.join(postsDir, file);
          const fileContents = readFileSafe(filePath);

          if (fileContents === null) {
            return null;
          }

          const { data: frontmatter } = matter(fileContents);
          const validatedFrontmatter = validateFrontmatter(frontmatter);

          const authors = normalizeAuthors(
            validatedFrontmatter.author as string | string[] | undefined,
            validatedFrontmatter.authors as string[] | undefined,
            blogConfig.authors
          );

          return {
            slug,
            frontmatter: validatedFrontmatter,
            authors,
          };
        } catch (error) {
          // Skip files that cannot be parsed
          // In production, consider logging to a structured logger instead of console.warn
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.warn(`Skipping file ${file}: ${errorMessage}`);
          return null;
        }
      })
      .filter((post): post is BlogPostMetadata => post !== null)
      .sort((a, b) => {
        const dateA = a.frontmatter?.date || '';
        const dateB = b.frontmatter?.date || '';
        return dateB.localeCompare(dateA);
      });

    return posts;
  } catch (error) {
    // If directory doesn't exist, return empty array
    if (error instanceof DirectoryError) {
      return [];
    }
    throw error;
  }
}

/**
 * Gets all blog post slugs
 * @param options - Optional configuration
 * @returns Array of slug strings
 */
export function getAllBlogPostSlugs(
  options: GetBlogPostOptions = {}
): Promise<string[]> {
  return getAllBlogPosts(options).then((posts) => posts.map((post) => post.slug));
}

