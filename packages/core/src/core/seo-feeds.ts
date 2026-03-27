import type { BlogPost, Config } from './types.js';
import { getConfig } from './config.js';
import { resolveFrontmatterField } from './type-guards.js';
import { DEFAULT_SITE_NAME, RSS_POST_LIMIT } from './constants.js';
import {
  resolvePostUrlWithConfig,
  escapeXml,
  getAuthorName,
} from './seo-utils.js';

/**
 * Generates RSS feed XML for blog posts (used by `createRssFeedResponse` in `@next-md-blog/core/next`).
 */
export function generateRSSFeed(
  posts: BlogPost[],
  config?: Config
): string {
  const blogConfig = config || getConfig();
  const {
    siteName = DEFAULT_SITE_NAME,
    siteUrl = '',
    defaultAuthor,
  } = blogConfig;

  const items = posts
    .slice(0, RSS_POST_LIMIT)
    .map((post) => {
      const title = resolveFrontmatterField<string>(['title'], post.frontmatter, post.slug) || post.slug;
      const description = resolveFrontmatterField<string>(
        ['description', 'excerpt'],
        post.frontmatter,
        ''
      ) || '';
      const authorObj = post.authors[0];
      const author = authorObj ? getAuthorName(authorObj) : (defaultAuthor || '');
      const pubDate = resolveFrontmatterField<string>(
        ['publishedDate', 'date'],
        post.frontmatter
      ) || new Date().toISOString();
      const url = resolvePostUrlWithConfig(
        resolveFrontmatterField<string>(['canonicalUrl'], post.frontmatter),
        post.slug,
        siteUrl,
        blogConfig
      );

      const rssDate = new Date(pubDate).toUTCString();

      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(author)}</author>
      <pubDate>${rssDate}</pubDate>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Latest blog posts from ${escapeXml(siteName)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
