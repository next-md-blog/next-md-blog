/**
 * Content collection abstraction.
 *
 * A `Collection` owns one content surface (blog, glossary, docs, changelog…).
 * Multiple collections coexist in one site; site-wide concerns (organization,
 * site URL, default author) live in `SiteConfig`.
 */
import type { Metadata } from 'next';
import type { MetadataRoute } from 'next';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './frontmatter.js';

import type {
  BlogPostFrontmatter,
  BlogPost,
  BlogPostMetadata,
  Author,
} from './types.js';
import type { SiteConfig } from './site.js';
import { calculateReadingTime, calculateWordCount, normalizeAuthors } from './utils.js';
import { validateContent, validateFrontmatter, validateSlug } from './validation.js';
import {
  BlogPostNotFoundError,
  DirectoryError,
  FileReadError,
} from './errors.js';
import { MARKDOWN_FILE_REGEX, SUPPORTED_EXTENSIONS } from './constants.js';
import { resolveFrontmatterField, isStringArray } from './type-guards.js';
import {
  buildRobotsMeta,
  ensureAuthorsResolved,
  getAuthorNames,
  normalizeKeywords,
  resolveCanonicalUrl,
  resolveDefaultAuthor,
} from './seo-utils.js';
import {
  buildOrganizationGraphNode,
  buildPublisherEmbedded,
  resolveOrganizationId,
} from './organization-schema.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type BaseFrontmatter = BlogPostFrontmatter;
export type ContentDoc<TFrontmatter extends BaseFrontmatter = BaseFrontmatter> =
  Omit<BlogPost, 'frontmatter'> & { frontmatter: TFrontmatter };
export type ContentMetadata<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
> = Omit<BlogPostMetadata, 'frontmatter'> & { frontmatter: TFrontmatter };

/** Context passed to `schemaBuilder` callbacks. */
export interface SchemaBuilderContext<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
> {
  site: SiteConfig;
  collection: ResolvedCollectionConfig<TFrontmatter>;
  /** Canonical URL of the document for the current locale. */
  url: string;
  /** Currently rendered locale, if any. */
  locale: string | undefined;
}

export type SchemaBuilder<TFrontmatter extends BaseFrontmatter = BaseFrontmatter> = (
  doc: ContentDoc<TFrontmatter>,
  ctx: SchemaBuilderContext<TFrontmatter>,
) => Record<string, unknown>;

export interface RssOptions {
  title?: string;
  description?: string;
  /** Cap number of items (default 20). */
  limit?: number;
}

export interface CollectionDefaults {
  /** Same shape as `generateBlogPostMetadata`'s `titleTemplate` option. */
  titleTemplate?: 'site-suffix' | 'absolute' | 'bare';
  /** Default speakable spec. `true` uses sensible defaults. */
  speakable?:
    | boolean
    | { cssSelector?: string[]; xpath?: string[] };
}

export interface CollectionConfig<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
> {
  /** Stable identifier (used as cache key, in error messages). */
  id: string;
  /** Filesystem directory relative to cwd (e.g. `content/blog`). */
  contentDir: string;
  /** URL segment under `/{lang}` (e.g. `blog`). */
  pathSegment: string;
  /** Human-readable label (default: capitalized pathSegment). */
  label?: string;
  /**
   * Site-relative index path (default: `/${pathSegment}`).
   * Used in default breadcrumbs and sitemap entries.
   */
  indexPath?: string;
  /** Schema.org @type for the per-doc schema (default: 'BlogPosting'). */
  schemaType?: string;
  /** Override the entire schema builder. */
  schemaBuilder?: SchemaBuilder<TFrontmatter>;
  /** RSS feed config. `false` disables the feed for this collection. */
  rss?: false | RssOptions;
  /** Site config (shared across collections). */
  site: SiteConfig;
  /** Per-collection defaults applied to `metadata()` / `schemaGraph()`. */
  defaults?: CollectionDefaults;
}

export type ResolvedCollectionConfig<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
> = Required<
  Omit<
    CollectionConfig<TFrontmatter>,
    'schemaBuilder' | 'defaults' | 'site' | 'rss' | 'label' | 'indexPath'
  >
> & {
  label: string;
  indexPath: string;
  rss: false | Required<RssOptions>;
  defaults: CollectionDefaults;
  site: SiteConfig;
  schemaBuilder?: SchemaBuilder<TFrontmatter>;
};

/** Per-call read options. */
export interface ReadOptions {
  /** Locale subfolder (e.g. 'en'). When set, reads from `${contentDir}/${locale}`. */
  locale?: string;
}

export interface MetadataOptions {
  locale?: string;
  /** Overrides `defaults.titleTemplate`. */
  titleTemplate?: CollectionDefaults['titleTemplate'] | ((args: { title: string; siteName: string }) => string);
  /** Pre-computed hreflang map (e.g. from `getInAllLocales`). */
  alternateLanguages?: Record<string, string>;
}

export interface SchemaOptions {
  locale?: string;
  /** Overrides `defaults.speakable`. */
  speakable?: CollectionDefaults['speakable'];
  /** Mutate the node before serialization (last writer wins). */
  extend?: (node: Record<string, unknown>) => Record<string, unknown>;
}

export interface SchemaGraphOptions extends SchemaOptions {
  includeBreadcrumbs?: boolean;
}

export interface Breadcrumb {
  name: string;
  url: string;
}

