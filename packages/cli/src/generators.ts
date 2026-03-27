import type { CLIConfig } from './types.js';
import { loadTemplate } from './templates.js';

/**
 * Build options parameter string for function calls
 * @param contentDir - Content directory name
 * @param i18nEnabled - Whether i18n is enabled
 * @returns Options parameter string
 */
function buildOptionsParam(contentDir: string, i18nEnabled: boolean): string {
  const parts: string[] = [];
  if (contentDir !== 'posts') {
    parts.push('postsDir: POSTS_DIR');
  }
  if (i18nEnabled) {
    parts.push('locale');
  }
  parts.push('config: blogConfig');
  return `{ ${parts.join(', ')} }`;
}

/**
 * Build posts directory option constant
 * @param contentDir - Content directory name
 * @returns Posts directory option string or empty string
 */
function buildPostsDirOption(contentDir: string): string {
  return contentDir !== 'posts' ? `\nconst POSTS_DIR = '${contentDir}';` : '';
}

/**
 * Generate blog page component code
 * @param config - CLI configuration
 * @returns Generated blog page code
 */
export function generateBlogPage(config: CLIConfig): string {
  const { contentDir, i18n, blogsRoute } = config;
  const postsDirOption = buildPostsDirOption(contentDir);
  const postsDirParam = buildOptionsParam(contentDir, i18n.enabled);
  const postsDirParamFunc = `, ${postsDirParam}`;
  
  const localeParam = i18n.enabled ? ', locale: string' : '';
  const localeExtract = i18n.enabled ? '  const { slug, locale } = resolvedParams;' : '  const { slug } = resolvedParams;';
  
  // Generate generateStaticParams code based on i18n
  const localesArray = i18n.enabled && i18n.locales.length > 0 
    ? i18n.locales.map(locale => `'${locale}'`).join(', ')
    : "'en'";
  
  const generateStaticParamsPostsDirParam = buildOptionsParam(contentDir, i18n.enabled);
  
  const generateStaticParamsCode = i18n.enabled
    ? `  // Supported locales
    const locales = [${localesArray}];
    
    const allParams: Array<{ slug: string; locale: string }> = [];
    for (const locale of locales) {
      const posts = await getAllBlogPosts(${generateStaticParamsPostsDirParam});
      for (const post of posts) {
        allParams.push({ slug: post.slug, locale });
      }
    }
    return allParams;`
    : `  const posts = await getAllBlogPosts(${postsDirParam});
  return posts.map((post) => ({
    slug: post.slug,
  }));`;

  const backToListHrefAttr = i18n.enabled
    ? 'href={`/${locale}/' + blogsRoute + '`}`'
    : `href={\`/${blogsRoute}\`}`;

  return loadTemplate('blog-page.tsx', {
    POSTS_DIR_OPTION: postsDirOption,
    POSTS_DIR_PARAM: postsDirParam,
    POSTS_DIR_PARAM_FUNC: postsDirParamFunc,
    LOCALE_PARAM: localeParam,
    LOCALE_EXTRACT: localeExtract,
    GENERATE_STATIC_PARAMS: generateStaticParamsCode,
    BACK_TO_LIST_HREF_ATTR: backToListHrefAttr,
  });
}

/**
 * Generate blogs listing page component code
 * @param config - CLI configuration
 * @returns Generated blogs page code
 */
export function generateBlogsPage(config: CLIConfig): string {
  const { blogRoute, contentDir, i18n } = config;
  const postsDirOption = buildPostsDirOption(contentDir);
  const postsDirParam = buildOptionsParam(contentDir, i18n.enabled);
  
  const localeParam = i18n.enabled ? 'locale: string' : '';
  const localeExtract = i18n.enabled ? '  const { locale } = resolvedParams;' : '';
  const paramsType = i18n.enabled ? '{ locale: string }' : 'Record<string, never>';

  const postLinkHrefAttr = i18n.enabled
    ? 'href={`/${locale}/' + blogRoute + '/${post.slug}`}`'
    : `href={\`/${blogRoute}/\${post.slug}\`}`;

  return loadTemplate('blogs-page.tsx', {
    POSTS_DIR_OPTION: postsDirOption,
    POSTS_DIR_PARAM: postsDirParam,
    LOCALE_PARAM: localeParam,
    LOCALE_EXTRACT: localeExtract,
    PARAMS_TYPE: paramsType,
    BLOG_ROUTE: blogRoute,
    POST_LINK_HREF_ATTR: postLinkHrefAttr,
    CONTENT_DIR: contentDir,
  });
}

