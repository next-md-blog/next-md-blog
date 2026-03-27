import { getAllBlogPosts, getBlogPost } from '@next-md-blog/core';
import { createRssFeedResponse } from '@next-md-blog/core/next';
import blogConfig from '../../next-md-blog.config';

export async function GET() {
  const postsMetadata = await getAllBlogPosts({ config: blogConfig });

  const posts = await Promise.all(
    postsMetadata.slice(0, 20).map(async (postMeta) => getBlogPost(postMeta.slug, { config: blogConfig }))
  );

  const validPosts = posts.filter((post): post is NonNullable<typeof post> => post !== null);

  return createRssFeedResponse(validPosts, blogConfig);
}
