import { describe, it, expect } from 'vitest';
import {
  validateSlug,
  validateFrontmatter,
  validateContent,
} from '../validation';

describe('validateSlug', () => {
  it('should accept valid slugs', () => {
    expect(() => validateSlug('my-blog-post')).not.toThrow();
    expect(() => validateSlug('hello-world-123')).not.toThrow();
    expect(() => validateSlug('a')).not.toThrow();
  });

  it('should throw error for empty string', () => {
    expect(() => validateSlug('')).toThrow('Slug must be a non-empty string');
  });

  it('should throw error for whitespace-only string', () => {
    expect(() => validateSlug('   ')).toThrow('Slug cannot be empty or whitespace');
    expect(() => validateSlug('\t\n')).toThrow('Slug cannot be empty or whitespace');
  });

  it('should throw error for null or undefined', () => {
    expect(() => validateSlug(null as any)).toThrow('Slug must be a non-empty string');
    expect(() => validateSlug(undefined as any)).toThrow('Slug must be a non-empty string');
  });

  it('should throw error for non-string types', () => {
    expect(() => validateSlug(123 as any)).toThrow('Slug must be a non-empty string');
    expect(() => validateSlug({} as any)).toThrow('Slug must be a non-empty string');
    expect(() => validateSlug([] as any)).toThrow('Slug must be a non-empty string');
  });

  it('should throw error for slugs with directory traversal', () => {
    expect(() => validateSlug('../post')).toThrow('Slug cannot contain path separators');
    expect(() => validateSlug('../../post')).toThrow('Slug cannot contain path separators');
    expect(() => validateSlug('post/../other')).toThrow('Slug cannot contain path separators');
  });

  it('should throw error for slugs with path separators', () => {
    expect(() => validateSlug('post/sub')).toThrow('Slug cannot contain path separators');
    expect(() => validateSlug('post\\sub')).toThrow('Slug cannot contain path separators');
  });

  it('should throw error for slugs with null bytes', () => {
    expect(() => validateSlug('post\0null')).toThrow('Slug cannot contain null bytes');
  });

  it('should return true for valid slugs', () => {
    expect(validateSlug('valid-slug')).toBe(true);
    expect(validateSlug('another_valid_slug')).toBe(true);
  });
});

describe('validateFrontmatter', () => {
  it('should return empty object for null', () => {
    expect(validateFrontmatter(null)).toEqual({});
  });

  it('should return empty object for undefined', () => {
    expect(validateFrontmatter(undefined)).toEqual({});
  });

  it('should return empty object for non-object types', () => {
    expect(validateFrontmatter('string')).toEqual({});
    expect(validateFrontmatter(123)).toEqual({});
    expect(validateFrontmatter(true)).toEqual({});
  });

  it('should return empty object for arrays', () => {
    expect(validateFrontmatter([])).toEqual({});
    expect(validateFrontmatter([1, 2, 3])).toEqual({});
  });

  it('should return the object for valid frontmatter', () => {
    const frontmatter = {
      title: 'My Post',
      date: '2024-01-01',
      description: 'A test post',
    };
    expect(validateFrontmatter(frontmatter)).toEqual(frontmatter);
  });

  it('should handle frontmatter with all optional fields', () => {
    const frontmatter = {
      title: 'My Post',
      date: '2024-01-01',
      description: 'A test post',
      author: 'John Doe',
      tags: ['test', 'blog'],
      ogImage: 'https://example.com/image.jpg',
      image: 'https://example.com/featured.jpg',
      customField: 'custom value',
    };
    expect(validateFrontmatter(frontmatter)).toEqual(frontmatter);
  });

  it('should handle empty object', () => {
    expect(validateFrontmatter({})).toEqual({});
  });
});

describe('validateContent', () => {
  it('should accept valid string content', () => {
    expect(() => validateContent('Hello world')).not.toThrow();
    expect(() => validateContent('# Markdown content')).not.toThrow();
    expect(() => validateContent('')).not.toThrow();
    expect(() => validateContent('   ')).not.toThrow();
  });

  it('should throw error for non-string types', () => {
    expect(() => validateContent(null as any)).toThrow('Content must be a string');
    expect(() => validateContent(undefined as any)).toThrow('Content must be a string');
    expect(() => validateContent(123 as any)).toThrow('Content must be a string');
    expect(() => validateContent({} as any)).toThrow('Content must be a string');
    expect(() => validateContent([] as any)).toThrow('Content must be a string');
  });

  it('should return true for valid content', () => {
    expect(validateContent('Valid content')).toBe(true);
    expect(validateContent('')).toBe(true);
  });
});


