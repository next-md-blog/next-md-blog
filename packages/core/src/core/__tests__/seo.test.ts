import { describe, it, expect } from 'vitest';
import {
  generateBlogPostMetadata,
  generateBlogListMetadata,
  generateBlogPostSchema,
  generateBreadcrumbsSchema,
  generateBlogPostSchemaGraph,
} from '../seo';
import { generateOrganizationSchema } from '../organization-schema';
import type { BlogPost, BlogPostMetadata, Author, Config } from '../types';

describe('generateBlogPostMetadata', () => {
  const basePost: BlogPost = {
    slug: 'test-post',
    content: '# Test Post\n\nThis is a test.',
    frontmatter: {
      title: 'Test Post',
      description: 'A test blog post',
      date: '2024-01-01',
      author: 'John Doe',
      tags: ['test', 'blog'],
    },
    readingTime: 1,
    wordCount: 5,
    authors: ['John Doe'],
  };

  it('should generate basic metadata', () => {
    const metadata = generateBlogPostMetadata(basePost);
    expect(metadata.title).toBe('Test Post | My Blog');
    expect(metadata.description).toBe('A test blog post');
  });

  it('should use custom site name', () => {
    const config: Config = { siteName: 'Custom Blog' };
    const metadata = generateBlogPostMetadata(basePost, config);
    expect(metadata.title).toBe('Test Post | Custom Blog');
    expect(metadata.openGraph?.siteName).toBe('Custom Blog');
  });

  it('should use slug as title fallback', () => {
    const postWithoutTitle: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, title: undefined },
    };
    const metadata = generateBlogPostMetadata(postWithoutTitle);
    expect(metadata.title).toBe('test-post | My Blog');
    expect(metadata.openGraph?.title).toBe('test-post');
  });

  it('should generate OpenGraph metadata', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };
    const metadata = generateBlogPostMetadata(basePost, config);
    expect(metadata.openGraph?.type).toBe('article');
    expect(metadata.openGraph?.title).toBe('Test Post');
    expect(metadata.openGraph?.description).toBe('A test blog post');
    expect(metadata.openGraph?.url).toBe('https://example.com/blog/test-post');
    expect(metadata.openGraph?.siteName).toBe('Test Blog');
  });

  it('should include published time when date is provided', () => {
    const metadata = generateBlogPostMetadata(basePost);
    expect(metadata.openGraph?.publishedTime).toBe('2024-01-01');
  });

  it('should include authors when provided', () => {
    const metadata = generateBlogPostMetadata(basePost);
    expect(metadata.openGraph?.authors).toEqual(['John Doe']);
    expect(metadata.authors).toEqual([{ name: 'John Doe' }]);
  });

  it('should use default author from config', () => {
    const config: Config = { defaultAuthor: 'Default Author' };
    const postWithoutAuthor: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, author: undefined },
      authors: [],
    };
    const metadata = generateBlogPostMetadata(postWithoutAuthor, config);
    expect(metadata.openGraph?.authors).toEqual(['Default Author']);
  });

  it('should support multiple authors via authors array', () => {
    const postWithMultipleAuthors: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        authors: ['John Doe', 'Jane Smith'],
      },
      authors: ['John Doe', 'Jane Smith'],
    };
    const metadata = generateBlogPostMetadata(postWithMultipleAuthors);
    expect(metadata.openGraph?.authors).toEqual(['John Doe', 'Jane Smith']);
    expect(metadata.authors).toEqual([
      { name: 'John Doe' },
      { name: 'Jane Smith' },
    ]);
  });

  it('should support author as array', () => {
    const postWithAuthorArray: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        author: ['John Doe', 'Jane Smith'],
      },
      authors: ['John Doe', 'Jane Smith'],
    };
    const metadata = generateBlogPostMetadata(postWithAuthorArray);
    expect(metadata.openGraph?.authors).toEqual(['John Doe', 'Jane Smith']);
    expect(metadata.authors).toEqual([
      { name: 'John Doe' },
      { name: 'Jane Smith' },
    ]);
  });

  it('should prioritize authors field over author field', () => {
    const postWithBoth: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        author: 'Single Author',
        authors: ['First Author', 'Second Author'],
      },
      authors: ['First Author', 'Second Author'],
    };
    const metadata = generateBlogPostMetadata(postWithBoth);
    expect(metadata.openGraph?.authors).toEqual(['First Author', 'Second Author']);
  });

  it('should merge authors from both fields and remove duplicates', () => {
    const postWithOverlap: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        author: 'John Doe',
        authors: ['Jane Smith', 'John Doe'],
      },
      authors: ['Jane Smith', 'John Doe'],
    };
    const metadata = generateBlogPostMetadata(postWithOverlap);
    // authors field comes first, so order is preserved
    expect(metadata.openGraph?.authors).toEqual(['Jane Smith', 'John Doe']);
  });

  it('should include tags when provided', () => {
    const metadata = generateBlogPostMetadata(basePost);
    expect(metadata.openGraph?.tags).toEqual(['test', 'blog']);
    expect(metadata.keywords).toEqual(['test', 'blog']);
  });

  it('should not include tags when empty', () => {
    const postWithoutTags: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, tags: undefined },
    };
    const metadata = generateBlogPostMetadata(postWithoutTags);
    expect(metadata.openGraph?.tags).toBeUndefined();
    expect(metadata.keywords).toBeUndefined();
  });

  it('should generate Twitter metadata', () => {
    const config: Config = {
      twitterHandle: 'testuser',
    };
    const metadata = generateBlogPostMetadata(basePost, config);
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.twitter?.title).toBe('Test Post');
    expect(metadata.twitter?.description).toBe('A test blog post');
    expect(metadata.twitter?.creator).toBe('@testuser');
  });

  it('should handle Twitter handle with @ prefix', () => {
    const config: Config = {
      twitterHandle: '@testuser',
    };
    const metadata = generateBlogPostMetadata(basePost, config);
    expect(metadata.twitter?.creator).toBe('@testuser');
  });

  it('should include OG image from frontmatter', () => {
    const postWithOgImage: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        ogImage: 'https://example.com/og-image.jpg',
      },
    };
    const metadata = generateBlogPostMetadata(postWithOgImage);
    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Test Post',
      },
    ]);
    expect(metadata.twitter?.images).toEqual(['https://example.com/og-image.jpg']);
  });

  it('should fallback to image field for OG image', () => {
    const postWithImage: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        image: 'https://example.com/image.jpg',
      },
    };
    const metadata = generateBlogPostMetadata(postWithImage);
    expect(metadata.openGraph?.images?.[0]?.url).toBe('https://example.com/image.jpg');
  });

  it('should use default OG image from config', () => {
    const config: Config = {
      defaultOgImage: 'https://example.com/default-og.jpg',
    };
    const metadata = generateBlogPostMetadata(basePost, config);
    expect(metadata.openGraph?.images?.[0]?.url).toBe('https://example.com/default-og.jpg');
  });

  it('should prioritize ogImage over image over defaultOgImage', () => {
    const config: Config = {
      defaultOgImage: 'https://example.com/default.jpg',
    };
    const post: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        ogImage: 'https://example.com/og.jpg',
        image: 'https://example.com/image.jpg',
      },
    };
    const metadata = generateBlogPostMetadata(post, config);
    expect(metadata.openGraph?.images?.[0]?.url).toBe('https://example.com/og.jpg');
  });

  it('should handle empty description', () => {
    const postWithoutDescription: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, description: undefined },
    };
    const metadata = generateBlogPostMetadata(postWithoutDescription);
    expect(metadata.description).toBe('');
  });

  it('should handle empty site URL', () => {
    const metadata = generateBlogPostMetadata(basePost, { siteUrl: '' });
    expect(metadata.openGraph?.url).toBe('/blog/test-post');
  });

  it('should include author email and URL in HTML meta tags when Author object is provided', () => {
    const authorWithDetails = {
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.example.com',
      twitter: '@johndoe',
    };
    const postWithAuthorObject: BlogPost = {
      ...basePost,
      authors: [authorWithDetails],
    };
    const metadata = generateBlogPostMetadata(postWithAuthorObject);
    
    // Check that author email and URL are in the 'other' meta tags
    expect(metadata.other).toBeDefined();
    expect(metadata.other?.['author:email']).toBe('john@example.com');
    expect(metadata.other?.['author:url']).toBe('https://johndoe.example.com');
    expect(metadata.other?.['article:author']).toBe('John Doe');
  });

  it('should include author email and URL in authors metadata field', () => {
    const authorWithDetails = {
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.example.com',
    };
    const postWithAuthorObject: BlogPost = {
      ...basePost,
      authors: [authorWithDetails],
    };
    const metadata = generateBlogPostMetadata(postWithAuthorObject);
    
    expect(metadata.authors).toEqual([
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ]);
  });

  it('should handle multiple authors with email and URL in meta tags', () => {
    const authorsWithDetails = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        url: 'https://janesmith.example.com',
      },
    ];
    const postWithMultipleAuthors: BlogPost = {
      ...basePost,
      authors: authorsWithDetails,
    };
    const metadata = generateBlogPostMetadata(postWithMultipleAuthors);
    
    expect(metadata.other?.['author:email']).toBe('john@example.com');
    expect(metadata.other?.['author:url']).toBe('https://johndoe.example.com');
    expect(metadata.other?.['author:email2']).toBe('jane@example.com');
    expect(metadata.other?.['author:url2']).toBe('https://janesmith.example.com');
    expect(metadata.other?.['article:author']).toBe('John Doe');
    expect(metadata.other?.['article:author2']).toBe('Jane Smith');
  });

  it('should use author Twitter handle in Twitter metadata when available', () => {
    const authorWithTwitter = {
      name: 'John Doe',
      email: 'john@example.com',
      twitter: '@johndoe',
    };
    const postWithAuthorObject: BlogPost = {
      ...basePost,
      authors: [authorWithTwitter],
    };
    const config: Config = {
      twitterHandle: '@sitehandle',
    };
    const metadata = generateBlogPostMetadata(postWithAuthorObject, config);
    
    // Should use author's Twitter handle, not site's
    expect(metadata.twitter?.creator).toBe('@johndoe');
  });

  it('should fallback to site Twitter handle when author has no Twitter', () => {
    const authorWithoutTwitter = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    const postWithAuthorObject: BlogPost = {
      ...basePost,
      authors: [authorWithoutTwitter],
    };
    const config: Config = {
      twitterHandle: '@sitehandle',
    };
    const metadata = generateBlogPostMetadata(postWithAuthorObject, config);
    
    // Should use site's Twitter handle as fallback
    expect(metadata.twitter?.creator).toBe('@sitehandle');
  });

  it('should resolve defaultAuthor from config.authors array', () => {
    const config: Config = {
      defaultAuthor: 'John Doe',
      authors: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://johndoe.example.com',
          twitter: '@johndoe',
        },
      ],
    };
    const postWithoutAuthor: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, author: undefined },
      authors: [],
    };
    const metadata = generateBlogPostMetadata(postWithoutAuthor, config);
    
    // Should resolve defaultAuthor to full Author object
    expect(metadata.openGraph?.authors).toEqual(['John Doe']);
    expect(metadata.other?.['author:email']).toBe('john@example.com');
    expect(metadata.other?.['author:url']).toBe('https://johndoe.example.com');
    expect(metadata.twitter?.creator).toBe('@johndoe');
    expect(metadata.authors).toEqual([
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ]);
  });

  it('should handle string authors (not resolved from config) without email/URL', () => {
    const postWithStringAuthor: BlogPost = {
      ...basePost,
      authors: ['John Doe'], // String, not Author object
    };
    const metadata = generateBlogPostMetadata(postWithStringAuthor);
    
    // Should not have email/URL meta tags for string authors
    expect(metadata.other?.['author:email']).toBeUndefined();
    expect(metadata.other?.['author:url']).toBeUndefined();
    expect(metadata.other?.['article:author']).toBe('John Doe');
    expect(metadata.authors).toEqual([{ name: 'John Doe' }]);
  });

  it('should handle mixed string and Author object authors', () => {
    const mixedAuthors = [
      'Unknown Author', // String
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ];
    const postWithMixedAuthors: BlogPost = {
      ...basePost,
      authors: mixedAuthors,
    };
    const metadata = generateBlogPostMetadata(postWithMixedAuthors);
    
    expect(metadata.other?.['article:author']).toBe('Unknown Author');
    expect(metadata.other?.['article:author2']).toBe('John Doe');
    // Only Author object should have email/URL
    expect(metadata.other?.['author:email2']).toBe('john@example.com');
    expect(metadata.other?.['author:url2']).toBe('https://johndoe.example.com');
    expect(metadata.authors).toEqual([
      { name: 'Unknown Author' },
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ]);
  });
});

