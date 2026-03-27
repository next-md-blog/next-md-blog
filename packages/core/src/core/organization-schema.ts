import type { Config } from './types.js';
import { DEFAULT_SITE_NAME } from './constants.js';
import { getConfig } from './config.js';

/**
 * Normalizes siteUrl to an origin with no trailing slash (empty string if invalid).
 */
export function normalizeSiteOrigin(siteUrl: string | undefined): string {
  if (!siteUrl?.trim()) return '';
  try {
    const u = new URL(siteUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return siteUrl.replace(/\/$/, '');
  }
}

/**
 * Stable @id for the site Organization node (fragment on origin).
 */
export function resolveOrganizationId(config?: Config): string | undefined {
  const blogConfig = config || getConfig();
  const org = blogConfig.organization;
  if (org?.id?.trim()) return org.id.trim();
  const origin = normalizeSiteOrigin(blogConfig.siteUrl);
  if (!origin) return undefined;
  return `${origin}/#organization`;
}

/**
 * JSON-LD Organization node for publisher / standalone script.
 */
export function buildOrganizationNode(config?: Config): Record<string, unknown> | undefined {
  const blogConfig = config || getConfig();
  const {
    siteName = DEFAULT_SITE_NAME,
    siteUrl = '',
    organization: org,
  } = blogConfig;

  if (!siteName) return undefined;

  const origin = normalizeSiteOrigin(siteUrl);
  const id = resolveOrganizationId(blogConfig);

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
  };

  if (id) node['@id'] = id;
  if (origin || siteUrl) {
    node.url = origin || siteUrl.replace(/\/$/, '');
  }
  if (org?.legalName) node.legalName = org.legalName;
  if (org?.description) node.description = org.description;
  if (org?.logo) {
    node.logo = {
      '@type': 'ImageObject',
      url: org.logo,
    };
  }
  if (org?.sameAs && org.sameAs.length > 0) {
    node.sameAs = org.sameAs.length === 1 ? org.sameAs[0] : org.sameAs;
  }

  return node;
}

/**
 * Standalone Organization JSON-LD for layout or @graph.
 */
export function generateOrganizationSchema(config?: Config): Record<string, unknown> | undefined {
  return buildOrganizationNode(config);
}

/** Publisher object for BlogPosting (no @context). */
export function buildPublisherEmbedded(config?: Config): Record<string, unknown> | undefined {
  const node = buildOrganizationNode(config);
  if (!node) return undefined;
  const rest = { ...node };
  delete rest['@context'];
  return rest;
}

/** Organization node for @graph (no @context). */
export function buildOrganizationGraphNode(config?: Config): Record<string, unknown> | undefined {
  return buildPublisherEmbedded(config);
}
