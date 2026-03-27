import { describe, it, expect } from 'vitest';
import {
  validatePath,
  validateRouteName,
  validateLocale,
  validateLocales,
  validateLocaleFolder,
} from '../src/validation.js';

describe('validatePath', () => {
  it('should accept valid relative paths', () => {
    expect(validatePath('posts')).toBe('posts');
    expect(validatePath('content/posts')).toBe('content/posts');
    expect(validatePath('my-blog-posts')).toBe('my-blog-posts');
  });

  it('should throw error for empty string', () => {
    expect(() => validatePath('')).toThrow('Path must be a non-empty string');
  });

  it('should throw error for whitespace-only string', () => {
    expect(() => validatePath('   ')).toThrow('Path cannot be empty or whitespace');
  });

  it('should throw error for null or undefined', () => {
    expect(() => validatePath(null as any)).toThrow('Path must be a non-empty string');
    expect(() => validatePath(undefined as any)).toThrow('Path must be a non-empty string');
  });

  it('should throw error for paths with directory traversal', () => {
    expect(() => validatePath('../posts')).toThrow('Path cannot contain directory traversal sequences');
    expect(() => validatePath('../../posts')).toThrow('Path cannot contain directory traversal sequences');
    expect(() => validatePath('posts/../other')).toThrow('Path cannot contain directory traversal sequences');
  });

  it('should throw error for absolute paths when not allowed', () => {
    expect(() => validatePath('/posts')).toThrow('Absolute paths are not allowed');
    expect(() => validatePath('C:\\posts')).toThrow('Absolute paths are not allowed');
  });

  it('should allow absolute paths when explicitly allowed', () => {
    expect(validatePath('/posts', true)).toBe('/posts');
  });

  it('should throw error for paths with null bytes', () => {
    expect(() => validatePath('posts\0')).toThrow('Path cannot contain null bytes');
  });

  it('should throw error for paths with control characters', () => {
    expect(() => validatePath('posts\n')).toThrow('Path cannot contain control characters');
    expect(() => validatePath('posts\t')).toThrow('Path cannot contain control characters');
  });

  it('should reject path separators when not allowed', () => {
    expect(() => validatePath('posts/sub', false, false)).toThrow('Path cannot contain path separators');
    expect(() => validatePath('posts\\sub', false, false)).toThrow('Path cannot contain path separators');
  });

  it('should allow path separators when allowed', () => {
    expect(validatePath('posts/sub', false, true)).toBe('posts/sub');
  });
});

describe('validateRouteName', () => {
  it('should accept valid route names', () => {
    expect(validateRouteName('blog')).toBe('blog');
    expect(validateRouteName('my-blog')).toBe('my-blog');
    expect(validateRouteName('blog_route')).toBe('blog_route');
    expect(validateRouteName('[slug]')).toBe('[slug]');
    expect(validateRouteName('[locale]')).toBe('[locale]');
    expect(validateRouteName('blog123')).toBe('blog123');
  });

  it('should throw error for empty string', () => {
    expect(() => validateRouteName('')).toThrow('Route name must be a non-empty string');
  });

  it('should throw error for whitespace-only string', () => {
    expect(() => validateRouteName('   ')).toThrow('Route name cannot be empty or whitespace');
  });

  it('should throw error for null or undefined', () => {
    expect(() => validateRouteName(null as any)).toThrow('Route name must be a non-empty string');
    expect(() => validateRouteName(undefined as any)).toThrow('Route name must be a non-empty string');
  });

  it('should throw error for route names with directory traversal', () => {
    expect(() => validateRouteName('../blog')).toThrow('Route name cannot contain directory traversal sequences');
    expect(() => validateRouteName('blog/../other')).toThrow('Route name cannot contain directory traversal sequences');
  });

  it('should throw error for route names with invalid characters', () => {
    expect(() => validateRouteName('blog route')).toThrow('Route name can only contain');
    expect(() => validateRouteName('blog@route')).toThrow('Route name can only contain');
    expect(() => validateRouteName('blog.route')).toThrow('Route name can only contain');
  });

  it('should throw error for route names with null bytes', () => {
    expect(() => validateRouteName('blog\0')).toThrow('Route name cannot contain null bytes');
  });
});

