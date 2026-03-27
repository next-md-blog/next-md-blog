import { getAllBlogPosts } from '@next-md-blog/core';
import { getBlogSitemap } from '@next-md-blog/core/next';
import blogConfig from '../next-md-blog.config';

const locales = ['en', 'fr'] as const;

export default async function sitemap() {
  const allPosts = [];
  for (const locale of locales) {
    const posts = await getAllBlogPosts({ locale, config: blogConfig });
    allPosts.push(...posts);
  }
  return getBlogSitemap(allPosts, blogConfig);
}