export interface Collection<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
> {
  readonly id: string;
  readonly config: ResolvedCollectionConfig<TFrontmatter>;

  // Data
  getAll(opts?: ReadOptions): Promise<ContentMetadata<TFrontmatter>[]>;
  getOne(slug: string, opts?: ReadOptions): Promise<ContentDoc<TFrontmatter> | null>;
  getAllSlugs(opts?: ReadOptions): Promise<string[]>;
  getInAllLocales(
    slug: string,
    locales: readonly string[],
  ): Promise<Map<string, ContentDoc<TFrontmatter> | null>>;

  // Queries
  getByAuthor(
    authorSlug: string,
    opts?: ReadOptions,
  ): Promise<ContentMetadata<TFrontmatter>[]>;
  getBySeries(
    seriesSlug: string,
    opts?: ReadOptions,
  ): Promise<ContentMetadata<TFrontmatter>[]>;
  getAllAuthorSlugs(locales?: readonly string[]): Promise<string[]>;
  getAllSeriesSlugs(locales?: readonly string[]): Promise<string[]>;

  // URLs
  url(slug: string, locale?: string, canonicalUrl?: string): string;
  indexUrl(locale?: string): string;
  hreflangMap(slug: string, locales: readonly string[]): Promise<Record<string, string>>;

  // SEO
  metadata(
    doc: ContentDoc<TFrontmatter>,
    opts?: MetadataOptions,
  ): Promise<Metadata>;
  listMetadata(
    docs: ContentMetadata<TFrontmatter>[],
    opts?: { locale?: string },
  ): Metadata;
  schema(
    doc: ContentDoc<TFrontmatter>,
    opts?: SchemaOptions,
  ): Record<string, unknown>;
  schemaGraph(
    doc: ContentDoc<TFrontmatter>,
    breadcrumbs?: Breadcrumb[],
    opts?: SchemaGraphOptions,
  ): Record<string, unknown>;
  breadcrumbsSchema(
    doc: ContentDoc<TFrontmatter>,
    breadcrumbs?: Breadcrumb[],
    opts?: { locale?: string },
  ): Record<string, unknown>;

  // Output
  rssXml(opts?: { locale?: string }): Promise<string>;
  rssResponse(opts?: { locale?: string; init?: ResponseInit }): Promise<NextResponse>;
  sitemapEntries(opts: { locales: readonly string[] }): Promise<MetadataRoute.Sitemap>;
  llmsTxtSection(opts: { locales: readonly string[]; defaultLocale?: string }): Promise<string>;
  llmsFullTxtSection(opts: { locales: readonly string[] }): Promise<string>;
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------

function readFileSafe(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new FileReadError(
      filePath,
      error instanceof Error ? error : undefined,
      { operation: 'readFileSafe' },
    );
  }
}

function readDirectorySafe(dirPath: string): string[] {
  try {
    if (!fs.existsSync(dirPath)) return [];
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) return [];
    return fs.readdirSync(dirPath);
  } catch (error) {
    throw new DirectoryError(
      dirPath,
      error instanceof Error ? error : undefined,
      { operation: 'readDirectorySafe' },
    );
  }
}

function resolveDir(contentDir: string, locale?: string): string {
  const base = path.isAbsolute(contentDir)
    ? contentDir
    : path.join(process.cwd(), contentDir);
  return locale ? path.join(base, locale) : base;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function slugifyAuthor(name: string): string {
  return slugify(name);
}
export function slugifySeries(value: string): string {
  return slugify(value);
}

function authorNameFrom(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name: unknown }).name;
    if (typeof name === 'string') return name;
  }
  return null;
}

export function authorNamesFromFrontmatter(
  fm: Record<string, unknown>,
): string[] {
  const out = new Set<string>();
  const single = fm.author;
  if (Array.isArray(single)) {
    for (const a of single) {
      const n = authorNameFrom(a);
      if (n) out.add(n);
    }
  } else {
    const n = authorNameFrom(single);
    if (n) out.add(n);
  }
  const many = fm.authors;
  if (Array.isArray(many)) {
    for (const a of many) {
      const n = authorNameFrom(a);
      if (n) out.add(n);
    }
  }
  return [...out];
}

function parseDoc<TFrontmatter extends BaseFrontmatter>(
  filePath: string,
  slug: string,
  authors?: Author[],
): ContentDoc<TFrontmatter> {
  const fileContents = readFileSafe(filePath);
  if (fileContents === null) throw new BlogPostNotFoundError(slug);
  try {
    const { data: frontmatter, content } = parseFrontmatter(fileContents);
    validateContent(content);
    const trimmedContent = content.trim();
    const validated = validateFrontmatter(frontmatter);
    const readingTime =
      (validated.readingTime as number) || calculateReadingTime(trimmedContent);
    const wordCount = calculateWordCount(trimmedContent);
    const resolvedAuthors = normalizeAuthors(
      validated.author as string | string[] | undefined,
      validated.authors as string[] | undefined,
      authors,
    );
    return {
      slug,
      content: trimmedContent,
      frontmatter: validated as unknown as TFrontmatter,
      readingTime,
      wordCount,
      authors: resolvedAuthors,
    };
  } catch (error) {
    throw new FileReadError(
      filePath,
      error instanceof Error ? error : new Error('Failed to parse markdown'),
      { operation: 'parseDoc', slug },
    );
  }
}

// ---------------------------------------------------------------------------
// Default schema builders
// ---------------------------------------------------------------------------

const DEFAULT_SPEAKABLE_SELECTORS = [
  'article > header h1',
  'article > header p',
];

function buildAuthorSchema(author: string | Author) {
  if (typeof author === 'string') {
    return { '@type': 'Person', name: author };
  }
  return {
    '@type': 'Person',
    name: author.name,
    ...(author.email && { email: author.email }),
    ...(author.url && { url: author.url }),
    ...(author.avatar && { image: author.avatar }),
  };
}

