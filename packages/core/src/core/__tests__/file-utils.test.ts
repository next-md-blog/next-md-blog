import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getBlogPost, getAllBlogPosts, getAllBlogPostSlugs } from '../file-utils';
import { BlogPostNotFoundError, FileReadError } from '../errors';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  },
}));

// Mock gray-matter
vi.mock('gray-matter', () => ({
  default: vi.fn(),
}));

describe('getBlogPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return blog post for .md file', async () => {
    const slug = 'test-post';
    const filePath = path.join(process.cwd(), 'posts', `${slug}.md`);
    const fileContent = '---\ntitle: Test Post\ndate: 2024-01-01\n---\n# Content';

    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as any).mockReturnValue(fileContent);

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Test Post', date: '2024-01-01' },
      content: '# Content',
    } as any);

    const result = await getBlogPost(slug);

    expect(result).toBeDefined();
    expect(result?.slug).toBe(slug);
    expect(result?.content).toBe('# Content');
    expect(result?.frontmatter.title).toBe('Test Post');
  });

  it('should return blog post for .mdx file', async () => {
    const slug = 'test-post';
    const filePath = path.join(process.cwd(), 'posts', `${slug}.mdx`);
    const fileContent = '---\ntitle: Test Post\n---\n# Content';

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === filePath;
    });
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as any).mockReturnValue(fileContent);

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Test Post' },
      content: '# Content',
    } as any);

    const result = await getBlogPost(slug);

    expect(result).toBeDefined();
    expect(result?.slug).toBe(slug);
  });

  it('should return null when post not found', async () => {
    const slug = 'non-existent';

    (fs.existsSync as any).mockReturnValue(false);

    const result = await getBlogPost(slug);

    expect(result).toBeNull();
  });

  it('should throw BlogPostNotFoundError for invalid slug', async () => {
    await expect(getBlogPost('../invalid')).rejects.toThrow();
  });

  it('should use custom posts directory', async () => {
    const slug = 'test-post';
    const customDir = 'content/blog';
    const filePath = path.join(process.cwd(), customDir, `${slug}.md`);
    const fileContent = '---\ntitle: Test\n---\nContent';

    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as any).mockReturnValue(fileContent);

    vi.mocked(matter).mockReturnValue({
      data: {},
      content: 'Content',
    } as any);

    const result = await getBlogPost(slug, { postsDir: customDir });

    expect(result).toBeDefined();
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
  });

  it('should use locale directory', async () => {
    const slug = 'test-post';
    const locale = 'en';
    const filePath = path.join(process.cwd(), 'posts', locale, `${slug}.md`);
    const fileContent = '---\ntitle: Test\n---\nContent';

    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as any).mockReturnValue(fileContent);

    vi.mocked(matter).mockReturnValue({
      data: {},
      content: 'Content',
    } as any);

    const result = await getBlogPost(slug, { locale });

    expect(result).toBeDefined();
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
  });

  it('should throw FileReadError when file cannot be read', async () => {
    const slug = 'test-post';
    const filePath = path.join(process.cwd(), 'posts', `${slug}.md`);

    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ isFile: () => true });
    (fs.readFileSync as any).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    await expect(getBlogPost(slug)).rejects.toThrow(FileReadError);
  });
});

