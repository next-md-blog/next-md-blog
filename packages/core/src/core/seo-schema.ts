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

/** Options for `generateBlogPostSchema`. */
export interface BlogPostSchemaOptions {
  /** If true and an organization @id exists, publisher is `{ "@id": "..." }` only */
  publisherReference?: boolean;
  /** Locale segment, used for URL building and `inLanguage`. */
  locale?: string;
  /**
   * Speakable specification (https://schema.org/speakable). Pass `true` to use a
   * sensible default (article header + first paragraph), or your own selectors.
   */
  speakable?: boolean | { cssSelector?: string[]; xpath?: string[] };
  /**
   * Free-form mutation of the BlogPosting node before serialization. Use this
   * for HowTo extensions, custom fields, isPartOf overrides, etc.
   */
  extendArticle?: (node: Record<string, unknown>) => Record<string, unknown>;
}

const DEFAULT_SPEAKABLE_SELECTORS = [
  'article > header h1',
  'article > header p',
];

function slugifySeries(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generates JSON-LD structured data (Schema.org) for a blog post.
 * @param post - The blog post
 * @param config - SEO configuration
 * @param options - Locale, speakable, publisher reference, extension hook
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
  const locale = options?.locale;

  const fm = post.frontmatter;

  const title = resolveFrontmatterField<string>(['seoTitle', 'title'], fm, post.slug) || post.slug;
  const description = resolveFrontmatterField<string>(
    ['seoDescription', 'description', 'excerpt'],
    fm,
    ''
  ) || '';
  // Use normalized authors from post, or fallback to default author (resolved from config if available).
  const resolvedDefaultAuthor = resolveDefaultAuthor(defaultAuthor, configAuthors);
  const postAuthors = (post.authors && post.authors.length > 0)
    ? post.authors
    : (resolvedDefaultAuthor ? [resolvedDefaultAuthor] : []);

  const authors = ensureAuthorsResolved(postAuthors, configAuthors);
  const publishedDate = resolveFrontmatterField<string>(['publishedDate', 'date'], fm);
  // `updated` is a first-class alias for `modifiedDate`.
  const modifiedDate =
    resolveFrontmatterField<string>(['modifiedDate', 'updated'], fm) ||
    publishedDate;
  const postUrl = resolvePostUrlWithConfig(
    resolveFrontmatterField<string>(['canonicalUrl'], fm),
    post.slug,
    siteUrl,
    blogConfig,
    locale
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

  const lang = locale ?? resolveFrontmatterField<string>(['lang'], fm);

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
    ...(lang ? { inLanguage: lang } : {}),
    ...(wordCount > 0 && { wordCount }),
    ...(readingTime > 0 && {
      timeRequired: `PT${readingTime}M`,
    }),
  };

  // Speakable spec (voice-assistant friendly).
  if (options?.speakable) {
    const sp =
      options.speakable === true
        ? { cssSelector: DEFAULT_SPEAKABLE_SELECTORS }
        : options.speakable;
    schema.speakable = { '@type': 'SpeakableSpecification', ...sp };
  }

  // E-E-A-T: reviewer / fact-checker / last reviewed.
  const reviewedBy = resolveFrontmatterField<string>(['reviewedBy'], fm);
  if (reviewedBy) {
    schema.reviewedBy = { '@type': 'Person', name: reviewedBy };
  }
  const factCheckedBy = resolveFrontmatterField<string>(['factCheckedBy'], fm);
  if (factCheckedBy) {
    schema.factCheckedBy = { '@type': 'Person', name: factCheckedBy };
  }
  const lastReviewed = resolveFrontmatterField<string>(['lastReviewed'], fm);
  if (lastReviewed) {
    schema.lastReviewed = lastReviewed;
  }

  // Series → isPartOf the pillar CollectionPage.
  const series = resolveFrontmatterField<string>(['series'], fm);
  if (series && siteUrl) {
    const localeSeg = locale ? `/${locale}/` : '/';
    const seriesSlug = slugifySeries(series);
    const seriesTitle =
      resolveFrontmatterField<string>(['seriesTitle'], fm) || series;
    schema.isPartOf = {
      '@type': 'CollectionPage',
      '@id': `${siteUrl.replace(/\/$/, '')}${localeSeg}topics/${seriesSlug}`,
      name: seriesTitle,
    };
  }

  // Merge with custom schema from frontmatter (frontmatter wins).
  let merged = schema;
  if (fm.schema && typeof fm.schema === 'object') {
    merged = { ...schema, ...(fm.schema as Record<string, unknown>) };
  }

  // Free-form mutation hook (runs last).
  if (options?.extendArticle) {
    return options.extendArticle({ ...merged });
  }
  return merged;
}

/**
 * Generates breadcrumbs schema for a blog post
 * @param post - The blog post
 * @param config - SEO configuration
 * @param breadcrumbs - Optional custom breadcrumb items
 * @param locale - Optional locale segment for URL building
 * @returns Breadcrumbs JSON-LD schema object
 */
export function generateBreadcrumbsSchema(
  post: BlogPost,
  config?: Config,
  breadcrumbs?: Array<{ name: string; url: string }>,
  locale?: string
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
    blogConfig,
    locale
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

/** Options for `generateBlogPostSchemaGraph`. */
export interface BlogPostSchemaGraphOptions {
  locale?: string;
  speakable?: BlogPostSchemaOptions['speakable'];
  extendArticle?: BlogPostSchemaOptions['extendArticle'];
}

/**
 * Single JSON-LD `@graph` for Organization + BlogPosting + BreadcrumbList.
 *
 * Backwards-compatible: the 5th `options` parameter is optional. Passing
 * `{ locale, speakable, extendArticle }` removes the need for app code to
 * post-mutate the graph for locale-aware URLs and rich SEO fields.
 */
export function generateBlogPostSchemaGraph(
  post: BlogPost,
  config?: Config,
  breadcrumbs?: Array<{ name: string; url: string }>,
  includeBreadcrumbs = true,
  options?: BlogPostSchemaGraphOptions
): Record<string, unknown> {
  const orgNode = buildOrganizationGraphNode(config);
  const article = generateBlogPostSchema(post, config, {
    publisherReference: true,
    ...(options?.locale !== undefined && { locale: options.locale }),
    ...(options?.speakable !== undefined && { speakable: options.speakable }),
    ...(options?.extendArticle !== undefined && { extendArticle: options.extendArticle }),
  });
  const articleBody = { ...article };
  delete articleBody['@context'];

  const graph: Record<string, unknown>[] = [];
  if (orgNode) graph.push(orgNode);
  graph.push(articleBody);

  if (includeBreadcrumbs) {
    const crumbs = generateBreadcrumbsSchema(post, config, breadcrumbs, options?.locale);
    const crumbsBody = { ...crumbs };
    delete crumbsBody['@context'];
    graph.push(crumbsBody);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
