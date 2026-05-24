import { defineSite, defineCollection } from '@next-md-blog/core';

export const site = defineSite({
  siteName: 'Multi-Language Blog',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  defaultAuthor: 'Example Author',
  twitterHandle: '@example',
  defaultLang: 'en',
});

export const LOCALES = ['en', 'fr'] as const;

export const blog = defineCollection({
  id: 'blog',
  contentDir: 'posts',
  pathSegment: 'blog',
  indexPath: '/blogs',
  site,
});

// Default export kept for tooling that imports a single config.
export default site;
