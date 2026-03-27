import type { BlogPost, BlogPostMetadata, Config } from './types.js';
import type { Metadata } from 'next';
import { getConfig } from './config.js';
import { resolveFrontmatterField, isStringArray } from './type-guards.js';
import { DEFAULT_SITE_NAME, DEFAULT_LANG } from './constants.js';
import {
  normalizeKeywords,
  getAuthorNames,
  ensureAuthorsResolved,
  resolveDefaultAuthor,
  buildRobotsMeta,
  resolvePostUrlWithConfig,
  resolveHreflangMap,
  resolveBlogIndexUrl,
  resolveCanonicalUrl,
} from './seo-utils.js';

/**
 * Generates comprehensive metadata for a blog post
 * @param post - The blog post
 * @param config - SEO configuration
 * @returns Metadata object for Next.js
 */
export function generateBlogPostMetadata(
  post: BlogPost,
  config?: Config
): Metadata {
  const blogConfig = config || getConfig();
  
  const {
    siteName = DEFAULT_SITE_NAME,
    siteUrl = '',
    defaultAuthor,
    authors: configAuthors,
    twitterHandle,
    defaultOgImage,
    defaultLang = DEFAULT_LANG,
  } = blogConfig;

  const fm = post.frontmatter;

  // Title resolution: seoTitle > title > slug
  const baseTitle = resolveFrontmatterField<string>(['title'], fm, post.slug) || post.slug;
  const seoTitle = resolveFrontmatterField<string>(['seoTitle', 'title'], fm, baseTitle) || baseTitle;
  const pageTitle = `${seoTitle} | ${siteName}`;

  // Description resolution: seoDescription > description > excerpt > empty
  const description = resolveFrontmatterField<string>(
    ['seoDescription', 'description', 'excerpt'],
    fm,
    ''
  ) || '';

  // Use normalized authors from post, or fallback to default author (resolved from config if available)
  // Note: post.authors should already be resolved from config.authors when the post was loaded (in file-utils.ts)
  // However, we ensure they are resolved here as a safety net in case resolution didn't happen earlier
  const resolvedDefaultAuthor = resolveDefaultAuthor(defaultAuthor, configAuthors);
  const postAuthors = (post.authors && post.authors.length > 0) 
    ? post.authors 
    : (resolvedDefaultAuthor ? [resolvedDefaultAuthor] : []);
  
  // Ensure all authors are resolved from config (safety net)
  const authors = ensureAuthorsResolved(postAuthors, configAuthors);
  const authorNames = getAuthorNames(authors);
  
  // Extract author Twitter handles for Twitter metadata
  // Works for both frontmatter authors (already resolved) and default author (just resolved above)
  const authorTwitterHandles = authors
    .map((author) => {
      if (typeof author === 'string') return undefined;
      return author.twitter;
    })
    .filter((handle): handle is string => Boolean(handle));

  // Date resolution: publishedDate > date
  const publishedDate = resolveFrontmatterField<string>(['publishedDate', 'date'], fm);
  const modifiedDate = resolveFrontmatterField<string>(['modifiedDate'], fm);

  // Tags and keywords
  const tags = isStringArray(fm.tags) ? fm.tags : [];
  const keywords = normalizeKeywords(fm.keywords as string | string[] | undefined);
  const allKeywords = [...tags, ...keywords].filter(
    (k, i, arr) => arr.indexOf(k) === i
  ); // Remove duplicates

  // OG image resolution: ogImage > image > defaultOgImage
  // If not provided, Next.js will automatically use opengraph-image.tsx file convention
  const ogImageUrl =
    resolveFrontmatterField<string>(['ogImage', 'image'], fm) ||
    defaultOgImage;

  const imageAlt = resolveFrontmatterField<string>(['imageAlt'], fm) || seoTitle;

  // OG title/description: ogTitle/ogDescription > seoTitle/seoDescription > title/description
  const ogTitle = resolveFrontmatterField<string>(['ogTitle'], fm) || seoTitle;
  const ogDescription = resolveFrontmatterField<string>(['ogDescription'], fm) || description;

  // Twitter title/description: twitterTitle/twitterDescription > ogTitle/ogDescription > seoTitle/description
  const twitterTitle = resolveFrontmatterField<string>(['twitterTitle'], fm) || ogTitle;
  const twitterDescription = resolveFrontmatterField<string>(['twitterDescription'], fm) || ogDescription;

  // Canonical URL - supports both absolute and relative URLs
  // Relative URLs will be resolved against siteUrl
  const canonicalUrl = resolvePostUrlWithConfig(
    resolveFrontmatterField<string>(['canonicalUrl'], fm),
    post.slug,
    siteUrl,
    blogConfig
  );

  // Language
  const lang = resolveFrontmatterField<string>(['lang'], fm) || defaultLang;

  // Robots meta
  const robots = buildRobotsMeta(fm);

  const postUrl = canonicalUrl;

  // Article meta tags (for better SEO)
  const articleMeta: Record<string, string> = {};
  if (publishedDate) articleMeta['article:published_time'] = publishedDate;
  if (modifiedDate) articleMeta['article:modified_time'] = modifiedDate;
  const category = resolveFrontmatterField<string>(['category'], fm);
  if (category) articleMeta['article:section'] = category;
  if (tags.length > 0) {
    tags.forEach((tag, index) => {
      articleMeta[`article:tag${index > 0 ? index + 1 : ''}`] = tag;
    });
  }
  if (authorNames.length > 0) {
    authorNames.forEach((authorName, index) => {
      articleMeta[`article:author${index > 0 ? index + 1 : ''}`] = authorName;
    });
  }
  
  // Add author email and other details from Author objects to meta tags
  authors.forEach((author, index) => {
    if (typeof author === 'object') {
      // Add author email if available
      if (author.email) {
        articleMeta[`author:email${index > 0 ? index + 1 : ''}`] = author.email;
      }
      // Add author URL if available
      if (author.url) {
        articleMeta[`author:url${index > 0 ? index + 1 : ''}`] = author.url;
      }
    }
  });

  // Build alternates object
  const alternates: { canonical?: string; languages?: Record<string, string> } = {};
  if (canonicalUrl) alternates.canonical = canonicalUrl;
  const hreflang = resolveHreflangMap(fm, blogConfig);
  if (hreflang && Object.keys(hreflang).length > 0) {
    alternates.languages = siteUrl
      ? Object.fromEntries(
          Object.entries(hreflang).map(([k, v]) => [
            k,
            v.startsWith('http://') || v.startsWith('https://')
              ? v
              : resolveCanonicalUrl(v, siteUrl),
          ])
        )
      : hreflang;
  }

  // Merge all custom meta tags into the 'other' field
  const otherMeta: Record<string, string> = {};
  if (lang) otherMeta['lang'] = lang;
  Object.assign(otherMeta, articleMeta);

  const metadata: Metadata = {
    title: pageTitle,
    description,
    ...(Object.keys(alternates).length > 0 && { alternates }),
    ...(robots && { robots }),
    ...(Object.keys(otherMeta).length > 0 && { other: otherMeta }),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'article',
      url: postUrl,
      siteName,
      ...(ogImageUrl && {
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: imageAlt,
          },
        ],
      }),
      ...(publishedDate && { publishedTime: publishedDate }),
      ...(modifiedDate && { modifiedTime: modifiedDate }),
      ...(authorNames.length > 0 && { authors: authorNames }),
      ...(tags.length > 0 && { tags }),
      ...(lang && { locale: lang }),
    },
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description: twitterDescription,
      ...(ogImageUrl && { images: [ogImageUrl] }),
      // Use author's Twitter handle if available, otherwise fallback to site Twitter handle
      ...(authorTwitterHandles.length > 0 
        ? { creator: `@${authorTwitterHandles[0].replace('@', '')}` }
        : twitterHandle && { creator: `@${twitterHandle.replace('@', '')}` }
      ),
    },
    ...(allKeywords.length > 0 && { keywords: allKeywords }),
    ...(authors.length > 0 && { 
      authors: authors.map((author) => {
        if (typeof author === 'string') {
          return { name: author };
        }
        return {
          name: author.name,
          ...(author.email && { email: author.email }),
          ...(author.url && { url: author.url }),
        };
      })
    }),
  };

  return metadata;
}

/**
 * Generates metadata for the blog listing page
 * @param posts - Array of blog posts
 * @param config - SEO configuration
 * @returns Metadata object for Next.js
 */
export function generateBlogListMetadata(
  posts: BlogPostMetadata[],
  config?: Config
): Metadata {
  const blogConfig = config || getConfig();
  const { siteName = DEFAULT_SITE_NAME, siteUrl = '' } = blogConfig;
  const title = 'Blog Posts';
  const description = `Browse all ${posts.length} blog posts`;
  const listUrl = resolveBlogIndexUrl(siteUrl, blogConfig);

  const metadata: Metadata = {
    title: `${title} | ${siteName}`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: listUrl,
      siteName,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };

  return metadata;
}

