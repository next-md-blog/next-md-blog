import { describe, it, expect } from 'vitest';
import {
  normalizeKeywords,
  getAuthorName,
  getAuthorNames,
  ensureAuthorsResolved,
  resolveDefaultAuthor,
  buildRobotsMeta,
  resolveCanonicalUrl,
  resolvePostUrl,
  escapeXml,
} from '../seo-utils';
import type { Author, BlogPost } from '../types';

describe('normalizeKeywords', () => {
  it('should return empty array for undefined', () => {
    expect(normalizeKeywords(undefined)).toEqual([]);
  });

  it('should return array as-is when already an array', () => {
    expect(normalizeKeywords(['keyword1', 'keyword2'])).toEqual(['keyword1', 'keyword2']);
  });

  it('should split comma-separated string', () => {
    expect(normalizeKeywords('keyword1, keyword2, keyword3')).toEqual([
      'keyword1',
      'keyword2',
      'keyword3',
    ]);
  });

  it('should trim whitespace from keywords', () => {
    expect(normalizeKeywords(' keyword1 , keyword2 , keyword3 ')).toEqual([
      'keyword1',
      'keyword2',
      'keyword3',
    ]);
  });

  it('should filter out empty strings', () => {
    expect(normalizeKeywords('keyword1, , keyword2, , keyword3')).toEqual([
      'keyword1',
      'keyword2',
      'keyword3',
    ]);
  });

  it('should handle single keyword string', () => {
    expect(normalizeKeywords('keyword1')).toEqual(['keyword1']);
  });

  it('should return empty array for empty string', () => {
    expect(normalizeKeywords('')).toEqual([]);
  });

  it('should return empty array for non-string non-array', () => {
    expect(normalizeKeywords(123 as unknown as string)).toEqual([]);
    expect(normalizeKeywords(null as unknown as string)).toEqual([]);
  });
});

describe('getAuthorName', () => {
  it('should return string as-is when author is string', () => {
    expect(getAuthorName('John Doe')).toBe('John Doe');
  });

  it('should return name property when author is Author object', () => {
    const author: Author = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    expect(getAuthorName(author)).toBe('John Doe');
  });

  it('should handle Author object with only name', () => {
    const author: Author = {
      name: 'John Doe',
    };
    expect(getAuthorName(author)).toBe('John Doe');
  });
});

describe('getAuthorNames', () => {
  it('should convert array of string authors to array of names', () => {
    expect(getAuthorNames(['John Doe', 'Jane Smith'])).toEqual(['John Doe', 'Jane Smith']);
  });

  it('should convert array of Author objects to array of names', () => {
    const authors: Author[] = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
    ];
    expect(getAuthorNames(authors)).toEqual(['John Doe', 'Jane Smith']);
  });

  it('should handle mixed array of strings and Author objects', () => {
    const authors: (string | Author)[] = [
      'John Doe',
      { name: 'Jane Smith', email: 'jane@example.com' },
    ];
    expect(getAuthorNames(authors)).toEqual(['John Doe', 'Jane Smith']);
  });

  it('should handle empty array', () => {
    expect(getAuthorNames([])).toEqual([]);
  });
});

describe('ensureAuthorsResolved', () => {
  const configAuthors: Author[] = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ];

  it('should return authors as-is when no configAuthors provided', () => {
    const authors = ['John Doe', 'Jane Smith'];
    expect(ensureAuthorsResolved(authors, undefined)).toEqual(authors);
  });

  it('should return authors as-is when configAuthors is empty', () => {
    const authors = ['John Doe', 'Jane Smith'];
    expect(ensureAuthorsResolved(authors, [])).toEqual(authors);
  });

  it('should return Author objects as-is', () => {
    const authors: Author[] = [
      { name: 'John Doe', email: 'john@example.com' },
    ];
    expect(ensureAuthorsResolved(authors, configAuthors)).toEqual(authors);
  });

  it('should resolve string authors from config', () => {
    const authors = ['John Doe'];
    const result = ensureAuthorsResolved(authors, configAuthors);
    expect(result[0]).toEqual(configAuthors[0]);
  });

  it('should handle mixed string and Author object authors', () => {
    const authors: (string | Author)[] = [
      'John Doe',
      { name: 'Unknown Author', email: 'unknown@example.com' },
    ];
    const result = ensureAuthorsResolved(authors, configAuthors);
    expect(result[0]).toEqual(configAuthors[0]);
    expect(result[1]).toEqual(authors[1]);
  });
});

describe('resolveDefaultAuthor', () => {
  const configAuthors: Author[] = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ];

  it('should return undefined when defaultAuthor is not provided', () => {
    expect(resolveDefaultAuthor(undefined, configAuthors)).toBeUndefined();
  });

  it('should resolve author from config when found', () => {
    const result = resolveDefaultAuthor('John Doe', configAuthors);
    expect(result).toEqual(configAuthors[0]);
  });

  it('should return string when author not found in config', () => {
    const result = resolveDefaultAuthor('Unknown Author', configAuthors);
    expect(result).toBe('Unknown Author');
  });

  it('should return string when no configAuthors provided', () => {
    const result = resolveDefaultAuthor('John Doe', undefined);
    expect(result).toBe('John Doe');
  });
});

