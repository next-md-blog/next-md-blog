import { createConfig } from '@next-md-blog/core';

export default createConfig({
  siteName: 'Multi-Language Blog',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  defaultAuthor: 'Example Author',
  twitterHandle: '@example',
  defaultLang: 'en',
  // OG images are automatically generated via opengraph-image.tsx file convention
  // defaultOgImage: 'https://example.com/default-og.jpg',
});