/**
 * Generate OG image component code
 * @param config - CLI configuration
 * @returns Generated OG image code
 */
export function generateOgImage(config: CLIConfig): string {
  const { seoConfig, contentDir, i18n } = config;
  const postsDirOption = buildPostsDirOption(contentDir);
  const postsDirParam = `, ${buildOptionsParam(contentDir, i18n.enabled)}`;
  
  const localeParam = i18n.enabled ? ', locale: string' : '';
  const localeExtract = i18n.enabled ? '  const { slug, locale } = resolvedParams;' : '  const { slug } = resolvedParams;';

  return loadTemplate('opengraph-image.tsx', {
    POSTS_DIR_OPTION: postsDirOption,
    POSTS_DIR_PARAM: postsDirParam,
    LOCALE_PARAM: localeParam,
    LOCALE_EXTRACT: localeExtract,
    SITE_NAME: seoConfig.siteName,
  });
}

/**
 * Generate Pages Router blog page component code
 * @param config - CLI configuration
 * @returns Generated Pages Router blog page code
 */
export function generatePagesRouterBlogPage(config: CLIConfig): string {
  const { contentDir } = config;
  const postsDirOption = buildPostsDirOption(contentDir);
  const postsDirParam = contentDir !== 'posts' 
    ? '{ postsDir: POSTS_DIR, config: blogConfig }'
    : '{ config: blogConfig }';
  const postsDirParamFunc = contentDir !== 'posts' 
    ? ', { postsDir: POSTS_DIR, config: blogConfig }'
    : ', { config: blogConfig }';

  return loadTemplate('pages-router-blog-page.tsx', {
    POSTS_DIR_OPTION: postsDirOption,
    POSTS_DIR_PARAM: postsDirParam,
    POSTS_DIR_PARAM_FUNC: postsDirParamFunc,
  });
}

/**
 * Generate Pages Router blogs listing page component code
 * @param config - CLI configuration
 * @returns Generated Pages Router blogs page code
 */
export function generatePagesRouterBlogsPage(config: CLIConfig): string {
  const { blogRoute, contentDir } = config;
  const postsDirOption = buildPostsDirOption(contentDir);
  const postsDirParam = contentDir !== 'posts' 
    ? '{ postsDir: POSTS_DIR, config: blogConfig }'
    : '{ config: blogConfig }';

  return loadTemplate('pages-router-blogs-page.tsx', {
    POSTS_DIR_OPTION: postsDirOption,
    POSTS_DIR_PARAM: postsDirParam,
    BLOG_ROUTE: blogRoute,
  });
}

/**
 * Generate next-md-blog config file content
 * @param config - CLI configuration
 * @returns Config file content
 */
export function generateConfigFile(config: CLIConfig): string {
  const { seoConfig, i18n } = config;
  const defaultLang = i18n.enabled && i18n.locales.length > 0 ? i18n.locales[0] : 'en';
  
  return `import { createConfig } from '@next-md-blog/core';

export default createConfig({
  siteName: '${seoConfig.siteName}',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '${seoConfig.siteUrl}',
  defaultAuthor: '${seoConfig.defaultAuthor}',
${seoConfig.twitterHandle ? `  twitterHandle: '${seoConfig.twitterHandle}',` : '  // twitterHandle: undefined,'}
  defaultLang: '${defaultLang}',
  // OG images are automatically generated via opengraph-image.tsx file convention
  // defaultOgImage: 'https://example.com/default-og.jpg',
  // Rich publisher JSON-LD (optional):
  // organization: { logo: 'https://example.com/logo.png', sameAs: ['https://twitter.com/yourhandle'] },
});
`;
}

/**
 * Generate app/sitemap.ts for MetadataRoute sitemap
 */