describe('getAllBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all blog posts sorted by date', async () => {
    const files = ['post-1.md', 'post-2.md', 'post-3.mdx'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockImplementation((filePath: string) => {
      if (filePath.includes('post-1')) {
        return '---\ntitle: Post 1\ndate: 2024-01-01\n---\n';
      }
      if (filePath.includes('post-2')) {
        return '---\ntitle: Post 2\ndate: 2024-01-03\n---\n';
      }
      if (filePath.includes('post-3')) {
        return '---\ntitle: Post 3\ndate: 2024-01-02\n---\n';
      }
      return '';
    });

    vi.mocked(matter).mockImplementation((content: string) => {
      if (content.includes('Post 1')) {
        return { data: { title: 'Post 1', date: '2024-01-01' }, content: '' } as any;
      }
      if (content.includes('Post 2')) {
        return { data: { title: 'Post 2', date: '2024-01-03' }, content: '' } as any;
      }
      if (content.includes('Post 3')) {
        return { data: { title: 'Post 3', date: '2024-01-02' }, content: '' } as any;
      }
      return { data: {}, content: '' } as any;
    });

    const result = await getAllBlogPosts();

    expect(result).toHaveLength(3);
    expect(result[0].slug).toBe('post-2'); // Newest first
    expect(result[1].slug).toBe('post-3');
    expect(result[2].slug).toBe('post-1');
  });

  it('should filter out non-markdown files', async () => {
    const files = ['post-1.md', 'post-2.txt', 'post-3.mdx', 'readme.md'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockReturnValue('---\ntitle: Test\n---\n');

    vi.mocked(matter).mockReturnValue({ data: { title: 'Test' }, content: '' } as any);

    const result = await getAllBlogPosts();

    // Should only include .md and .mdx files
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((post) => ['post-1', 'post-3', 'readme'].includes(post.slug))).toBe(true);
  });

  it('should return empty array when directory does not exist', async () => {
    (fs.existsSync as any).mockReturnValue(false);

    const result = await getAllBlogPosts();

    expect(result).toEqual([]);
  });

  it('should return empty array on DirectoryError', async () => {
    (fs.existsSync as any).mockReturnValue(true);
    (fs.statSync as any).mockReturnValue({ isDirectory: () => true });
    (fs.readdirSync as any).mockImplementation(() => {
      throw new Error('Access denied');
    });

    const result = await getAllBlogPosts();

    expect(result).toEqual([]);
  });

  it('should skip files that cannot be parsed', async () => {
    const files = ['valid.md', 'invalid.md'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockImplementation((filePath: string) => {
      if (filePath.includes('invalid')) {
        throw new Error('Parse error');
      }
      return '---\ntitle: Valid\n---\n';
    });

    vi.mocked(matter).mockImplementation((content: string) => {
      if (content.includes('Valid')) {
        return { data: { title: 'Valid' }, content: '' } as any;
      }
      throw new Error('Parse error');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getAllBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('valid');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should use custom posts directory', async () => {
    const customDir = 'content/blog';
    const files = ['post.md'];
    const postsDir = path.join(process.cwd(), customDir);

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockReturnValue('---\ntitle: Test\n---\n');

    vi.mocked(matter).mockReturnValue({ data: { title: 'Test' }, content: '' } as any);

    await getAllBlogPosts({ postsDir: customDir });

    expect(fs.readdirSync).toHaveBeenCalledWith(postsDir);
  });

  it('should use locale directory', async () => {
    const locale = 'fr';
    const files = ['post.md'];
    const postsDir = path.join(process.cwd(), 'posts', locale);

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockReturnValue('---\ntitle: Test\n---\n');

    vi.mocked(matter).mockReturnValue({ data: { title: 'Test' }, content: '' } as any);

    await getAllBlogPosts({ locale });

    expect(fs.readdirSync).toHaveBeenCalledWith(postsDir);
  });

  it('should handle posts without dates', async () => {
    const files = ['post-1.md', 'post-2.md'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockReturnValue('---\ntitle: Test\n---\n');

    vi.mocked(matter).mockReturnValue({ data: { title: 'Test' }, content: '' } as any);

    const result = await getAllBlogPosts();

    expect(result).toHaveLength(2);
    // Posts without dates should still be included
  });
});

describe('getAllBlogPostSlugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return array of slugs', async () => {
    const files = ['post-1.md', 'post-2.mdx'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockReturnValue('---\ntitle: Test\n---\n');

    vi.mocked(matter).mockReturnValue({ data: { title: 'Test' }, content: '' } as any);

    const result = await getAllBlogPostSlugs();

    expect(result).toContain('post-1');
    expect(result).toContain('post-2');
    expect(result.length).toBe(2);
  });

  it('should return empty array when no posts', async () => {
    (fs.existsSync as any).mockReturnValue(false);

    const result = await getAllBlogPostSlugs();

    expect(result).toEqual([]);
  });

  it('should respect sorting from getAllBlogPosts', async () => {
    const files = ['old.md', 'new.md'];
    const postsDir = path.join(process.cwd(), 'posts');

    (fs.existsSync as any).mockImplementation((p: string) => {
      return p === postsDir || files.some(f => p.includes(f));
    });
    (fs.statSync as any).mockImplementation((p: string) => {
      if (p === postsDir) {
        return { isDirectory: () => true };
      }
      return { isFile: () => true };
    });
    (fs.readdirSync as any).mockReturnValue(files);
    (fs.readFileSync as any).mockImplementation((filePath: string) => {
      if (filePath.includes('old')) {
        return '---\ntitle: Old\ndate: 2024-01-01\n---\n';
      }
      return '---\ntitle: New\ndate: 2024-01-02\n---\n';
    });

    vi.mocked(matter).mockImplementation((content: string) => {
      if (content.includes('Old')) {
        return { data: { title: 'Old', date: '2024-01-01' }, content: '' } as any;
      }
      return { data: { title: 'New', date: '2024-01-02' }, content: '' } as any;
    });

    const result = await getAllBlogPostSlugs();

    expect(result[0]).toBe('new'); // Newest first
    expect(result[1]).toBe('old');
  });
});

