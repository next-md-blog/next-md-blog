import type { CLIConfig } from './types.js';
import { loadTemplate } from './templates.js';

/** Locales literal used in generated `next-md-blog.config.ts`. */
function buildLocalesLiteral(config: CLIConfig): string {
  if (!config.i18n.enabled || config.i18n.locales.length === 0) {
    return "['en'] as const";
  }
  return `[${config.i18n.locales.map((l) => `'${l}'`).join(', ')}] as const`;
}

// ---------------------------------------------------------------------------
// App Router templates
// ---------------------------------------------------------------------------

/**
 * Generate `app/[blogRoute]/[slug]/page.tsx`.
 */
export function generateBlogPage(config: CLIConfig): string {
  const { i18n, blogsRoute } = config;

  const paramsType = i18n.enabled
    ? '{ slug: string; locale: string }'
    : '{ slug: string }';
  const localeExtract = i18n.enabled
    ? '  const { slug, locale } = resolvedParams;'
    : '  const { slug } = resolvedParams;';
  const getOpts = i18n.enabled ? '{ locale }' : '';
  const metadataCall = i18n.enabled
    ? 'blog.metadata(post, { locale })'
    : 'blog.metadata(post)';
  const backToListHrefAttr = i18n.enabled
    ? 'href={`/${locale}/' + blogsRoute + '`}'
    : `href="/${blogsRoute}"`;
  const generateStaticParamsCode = i18n.enabled
    ? `  const allParams: Array<{ slug: string; locale: string }> = [];
  for (const locale of LOCALES) {
    const posts = await blog.getAll({ locale });
    for (const post of posts) {
      allParams.push({ slug: post.slug, locale });
    }
  }
  return allParams;`
    : `  const posts = await blog.getAll();
  return posts.map((post) => ({ slug: post.slug }));`;

  const localesImport = i18n.enabled
    ? "import { blog, LOCALES } from '@/next-md-blog.config';"
    : "import { blog } from '@/next-md-blog.config';";

  return loadTemplate('blog-page.tsx', {
    LOCALES_IMPORT: localesImport,
    PARAMS_TYPE: paramsType,
    LOCALE_EXTRACT: localeExtract,
    GET_OPTS: getOpts,
    METADATA_CALL: metadataCall,
    GENERATE_STATIC_PARAMS: generateStaticParamsCode,
    BACK_TO_LIST_HREF_ATTR: backToListHrefAttr,
  });
}

/**
 * Generate `app/[blogsRoute]/page.tsx`.
 */
export function generateBlogsPage(config: CLIConfig): string {
  const { blogRoute, i18n } = config;

  const paramsType = i18n.enabled
    ? '{ locale: string }'
    : 'Record<string, never>';
  const localeExtract = i18n.enabled
    ? '  const { locale } = resolvedParams;'
    : '';
  const getOpts = i18n.enabled ? '{ locale }' : '';
  const listMetadataCall = i18n.enabled
    ? 'blog.listMetadata(posts, { locale })'
    : 'blog.listMetadata(posts)';
  const postLinkHrefAttr = i18n.enabled
    ? 'href={`/${locale}/' + blogRoute + '/${post.slug}`}'
    : `href={\`/${blogRoute}/\${post.slug}\`}`;

  return loadTemplate('blogs-page.tsx', {
    PARAMS_TYPE: paramsType,
    LOCALE_EXTRACT: localeExtract,
    GET_OPTS: getOpts,
    LIST_METADATA_CALL: listMetadataCall,
    POST_LINK_HREF_ATTR: postLinkHrefAttr,
  });
}

/**
 * Generate `app/[blogRoute]/[slug]/opengraph-image.tsx`.
 */