export function generateAppSitemap(config: CLIConfig): string {
  const { contentDir, i18n } = config;
  const postsDirConst =
    contentDir !== 'posts' ? `const POSTS_DIR = '${contentDir}';\n` : '';

  const noLocaleOpts =
    contentDir !== 'posts'
      ? '{ config: blogConfig, postsDir: POSTS_DIR }'
      : '{ config: blogConfig }';

  const body =
    i18n.enabled && i18n.locales.length > 0
      ? `const locales = [${i18n.locales.map((l) => `'${l}'`).join(', ')}] as const;
  const allPosts = [];
  for (const locale of locales) {
    const posts = await getAllBlogPosts(${
      contentDir !== 'posts'
        ? '{ locale, config: blogConfig, postsDir: POSTS_DIR }'
        : '{ locale, config: blogConfig }'
    });
    allPosts.push(...posts);
  }
  return getBlogSitemap(allPosts, blogConfig);`
      : `const posts = await getAllBlogPosts(${noLocaleOpts});
  return getBlogSitemap(posts, blogConfig);`;

  return `import { getAllBlogPosts } from '@next-md-blog/core';
import { getBlogSitemap } from '@next-md-blog/core/next';
import blogConfig from '@/next-md-blog.config';
${postsDirConst}
export default async function sitemap() {
  ${body}
}
`;
}

/**
 * Generate app/robots.ts for MetadataRoute robots
 */
export function generateAppRobots(): string {
  return `import { getBlogRobots } from '@next-md-blog/core/next';
import blogConfig from '@/next-md-blog.config';

export default function robots() {
  return getBlogRobots(blogConfig);
}
`;
}

/**
 * Generate app/feed.xml/route.ts for RSS (latest posts).
 */
export function generateAppFeedRoute(config: CLIConfig): string {
  const { contentDir, i18n } = config;
  const postsDirConst =
    contentDir !== 'posts' ? `const POSTS_DIR = '${contentDir}';\n` : '';

  const getOptsNoLocale =
    contentDir !== 'posts'
      ? '{ config: blogConfig, postsDir: POSTS_DIR }'
      : '{ config: blogConfig }';

  const getPostOptsNoLocale =
    contentDir !== 'posts'
      ? '{ config: blogConfig, postsDir: POSTS_DIR }'
      : '{ config: blogConfig }';

  const body = i18n.enabled && i18n.locales.length > 0
    ? `const locales = [${i18n.locales.map((l) => `'${l}'`).join(', ')}] as const;
  type Entry = { slug: string; locale: string; date: string };
  const entries: Entry[] = [];
  for (const locale of locales) {
    const list = await getAllBlogPosts(${
      contentDir !== 'posts'
        ? '{ locale, config: blogConfig, postsDir: POSTS_DIR }'
        : '{ locale, config: blogConfig }'
    });
    for (const p of list) {
      const date =
        p.frontmatter?.date != null && typeof p.frontmatter.date === 'string'
          ? p.frontmatter.date
          : '';
      entries.push({ slug: p.slug, locale, date });
    }
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));
  const top = entries.slice(0, 20);
  const posts = await Promise.all(
    top.map(({ slug, locale }) =>
      getBlogPost(slug, ${
        contentDir !== 'posts'
          ? '{ locale, config: blogConfig, postsDir: POSTS_DIR }'
          : '{ locale, config: blogConfig }'
      })
    )
  );
  const validPosts = posts.filter((post): post is NonNullable<typeof post> => post !== null);
  return createRssFeedResponse(validPosts, blogConfig);`
    : `const postsMetadata = await getAllBlogPosts(${getOptsNoLocale});
  const posts = await Promise.all(
    postsMetadata.slice(0, 20).map(async (postMeta) =>
      getBlogPost(postMeta.slug, ${getPostOptsNoLocale})
    )
  );
  const validPosts = posts.filter((post): post is NonNullable<typeof post> => post !== null);
  return createRssFeedResponse(validPosts, blogConfig);`;

  return `import { getAllBlogPosts, getBlogPost } from '@next-md-blog/core';
import { createRssFeedResponse } from '@next-md-blog/core/next';
import blogConfig from '@/next-md-blog.config';
${postsDirConst}
export async function GET() {
  ${body}
}
`;
}

