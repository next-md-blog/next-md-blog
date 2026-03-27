import { describe, it, expect } from 'vitest';
import {
  createMockBlogPost,
  createMockBlogPostMetadata,
  createMockAuthor,
  createMockConfig,
  createMockFrontmatter,
  createMockFileSystem,
} from './fixtures';
import type { BlogPost, BlogPostMetadata, Author, Config } from '../types';

describe('createMockBlogPost', () => {
  it('should create a mock blog post with default values', () => {
    const post = createMockBlogPost();

    expect(post.slug).toBe('test-post');
    expect(post.content).toBe('# Test Post\n\nThis is a test blog post content.');
    expect(post.frontmatter.title).toBe('Test Post');
    expect(post.frontmatter.description).toBe('A test blog post');
    expect(post.frontmatter.date).toBe('2024-01-01');
    expect(post.frontmatter.author).toBe('John Doe');
    expect(post.frontmatter.tags).toEqual(['test', 'blog']);
    expect(post.readingTime).toBe(1);
    expect(post.wordCount).toBe(5);
    expect(post.authors).toEqual(['John Doe']);
  });

  it('should allow overriding default values', () => {
    const post = createMockBlogPost({
      slug: 'custom-post',
      content: 'Custom content',
      readingTime: 5,
    });

    expect(post.slug).toBe('custom-post');
    expect(post.content).toBe('Custom content');
    expect(post.readingTime).toBe(5);
    expect(post.wordCount).toBe(5); // Still default
  });

  it('should allow overriding frontmatter', () => {
    const post = createMockBlogPost({
      frontmatter: {
        ...createMockBlogPost().frontmatter,
        title: 'Custom Title',
        date: '2024-12-31',
      },
    });

    expect(post.frontmatter.title).toBe('Custom Title');
    expect(post.frontmatter.date).toBe('2024-12-31');
    expect(post.frontmatter.description).toBe('A test blog post'); // Still default
  });

  it('should allow overriding authors', () => {
    const post = createMockBlogPost({
      authors: ['Jane Smith', 'John Doe'],
    });

    expect(post.authors).toEqual(['Jane Smith', 'John Doe']);
  });
});

describe('createMockBlogPostMetadata', () => {
  it('should create a mock blog post metadata with default values', () => {
    const metadata = createMockBlogPostMetadata();

    expect(metadata.slug).toBe('test-post');
    expect(metadata.frontmatter.title).toBe('Test Post');
    expect(metadata.frontmatter.description).toBe('A test blog post');
    expect(metadata.frontmatter.date).toBe('2024-01-01');
    expect(metadata.frontmatter.author).toBe('John Doe');
    expect(metadata.frontmatter.tags).toEqual(['test', 'blog']);
    expect(metadata.authors).toEqual(['John Doe']);
  });

  it('should allow overriding default values', () => {
    const metadata = createMockBlogPostMetadata({
      slug: 'custom-metadata',
      frontmatter: {
        title: 'Custom Metadata Title',
      },
    });

    expect(metadata.slug).toBe('custom-metadata');
    expect(metadata.frontmatter.title).toBe('Custom Metadata Title');
  });

  it('should not include content, readingTime, or wordCount', () => {
    const metadata = createMockBlogPostMetadata();
    expect('content' in metadata).toBe(false);
    expect('readingTime' in metadata).toBe(false);
    expect('wordCount' in metadata).toBe(false);
  });
});

describe('createMockAuthor', () => {
  it('should create a mock author with default values', () => {
    const author = createMockAuthor();

    expect(author.name).toBe('John Doe');
    expect(author.email).toBe('john@example.com');
    expect(author.bio).toBe('Test author bio');
  });

  it('should allow overriding default values', () => {
    const author = createMockAuthor({
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'Custom bio',
      url: 'https://jane.example.com',
      twitter: '@janesmith',
    });

    expect(author.name).toBe('Jane Smith');
    expect(author.email).toBe('jane@example.com');
    expect(author.bio).toBe('Custom bio');
    expect(author.url).toBe('https://jane.example.com');
    expect(author.twitter).toBe('@janesmith');
  });

  it('should allow partial overrides', () => {
    const author = createMockAuthor({
      name: 'Custom Name',
    });

    expect(author.name).toBe('Custom Name');
    expect(author.email).toBe('john@example.com'); // Still default
    expect(author.bio).toBe('Test author bio'); // Still default
  });
});

