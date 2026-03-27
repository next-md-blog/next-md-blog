import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateRSSFeed } from '../seo-feeds';
import { getBlogSitemapEntries } from '../sitemap-data';
import type { BlogPost, BlogPostMetadata, Config } from '../types';
import { createMockBlogPost, createMockBlogPostMetadata, createMockConfig } from './fixtures';

describe('getBlogSitemapEntries', () => {
  it('should build entries with url, lastModified, changefreq, priority', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test-post',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe('https://example.com/blog/test-post');
    expect(entries[0]?.changeFrequency).toBe('monthly');
    expect(entries[0]?.priority).toBe(0.8);
    const lm = entries[0]?.lastModified;
    expect(lm instanceof Date ? lm.toISOString().split('T')[0] : String(lm).split('T')[0]).toBe(
      '2024-01-01'
    );
  });

  it('should handle multiple posts', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({ slug: 'post-1', frontmatter: { date: '2024-01-01' } }),
      createMockBlogPostMetadata({ slug: 'post-2', frontmatter: { date: '2024-01-02' } }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    expect(entries.map((e) => e.url)).toEqual([
      'https://example.com/blog/post-1',
      'https://example.com/blog/post-2',
    ]);
  });

  it('should use modifiedDate when set', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test-post',
        frontmatter: {
          date: '2024-01-01',
          modifiedDate: '2024-01-15',
        },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    const lm = entries[0]?.lastModified;
    expect(lm instanceof Date ? lm.toISOString().split('T')[0] : String(lm)).toMatch(/2024-01-15/);
  });

  it('should fallback to date when modifiedDate missing', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test-post',
        frontmatter: { date: '2024-01-01' },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    const lm = entries[0]?.lastModified;
    expect(lm instanceof Date ? lm.toISOString().split('T')[0] : String(lm)).toMatch(/2024-01-01/);
  });

  it('should use today when no date fields', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({ slug: 'test-post', frontmatter: {} }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    const today = new Date().toISOString().split('T')[0];
    const lm = entries[0]?.lastModified;
    const dayStr = lm instanceof Date ? lm.toISOString().split('T')[0] : String(lm).split('T')[0];
    expect(dayStr).toBe(today);
  });

  it('should preserve ampersand in slug URL path', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test&post',
        frontmatter: { date: '2024-01-01' },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    expect(entries[0]?.url).toBe('https://example.com/blog/test&post');
  });

  it('should work when config omitted', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test-post',
        frontmatter: { date: '2024-01-01' },
      }),
    ];
    const entries = getBlogSitemapEntries(posts);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toMatch(/blog\/test-post/);
  });

  it('should return empty array for no posts', () => {
    expect(getBlogSitemapEntries([], { siteUrl: 'https://example.com' })).toEqual([]);
  });

  it('should handle empty siteUrl', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'test-post',
        frontmatter: { date: '2024-01-01' },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: '' });
    expect(entries[0]?.url).toBe('/blog/test-post');
  });

  it('should use canonicalUrl when set', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'slug',
        frontmatter: {
          date: '2024-01-01',
          canonicalUrl: 'https://example.com/custom-path',
        },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, { siteUrl: 'https://example.com' });
    expect(entries[0]?.url).toBe('https://example.com/custom-path');
  });

  it('should set alternates from config.alternateLanguages', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'post',
        frontmatter: { date: '2024-01-01' },
      }),
    ];
    const entries = getBlogSitemapEntries(posts, {
      siteUrl: 'https://example.com',
      alternateLanguages: {
        en: 'https://example.com/blog/post',
        fr: 'https://example.com/fr/blog/post',
      },
    });
    expect(entries[0]?.alternates?.languages).toEqual({
      en: 'https://example.com/blog/post',
      fr: 'https://example.com/fr/blog/post',
    });
  });

  it('should prefer frontmatter alternateLanguages', () => {
    const posts: BlogPostMetadata[] = [
      createMockBlogPostMetadata({
        slug: 'a',
        frontmatter: {
          date: '2024-02-01',
          alternateLanguages: { de: 'https://example.com/de/blog/a' },
        },
      }),
    ];
    const config: Config = { siteUrl: 'https://example.com' };
    const entries = getBlogSitemapEntries(posts, config);
    expect(entries[0]?.url).toBe('https://example.com/blog/a');
    expect(entries[0]?.alternates?.languages).toEqual({
      de: 'https://example.com/de/blog/a',
    });
  });
});

