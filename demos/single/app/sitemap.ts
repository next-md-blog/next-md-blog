import { getAllBlogPosts } from '@next-md-blog/core';
import { getBlogSitemap } from '@next-md-blog/core/next';
import blogConfig from '../next-md-blog.config';

export default async function sitemap() {
  const posts = await getAllBlogPosts({ config: blogConfig });
  return getBlogSitemap(posts, blogConfig);
}