describe('createMockConfig', () => {
  it('should create a mock config with default values', () => {
    const config = createMockConfig();

    expect(config.siteName).toBe('Test Blog');
    expect(config.siteUrl).toBe('https://example.com');
    expect(config.defaultAuthor).toBe('Test Author');
    expect(config.defaultLang).toBe('en');
  });

  it('should allow overriding default values', () => {
    const config = createMockConfig({
      siteName: 'Custom Blog',
      siteUrl: 'https://custom.com',
      defaultAuthor: 'Custom Author',
      twitterHandle: '@custom',
    });

    expect(config.siteName).toBe('Custom Blog');
    expect(config.siteUrl).toBe('https://custom.com');
    expect(config.defaultAuthor).toBe('Custom Author');
    expect(config.twitterHandle).toBe('@custom');
  });

  it('should allow partial overrides', () => {
    const config = createMockConfig({
      siteName: 'Partial Override',
    });

    expect(config.siteName).toBe('Partial Override');
    expect(config.siteUrl).toBe('https://example.com'); // Still default
  });
});

describe('createMockFrontmatter', () => {
  it('should create a mock frontmatter with default values', () => {
    const frontmatter = createMockFrontmatter();

    expect(frontmatter.title).toBe('Test Post');
    expect(frontmatter.description).toBe('A test blog post');
    expect(frontmatter.date).toBe('2024-01-01');
    expect(frontmatter.author).toBe('John Doe');
    expect(frontmatter.tags).toEqual(['test', 'blog']);
  });

  it('should allow overriding default values', () => {
    const frontmatter = createMockFrontmatter({
      title: 'Custom Title',
      date: '2024-12-31',
      customField: 'custom value',
    });

    expect(frontmatter.title).toBe('Custom Title');
    expect(frontmatter.date).toBe('2024-12-31');
    expect(frontmatter.customField).toBe('custom value');
    expect(frontmatter.description).toBe('A test blog post'); // Still default
  });

  it('should allow adding new fields', () => {
    const frontmatter = createMockFrontmatter({
      category: 'Tech',
      published: true,
    });

    expect(frontmatter.category).toBe('Tech');
    expect(frontmatter.published).toBe(true);
  });
});

describe('createMockFileSystem', () => {
  it('should create a mock file system with default files and directories', () => {
    const mockFs = createMockFileSystem();

    expect(mockFs.files).toHaveProperty('posts/test-post.md');
    expect(mockFs.files).toHaveProperty('posts/another-post.md');
    expect(mockFs.files['posts/test-post.md']).toContain('title: Test Post');
    expect(mockFs.files['posts/another-post.md']).toContain('title: Another Post');
    expect(mockFs.directories).toContain('posts');
    expect(mockFs.directories).toContain('posts/en');
    expect(mockFs.directories).toContain('posts/fr');
  });

  it('should return files as a record', () => {
    const mockFs = createMockFileSystem();

    expect(typeof mockFs.files).toBe('object');
    expect(Array.isArray(mockFs.files)).toBe(false);
  });

  it('should return directories as an array', () => {
    const mockFs = createMockFileSystem();

    expect(Array.isArray(mockFs.directories)).toBe(true);
    expect(mockFs.directories.length).toBe(3);
  });

  it('should have valid markdown file content', () => {
    const mockFs = createMockFileSystem();

    expect(mockFs.files['posts/test-post.md']).toContain('---');
    expect(mockFs.files['posts/test-post.md']).toContain('# Content');
  });
});

