import type { SiteOrganization } from './types.js';

/** Structural type — accepts a full SiteConfig or any legacy Config. */
interface OrgSource {
  siteName?: string;
  siteUrl?: string;
  organization?: SiteOrganization;
}

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
export function resolveOrganizationId(source?: OrgSource): string | undefined {
  const org = source?.organization;
  if (org?.id?.trim()) return org.id.trim();
  const origin = normalizeSiteOrigin(source?.siteUrl);
  if (!origin) return undefined;
  return `${origin}/#organization`;
}

/**
 * JSON-LD Organization node for publisher / standalone script.
 */
export function buildOrganizationNode(
  source?: OrgSource,
): Record<string, unknown> | undefined {
  const siteName = source?.siteName;
  const siteUrl = source?.siteUrl ?? '';
  const org = source?.organization;

  if (!siteName) return undefined;

  const origin = normalizeSiteOrigin(siteUrl);
  const id = resolveOrganizationId(source);

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
    node.logo = { '@type': 'ImageObject', url: org.logo };
  }
  if (org?.foundingDate) node.foundingDate = org.foundingDate;
  if (org?.founder) {
    node.founder = { '@type': 'Person', name: org.founder };
  }
  if (org?.address && Object.values(org.address).some(Boolean)) {
    node.address = { '@type': 'PostalAddress', ...org.address };
  }
  if (org?.contactPoint && Object.values(org.contactPoint).some(Boolean)) {
    node.contactPoint = { '@type': 'ContactPoint', ...org.contactPoint };
  }
  const sameAsList = [
    ...(org?.sameAs ?? []),
    ...(org?.wikidata ? [org.wikidata] : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);
  if (sameAsList.length > 0) {
    node.sameAs = sameAsList.length === 1 ? sameAsList[0] : sameAsList;
  }

  return node;
}

/**
 * Standalone Organization JSON-LD for layout or @graph.
 */
export function generateOrganizationSchema(
  source?: OrgSource,
): Record<string, unknown> | undefined {
  return buildOrganizationNode(source);
}

/** Publisher object for BlogPosting (no @context). */
export function buildPublisherEmbedded(
  source?: OrgSource,
): Record<string, unknown> | undefined {
  const node = buildOrganizationNode(source);
  if (!node) return undefined;
  const rest = { ...node };
  delete rest['@context'];
  return rest;
}

/** Organization node for @graph (no @context). */
export function buildOrganizationGraphNode(
  source?: OrgSource,
): Record<string, unknown> | undefined {
  return buildPublisherEmbedded(source);
}
