import { describe, it, expect } from 'vitest';
import {
  MdxBlogError,
  BlogPostNotFoundError,
  FileReadError,
  DirectoryError,
} from '../errors';

describe('MdxBlogError', () => {
  it('should create error with message and code', () => {
    const error = new MdxBlogError('Test error', 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.name).toBe('MdxBlogError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MdxBlogError);
  });
});

describe('BlogPostNotFoundError', () => {
  it('should create error with slug', () => {
    const error = new BlogPostNotFoundError('my-post');
    expect(error.message).toBe('Blog post with slug "my-post" not found');
    expect(error.code).toBe('BLOG_POST_NOT_FOUND');
    expect(error.name).toBe('BlogPostNotFoundError');
    expect(error).toBeInstanceOf(MdxBlogError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should handle different slug formats', () => {
    const error1 = new BlogPostNotFoundError('hello-world');
    expect(error1.message).toContain('hello-world');

    const error2 = new BlogPostNotFoundError('123');
    expect(error2.message).toContain('123');
  });
});

describe('FileReadError', () => {
  it('should create error with file path', () => {
    const error = new FileReadError('/path/to/file.md');
    expect(error.message).toContain('/path/to/file.md');
    expect(error.message).toContain('Failed to read file');
    expect(error.code).toBe('FILE_READ_ERROR');
    expect(error.name).toBe('FileReadError');
    expect(error).toBeInstanceOf(MdxBlogError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should include original error message if provided', () => {
    const originalError = new Error('Permission denied');
    const error = new FileReadError('/path/to/file.md', originalError);
    expect(error.message).toContain('/path/to/file.md');
    expect(error.message).toContain('Permission denied');
    expect(error.code).toBe('FILE_READ_ERROR');
  });

  it('should handle missing original error', () => {
    const error = new FileReadError('/path/to/file.md');
    expect(error.message).toContain('Unknown error');
  });
});

describe('DirectoryError', () => {
  it('should create error with directory path', () => {
    const error = new DirectoryError('/path/to/directory');
    expect(error.message).toContain('/path/to/directory');
    expect(error.message).toContain('Directory operation failed');
    expect(error.code).toBe('DIRECTORY_ERROR');
    expect(error.name).toBe('DirectoryError');
    expect(error).toBeInstanceOf(MdxBlogError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should include original error message if provided', () => {
    const originalError = new Error('Access denied');
    const error = new DirectoryError('/path/to/directory', originalError);
    expect(error.message).toContain('/path/to/directory');
    expect(error.message).toContain('Access denied');
    expect(error.code).toBe('DIRECTORY_ERROR');
  });

  it('should handle missing original error', () => {
    const error = new DirectoryError('/path/to/directory');
    expect(error.message).toContain('Unknown error');
  });
});