export function generateOgImage(config: CLIConfig): string {
  const { i18n } = config;
  const paramsType = i18n.enabled
    ? '{ slug: string; locale: string }'
    : '{ slug: string }';
  const localeExtract = i18n.enabled
    ? '  const { slug, locale } = await params;'
    : '  const { slug } = await params;';
  const getOpts = i18n.enabled ? '{ locale }' : '';

  return loadTemplate('opengraph-image.tsx', {
    PARAMS_TYPE: paramsType,
    LOCALE_EXTRACT: localeExtract,
    GET_OPTS: getOpts,
  });
}

// ---------------------------------------------------------------------------
// Pages Router templates (no i18n)
// ---------------------------------------------------------------------------

export function generatePagesRouterBlogPage(_config: CLIConfig): string {
  return loadTemplate('pages-router-blog-page.tsx', {});
}

export function generatePagesRouterBlogsPage(config: CLIConfig): string {
  return loadTemplate('pages-router-blogs-page.tsx', {
    BLOG_ROUTE: config.blogRoute,
  });
}

// ---------------------------------------------------------------------------
// Config + SEO file generators
// ---------------------------------------------------------------------------

/**
 * Generate `next-md-blog.config.ts` — exports `site` + one `blog` collection
 * (plus a `LOCALES` constant when i18n is enabled).
 */
export function generateConfigFile(config: CLIConfig): string {
  const { seoConfig, i18n, contentDir, blogRoute, blogsRoute } = config;
  const defaultLang =
    i18n.enabled && i18n.locales.length > 0 ? i18n.locales[0] : 'en';
  const twitterLine = seoConfig.twitterHandle
    ? `  twitterHandle: '${seoConfig.twitterHandle}',`
    : '  // twitterHandle: undefined,';
  const localesBlock = i18n.enabled
    ? `\nexport const LOCALES = ${buildLocalesLiteral(config)};\n`
    : '';

  return `import { defineSite, defineCollection } from '@next-md-blog/core';

export const site = defineSite({
  siteName: '${seoConfig.siteName}',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '${seoConfig.siteUrl}',
  defaultAuthor: '${seoConfig.defaultAuthor}',
${twitterLine}
  defaultLang: '${defaultLang}',
  // Rich publisher JSON-LD (optional):
  // organization: { logo: 'https://example.com/logo.png', sameAs: ['https://twitter.com/yourhandle'] },
});
${localesBlock}
export const blog = defineCollection({
  id: 'blog',
  contentDir: '${contentDir}',
  pathSegment: '${blogRoute}',
  indexPath: '/${blogsRoute}',
  site,
});

// Default export kept for tooling that imports a single config module.
export default site;
`;
}

/**
 * Generate `app/sitemap.ts` — uses `composeSitemap` across every collection.
 */
export function generateAppSitemap(config: CLIConfig): string {
  const { i18n } = config;
  const localesImport = i18n.enabled
    ? "import { blog, LOCALES } from '@/next-md-blog.config';"
    : `import { blog, site } from '@/next-md-blog.config';

const LOCALES = [site.defaultLang ?? 'en'] as const;`;

  return `import { composeSitemap } from '@next-md-blog/core';
${localesImport}

export default async function sitemap() {
  return composeSitemap({
    collections: [blog],
    locales: LOCALES,
  });
}
`;
}

/**
 * Generate `app/robots.ts`.
 */
export function generateAppRobots(): string {
  return `import { getRobots } from '@next-md-blog/core/next';
import { site } from '@/next-md-blog.config';

export default function robots() {
  return getRobots(site);
}
`;
}

/**
 * Generate `app/feed.xml/route.ts` — delegates to `blog.rssResponse`.
 */
export function generateAppFeedRoute(config: CLIConfig): string {
  const { i18n } = config;
  if (!i18n.enabled) {
    return `import { blog } from '@/next-md-blog.config';

export async function GET() {
  return blog.rssResponse();
}
`;
  }
  // For i18n, ship one default-locale feed at /feed.xml. Add /[locale]/feed.xml
  // routes manually if you want per-locale feeds.
  return `import { blog, site } from '@/next-md-blog.config';

export async function GET() {
  return blog.rssResponse({ locale: site.defaultLang });
}
`;
}
