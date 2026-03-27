import { createConfig } from '@next-md-blog/core';

export default createConfig({
  siteName: 'next-md-blog demo',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  defaultAuthor: 'Blog Author',
  authors: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software developer and blogger',
      avatar: '/example.jpg',
      twitter: '@johndoe',
      github: 'johndoe',
      url: 'https://johndoe.example.com',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'Tech writer and content creator',
      twitter: '@janesmith',
    },
  ],
  twitterHandle: '@example',
  defaultLang: 'en',
  // OG images are automatically generated via opengraph-image.tsx file convention
  // defaultOgImage: 'https://example.com/default-og.jpg',
});

