import type { BlogPost, BlogPostMetadata, Author, Config } from '../types.js';

/**
 * Test fixtures for common data structures used in tests
 */

/**
 * Creates a mock BlogPost for testing
 */
export function createMockBlogPost(overrides?: Partial<BlogPost>): BlogPost {
  return {
    slug: 'test-post',
    content: '# Test Post\n\nThis is a test blog post content.',
    frontmatter: {
      title: 'Test Post',
      description: 'A test blog post',
      date: '2024-01-01',
      author: 'John Doe',
      tags: ['test', 'blog'],
    },
    readingTime: 1,
    wordCount: 5,
    authors: ['John Doe'],
    ...overrides,
  };
}

/**
 * Creates a mock BlogPostMetadata for testing
 */
export function createMockBlogPostMetadata(overrides?: Partial<BlogPostMetadata>): BlogPostMetadata {
  return {
    slug: 'test-post',
    frontmatter: {
      title: 'Test Post',
      description: 'A test blog post',
      date: '2024-01-01',
      author: 'John Doe',
      tags: ['test', 'blog'],
    },
    authors: ['John Doe'],
    ...overrides,
  };
}

/**
 * Creates a mock Author object for testing
 */
export function createMockAuthor(overrides?: Partial<Author>): Author {
  return {
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Test author bio',
    ...overrides,
  };
}

/**
 * Creates a mock Config object for testing
 */
export function createMockConfig(overrides?: Partial<Config>): Config {
  return {
    siteName: 'Test Blog',
    siteUrl: 'https://example.com',
    defaultAuthor: 'Test Author',
    defaultLang: 'en',
    ...overrides,
  };
}

/**
 * Creates a mock frontmatter object for testing
 */
export function createMockFrontmatter(overrides?: Record<string, unknown>) {
  return {
    title: 'Test Post',
    description: 'A test blog post',
    date: '2024-01-01',
    author: 'John Doe',
    tags: ['test', 'blog'],
    ...overrides,
  };
}

/**
 * Creates a mock file system structure for testing
 */
export interface MockFileSystem {
  files: Record<string, string>;
  directories: string[];
}

/**
 * Creates a mock file system result
 */
export function createMockFileSystem(): MockFileSystem {
  return {
    files: {
      'posts/test-post.md': '---\ntitle: Test Post\ndate: 2024-01-01\n---\n# Content',
      'posts/another-post.md': '---\ntitle: Another Post\ndate: 2024-01-02\n---\n# Content',
    },
    directories: ['posts', 'posts/en', 'posts/fr'],
  };
}

