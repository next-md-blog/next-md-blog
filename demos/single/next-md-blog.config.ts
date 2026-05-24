import { defineSite, defineCollection } from '@next-md-blog/core';

export const site = defineSite({
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
});

export const blog = defineCollection({
  id: 'blog',
  contentDir: 'posts',
  pathSegment: 'blog',
  indexPath: '/blogs',
  site,
});

// Default export kept for any tooling that still expects a single config import.
export default site;