/** Default schema for `BlogPosting` (and any other Article-shaped @type). */
function defaultArticleBuilder<TFrontmatter extends BaseFrontmatter>(
  doc: ContentDoc<TFrontmatter>,
  ctx: SchemaBuilderContext,
): Record<string, unknown> {
  const { site, collection, url, locale } = ctx;
  const fm = doc.frontmatter as BaseFrontmatter;
  const title =
    resolveFrontmatterField<string>(['seoTitle', 'title'], fm, doc.slug) ||
    doc.slug;
  const description =
    resolveFrontmatterField<string>(
      ['seoDescription', 'description', 'excerpt'],
      fm,
      '',
    ) || '';

  const resolvedDefault = resolveDefaultAuthor(site.defaultAuthor, site.authors);
  const docAuthors = doc.authors?.length
    ? doc.authors
    : resolvedDefault
      ? [resolvedDefault]
      : [];
  const authors = ensureAuthorsResolved(docAuthors, site.authors);

  const publishedDate = resolveFrontmatterField<string>(
    ['publishedDate', 'date'],
    fm,
  );
  const modifiedDate =
    resolveFrontmatterField<string>(['modifiedDate', 'updated'], fm) ||
    publishedDate;
  const ogImageUrl = resolveFrontmatterField<string>(['ogImage', 'image'], fm);
  const lang = locale ?? resolveFrontmatterField<string>(['lang'], fm);

  const orgId = resolveOrganizationId(site);
  const publisher = orgId
    ? { '@id': orgId }
    : buildPublisherEmbedded(site);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type':
      resolveFrontmatterField<string>(['type'], fm, collection.schemaType) ||
      collection.schemaType,
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(publishedDate && { datePublished: publishedDate }),
    ...(modifiedDate && { dateModified: modifiedDate }),
    ...(authors.length > 0 && {
      author:
        authors.length === 1
          ? buildAuthorSchema(authors[0])
          : authors.map(buildAuthorSchema),
    }),
    ...(publisher && { publisher }),
    ...(ogImageUrl && {
      image: {
        '@type': 'ImageObject',
        url: ogImageUrl,
        ...(resolveFrontmatterField<string>(['imageAlt'], fm)
          ? { caption: resolveFrontmatterField<string>(['imageAlt'], fm)! }
          : {}),
      },
    }),
    ...(resolveFrontmatterField<string>(['category'], fm)
      ? { articleSection: resolveFrontmatterField<string>(['category'], fm)! }
      : {}),
    ...(isStringArray(fm.tags) && fm.tags.length > 0
      ? { keywords: fm.tags.join(', ') }
      : {}),
    ...(lang ? { inLanguage: lang } : {}),
    ...(doc.wordCount > 0 && { wordCount: doc.wordCount }),
    ...(doc.readingTime > 0 && { timeRequired: `PT${doc.readingTime}M` }),
  };

  // E-E-A-T
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

  // Series → isPartOf the pillar
  const series = resolveFrontmatterField<string>(['series'], fm);
  if (series && site.siteUrl) {
    const localeSeg = locale ? `/${locale}/` : '/';
    const seriesSlug = slugifySeries(series);
    const seriesTitle =
      resolveFrontmatterField<string>(['seriesTitle'], fm) || series;
    schema.isPartOf = {
      '@type': 'CollectionPage',
      '@id': `${site.siteUrl.replace(/\/$/, '')}${localeSeg}topics/${seriesSlug}`,
      name: seriesTitle,
    };
  }

  // Frontmatter `schema` overrides defaults.
  if (fm.schema && typeof fm.schema === 'object') {
    return { ...schema, ...(fm.schema as Record<string, unknown>) };
  }
  return schema;
}

