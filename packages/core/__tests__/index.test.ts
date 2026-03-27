import { describe, it, expect } from 'vitest';

describe('index.ts exports', () => {
  it('should export MarkdownContent', async () => {
    const module = await import('../dist/index.js');
    expect(module.MarkdownContent).toBeDefined();
    expect(typeof module.MarkdownContent).toBe('function');
  });

  // Note: TypeScript types are erased at runtime, so we can't test type exports directly
  // These are compile-time only. The types are exported in the .d.ts files.

  it('should export defaultMarkdownComponents', async () => {
    const module = await import('../dist/index.js');
    expect(module.defaultMarkdownComponents).toBeDefined();
  });

  it('should export OgImage', async () => {
    const module = await import('../dist/index.js');
    expect(module.OgImage).toBeDefined();
    expect(typeof module.OgImage).toBe('function');
  });

  // Note: TypeScript types are erased at runtime

  it('should export BlogPostSEO', async () => {
    const module = await import('../dist/index.js');
    expect(module.BlogPostSEO).toBeDefined();
    expect(typeof module.BlogPostSEO).toBe('function');
  });

  // Note: TypeScript types are erased at runtime

  it('should export getBlogPost', async () => {
    const module = await import('../dist/index.js');
    expect(module.getBlogPost).toBeDefined();
    expect(typeof module.getBlogPost).toBe('function');
  });

  it('should export getAllBlogPosts', async () => {
    const module = await import('../dist/index.js');
    expect(module.getAllBlogPosts).toBeDefined();
    expect(typeof module.getAllBlogPosts).toBe('function');
  });

  it('should export getAllBlogPostSlugs', async () => {
    const module = await import('../dist/index.js');
    expect(module.getAllBlogPostSlugs).toBeDefined();
    expect(typeof module.getAllBlogPostSlugs).toBe('function');
  });

  it('should export generateBlogPostMetadata', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateBlogPostMetadata).toBeDefined();
    expect(typeof module.generateBlogPostMetadata).toBe('function');
  });

  it('should export generateBlogListMetadata', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateBlogListMetadata).toBeDefined();
    expect(typeof module.generateBlogListMetadata).toBe('function');
  });

  it('should export generateBlogPostSchema', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateBlogPostSchema).toBeDefined();
    expect(typeof module.generateBlogPostSchema).toBe('function');
  });

  it('should export generateBreadcrumbsSchema', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateBreadcrumbsSchema).toBeDefined();
    expect(typeof module.generateBreadcrumbsSchema).toBe('function');
  });

  it('should export generateRSSFeed', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateRSSFeed).toBeDefined();
    expect(typeof module.generateRSSFeed).toBe('function');
  });

  it('should export getBlogSitemap and getBlogRobots', async () => {
    const module = await import('../dist/index.js');
    expect(module.getBlogSitemap).toBeDefined();
    expect(module.getBlogRobots).toBeDefined();
  });

  it('should export generateOrganizationSchema', async () => {
    const module = await import('../dist/index.js');
    expect(module.generateOrganizationSchema).toBeDefined();
  });

  it('should export createConfig', async () => {
    const module = await import('../dist/index.js');
    expect(module.createConfig).toBeDefined();
    expect(typeof module.createConfig).toBe('function');
  });

  it('should export loadConfig', async () => {
    const module = await import('../dist/index.js');
    expect(module.loadConfig).toBeDefined();
    expect(typeof module.loadConfig).toBe('function');
  });

  it('should export getConfig', async () => {
    const module = await import('../dist/index.js');
    expect(module.getConfig).toBeDefined();
    expect(typeof module.getConfig).toBe('function');
  });

  // Note: TypeScript types (BlogPost, BlogPostMetadata, BlogPostFrontmatter, 
  // GetBlogPostOptions, Author, Config) are erased at runtime.
  // They are available as TypeScript types in .d.ts files for compile-time checking.

  it('should export MdxBlogError', async () => {
    const module = await import('../dist/index.js');
    expect(module.MdxBlogError).toBeDefined();
  });

  it('should export BlogPostNotFoundError', async () => {
    const module = await import('../dist/index.js');
    expect(module.BlogPostNotFoundError).toBeDefined();
  });

  it('should export FileReadError', async () => {
    const module = await import('../dist/index.js');
    expect(module.FileReadError).toBeDefined();
  });

  it('should export DirectoryError', async () => {
    const module = await import('../dist/index.js');
    expect(module.DirectoryError).toBeDefined();
  });

  it('should export POSTS_DIR_NAME', async () => {
    const module = await import('../dist/index.js');
    expect(module.POSTS_DIR_NAME).toBeDefined();
    expect(module.POSTS_DIR_NAME).toBe('posts');
  });

  it('should export getPostsDirectory', async () => {
    const module = await import('../dist/index.js');
    expect(module.getPostsDirectory).toBeDefined();
    expect(typeof module.getPostsDirectory).toBe('function');
  });

  it('should export calculateReadingTime', async () => {
    const module = await import('../dist/index.js');
    expect(module.calculateReadingTime).toBeDefined();
    expect(typeof module.calculateReadingTime).toBe('function');
  });

  it('should export calculateWordCount', async () => {
    const module = await import('../dist/index.js');
    expect(module.calculateWordCount).toBeDefined();
    expect(typeof module.calculateWordCount).toBe('function');
  });

  it('should export normalizeAuthors', async () => {
    const module = await import('../dist/index.js');
    expect(module.normalizeAuthors).toBeDefined();
    expect(typeof module.normalizeAuthors).toBe('function');
  });
});