describe('generateBlogListMetadata', () => {
  const basePosts: BlogPostMetadata[] = [
    {
      slug: 'post-1',
      frontmatter: { title: 'Post 1', date: '2024-01-01' },
    },
    {
      slug: 'post-2',
      frontmatter: { title: 'Post 2', date: '2024-01-02' },
    },
  ];

  it('should generate basic list metadata', () => {
    const metadata = generateBlogListMetadata(basePosts);
    expect(metadata.title).toBe('Blog Posts | My Blog');
    expect(metadata.description).toBe('Browse all 2 blog posts');
  });

  it('should use custom site name', () => {
    const config: Config = { siteName: 'Custom Blog' };
    const metadata = generateBlogListMetadata(basePosts, config);
    expect(metadata.title).toBe('Blog Posts | Custom Blog');
    expect(metadata.openGraph?.siteName).toBe('Custom Blog');
  });

  it('should generate OpenGraph metadata', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };
    const metadata = generateBlogListMetadata(basePosts, config);
    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.openGraph?.title).toBe('Blog Posts');
    expect(metadata.openGraph?.description).toBe('Browse all 2 blog posts');
    expect(metadata.openGraph?.url).toBe('https://example.com/blogs');
    expect(metadata.openGraph?.siteName).toBe('Test Blog');
  });

  it('should generate Twitter metadata', () => {
    const metadata = generateBlogListMetadata(basePosts);
    expect(metadata.twitter?.card).toBe('summary');
    expect(metadata.twitter?.title).toBe('Blog Posts');
    expect(metadata.twitter?.description).toBe('Browse all 2 blog posts');
  });

  it('should handle empty posts array', () => {
    const metadata = generateBlogListMetadata([]);
    expect(metadata.description).toBe('Browse all 0 blog posts');
  });

  it('should handle single post', () => {
    const metadata = generateBlogListMetadata([basePosts[0]]);
    expect(metadata.description).toBe('Browse all 1 blog posts');
  });

  it('should handle empty site URL', () => {
    const metadata = generateBlogListMetadata(basePosts, { siteUrl: '' });
    expect(metadata.openGraph?.url).toBe('/blogs');
  });
});