/** Built-in `DefinedTerm` builder — used when `schemaType === 'DefinedTerm'`. */
function definedTermBuilder<TFrontmatter extends BaseFrontmatter>(
  doc: ContentDoc<TFrontmatter>,
  ctx: SchemaBuilderContext,
): Record<string, unknown> {
  const { site, collection, url, locale } = ctx;
  const fm = doc.frontmatter as BaseFrontmatter;
  const title =
    resolveFrontmatterField<string>(['seoTitle', 'title'], fm, doc.slug) ||
    doc.slug;
  const description =
    resolveFrontmatterField<string>(
      ['seoDescription', 'description', 'excerpt'],
      fm,
      '',
    ) || '';
  const lang = locale ?? resolveFrontmatterField<string>(['lang'], fm);
  const setUrl = collection.indexPath.startsWith('http')
    ? collection.indexPath
    : `${site.siteUrl.replace(/\/$/, '')}${
        locale ? `/${locale}` : ''
      }${collection.indexPath.startsWith('/') ? collection.indexPath : `/${collection.indexPath}`}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: title,
    description,
    url,
    termCode: doc.slug,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': setUrl,
      name: collection.label,
    },
    ...(lang ? { inLanguage: lang } : {}),
  };

  if (fm.schema && typeof fm.schema === 'object') {
    return { ...schema, ...(fm.schema as Record<string, unknown>) };
  }
  return schema;
}

/**
 * Build a `FAQPage` `@graph` node from frontmatter, or `null` if `faq` is empty.
 */
function buildFaqNode(
  fm: BaseFrontmatter,
): Record<string, unknown> | null {
  const items = fm.faq;
  if (!Array.isArray(items) || items.length === 0) return null;
  const mainEntity = items
    .filter(
      (it): it is { question: string; answer: string } =>
        !!it &&
        typeof it === 'object' &&
        typeof (it as { question?: unknown }).question === 'string' &&
        typeof (it as { answer?: unknown }).answer === 'string',
    )
    .map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    }));
  if (mainEntity.length === 0) return null;
  return {
    '@type': 'FAQPage',
    mainEntity,
  };
}

/**
 * Build a `HowTo` `@graph` node from frontmatter, or `null` if `howto` is unset
 * / has no steps. Falls back to post title / description for `name` / `description`.
 */
function buildHowToNode(
  fm: BaseFrontmatter,
  locale?: string,
): Record<string, unknown> | null {
  const data = fm.howto;
  if (!data || typeof data !== 'object') return null;
  const steps = (data as { steps?: unknown }).steps;
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const stepNodes = steps
    .filter(
      (s): s is { name: string; text: string; image?: string; url?: string } =>
        !!s &&
        typeof s === 'object' &&
        typeof (s as { name?: unknown }).name === 'string' &&
        typeof (s as { text?: unknown }).text === 'string',
    )
    .map((s) => {
      const node: Record<string, unknown> = {
        '@type': 'HowToStep',
        name: s.name,
        text: s.text,
      };
      if (s.image) node.image = s.image;
      if (s.url) node.url = s.url;
      return node;
    });
  if (stepNodes.length === 0) return null;

  const name =
    (data as { name?: string }).name ??
    (typeof fm.title === 'string' ? fm.title : undefined);
  const description =
    (data as { description?: string }).description ??
    (typeof fm.description === 'string' ? fm.description : undefined);

  const node: Record<string, unknown> = {
    '@type': 'HowTo',
    ...(name && { name }),
    ...(description && { description }),
    step: stepNodes,
  };
  const totalTime = (data as { totalTime?: string }).totalTime;
  if (totalTime) node.totalTime = totalTime;
  const estimatedCost = (data as { estimatedCost?: { currency: string; value: string | number } }).estimatedCost;
  if (estimatedCost?.currency && estimatedCost?.value !== undefined) {
    node.estimatedCost = {
      '@type': 'MonetaryAmount',
      currency: estimatedCost.currency,
      value: String(estimatedCost.value),
    };
  }
  const supply = (data as { supply?: string[] }).supply;
  if (Array.isArray(supply) && supply.length > 0) {
    node.supply = supply.map((s) => ({ '@type': 'HowToSupply', name: s }));
  }
  const tool = (data as { tool?: string[] }).tool;
  if (Array.isArray(tool) && tool.length > 0) {
    node.tool = tool.map((t) => ({ '@type': 'HowToTool', name: t }));
  }
  const yieldText = (data as { yield?: string }).yield;
  if (yieldText) node.yield = yieldText;
  const image = (data as { image?: string }).image;
  if (image) node.image = image;
  if (locale) node.inLanguage = locale;
  return node;
}

function pickSchemaBuilder<TFrontmatter extends BaseFrontmatter>(
  config: ResolvedCollectionConfig<TFrontmatter>,
): SchemaBuilder<TFrontmatter> {
  if (config.schemaBuilder) return config.schemaBuilder;
  switch (config.schemaType) {
    case 'DefinedTerm':
      return definedTermBuilder as unknown as SchemaBuilder<TFrontmatter>;
    case 'BlogPosting':
    case 'Article':
    case 'NewsArticle':
    case 'TechArticle':
    default:
      return defaultArticleBuilder as unknown as SchemaBuilder<TFrontmatter>;
  }
}

// ---------------------------------------------------------------------------
// defineCollection
// ---------------------------------------------------------------------------

const DEFAULT_RSS: Required<RssOptions> = {
  title: '',
  description: '',
  limit: 20,
};

export function defineCollection<
  TFrontmatter extends BaseFrontmatter = BaseFrontmatter,
>(input: CollectionConfig<TFrontmatter>): Collection<TFrontmatter> {
  const label =
    input.label ??
    input.pathSegment.charAt(0).toUpperCase() + input.pathSegment.slice(1);
  const indexPath = input.indexPath ?? `/${input.pathSegment}`;
  const rss: false | Required<RssOptions> =
    input.rss === false
      ? false
      : {
          ...DEFAULT_RSS,
          title: input.rss?.title ?? `${input.site.siteName} — ${label}`,
          description: input.rss?.description ?? `Latest from ${label}`,
          limit: input.rss?.limit ?? DEFAULT_RSS.limit,
        };

  const config: ResolvedCollectionConfig<TFrontmatter> = {
    id: input.id,
    contentDir: input.contentDir,
    pathSegment: input.pathSegment.replace(/^\/+|\/+$/g, ''),
    label,
    indexPath,
    schemaType: input.schemaType ?? 'BlogPosting',
    rss,
    site: input.site,
    defaults: input.defaults ?? {},
    ...(input.schemaBuilder ? { schemaBuilder: input.schemaBuilder } : {}),
  };

  function buildUrl(slug: string, locale?: string, canonicalUrl?: string) {
    if (canonicalUrl) {
      if (/^https?:\/\//.test(canonicalUrl)) return canonicalUrl;
      return resolveCanonicalUrl(canonicalUrl, config.site.siteUrl);
    }
    const base = config.site.siteUrl.replace(/\/$/, '');
    const localeSeg = locale ? `/${locale}` : '';
    return `${base}${localeSeg}/${config.pathSegment}/${slug}`;
  }

  function buildIndexUrl(locale?: string) {
    const base = config.site.siteUrl.replace(/\/$/, '');
    const localeSeg = locale ? `/${locale}` : '';
    const idx = indexPath.startsWith('/') ? indexPath : `/${indexPath}`;
    if (/^https?:\/\//.test(indexPath)) return indexPath;
    return `${base}${localeSeg}${idx}`;
  }

  async function getAll(
    opts: ReadOptions = {},
  ): Promise<ContentMetadata<TFrontmatter>[]> {
    try {
      const dir = resolveDir(config.contentDir, opts.locale);
      const files = readDirectorySafe(dir).filter((f) =>
        MARKDOWN_FILE_REGEX.test(f),
      );
      const docs: ContentMetadata<TFrontmatter>[] = [];
      for (const file of files) {
        try {
          const slug = file.replace(MARKDOWN_FILE_REGEX, '');
          const filePath = path.join(dir, file);
          const fileContents = readFileSafe(filePath);
          if (fileContents === null) continue;
          const { data: frontmatter } = parseFrontmatter(fileContents);
          const validated = validateFrontmatter(frontmatter);
          const authors = normalizeAuthors(
            validated.author as string | string[] | undefined,
            validated.authors as string[] | undefined,
            config.site.authors,
          );
          docs.push({
            slug,
            frontmatter: validated as unknown as TFrontmatter,
            authors,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.warn(
            `[${config.id}] Skipping ${file}: ${errorMessage}`,
          );
        }
      }
      return docs.sort((a, b) => {
        const da = (a.frontmatter.date as string) || '';
        const db = (b.frontmatter.date as string) || '';
        return db.localeCompare(da);
      });
    } catch (error) {
      if (error instanceof DirectoryError) return [];
      throw error;
    }
  }

  async function getOne(
    slug: string,
    opts: ReadOptions = {},
  ): Promise<ContentDoc<TFrontmatter> | null> {
    try {
      validateSlug(slug);
      const dir = resolveDir(config.contentDir, opts.locale);
      for (const ext of SUPPORTED_EXTENSIONS) {
        const filePath = path.join(dir, `${slug}${ext}`);
        const fileContents = readFileSafe(filePath);
        if (fileContents !== null) {
          return parseDoc<TFrontmatter>(filePath, slug, config.site.authors);
        }
      }
      return null;
    } catch (error) {
      if (
        error instanceof BlogPostNotFoundError ||
        error instanceof FileReadError
      ) {
        throw error;
      }
      throw error;
    }
  }

  async function getAllSlugs(opts: ReadOptions = {}): Promise<string[]> {
    const all = await getAll(opts);
    return all.map((p) => p.slug);
  }

  async function getInAllLocales(
    slug: string,
    locales: readonly string[],
  ): Promise<Map<string, ContentDoc<TFrontmatter> | null>> {
    const entries = await Promise.all(
      locales.map(async (locale) => {
        try {
          return [locale, await getOne(slug, { locale })] as const;
        } catch {
          return [locale, null] as const;
        }
      }),
    );
    return new Map(entries);
  }

  async function getByAuthor(
    authorSlug: string,
    opts: ReadOptions = {},
  ): Promise<ContentMetadata<TFrontmatter>[]> {
    const all = await getAll(opts);
    return all.filter((p) =>
      authorNamesFromFrontmatter(
        p.frontmatter as Record<string, unknown>,
      ).some((n) => slugifyAuthor(n) === authorSlug),
    );
  }

  async function getBySeries(
    seriesSlug: string,
    opts: ReadOptions = {},
  ): Promise<ContentMetadata<TFrontmatter>[]> {
    const all = await getAll(opts);
    const filtered = all.filter((p) => {
      const raw = resolveFrontmatterField<string>(
        ['series'],
        p.frontmatter as Record<string, unknown>,
      );
      return raw ? slugifySeries(raw) === seriesSlug : false;
    });
    return filtered.sort((a, b) => {
      const oa = resolveFrontmatterField<number>(
        ['seriesOrder'],
        a.frontmatter as Record<string, unknown>,
      );
      const ob = resolveFrontmatterField<number>(
        ['seriesOrder'],
        b.frontmatter as Record<string, unknown>,
      );
      if (typeof oa === 'number' && typeof ob === 'number') return oa - ob;
      if (typeof oa === 'number') return -1;
      if (typeof ob === 'number') return 1;
      const da = (a.frontmatter.date as string) || '';
      const db = (b.frontmatter.date as string) || '';
      return da.localeCompare(db);
    });
  }

  async function getAllAuthorSlugs(
    locales?: readonly string[],
  ): Promise<string[]> {
    const localeList = locales && locales.length > 0 ? locales : [undefined];
    const out = new Set<string>();
    for (const locale of localeList) {
      const opts: ReadOptions = {};
      if (locale) opts.locale = locale;
      const docs = await getAll(opts);
      for (const d of docs) {
        for (const name of authorNamesFromFrontmatter(
          d.frontmatter as Record<string, unknown>,
        )) {
          out.add(slugifyAuthor(name));
        }
      }
    }
    for (const a of config.site.authors ?? []) {
      if (a.name) out.add(slugifyAuthor(a.name));
    }
    return [...out];
  }

  async function getAllSeriesSlugs(
    locales?: readonly string[],
  ): Promise<string[]> {
    const localeList = locales && locales.length > 0 ? locales : [undefined];
    const out = new Set<string>();
    for (const locale of localeList) {
      const opts: ReadOptions = {};
      if (locale) opts.locale = locale;
      const docs = await getAll(opts);
      for (const d of docs) {
        const raw = resolveFrontmatterField<string>(
          ['series'],
          d.frontmatter as Record<string, unknown>,
        );
        if (raw) out.add(slugifySeries(raw));
      }
    }
    return [...out];
  }

  async function hreflangMap(
    slug: string,
    locales: readonly string[],
  ): Promise<Record<string, string>> {
    const siblings = await getInAllLocales(slug, locales);
    const map: Record<string, string> = {};
    for (const [locale, doc] of siblings) {
      if (doc) map[locale] = buildUrl(slug, locale);
    }
    return map;
  }

  async function metadata(
    doc: ContentDoc<TFrontmatter>,
    opts: MetadataOptions = {},
  ): Promise<Metadata> {
    const fm = doc.frontmatter as BaseFrontmatter;
    const seoTitle =
      resolveFrontmatterField<string>(['seoTitle', 'title'], fm, doc.slug) ||
      doc.slug;
    const description =
      resolveFrontmatterField<string>(
        ['seoDescription', 'description', 'excerpt'],
        fm,
        '',
      ) || '';
    const titleMode =
      opts.titleTemplate ?? config.defaults.titleTemplate ?? 'site-suffix';
    const suffixed = `${seoTitle} | ${config.site.siteName}`;
    let pageTitle: Metadata['title'];
    if (typeof titleMode === 'function') {
      pageTitle = titleMode({
        title: seoTitle,
        siteName: config.site.siteName,
      });
    } else if (titleMode === 'absolute') {
      pageTitle = { absolute: suffixed };
    } else if (titleMode === 'bare') {
      pageTitle = seoTitle;
    } else {
      pageTitle = suffixed;
    }

    const fmCanonical = resolveFrontmatterField<string>(['canonicalUrl'], fm);
    const canonicalUrl = buildUrl(doc.slug, opts.locale, fmCanonical);
    const lang =
      opts.locale ||
      resolveFrontmatterField<string>(['lang'], fm) ||
      config.site.defaultLang;

    const resolvedDefault = resolveDefaultAuthor(
      config.site.defaultAuthor,
      config.site.authors,
    );
    const docAuthors = doc.authors?.length
      ? doc.authors
      : resolvedDefault
        ? [resolvedDefault]
        : [];
    const authors = ensureAuthorsResolved(docAuthors, config.site.authors);
    const authorNames = getAuthorNames(authors);
    const authorTwitter = authors
      .map((a) => (typeof a === 'string' ? undefined : a.twitter))
      .filter((h): h is string => Boolean(h));

    const publishedDate = resolveFrontmatterField<string>(
      ['publishedDate', 'date'],
      fm,
    );
    const modifiedDate = resolveFrontmatterField<string>(
      ['modifiedDate', 'updated'],
      fm,
    );
    const tags = isStringArray(fm.tags) ? fm.tags : [];
    const keywords = normalizeKeywords(
      fm.keywords as string | string[] | undefined,
    );
    const allKeywords = [...tags, ...keywords].filter(
      (k, i, arr) => arr.indexOf(k) === i,
    );
    const ogImageUrl =
      resolveFrontmatterField<string>(['ogImage', 'image'], fm) ||
      config.site.defaultOgImage;
    const imageAlt =
      resolveFrontmatterField<string>(['imageAlt'], fm) || seoTitle;
    const ogTitle = resolveFrontmatterField<string>(['ogTitle'], fm) || seoTitle;
    const ogDescription =
      resolveFrontmatterField<string>(['ogDescription'], fm) || description;
    const twitterTitle =
      resolveFrontmatterField<string>(['twitterTitle'], fm) || ogTitle;
    const twitterDescription =
      resolveFrontmatterField<string>(['twitterDescription'], fm) ||
      ogDescription;
    const robots = buildRobotsMeta(fm);

    const alternates: { canonical?: string; languages?: Record<string, string> } =
      {};
    if (canonicalUrl) alternates.canonical = canonicalUrl;
    const fmLangs =
      opts.alternateLanguages ??
      (fm.alternateLanguages as Record<string, string> | undefined);
    if (fmLangs && Object.keys(fmLangs).length > 0) {
      alternates.languages = Object.fromEntries(
        Object.entries(fmLangs).map(([k, v]) => [
          k,
          v.startsWith('http://') || v.startsWith('https://')
            ? v
            : resolveCanonicalUrl(v, config.site.siteUrl),
        ]),
      );
    }

    const articleMeta: Record<string, string> = {};
    if (publishedDate) articleMeta['article:published_time'] = publishedDate;
    if (modifiedDate) articleMeta['article:modified_time'] = modifiedDate;
    const category = resolveFrontmatterField<string>(['category'], fm);
    if (category) articleMeta['article:section'] = category;
    tags.forEach((tag, i) => {
      articleMeta[`article:tag${i > 0 ? i + 1 : ''}`] = tag;
    });
    authorNames.forEach((n, i) => {
      articleMeta[`article:author${i > 0 ? i + 1 : ''}`] = n;
    });
    const otherMeta: Record<string, string> = {};
    if (lang) otherMeta.lang = lang;
    Object.assign(otherMeta, articleMeta);

    const isArticle = config.schemaType !== 'DefinedTerm';

    return {
      title: pageTitle,
      description,
      ...(Object.keys(alternates).length > 0 && { alternates }),
      ...(robots && { robots }),
      ...(Object.keys(otherMeta).length > 0 && { other: otherMeta }),
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        type: isArticle ? 'article' : 'website',
        url: canonicalUrl,
        siteName: config.site.siteName,
        ...(ogImageUrl && {
          images: [
            { url: ogImageUrl, width: 1200, height: 630, alt: imageAlt },
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
        ...(authorTwitter.length > 0
          ? { creator: `@${authorTwitter[0]!.replace('@', '')}` }
          : config.site.twitterHandle
            ? { creator: `@${config.site.twitterHandle.replace('@', '')}` }
            : {}),
      },
      ...(allKeywords.length > 0 && { keywords: allKeywords }),
      ...(authors.length > 0 && {
        authors: authors.map((a) =>
          typeof a === 'string'
            ? { name: a }
            : {
                name: a.name,
                ...(a.email && { email: a.email }),
                ...(a.url && { url: a.url }),
              },
        ),
      }),
    };
  }

  function listMetadata(
    docs: ContentMetadata<TFrontmatter>[],
    opts: { locale?: string } = {},
  ): Metadata {
    const title = `${config.label}`;
    const description = `Browse all ${docs.length} ${config.label.toLowerCase()} entries`;
    const url = buildIndexUrl(opts.locale);
    return {
      title: `${title} | ${config.site.siteName}`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        siteName: config.site.siteName,
      },
      twitter: { card: 'summary', title, description },
    };
  }

  function schema(
    doc: ContentDoc<TFrontmatter>,
    opts: SchemaOptions = {},
  ): Record<string, unknown> {
    const url = buildUrl(
      doc.slug,
      opts.locale,
      resolveFrontmatterField<string>(
        ['canonicalUrl'],
        doc.frontmatter as Record<string, unknown>,
      ),
    );
    const builder = pickSchemaBuilder<TFrontmatter>(config);
    const ctx: SchemaBuilderContext<TFrontmatter> = {
      site: config.site,
      collection: config,
      url,
      locale: opts.locale,
    };
    let node = builder(doc, ctx);

    const speakable =
      opts.speakable !== undefined ? opts.speakable : config.defaults.speakable;
    if (speakable) {
      const sp =
        speakable === true
          ? { cssSelector: DEFAULT_SPEAKABLE_SELECTORS }
          : speakable;
      node = { ...node, speakable: { '@type': 'SpeakableSpecification', ...sp } };
    }
    if (opts.extend) {
      node = opts.extend({ ...node });
    }
    return node;
  }

  function breadcrumbsSchema(
    doc: ContentDoc<TFrontmatter>,
    breadcrumbs?: Breadcrumb[],
    opts: { locale?: string } = {},
  ): Record<string, unknown> {
    const fm = doc.frontmatter as BaseFrontmatter;
    const title =
      resolveFrontmatterField<string>(['seoTitle', 'title'], fm, doc.slug) ||
      doc.slug;
    const docUrl = buildUrl(
      doc.slug,
      opts.locale,
      resolveFrontmatterField<string>(['canonicalUrl'], fm),
    );
    const items: Breadcrumb[] =
      breadcrumbs ?? [
        { name: 'Home', url: config.site.siteUrl || '/' },
        { name: config.label, url: buildIndexUrl(opts.locale) },
        { name: title, url: docUrl },
      ];
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  function schemaGraph(
    doc: ContentDoc<TFrontmatter>,
    breadcrumbs?: Breadcrumb[],
    opts: SchemaGraphOptions = {},
  ): Record<string, unknown> {
    const include = opts.includeBreadcrumbs !== false;
    const orgNode = buildOrganizationGraphNode(config.site);
    const article = schema(doc, opts);
    const articleBody = { ...article };
    delete articleBody['@context'];

    const graph: Record<string, unknown>[] = [];
    if (orgNode) graph.push(orgNode);
    graph.push(articleBody);

    if (include) {
      const crumbs = breadcrumbsSchema(
        doc,
        breadcrumbs,
        opts.locale ? { locale: opts.locale } : {},
      );
      const crumbsBody = { ...crumbs };
      delete crumbsBody['@context'];
      graph.push(crumbsBody);
    }

    // Additional rich-result nodes derived from frontmatter.
    const faqNode = buildFaqNode(doc.frontmatter as BaseFrontmatter);
    if (faqNode) graph.push(faqNode);
    const howToNode = buildHowToNode(
      doc.frontmatter as BaseFrontmatter,
      opts.locale,
    );
    if (howToNode) graph.push(howToNode);

    return { '@context': 'https://schema.org', '@graph': graph };
  }

  // RSS generation (inlined; uses escapeXml from seo-utils).
  async function rssXml(opts: { locale?: string } = {}): Promise<string> {
    if (!config.rss) {
      throw new Error(`[${config.id}] RSS is disabled (config.rss = false)`);
    }
    const meta = await getAll(opts.locale ? { locale: opts.locale } : {});
    const limit = config.rss.limit;
    const slice = meta.slice(0, limit);
    const channelLink = buildIndexUrl(opts.locale);
    const xmlEscape = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const items: string[] = [];
    for (const m of slice) {
      const doc = await getOne(
        m.slug,
        opts.locale ? { locale: opts.locale } : {},
      );
      if (!doc) continue;
      const link = buildUrl(
        doc.slug,
        opts.locale,
        resolveFrontmatterField<string>(
          ['canonicalUrl'],
          doc.frontmatter as Record<string, unknown>,
        ),
      );
      const title = xmlEscape(
        (doc.frontmatter.title as string) ?? doc.slug,
      );
      const description = xmlEscape(
        (doc.frontmatter.description as string) ?? '',
      );
      const pub =
        (resolveFrontmatterField<string>(
          ['publishedDate', 'date'],
          doc.frontmatter as Record<string, unknown>,
        ) as string | undefined) ?? new Date().toUTCString();
      const author = doc.authors?.[0];
      const authorName =
        typeof author === 'string'
          ? author
          : (author?.name ?? config.site.defaultAuthor ?? '');
      items.push(
        `    <item>\n` +
          `      <title>${title}</title>\n` +
          `      <link>${link}</link>\n` +
          `      <guid isPermaLink="true">${link}</guid>\n` +
          `      <description>${description}</description>\n` +
          (authorName ? `      <author>${xmlEscape(authorName)}</author>\n` : '') +
          `      <pubDate>${new Date(pub).toUTCString()}</pubDate>\n` +
          `    </item>`,
      );
    }
    const lang =
      opts.locale ?? config.site.defaultLang ?? 'en';
    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
      `  <channel>\n` +
      `    <title>${xmlEscape(config.rss.title)}</title>\n` +
      `    <link>${channelLink}</link>\n` +
      `    <description>${xmlEscape(config.rss.description)}</description>\n` +
      `    <language>${lang}</language>\n` +
      `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n` +
      `    <atom:link href="${channelLink}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
      items.join('\n') +
      `\n  </channel>\n` +
      `</rss>`
    );
  }

  async function rssResponse(
    opts: { locale?: string; init?: ResponseInit } = {},
  ): Promise<NextResponse> {
    const xml = await rssXml(opts.locale ? { locale: opts.locale } : {});
    const headers = new Headers(opts.init?.headers);
    if (!headers.has('Content-Type'))
      headers.set('Content-Type', 'application/xml; charset=utf-8');
    if (!headers.has('Cache-Control'))
      headers.set(
        'Cache-Control',
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      );
    return new NextResponse(xml, { status: 200, ...opts.init, headers });
  }

  async function sitemapEntries(opts: {
    locales: readonly string[];
  }): Promise<MetadataRoute.Sitemap> {
    const slugToLocales = new Map<string, Record<string, string>>();
    const slugDate = new Map<string, Date>();
    for (const locale of opts.locales) {
      const docs = await getAll({ locale });
      for (const d of docs) {
        const url = buildUrl(d.slug, locale);
        const langs = slugToLocales.get(d.slug) ?? {};
        langs[locale] = url;
        slugToLocales.set(d.slug, langs);
        const dates = [
          d.frontmatter.date,
          (d.frontmatter as BaseFrontmatter).updated,
        ]
          .filter((x): x is string => typeof x === 'string')
          .map((x) => new Date(x))
          .filter((x) => !Number.isNaN(x.getTime()));
        if (dates.length > 0) {
          const newest = new Date(
            Math.max(...dates.map((x) => x.getTime())),
          );
          const existing = slugDate.get(d.slug);
          if (!existing || newest > existing) slugDate.set(d.slug, newest);
        }
      }
    }
    const out: MetadataRoute.Sitemap = [];
    for (const [slug, langs] of slugToLocales) {
      const primaryLocale = opts.locales[0]!;
      const primary = langs[primaryLocale] ?? Object.values(langs)[0]!;
      out.push({
        url: primary,
        lastModified: slugDate.get(slug) ?? new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: { ...langs, 'x-default': langs[primaryLocale] ?? primary },
        },
      });
    }
    return out;
  }

  async function llmsTxtSection(opts: {
    locales: readonly string[];
    defaultLocale?: string;
  }): Promise<string> {
    const defaultLocale = opts.defaultLocale ?? opts.locales[0];
    const lines: string[] = [];
    for (const locale of opts.locales) {
      const docs = await getAll({ locale });
      if (!docs.length) continue;
      lines.push(
        `## ${config.label} (${locale})${
          locale === defaultLocale ? ' — default locale' : ''
        }`,
      );
      lines.push('');
      for (const d of docs) {
        const title = (d.frontmatter.title as string) ?? d.slug;
        const description =
          (resolveFrontmatterField<string>(
            ['description', 'excerpt'],
            d.frontmatter as Record<string, unknown>,
          ) as string | undefined) ?? '';
        const url = buildUrl(d.slug, locale);
        lines.push(`- [${title}](${url})${description ? `: ${description}` : ''}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  async function llmsFullTxtSection(opts: {
    locales: readonly string[];
  }): Promise<string> {
    const lines: string[] = [];
    for (const locale of opts.locales) {
      const docs = await getAll({ locale });
      for (const m of docs) {
        const doc = await getOne(m.slug, { locale });
        if (!doc) continue;
        const url = buildUrl(doc.slug, locale);
        const title = (doc.frontmatter.title as string) ?? doc.slug;
        lines.push('---');
        lines.push('');
        lines.push(`# ${title}`);
        lines.push('');
        if (url) lines.push(`Source: ${url}`);
        const published = resolveFrontmatterField<string>(
          ['date'],
          doc.frontmatter as Record<string, unknown>,
        );
        if (published) lines.push(`Published: ${published}`);
        const updated = resolveFrontmatterField<string>(
          ['updated', 'modifiedDate'],
          doc.frontmatter as Record<string, unknown>,
        );
        if (updated) lines.push(`Updated: ${updated}`);
        lines.push('');
        lines.push(doc.content.trim());
        lines.push('');
      }
    }
    return lines.join('\n');
  }

  return {
    id: config.id,
    config,
    getAll,
    getOne,
    getAllSlugs,
    getInAllLocales,
    getByAuthor,
    getBySeries,
    getAllAuthorSlugs,
    getAllSeriesSlugs,
    url: buildUrl,
    indexUrl: buildIndexUrl,
    hreflangMap,
    metadata,
    listMetadata,
    schema,
    schemaGraph,
    breadcrumbsSchema,
    rssXml,
    rssResponse,
    sitemapEntries,
    llmsTxtSection,
    llmsFullTxtSection,
  };
}