describe('buildRobotsMeta', () => {
  it('should return undefined when no robots directives', () => {
    const frontmatter: BlogPost['frontmatter'] = {};
    expect(buildRobotsMeta(frontmatter)).toBeUndefined();
  });

  it('should return noindex when noindex is true', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      noindex: true,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex');
  });

  it('should return nofollow when nofollow is true', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      nofollow: true,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('nofollow');
  });

  it('should return both when both are true', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      noindex: true,
      nofollow: true,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex, nofollow');
  });

  it('should use robots string when provided and no boolean flags', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      robots: 'noindex, nofollow',
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex, nofollow');
  });

  it('should prioritize boolean flags over robots string', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      robots: 'index, follow',
      noindex: true,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex');
  });

  it('should combine robots string with boolean flags', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      robots: 'noarchive',
      noindex: true,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex');
  });

  it('should handle robots string with noindex', () => {
    const frontmatter: BlogPost['frontmatter'] = {
      robots: 'noindex, nofollow',
      noindex: false,
      nofollow: false,
    };
    expect(buildRobotsMeta(frontmatter)).toBe('noindex, nofollow');
  });
});

describe('resolveCanonicalUrl', () => {
  it('should return absolute URL as-is', () => {
    expect(resolveCanonicalUrl('https://example.com/post', 'https://site.com')).toBe(
      'https://example.com/post'
    );
    expect(resolveCanonicalUrl('http://example.com/post', 'https://site.com')).toBe(
      'http://example.com/post'
    );
  });

  it('should resolve relative URL with leading slash', () => {
    expect(resolveCanonicalUrl('/blog/post', 'https://example.com')).toBe(
      'https://example.com/blog/post'
    );
  });

  it('should resolve relative URL without leading slash', () => {
    expect(resolveCanonicalUrl('blog/post', 'https://example.com')).toBe(
      'https://example.com/blog/post'
    );
  });

  it('should handle siteUrl with trailing slash', () => {
    expect(resolveCanonicalUrl('/blog/post', 'https://example.com/')).toBe(
      'https://example.com/blog/post'
    );
  });

  it('should handle siteUrl without trailing slash', () => {
    expect(resolveCanonicalUrl('/blog/post', 'https://example.com')).toBe(
      'https://example.com/blog/post'
    );
  });

  it('should handle root path', () => {
    expect(resolveCanonicalUrl('/', 'https://example.com')).toBe('https://example.com/');
  });
});

describe('resolvePostUrl', () => {
  it('should use canonicalUrl when provided', () => {
    expect(resolvePostUrl('https://custom.com/post', 'test-post', 'https://example.com')).toBe(
      'https://custom.com/post'
    );
  });

  it('should generate default URL from slug when canonicalUrl not provided', () => {
    expect(resolvePostUrl(undefined, 'test-post', 'https://example.com')).toBe(
      'https://example.com/blog/test-post'
    );
  });

  it('should resolve relative canonicalUrl', () => {
    expect(resolvePostUrl('/custom/post', 'test-post', 'https://example.com')).toBe(
      'https://example.com/custom/post'
    );
  });

  it('should handle empty siteUrl', () => {
    expect(resolvePostUrl(undefined, 'test-post', '')).toBe('/blog/test-post');
  });

  it('should handle absolute canonicalUrl with empty siteUrl', () => {
    expect(resolvePostUrl('https://custom.com/post', 'test-post', '')).toBe(
      'https://custom.com/post'
    );
  });
});

describe('escapeXml', () => {
  it('should escape ampersand', () => {
    expect(escapeXml('test & post')).toBe('test &amp; post');
  });

  it('should escape less than', () => {
    expect(escapeXml('test < post')).toBe('test &lt; post');
  });

  it('should escape greater than', () => {
    expect(escapeXml('test > post')).toBe('test &gt; post');
  });

  it('should escape double quotes', () => {
    expect(escapeXml('test "post"')).toBe('test &quot;post&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeXml("test 'post'")).toBe('test &apos;post&apos;');
  });

  it('should escape all special characters', () => {
    expect(escapeXml('test & <post> "with" \'quotes\'')).toBe(
      'test &amp; &lt;post&gt; &quot;with&quot; &apos;quotes&apos;'
    );
  });

  it('should handle string without special characters', () => {
    expect(escapeXml('test post')).toBe('test post');
  });

  it('should handle empty string', () => {
    expect(escapeXml('')).toBe('');
  });

  it('should handle multiple occurrences', () => {
    expect(escapeXml('test & post & more')).toBe('test &amp; post &amp; more');
  });
});

