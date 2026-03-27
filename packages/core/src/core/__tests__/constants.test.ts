import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import {
  POSTS_DIR_NAME,
  MARKDOWN_EXTENSION,
  MDX_EXTENSION,
  SUPPORTED_EXTENSIONS,
  MARKDOWN_FILE_REGEX,
  getPostsDirectory,
} from '../constants';

describe('Constants', () => {
  it('should have correct POSTS_DIR_NAME', () => {
    expect(POSTS_DIR_NAME).toBe('posts');
  });

  it('should have correct file extensions', () => {
    expect(MARKDOWN_EXTENSION).toBe('.md');
    expect(MDX_EXTENSION).toBe('.mdx');
  });

  it('should have correct SUPPORTED_EXTENSIONS array', () => {
    expect(SUPPORTED_EXTENSIONS).toEqual(['.md', '.mdx']);
    expect(SUPPORTED_EXTENSIONS).toContain(MARKDOWN_EXTENSION);
    expect(SUPPORTED_EXTENSIONS).toContain(MDX_EXTENSION);
  });

  it('should have correct MARKDOWN_FILE_REGEX', () => {
    expect(MARKDOWN_FILE_REGEX.test('post.md')).toBe(true);
    expect(MARKDOWN_FILE_REGEX.test('post.mdx')).toBe(true);
    expect(MARKDOWN_FILE_REGEX.test('post.txt')).toBe(false);
    expect(MARKDOWN_FILE_REGEX.test('post')).toBe(false);
    // Note: The regex is case-sensitive, so uppercase extensions won't match
    expect(MARKDOWN_FILE_REGEX.test('post.MD')).toBe(false);
    expect(MARKDOWN_FILE_REGEX.test('post.MDX')).toBe(false);
  });
});

describe('getPostsDirectory', () => {
  const originalCwd = process.cwd();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('should return default posts directory', () => {
    const result = getPostsDirectory();
    expect(result).toContain('posts');
    expect(result).toBe(path.join(process.cwd(), 'posts'));
  });

  it('should return custom posts directory', () => {
    const customPath = 'content/blog';
    const result = getPostsDirectory(customPath);
    expect(result).toContain('content');
    expect(result).toContain('blog');
    expect(result).toBe(path.join(process.cwd(), customPath));
  });

  it('should append locale to default directory', () => {
    const result = getPostsDirectory(undefined, 'en');
    expect(result).toContain('posts');
    expect(result).toContain('en');
    expect(result).toBe(path.join(process.cwd(), 'posts', 'en'));
  });

  it('should append locale to custom directory', () => {
    const customPath = 'content/blog';
    const result = getPostsDirectory(customPath, 'fr');
    expect(result).toContain('content');
    expect(result).toContain('blog');
    expect(result).toContain('fr');
    expect(result).toBe(path.join(process.cwd(), customPath, 'fr'));
  });

  it('should handle empty locale', () => {
    const result = getPostsDirectory(undefined, '');
    expect(result).toBe(path.join(process.cwd(), 'posts', ''));
  });

  it('should handle different locale codes', () => {
    const locales = ['en', 'fr', 'es', 'de', 'zh-CN'];
    locales.forEach((locale) => {
      const result = getPostsDirectory(undefined, locale);
      expect(result).toContain(locale);
    });
  });
});

