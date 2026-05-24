import { composeSitemap } from '@next-md-blog/core';
import { blog, site } from '../next-md-blog.config';

const DEFAULT_LOCALES = [site.defaultLang ?? 'en'] as const;

export default async function sitemap() {
  return composeSitemap({
    collections: [blog],
    locales: DEFAULT_LOCALES,
  });
}
