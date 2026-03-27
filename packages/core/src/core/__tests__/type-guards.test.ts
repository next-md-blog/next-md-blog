import { describe, it, expect } from 'vitest';
import {
  isString,
  isStringArray,
  isNumber,
  isAuthorObject,
  isAuthor,
  getStringField,
  getNumberField,
  resolveFrontmatterField,
} from '../type-guards';
import type { BlogPostFrontmatter, Author } from '../types';
import { createMockFrontmatter } from './fixtures';

describe('isString', () => {
  it('should return true for non-empty strings', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('test')).toBe(true);
    expect(isString(' ')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isString('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString({})).toBe(false);
  });
});

describe('isStringArray', () => {
  it('should return true for array of strings', () => {
    expect(isStringArray(['hello', 'world'])).toBe(true);
    expect(isStringArray(['test'])).toBe(true);
    expect(isStringArray([])).toBe(true);
  });

  it('should return false for array with non-string values', () => {
    expect(isStringArray(['hello', 123])).toBe(false);
    expect(isStringArray([null])).toBe(false);
    expect(isStringArray([undefined])).toBe(false);
    expect(isStringArray([{}])).toBe(false);
  });

  it('should return false for non-array values', () => {
    expect(isStringArray('hello')).toBe(false);
    expect(isStringArray(123)).toBe(false);
    expect(isStringArray(null)).toBe(false);
    expect(isStringArray(undefined)).toBe(false);
    expect(isStringArray({})).toBe(false);
  });
});

describe('isNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(123)).toBe(true);
    expect(isNumber(-123)).toBe(true);
    expect(isNumber(123.45)).toBe(true);
  });

  it('should return false for NaN', () => {
    expect(isNumber(NaN)).toBe(false);
  });

  it('should return false for non-number values', () => {
    expect(isNumber('123')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber({})).toBe(false);
  });
});

describe('isAuthorObject', () => {
  it('should return true for object with name property', () => {
    expect(isAuthorObject({ name: 'John Doe' })).toBe(true);
    expect(isAuthorObject({ name: 'John', email: 'john@example.com' })).toBe(true);
  });

  it('should return false for object without name property', () => {
    expect(isAuthorObject({ email: 'john@example.com' })).toBe(false);
    expect(isAuthorObject({})).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isAuthorObject('John Doe')).toBe(false);
    expect(isAuthorObject(123)).toBe(false);
    expect(isAuthorObject(null)).toBe(false);
    expect(isAuthorObject(undefined)).toBe(false);
    expect(isAuthorObject([])).toBe(false);
  });

  it('should return false for object with non-string name', () => {
    expect(isAuthorObject({ name: 123 })).toBe(false);
    expect(isAuthorObject({ name: null })).toBe(false);
    expect(isAuthorObject({ name: undefined })).toBe(false);
  });
});

describe('isAuthor', () => {
  it('should return true for valid Author object', () => {
    expect(isAuthor({ name: 'John Doe' })).toBe(true);
    expect(isAuthor({ name: 'John', email: 'john@example.com' })).toBe(true);
  });

  it('should return false for object without name property', () => {
    expect(isAuthor({ email: 'john@example.com' })).toBe(false);
    expect(isAuthor({})).toBe(false);
  });

  it('should return false for non-object values', () => {
    expect(isAuthor('John Doe')).toBe(false);
    expect(isAuthor(123)).toBe(false);
    expect(isAuthor(null)).toBe(false);
    expect(isAuthor(undefined)).toBe(false);
    expect(isAuthor([])).toBe(false);
  });

  it('should return false for object with non-string name', () => {
    expect(isAuthor({ name: 123 })).toBe(false);
    expect(isAuthor({ name: null })).toBe(false);
  });
});

