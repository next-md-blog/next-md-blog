import { composeSitemap } from '@next-md-blog/core';
import { blog, LOCALES } from '../next-md-blog.config';

export default async function sitemap() {
  return composeSitemap({
    collections: [blog],
    locales: LOCALES,
  });
}