describe('generateBlogPostSchema', () => {
  const basePost: BlogPost = {
    slug: 'test-post',
    content: '# Test Post\n\nThis is a test.',
    frontmatter: {
      title: 'Test Post',
      description: 'A test blog post',
      date: '2024-01-01',
      author: 'John Doe',
      tags: ['test', 'blog'],
    },
    readingTime: 1,
    wordCount: 5,
    authors: ['John Doe'],
  };

  it('should generate basic schema', () => {
    const schema = generateBlogPostSchema(basePost);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe('Test Post');
    expect(schema.description).toBe('A test blog post');
  });

  it('should support single author', () => {
    const schema = generateBlogPostSchema(basePost);
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
    });
  });

  it('should support multiple authors', () => {
    const postWithMultipleAuthors: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        authors: ['John Doe', 'Jane Smith'],
      },
      authors: ['John Doe', 'Jane Smith'],
    };
    const schema = generateBlogPostSchema(postWithMultipleAuthors);
    expect(schema.author).toEqual([
      { '@type': 'Person', name: 'John Doe' },
      { '@type': 'Person', name: 'Jane Smith' },
    ]);
  });

  it('should support author as array', () => {
    const postWithAuthorArray: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        author: ['John Doe', 'Jane Smith'],
      },
      authors: ['John Doe', 'Jane Smith'],
    };
    const schema = generateBlogPostSchema(postWithAuthorArray);
    expect(Array.isArray(schema.author)).toBe(true);
    expect((schema.author as Array<unknown>).length).toBe(2);
  });

  it('should include publisher information', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };
    const schema = generateBlogPostSchema(basePost, config);
    expect(schema.publisher).toEqual(
      expect.objectContaining({
        '@type': 'Organization',
        name: 'Test Blog',
        url: 'https://example.com',
        '@id': 'https://example.com/#organization',
      })
    );
  });

  it('should include organization logo and sameAs on publisher', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
      organization: {
        logo: 'https://example.com/logo.png',
        sameAs: ['https://twitter.com/test'],
      },
    };
    const schema = generateBlogPostSchema(basePost, config);
    expect(schema.publisher).toEqual(
      expect.objectContaining({
        logo: { '@type': 'ImageObject', url: 'https://example.com/logo.png' },
        sameAs: 'https://twitter.com/test',
      })
    );
  });

  it('should use publisher @id only when publisherReference is true', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };
    const schema = generateBlogPostSchema(basePost, config, {
      publisherReference: true,
    });
    expect(schema.publisher).toEqual({ '@id': 'https://example.com/#organization' });
  });

  it('should build @graph schema', () => {
    const config: Config = {
      siteName: 'Test Blog',
      siteUrl: 'https://example.com',
    };
    const g = generateBlogPostSchemaGraph(basePost, config, undefined, true);
    expect(g['@graph']).toBeDefined();
    expect(Array.isArray(g['@graph'])).toBe(true);
    expect((g['@graph'] as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it('should export generateOrganizationSchema with @id', () => {
    const org = generateOrganizationSchema({
      siteName: 'X',
      siteUrl: 'https://x.com',
    });
    expect(org?.['@id']).toBe('https://x.com/#organization');
  });

  it('should merge custom schema from frontmatter', () => {
    const postWithCustomSchema: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        schema: {
          mainEntityOfPage: 'https://example.com/test',
        },
      },
    };
    const schema = generateBlogPostSchema(postWithCustomSchema);
    expect(schema.mainEntityOfPage).toBe('https://example.com/test');
    expect(schema.headline).toBe('Test Post'); // Should still have base fields
  });

  it('should include author email, URL, and avatar in schema when Author object is provided', () => {
    const authorWithDetails = {
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.example.com',
      avatar: '/avatars/john.jpg',
    };
    const postWithAuthorObject: BlogPost = {
      ...basePost,
      authors: [authorWithDetails],
    };
    const schema = generateBlogPostSchema(postWithAuthorObject);
    
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.example.com',
      image: '/avatars/john.jpg',
    });
  });

  it('should include author email and URL in schema for multiple authors', () => {
    const authorsWithDetails = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        url: 'https://janesmith.example.com',
      },
    ];
    const postWithMultipleAuthors: BlogPost = {
      ...basePost,
      authors: authorsWithDetails,
    };
    const schema = generateBlogPostSchema(postWithMultipleAuthors);
    
    expect(Array.isArray(schema.author)).toBe(true);
    expect(schema.author).toEqual([
      {
        '@type': 'Person',
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
      {
        '@type': 'Person',
        name: 'Jane Smith',
        email: 'jane@example.com',
        url: 'https://janesmith.example.com',
      },
    ]);
  });

  it('should resolve defaultAuthor from config.authors array in schema', () => {
    const config: Config = {
      defaultAuthor: 'John Doe',
      authors: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          url: 'https://johndoe.example.com',
          avatar: '/avatars/john.jpg',
        },
      ],
    };
    const postWithoutAuthor: BlogPost = {
      ...basePost,
      frontmatter: { ...basePost.frontmatter, author: undefined },
      authors: [],
    };
    const schema = generateBlogPostSchema(postWithoutAuthor, config);
    
    // Should resolve defaultAuthor to full Author object
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://johndoe.example.com',
      image: '/avatars/john.jpg',
    });
  });

  it('should handle string authors in schema (no email/URL)', () => {
    const postWithStringAuthor: BlogPost = {
      ...basePost,
      authors: ['John Doe'], // String, not Author object
    };
    const schema = generateBlogPostSchema(postWithStringAuthor);
    
    expect(schema.author).toEqual({
      '@type': 'Person',
      name: 'John Doe',
    });
  });

  it('should handle mixed string and Author object authors in schema', () => {
    const mixedAuthors = [
      'Unknown Author', // String
      {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ];
    const postWithMixedAuthors: BlogPost = {
      ...basePost,
      authors: mixedAuthors,
    };
    const schema = generateBlogPostSchema(postWithMixedAuthors);
    
    expect(Array.isArray(schema.author)).toBe(true);
    expect(schema.author).toEqual([
      {
        '@type': 'Person',
        name: 'Unknown Author',
      },
      {
        '@type': 'Person',
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://johndoe.example.com',
      },
    ]);
  });
});

