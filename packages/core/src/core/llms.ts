/**
 * llms.txt / llms-full.txt generators — see https://llmstxt.org
 *
 * These return plain markdown strings. App code wraps them in a route handler:
 *
 *   // app/llms.txt/route.ts
 *   import { generateLlmsTxt } from '@next-md-blog/core';
 *   export const dynamic = 'force-static';
 *   export const revalidate = 3600;
 *   export async function GET() {
 *     const body = await generateLlmsTxt({ config, locales: ['en','fr'] });
 *     return new Response(body, { headers: { 'content-type': 'text/plain' }});
 *   }
 */
import type { BlogPostMetadata, Config } from './types.js';
import { getAllBlogPosts, getBlogPost } from './file-utils.js';
import { resolveFrontmatterField } from './type-guards.js';
import { getConfig } from './config.js';
import { DEFAULT_SITE_NAME } from './constants.js';
import { resolvePostUrlWithConfig } from './seo-utils.js';

export interface LlmsTxtOptions {
  config?: Config;
  /** Locales to enumerate. Defaults to `[config.defaultLang ?? 'en']`. */
  locales?: readonly string[];
  /** Marks one locale as default (added to the heading). Defaults to `locales[0]`. */
  defaultLocale?: string;
  /** Override the site summary (defaults to siteName + siteUrl). */
  summary?: string;
}

function postLine(
  post: BlogPostMetadata,
  siteUrl: string,
  config: Config,
  locale?: string
): string {
  const title = (post.frontmatter.title as string) ?? post.slug;
  const description =
    (resolveFrontmatterField<string>(['description', 'excerpt'], post.frontmatter) as
      | string
      | undefined) ?? '';
  const url = resolvePostUrlWithConfig(
    resolveFrontmatterField<string>(['canonicalUrl'], post.frontmatter),
    post.slug,
    siteUrl,
    config,
    locale
  );
  return `- [${title}](${url})${description ? `: ${description}` : ''}`;
}

/**
 * Generate the index `llms.txt` markdown: one section per locale listing posts.
 */
export async function generateLlmsTxt(
  options: LlmsTxtOptions = {}
): Promise<string> {
  const config = options.config || getConfig();
  const siteName = config.siteName ?? DEFAULT_SITE_NAME;
  const siteUrl = (config.siteUrl ?? '').replace(/\/$/, '');
  const locales = options.locales ?? [config.defaultLang ?? 'en'];
  const defaultLocale = options.defaultLocale ?? locales[0];

  const lines: string[] = [];
  lines.push(`# ${siteName}`);
  lines.push('');
  if (options.summary) {
    lines.push(`> ${options.summary}`);
  } else if (siteUrl) {
    lines.push(`> Canonical site: ${siteUrl}`);
  }
  lines.push('');

  for (const locale of locales) {
    let posts: BlogPostMetadata[];
    try {
      posts = await getAllBlogPosts({ config, locale });
    } catch {
      posts = [];
    }
    if (!posts.length) continue;
    const isDefault = locale === defaultLocale;
    lines.push(`## Blog (${locale})${isDefault ? ' — default locale' : ''}`);
    lines.push('');
    for (const p of posts) {
      lines.push(postLine(p, siteUrl, config, locale));
    }
    lines.push('');
  }

  if (siteUrl) {
    lines.push('## Feeds');
    lines.push('');
    for (const locale of locales) {
      lines.push(`- [RSS — ${locale}](${siteUrl}/${locale}/feed.xml)`);
    }
    lines.push('');
    lines.push(`- [Full prose](${siteUrl}/llms-full.txt)`);
  }

  return lines.join('\n');
}

/**
 * Generate `llms-full.txt`: concatenated post bodies (default locale only,
 * unless `locales` is overridden). Designed for LLM ingestion.
 */
export async function generateLlmsFullTxt(
  options: LlmsTxtOptions = {}
): Promise<string> {
  const config = options.config || getConfig();
  const siteName = config.siteName ?? DEFAULT_SITE_NAME;
  const siteUrl = (config.siteUrl ?? '').replace(/\/$/, '');
  const locales = options.locales ?? [config.defaultLang ?? 'en'];

  const out: string[] = [];
  out.push(`# ${siteName}`);
  out.push('');
  if (options.summary) out.push(`> ${options.summary}`);
  if (siteUrl) out.push(`> Source: ${siteUrl}`);
  out.push('');

  for (const locale of locales) {
    let metadata: BlogPostMetadata[];
    try {
      metadata = await getAllBlogPosts({ config, locale });
    } catch {
      metadata = [];
    }
    for (const m of metadata) {
      const post = await getBlogPost(m.slug, { config, locale });
      if (!post) continue;
      const url = resolvePostUrlWithConfig(
        resolveFrontmatterField<string>(['canonicalUrl'], post.frontmatter),
        post.slug,
        siteUrl,
        config,
        locale
      );
      const title = (post.frontmatter.title as string) ?? post.slug;
      out.push('---');
      out.push('');
      out.push(`# ${title}`);
      out.push('');
      if (url) out.push(`Source: ${url}`);
      const published = resolveFrontmatterField<string>(['date'], post.frontmatter);
      if (published) out.push(`Published: ${published}`);
      const updated = resolveFrontmatterField<string>(['updated', 'modifiedDate'], post.frontmatter);
      if (updated) out.push(`Updated: ${updated}`);
      out.push('');
      out.push(post.content.trim());
      out.push('');
    }
  }

  return out.join('\n');
}