describe('getStringField', () => {
  it('should return string value when field exists', () => {
    const frontmatter: BlogPostFrontmatter = {
      title: 'Test Post',
    };
    expect(getStringField(frontmatter, 'title')).toBe('Test Post');
  });

  it('should return fallback when field is missing', () => {
    const frontmatter: BlogPostFrontmatter = {};
    expect(getStringField(frontmatter, 'title', 'Default Title')).toBe('Default Title');
  });

  it('should return undefined when field is missing and no fallback', () => {
    const frontmatter: BlogPostFrontmatter = {};
    expect(getStringField(frontmatter, 'title')).toBeUndefined();
  });

  it('should return fallback when field is not a string', () => {
    const frontmatter: BlogPostFrontmatter = {
      title: 123 as unknown as string,
    };
    expect(getStringField(frontmatter, 'title', 'Default Title')).toBe('Default Title');
  });

  it('should return fallback when field is empty string', () => {
    const frontmatter: BlogPostFrontmatter = {
      title: '',
    };
    expect(getStringField(frontmatter, 'title', 'Default Title')).toBe('Default Title');
  });
});

describe('getNumberField', () => {
  it('should return number value when field exists', () => {
    const frontmatter: BlogPostFrontmatter = {
      readingTime: 5,
    };
    expect(getNumberField(frontmatter, 'readingTime')).toBe(5);
  });

  it('should return fallback when field is missing', () => {
    const frontmatter: BlogPostFrontmatter = {};
    expect(getNumberField(frontmatter, 'readingTime', 10)).toBe(10);
  });

  it('should return undefined when field is missing and no fallback', () => {
    const frontmatter: BlogPostFrontmatter = {};
    expect(getNumberField(frontmatter, 'readingTime')).toBeUndefined();
  });

  it('should return fallback when field is not a number', () => {
    const frontmatter: BlogPostFrontmatter = {
      readingTime: '5' as unknown as number,
    };
    expect(getNumberField(frontmatter, 'readingTime', 10)).toBe(10);
  });

  it('should return fallback when field is NaN', () => {
    const frontmatter: BlogPostFrontmatter = {
      readingTime: NaN,
    };
    expect(getNumberField(frontmatter, 'readingTime', 10)).toBe(10);
  });
});

describe('resolveFrontmatterField', () => {
  it('should return first available field value', () => {
    const frontmatter: BlogPostFrontmatter = {
      seoTitle: 'SEO Title',
      title: 'Regular Title',
    };
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBe('SEO Title');
  });

  it('should return second field if first is missing', () => {
    const frontmatter: BlogPostFrontmatter = {
      title: 'Regular Title',
    };
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBe('Regular Title');
  });

  it('should return fallback when no fields are found', () => {
    const frontmatter: BlogPostFrontmatter = {};
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter, 'Default');
    expect(result).toBe('Default');
  });

  it('should return undefined when no fields found and no fallback', () => {
    const frontmatter: BlogPostFrontmatter = {};
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBeUndefined();
  });

  it('should skip null values', () => {
    const frontmatter: BlogPostFrontmatter = {
      seoTitle: null as unknown as string,
      title: 'Regular Title',
    };
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBe('Regular Title');
  });

  it('should skip undefined values', () => {
    const frontmatter: BlogPostFrontmatter = {
      seoTitle: undefined,
      title: 'Regular Title',
    };
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBe('Regular Title');
  });

  it('should skip empty string values', () => {
    const frontmatter: BlogPostFrontmatter = {
      seoTitle: '',
      title: 'Regular Title',
    };
    const result = resolveFrontmatterField<string>(['seoTitle', 'title'], frontmatter);
    expect(result).toBe('Regular Title');
  });

  it('should work with number fields', () => {
    const frontmatter: BlogPostFrontmatter = {
      readingTime: 5,
    };
    const result = resolveFrontmatterField<number>(['readingTime'], frontmatter, 10);
    expect(result).toBe(5);
  });

  it('should work with boolean fields', () => {
    const frontmatter: BlogPostFrontmatter = {
      published: true,
    };
    const result = resolveFrontmatterField<boolean>(['published'], frontmatter, false);
    expect(result).toBe(true);
  });

  it('should handle multiple field names in order', () => {
    const frontmatter: BlogPostFrontmatter = {
      modifiedDate: '2024-01-15',
      date: '2024-01-01',
    };
    const result = resolveFrontmatterField<string>(['modifiedDate', 'date'], frontmatter);
    expect(result).toBe('2024-01-15');
  });

  it('should return first non-empty value', () => {
    const frontmatter: BlogPostFrontmatter = {
      description: '',
      excerpt: 'An excerpt',
    };
    const result = resolveFrontmatterField<string>(['description', 'excerpt'], frontmatter);
    expect(result).toBe('An excerpt');
  });
});

