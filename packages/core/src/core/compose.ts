/**
 * Site-wide composition helpers. They walk one or more collections and
 * aggregate the per-collection output (sitemap entries, llms.txt chunks).
 */
import type { MetadataRoute } from 'next';
import type { Collection } from './collection.js';
import type { SiteConfig } from './site.js';

export interface ComposeSitemapOptions {
  collections: Collection<never>[] | Collection[];
  locales: readonly string[];
  /**
   * Static / non-collection routes to include verbatim. Each is paired with
   * the canonical hreflang treatment if `hreflangFor` is provided.
   */
  staticEntries?: MetadataRoute.Sitemap;
}

export async function composeSitemap(
  opts: ComposeSitemapOptions,
): Promise<MetadataRoute.Sitemap> {
  const out: MetadataRoute.Sitemap = [...(opts.staticEntries ?? [])];
  for (const collection of opts.collections) {
    const entries = await collection.sitemapEntries({ locales: opts.locales });
    out.push(...entries);
  }
  return out;
}

export interface ComposeLlmsTxtOptions {
  site: SiteConfig;
  collections: Collection<never>[] | Collection[];
  locales: readonly string[];
  defaultLocale?: string;
  /** Free-form summary block at the top of llms.txt. */
  summary?: string;
}

export async function composeLlmsTxt(
  opts: ComposeLlmsTxtOptions,
): Promise<string> {
  const { site, collections, locales } = opts;
  const defaultLocale = opts.defaultLocale ?? locales[0];
  const siteUrl = site.siteUrl.replace(/\/$/, '');
  const lines: string[] = [];
  lines.push(`# ${site.siteName}`);
  lines.push('');
  if (opts.summary) {
    lines.push(`> ${opts.summary}`);
  } else if (siteUrl) {
    lines.push(`> Canonical site: ${siteUrl}`);
  }
  lines.push('');
  for (const collection of collections) {
    const section = await collection.llmsTxtSection({
      locales,
      ...(defaultLocale ? { defaultLocale } : {}),
    });
    if (section.trim()) lines.push(section);
  }
  if (siteUrl) {
    lines.push('## Feeds');
    lines.push('');
    for (const collection of collections) {
      if (collection.config.rss === false) continue;
      for (const locale of locales) {
        lines.push(
          `- [${collection.config.label} RSS — ${locale}](${siteUrl}/${locale}/${collection.config.pathSegment}/feed.xml)`,
        );
      }
    }
    lines.push('');
    lines.push(`- [Full prose](${siteUrl}/llms-full.txt)`);
  }
  return lines.join('\n');
}

export async function composeLlmsFullTxt(
  opts: ComposeLlmsTxtOptions,
): Promise<string> {
  const { site, collections, locales } = opts;
  const siteUrl = site.siteUrl.replace(/\/$/, '');
  const out: string[] = [];
  out.push(`# ${site.siteName}`);
  out.push('');
  if (opts.summary) out.push(`> ${opts.summary}`);
  if (siteUrl) out.push(`> Source: ${siteUrl}`);
  out.push('');
  for (const collection of collections) {
    const section = await collection.llmsFullTxtSection({ locales });
    if (section.trim()) out.push(section);
  }
  return out.join('\n');
}