describe('validateLocale', () => {
  it('should accept valid locale codes', () => {
    expect(validateLocale('en')).toBe('en');
    expect(validateLocale('fr')).toBe('fr');
    expect(validateLocale('en-US')).toBe('en-us');
    expect(validateLocale('fr-CA')).toBe('fr-ca');
    expect(validateLocale('zh-Hans')).toBe('zh-hans');
  });

  it('should throw error for empty string', () => {
    expect(() => validateLocale('')).toThrow('Locale must be a non-empty string');
  });

  it('should throw error for whitespace-only string', () => {
    expect(() => validateLocale('   ')).toThrow('Locale cannot be empty or whitespace');
  });

  it('should throw error for null or undefined', () => {
    expect(() => validateLocale(null as any)).toThrow('Locale must be a non-empty string');
    expect(() => validateLocale(undefined as any)).toThrow('Locale must be a non-empty string');
  });

  it('should throw error for locales with directory traversal', () => {
    expect(() => validateLocale('../en')).toThrow('Locale cannot contain directory traversal sequences');
    expect(() => validateLocale('en/../fr')).toThrow('Locale cannot contain directory traversal sequences');
  });

  it('should throw error for locales with path separators', () => {
    expect(() => validateLocale('en/US')).toThrow('Locale cannot contain path separators');
    expect(() => validateLocale('en\\US')).toThrow('Locale cannot contain path separators');
  });

  it('should throw error for locales with null bytes', () => {
    expect(() => validateLocale('en\0')).toThrow('Locale cannot contain null bytes');
  });

  it('should throw error for locales with control characters', () => {
    expect(() => validateLocale('en\n')).toThrow('Locale cannot contain control characters');
    expect(() => validateLocale('en\t')).toThrow('Locale cannot contain control characters');
  });

  it('should convert to lowercase', () => {
    expect(validateLocale('EN')).toBe('en');
    expect(validateLocale('EN-US')).toBe('en-us');
  });
});

describe('validateLocales', () => {
  it('should accept valid locale arrays', () => {
    expect(validateLocales(['en', 'fr'])).toEqual(['en', 'fr']);
    expect(validateLocales(['en-US', 'fr-CA'])).toEqual(['en-us', 'fr-ca']);
  });

  it('should accept empty array', () => {
    expect(validateLocales([])).toEqual([]);
  });

  it('should throw error for non-array input', () => {
    expect(() => validateLocales(null as any)).toThrow('Locales must be an array');
    expect(() => validateLocales('en,fr' as any)).toThrow('Locales must be an array');
  });

  it('should throw error for invalid locale in array', () => {
    expect(() => validateLocales(['en', '../fr'])).toThrow('Invalid locale at index 1');
    expect(() => validateLocales(['en', ''])).toThrow('Invalid locale at index 1');
  });

  it('should validate all locales in array', () => {
    expect(validateLocales(['en', 'fr', 'de'])).toEqual(['en', 'fr', 'de']);
  });
});

describe('validateLocaleFolder', () => {
  it('should accept valid locale folder names', () => {
    expect(validateLocaleFolder('[locale]')).toBe('[locale]');
    expect(validateLocaleFolder('locale')).toBe('locale');
    expect(validateLocaleFolder('i18n-folder')).toBe('i18n-folder');
  });

  it('should throw error for invalid locale folder names', () => {
    expect(() => validateLocaleFolder('../locale')).toThrow('Route name cannot contain directory traversal sequences');
    expect(() => validateLocaleFolder('locale/folder')).toThrow('Route name can only contain');
  });
});

