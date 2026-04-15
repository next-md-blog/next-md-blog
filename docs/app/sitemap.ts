import type { MetadataRoute } from 'next';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const dir = join(process.cwd(), 'content');
  const files = readdirSync(dir).filter(
    (name) => (name.endsWith('.mdx') || name.endsWith('.md')) && !name.startsWith('_'),
  );

  return files.map((file) => {
    const base = file.replace(/\.(mdx|md)$/i, '');
    const pathname = base === 'index' ? '/' : `/${base}`;
    const lastModified = statSync(join(dir, file)).mtime;

    return {
      url: new URL(pathname, SITE_URL).toString(),
      lastModified,
      changeFrequency: base === 'index' ? ('weekly' as const) : ('monthly' as const),
      priority: base === 'index' ? 1 : 0.75,
    };
  });
}
