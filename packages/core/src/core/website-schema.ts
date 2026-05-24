/**
 * Site-level WebSite + SearchAction JSON-LD generator.
 */
import type { SiteConfig } from './site.js';

export interface WebsiteSchemaOptions {
  /** Currently rendered locale (sets `inLanguage` + site URL prefix). */
  locale?: string;
  /**
   * Site-relative path of the search page (e.g. '/search').
   * If provided, emits a SearchAction with `{search_term_string}`.
   */
  searchPath?: string;
}

export function generateWebsiteSchema(
  site: SiteConfig,
  opts: WebsiteSchemaOptions = {},
): Record<string, unknown> {
  const base = site.siteUrl.replace(/\/$/, '');
  const locale = opts.locale;
  const url = locale ? `${base}/${locale}` : base;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url,
    name: site.siteName,
    ...(locale && { inLanguage: locale }),
    publisher: { '@id': `${base}/#organization` },
  };
  if (opts.searchPath) {
    const target = `${url}${opts.searchPath.startsWith('/') ? '' : '/'}${opts.searchPath}?q={search_term_string}`;
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: target },
      'query-input': 'required name=search_term_string',
    };
  }
  return schema;
}
