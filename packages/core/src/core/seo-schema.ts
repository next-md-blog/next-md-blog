import type { BlogPost, Author, Config } from './types.js';
import { calculateReadingTime, calculateWordCount } from './utils.js';
import { getConfig } from './config.js';
import { resolveFrontmatterField, isStringArray } from './type-guards.js';
import { DEFAULT_SITE_NAME } from './constants.js';
import {
  ensureAuthorsResolved,
  resolveDefaultAuthor,
  resolvePostUrlWithConfig,
  resolveBlogIndexUrl,
} from './seo-utils.js';
import {
  buildPublisherEmbedded,
  buildOrganizationGraphNode,
  resolveOrganizationId,
} from './organization-schema.js';

/** Options for `generateBlogPostSchema` */
export interface BlogPostSchemaOptions {
  /** If true and an organization @id exists, publisher is `{ "@id": "..." }` only */
  publisherReference?: boolean;
}

/**
 * Generates JSON-LD structured data (Schema.org) for a blog post
 * @param post - The blog post
 * @param config - SEO configuration
 * @returns JSON-LD schema object
 */
export function generateBlogPostSchema(
  post: BlogPost,
  config?: Config,
  options?: BlogPostSchemaOptions
): Record<string, unknown> {
  const blogConfig = config || getConfig();
  const {
    siteName = DEFAULT_SITE_NAME,
    siteUrl = '',
    defaultAuthor,
    authors: configAuthors,
  } = blogConfig;
  const publisherReference = options?.publisherReference === true;

  const fm = post.frontmatter;

  const title = resolveFrontmatterField<string>(['seoTitle', 'title'], fm, post.slug) || post.slug;
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
  const publishedDate = resolveFrontmatterField<string>(['publishedDate', 'date'], fm);
  const modifiedDate = resolveFrontmatterField<string>(['modifiedDate'], fm) || publishedDate;
  const postUrl = resolvePostUrlWithConfig(
    resolveFrontmatterField<string>(['canonicalUrl'], fm),
    post.slug,
    siteUrl,
    blogConfig
  );
  const ogImageUrl = resolveFrontmatterField<string>(['ogImage', 'image'], fm);

  // Calculate reading time and word count if not provided
  const readingTime = resolveFrontmatterField<number>(['readingTime'], fm) || calculateReadingTime(post.content);
  const wordCount = calculateWordCount(post.content);

  // Build author schema with full author info if available
  const buildAuthorSchema = (author: string | Author) => {
    if (typeof author === 'string') {
      return {
        '@type': 'Person',
        name: author,
      };
    }
    return {
      '@type': 'Person',
      name: author.name,
      ...(author.email && { email: author.email }),
      ...(author.url && { url: author.url }),
      ...(author.avatar && { image: author.avatar }),
    };
  };

  // Base schema
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': resolveFrontmatterField<string>(['type'], fm, 'BlogPosting') || 'BlogPosting',
    headline: title,
    description,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    ...(publishedDate && { datePublished: publishedDate }),
    ...(modifiedDate && { dateModified: modifiedDate }),
    ...(authors.length > 0 && {
      author: authors.length === 1
        ? buildAuthorSchema(authors[0])
        : authors.map(buildAuthorSchema),
    }),
    ...(siteName &&
      (() => {
        if (publisherReference) {
          const orgId = resolveOrganizationId(blogConfig);
          if (orgId) {
            return { publisher: { '@id': orgId } };
          }
        }
        const pub = buildPublisherEmbedded(blogConfig);
        return pub ? { publisher: pub } : {};
      })()),
    ...(ogImageUrl && {
      image: {
        '@type': 'ImageObject',
        url: ogImageUrl,
        ...(resolveFrontmatterField<string>(['imageAlt'], fm) ? { caption: resolveFrontmatterField<string>(['imageAlt'], fm)! } : {}),
      },
    }),
    ...(resolveFrontmatterField<string>(['category'], fm) ? { articleSection: resolveFrontmatterField<string>(['category'], fm)! } : {}),
    ...(isStringArray(fm.tags) && fm.tags.length > 0 && {
      keywords: fm.tags.join(', '),
    }),
    ...(resolveFrontmatterField<string>(['lang'], fm) ? { inLanguage: resolveFrontmatterField<string>(['lang'], fm)! } : {}),
    ...(wordCount > 0 && { wordCount }),
    ...(readingTime > 0 && {
      timeRequired: `PT${readingTime}M`,
    }),
  };

  // Merge with custom schema from frontmatter
  if (fm.schema && typeof fm.schema === 'object') {
    return {
      ...schema,
      ...(fm.schema as Record<string, unknown>),
    };
  }

  return schema;
}

/**
 * Generates breadcrumbs schema for a blog post
 * @param post - The blog post
 * @param config - SEO configuration
 * @param breadcrumbs - Optional custom breadcrumb items (e.g., [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }])
 * @returns Breadcrumbs JSON-LD schema object
 */
export function generateBreadcrumbsSchema(
  post: BlogPost,
  config?: Config,
  breadcrumbs?: Array<{ name: string; url: string }>
): Record<string, unknown> {
  const blogConfig = config || getConfig();
  const { siteUrl = '' } = blogConfig;
  const title = resolveFrontmatterField<string>(
    ['seoTitle', 'title'],
    post.frontmatter,
    post.slug
  ) || post.slug;
  const postUrl = resolvePostUrlWithConfig(
    resolveFrontmatterField<string>(['canonicalUrl'], post.frontmatter),
    post.slug,
    siteUrl,
    blogConfig
  );

  const blogIndexUrl = resolveBlogIndexUrl(siteUrl, blogConfig);

  // Default breadcrumbs: Home > Blog > Post
  const defaultBreadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'Home', url: siteUrl || '/' },
    { name: 'Blog', url: blogIndexUrl },
    { name: title, url: postUrl },
  ];

  const items = breadcrumbs || defaultBreadcrumbs;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Single JSON-LD `@graph` for Organization + BlogPosting + BreadcrumbList.
 */
export function generateBlogPostSchemaGraph(
  post: BlogPost,
  config?: Config,
  breadcrumbs?: Array<{ name: string; url: string }>,
  includeBreadcrumbs = true
): Record<string, unknown> {
  const orgNode = buildOrganizationGraphNode(config);
  const article = generateBlogPostSchema(post, config, { publisherReference: true });
  const articleBody = { ...article };
  delete articleBody['@context'];

  const graph: Record<string, unknown>[] = [];
  if (orgNode) graph.push(orgNode);
  graph.push(articleBody);

  if (includeBreadcrumbs) {
    const crumbs = generateBreadcrumbsSchema(post, config, breadcrumbs);
    const crumbsBody = { ...crumbs };
    delete crumbsBody['@context'];
    graph.push(crumbsBody);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