describe('generateRSSFeed', () => {
  it('should generate basic RSS feed XML', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent here.',
        frontmatter: {
          title: 'Test Post',
          description: 'A test post',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
      defaultAuthor: 'Default Author',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
    expect(feed).toContain('<channel>');
    expect(feed).toContain('<title>Test Blog</title>');
    expect(feed).toContain('<link>https://example.com</link>');
    expect(feed).toContain('<description>Latest blog posts from Test Blog</description>');
    expect(feed).toContain('<language>en</language>');
  });

  it('should include post items in RSS feed', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          description: 'A test post',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<item>');
    expect(feed).toContain('<title>Test Post</title>');
    expect(feed).toContain('<link>https://example.com/blog/test-post</link>');
    expect(feed).toContain('<description>A test post</description>');
    expect(feed).toContain('<author>John Doe</author>');
    expect(feed).toContain('<pubDate>');
  });

  it('should use excerpt as description if description not available', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          excerpt: 'An excerpt',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<description>An excerpt</description>');
  });

  it('should use slug as title fallback', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<title>test-post</title>');
  });

  it('should use defaultAuthor when post has no authors', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
        authors: [],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
      defaultAuthor: 'Default Author',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<author>Default Author</author>');
  });

  it('should use publishedDate if available', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          publishedDate: '2024-01-15T10:00:00Z',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    // RSS dates are formatted as RFC 822 (UTC string)
    expect(feed).toContain('<pubDate>');
    expect(feed).toContain('Mon, 15 Jan 2024');
  });

  it('should fallback to date if publishedDate not available', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    // RSS dates are formatted as RFC 822 (UTC string)
    expect(feed).toContain('<pubDate>');
    expect(feed).toContain('Mon, 01 Jan 2024');
  });

  it('should use current date if no date fields available', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<pubDate>');
  });

  it('should use canonicalUrl if available', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
          canonicalUrl: 'https://custom.com/post',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<link>https://custom.com/post</link>');
    expect(feed).toContain('<guid isPermaLink="true">https://custom.com/post</guid>');
  });

  it('should escape XML special characters', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test & Post',
          description: 'A test <post> with "quotes"',
          date: '2024-01-01',
        },
        authors: ['John & Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<title>Test &amp; Post</title>');
    expect(feed).toContain('<description>A test &lt;post&gt; with &quot;quotes&quot;</description>');
    expect(feed).toContain('<author>John &amp; Doe</author>');
  });

  it('should limit posts to RSS_POST_LIMIT', () => {
    const posts: BlogPost[] = Array.from({ length: 25 }, (_, i) =>
      createMockBlogPost({
        slug: `post-${i}`,
        content: '# Post\n\nContent.',
        frontmatter: {
          title: `Post ${i}`,
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      })
    );
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    // Should only include first 20 posts (RSS_POST_LIMIT)
    const itemMatches = feed.match(/<item>/g);
    expect(itemMatches).toHaveLength(20);
  });

  it('should use getConfig when config not provided', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];

    const feed = generateRSSFeed(posts);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<rss version="2.0"');
  });

  it('should handle empty posts array', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed([], config);

    expect(feed).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(feed).toContain('<channel>');
    expect(feed).not.toContain('<item>');
  });

  it('should include atom:link in feed', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<atom:link href="https://example.com/feed.xml" rel="self" type="application/rss+xml"/>');
  });

  it('should format pubDate as RFC 822', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01T12:00:00Z',
        },
        authors: ['John Doe'],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    // Should contain UTC formatted date
    expect(feed).toContain('<pubDate>');
    const pubDateMatch = feed.match(/<pubDate>(.*?)<\/pubDate>/);
    expect(pubDateMatch).toBeTruthy();
  });

  it('should handle Author objects in authors array', () => {
    const posts: BlogPost[] = [
      createMockBlogPost({
        slug: 'test-post',
        content: '# Test Post\n\nContent.',
        frontmatter: {
          title: 'Test Post',
          date: '2024-01-01',
        },
        authors: [{ name: 'John Doe', email: 'john@example.com' }],
      }),
    ];
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };

    const feed = generateRSSFeed(posts, config);

    expect(feed).toContain('<author>John Doe</author>');
  });
});