describe('generateBreadcrumbsSchema', () => {
  const basePost: BlogPost = {
    slug: 'test-post',
    content: '# Test Post\n\nThis is a test.',
    frontmatter: {
      title: 'Test Post',
      description: 'A test blog post',
      date: '2024-01-01',
      author: 'John Doe',
      tags: ['test', 'blog'],
    },
    readingTime: 1,
    wordCount: 5,
    authors: ['John Doe'],
  };

  it('should generate basic breadcrumbs schema with default breadcrumbs', () => {
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const schema = generateBreadcrumbsSchema(basePost, config);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    });
    expect(schema.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://example.com/blogs',
    });
    expect(schema.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Test Post',
      item: 'https://example.com/blog/test-post',
    });
  });

  it('should use custom breadcrumbs when provided', () => {
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const customBreadcrumbs = [
      { name: 'Home', url: 'https://example.com' },
      { name: 'Articles', url: 'https://example.com/articles' },
      { name: 'Test Post', url: 'https://example.com/articles/test-post' },
    ];
    const schema = generateBreadcrumbsSchema(basePost, config, customBreadcrumbs);

    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    });
    expect(schema.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Articles',
      item: 'https://example.com/articles',
    });
    expect(schema.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Test Post',
      item: 'https://example.com/articles/test-post',
    });
  });

  it('should use seoTitle or title for breadcrumb name', () => {
    const postWithSeoTitle: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        seoTitle: 'SEO Title',
        title: 'Regular Title',
      },
    };
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const schema = generateBreadcrumbsSchema(postWithSeoTitle, config);

    expect(schema.itemListElement[2].name).toBe('SEO Title');
  });

  it('should use slug as fallback for breadcrumb name', () => {
    const postWithoutTitle: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        title: undefined,
      },
    };
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const schema = generateBreadcrumbsSchema(postWithoutTitle, config);

    expect(schema.itemListElement[2].name).toBe('test-post');
  });

  it('should use canonicalUrl if available', () => {
    const postWithCanonical: BlogPost = {
      ...basePost,
      frontmatter: {
        ...basePost.frontmatter,
        canonicalUrl: 'https://custom.com/post',
      },
    };
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const schema = generateBreadcrumbsSchema(postWithCanonical, config);

    expect(schema.itemListElement[2].item).toBe('https://custom.com/post');
  });

  it('should handle empty siteUrl', () => {
    const config: Config = {
      siteUrl: '',
    };
    const schema = generateBreadcrumbsSchema(basePost, config);

    expect(schema.itemListElement[0].item).toBe('/');
    expect(schema.itemListElement[1].item).toBe('/blogs');
    expect(schema.itemListElement[2].item).toBe('/blog/test-post');
  });

  it('should use getConfig when config not provided', () => {
    const schema = generateBreadcrumbsSchema(basePost);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
  });

  it('should handle breadcrumbs with multiple items', () => {
    const config: Config = {
      siteUrl: 'https://example.com',
    };
    const customBreadcrumbs = [
      { name: 'Home', url: 'https://example.com' },
      { name: 'Category', url: 'https://example.com/category' },
      { name: 'Subcategory', url: 'https://example.com/category/subcategory' },
      { name: 'Test Post', url: 'https://example.com/category/subcategory/test-post' },
    ];
    const schema = generateBreadcrumbsSchema(basePost, config, customBreadcrumbs);

    expect(schema.itemListElement).toHaveLength(4);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
    expect(schema.itemListElement[3].position).toBe(4);
  });
});

