import type { MetadataRoute } from 'next';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL } from '../lib/site';

// No `lastModified`: file mtimes on Vercel are the checkout/build time, so every
// deploy claimed every page had just changed. Vercel clones shallowly, so git
// history is not a reliable source either. Search engines ignore a lastmod they
// cannot trust; omitting it is better than sending a false one.
// Fresh URLs are pushed to Bing/Yandex via IndexNow (.github/workflows/indexnow.yml).
export default function sitemap(): MetadataRoute.Sitemap {
  const dir = join(process.cwd(), 'content');
  const files = readdirSync(dir).filter(
    (name) => (name.endsWith('.mdx') || name.endsWith('.md')) && !name.startsWith('_'),
  );

  return files.map((file) => {
    const base = file.replace(/\.(mdx|md)$/i, '');
    const pathname = base === 'index' ? '/' : `/${base}`;

    return {
      url: new URL(pathname, SITE_URL).toString(),
      changeFrequency: base === 'index' ? ('weekly' as const) : ('monthly' as const),
      priority: base === 'index' ? 1 : 0.75,
    };
  });
}
