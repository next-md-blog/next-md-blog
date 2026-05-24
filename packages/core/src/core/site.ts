/**
 * Site-level configuration. Shared across every collection on the site.
 *
 * `SiteConfig` replaces the old `Config` interface — collection-scoped concerns
 * (postsDir, blogPostPathSegment, blogIndexPath) moved into `CollectionConfig`.
 */
import type { Author, SiteOrganization } from './types.js';

export interface SiteConfig {
  /** Site name — used in `<title>` suffixes, OG site_name, Organization.name. */
  siteName: string;
  /** Canonical origin (no trailing slash). e.g. https://example.com */
  siteUrl: string;
  /** Fallback author when a post has no author in frontmatter. */
  defaultAuthor?: string;
  /** Rich author list used to resolve names → profiles. */
  authors?: Author[];
  /** Twitter / X handle for Twitter Card metadata. */
  twitterHandle?: string;
  /** Default OG image (collection / post can override). */
  defaultOgImage?: string;
  /** Default language code (e.g. 'en'). */
  defaultLang?: string;
  /** Organization JSON-LD. */
  organization?: SiteOrganization;
}

/**
 * Helper: type-narrowing constructor with sensible defaults.
 */
export function defineSite(config: SiteConfig): SiteConfig {
  return {
    defaultLang: 'en',
    ...config,
    siteUrl: config.siteUrl.replace(/\/$/, ''),
  };
}

export type { Author, SiteOrganization, PostalAddress, ContactPoint } from './types.js';
