# @next-md-blog/core

**Next.js App Router–first** helpers for **Markdown / MDX** posts on disk: **`MarkdownContent`**, **`generateBlogPostMetadata`**, **JSON-LD** (including richer **Organization** publisher data), **RSS**, and SEO via **[metadata file conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)** — use **`app/sitemap.ts`** / **`app/robots.ts`** / optional **`feed.xml`** with **`@next-md-blog/core/next`** (`getBlogSitemap`, `getBlogRobots`, `createRssFeedResponse`).

## Install

```bash
npm install @next-md-blog/core
```

Peers: `next@^16`, `react@^19`, `react-dom@^19`.

## Documentation

- **Published docs:** [https://www.next-md-blog.com](https://www.next-md-blog.com)
- **Live demos:** [demo.next-md-blog.com](https://demo.next-md-blog.com) (single locale) · [demo.i18n.next-md-blog.com](https://demo.i18n.next-md-blog.com) (i18n)
- **Vercel:** single locale [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F) · i18n [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)
- **Source & issues:** [github.com/next-md-blog/next-md-blog](https://github.com/next-md-blog/next-md-blog)

To build the docs locally:

```bash
git clone https://github.com/next-md-blog/next-md-blog.git
cd next-md-blog
pnpm install && pnpm dev:docs
```

Then open [http://localhost:5101](http://localhost:5101).

Entry points in the repo: [Home / overview](https://github.com/next-md-blog/next-md-blog/blob/main/docs/content/index.mdx), [API reference](https://github.com/next-md-blog/next-md-blog/blob/main/docs/content/api-reference.mdx).

## Quick usage

```tsx
import {
  getBlogPost,
  getAllBlogPosts,
  MarkdownContent,
  createConfig,
  generateBlogPostMetadata,
} from '@next-md-blog/core';
import blogConfig from '@/next-md-blog.config';

const post = await getBlogPost('hello', { config: blogConfig });
```

Scaffold routes, **`sitemap.ts`**, **`robots.ts`**, and config with **`npx @next-md-blog/cli`**.

### `app/sitemap.ts` / `app/robots.ts`

```ts
import { getAllBlogPosts } from '@next-md-blog/core';
import { getBlogSitemap, getBlogRobots } from '@next-md-blog/core/next';
import blogConfig from '@/next-md-blog.config';

export default async function sitemap() {
  const posts = await getAllBlogPosts({ config: blogConfig });
  return getBlogSitemap(posts, blogConfig);
}
```

```ts
import { getBlogRobots } from '@next-md-blog/core/next';
import blogConfig from '@/next-md-blog.config';

export default function robots() {
  return getBlogRobots(blogConfig);
}
```

## Links

- [npm](https://www.npmjs.com/package/@next-md-blog/core)
- [Issues](https://github.com/next-md-blog/next-md-blog/issues)
- Source: [`packages/core`](https://github.com/next-md-blog/next-md-blog/tree/main/packages/core)

## License

MIT
