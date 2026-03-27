# next-md-blog

A React library for parsing and displaying **Markdown** and **MDX** blog posts in **Next.js** (App Router). Keep posts on disk with frontmatter, load them with typed helpers, and ship **metadata**, **Open Graph**, **JSON-LD**, **RSS**, and **sitemap** utilities—plus a **CLI** to scaffold routes, config, **sitemap / robots / RSS (`feed.xml`)** routes, and a **`seo`** subcommand to refresh those files (**`--force`** overwrites existing).

**Documentation:** [next-md-blog.com](https://www.next-md-blog.com) · **Repository:** [github.com/next-md-blog/next-md-blog](https://github.com/next-md-blog/next-md-blog)

## Features

- **Markdown and MDX** — Frontmatter metadata in the same file as the post; GitHub-flavored markdown via the rendering pipeline
- **Server Components** — Designed for the App Router; load posts in RSC route handlers
- **SEO** — Helpers for Next.js `Metadata`, Open Graph, Twitter cards, JSON-LD (`BlogPosting`), RSS, and sitemaps
- **OG images** — CLI can add `opengraph-image` routes; optional `OgImage` building block from core
- **TypeScript** — Typed config, posts, and frontmatter
- **CLI** — `npx @next-md-blog/cli` for posts folder, sample post, config, blog routes, **sitemap.ts / robots.ts / feed.xml** (under `app/` or `src/app/`); **`npx @next-md-blog/cli seo`** to add or update SEO routes only; **`--force`** to overwrite
- **i18n-friendly** — Locale-specific post folders and `locale` option on loaders (see docs)

## Installation

```bash
npm install @next-md-blog/core
```

Peers: **Next.js 16+**, **React 19+**.

## Quick start

### 1. Scaffold with the CLI

From your Next.js project root:

```bash
npx @next-md-blog/cli
```

This can create a `posts/` directory, an example post, `next-md-blog.config.ts`, `/blog/[slug]` and `/blogs` routes, **`sitemap.ts`**, **`robots.ts`**, and **`feed.xml/route.ts`**, optional Open Graph image route, Tailwind Typography tweaks, and install dependencies such as `@next-md-blog/core` and `@tailwindcss/typography`.

Refresh only SEO files (e.g. after a CLI upgrade):

```bash
npx @next-md-blog/cli seo --non-interactive --content-dir=posts
```

Use **`--force`** to replace existing sitemap, robots, and feed files. Full flags: [CLI docs](https://www.next-md-blog.com/cli).

Non-interactive example:

```bash
npx @next-md-blog/cli --non-interactive \
  --content-dir=posts \
  --blog-route=blog \
  --blogs-route=blogs \
  --site-name="My Blog" \
  --site-url="https://example.com" \
  --author="Ada Lovelace" \
  --twitter="@ada"
```

### 2. Add posts

Create `.md` or `.mdx` files under your content directory (often `posts/`). The file name (without extension) is the slug (e.g. `my-post.md` → `/blog/my-post` if you use the default route).

### 3. Configure the site

```tsx
// next-md-blog.config.ts
import { createConfig } from '@next-md-blog/core';

export default createConfig({
  siteName: 'My Blog',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
  defaultAuthor: 'Your Name',
  twitterHandle: '@yourhandle',
  defaultLang: 'en',
});
```

## App Router example

**`app/blog/[slug]/page.tsx`** (Next.js 16 async request APIs):

```tsx
import {
  getBlogPost,
  getAllBlogPosts,
  generateBlogPostMetadata,
  MarkdownContent,
} from '@next-md-blog/core';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import blogConfig from '@/next-md-blog.config';

export async function generateStaticParams() {
  const posts = await getAllBlogPosts({ config: blogConfig });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug, { config: blogConfig });
  if (!post) return { title: 'Post Not Found' };
  return generateBlogPostMetadata(post, blogConfig) as Metadata;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug, { config: blogConfig });
  if (!post) notFound();

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <h1>{post.frontmatter.title}</h1>
      <MarkdownContent content={post.content} />
    </article>
  );
}
```

**`app/blogs/page.tsx`** (listing):

```tsx
import { getAllBlogPosts, generateBlogListMetadata } from '@next-md-blog/core';
import Link from 'next/link';
import type { Metadata } from 'next';
import blogConfig from '@/next-md-blog.config';

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getAllBlogPosts({ config: blogConfig });
  return generateBlogListMetadata(posts, blogConfig) as Metadata;
}

export default async function BlogsPage() {
  const posts = await getAllBlogPosts({ config: blogConfig });

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              {post.frontmatter?.title ?? post.slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Frontmatter (common fields)

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Post title |
| `date` | `string` | Publication date |
| `description` | `string` | SEO description |
| `author` | `string` (or structured authors in config) | Author |
| `tags` | `string[]` | Tags |
| `ogImage` | `string` | Custom OG image URL |
| `image` | `string` | Featured image / OG fallback |

Extra keys remain on `frontmatter` for your own use. Full conventions: [Content & frontmatter](https://www.next-md-blog.com/content-and-frontmatter).

## SEO and OG images

Use **`generateBlogPostMetadata`**, **`generateBlogListMetadata`**, **`BlogPostSEO`**, **`getBlogSitemap`** / **`getBlogRobots`** / **`createRssFeedResponse`** (from `@next-md-blog/core` or `@next-md-blog/core/next`), etc., as shown in the [docs](https://www.next-md-blog.com/seo-and-feeds). The CLI scaffolds **`sitemap.ts`**, **`robots.ts`**, and **`feed.xml/route.ts`** on init, or via **`npx @next-md-blog/cli seo`**.

For dynamic OG images, the CLI can add `app/blog/[slug]/opengraph-image.tsx` using `next/og`’s **`ImageResponse`**. You can also compose visuals with the **`OgImage`** component from core (see package exports and [API reference](https://www.next-md-blog.com/api-reference)).

## Styling

Wrap rendered markdown with Tailwind Typography, for example:

```tsx
<div className="prose prose-lg dark:prose-invert max-w-none">
  <MarkdownContent content={post.content} />
</div>
```

The CLI can wire **`@tailwindcss/typography`** into your global CSS. Demos use **Tailwind v4** and optional **next-themes**.

## API reference

Full signatures, types, and edge cases live in the **[API reference](https://www.next-md-blog.com/api-reference)** on the documentation site.

## Demos and deploy templates

| What | Where | Hosted |
| --- | --- | --- |
| Single-locale demo (monorepo) | [`demos/single`](demos/single) | [demo.next-md-blog.com](https://demo.next-md-blog.com) |
| i18n demo (monorepo) | [`demos/i18n`](demos/i18n) | [demo.i18n.next-md-blog.com](https://demo.i18n.next-md-blog.com) |

**Standalone Vercel starters** (flat repo, npm core—no monorepo clone):

**Single locale** — [next-md-blog/template](https://github.com/next-md-blog/template)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F)

**i18n** — [next-md-blog/template-i18n](https://github.com/next-md-blog/template-i18n)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

After deploy, set **`NEXT_PUBLIC_SITE_URL`** to your production URL.

## Monorepo layout

This repository contains **`@next-md-blog/core`**, **`@next-md-blog/cli`**, the **Nextra docs** site, **demos**, and **templates**. Clone it with:

```bash
git clone https://github.com/next-md-blog/next-md-blog.git
cd next-md-blog
```

Root **`pnpm build`** builds packages, docs, and **both demo apps**. From the repo root, run **`pnpm check`** (lint, typecheck, test, build) before opening a PR—the same sequence as CI. See **[`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)** and [`contributing/`](contributing/).

## Advanced usage

Custom content directory and locale:

```tsx
const post = await getBlogPost('welcome', {
  config: blogConfig,
  postsDir: 'content/blog',
  locale: 'en',
});
```

Custom **`remarkPlugins`** / **`rehypePlugins`** on **`MarkdownContent`** are supported; use trusted plugins only—see the [API reference](https://www.next-md-blog.com/api-reference).

## Contributing

Contributions are welcome. Start with **[`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)**.

## License

MIT

## Links

- [Documentation site](https://www.next-md-blog.com)
- [Getting started](https://www.next-md-blog.com/getting-started)
- [Contributing](.github/CONTRIBUTING.md)
- [Testing (monorepo)](contributing/testing.md)
- [Quick start (local demos)](contributing/quick-start.md)

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=next-md-blog/next-md-blog&type=Date)](https://www.star-history.com/#next-md-blog/next-md-blog&Date)

Combined chart (with another repository on the same graph): [Star History](https://www.star-history.com/?repos=Cyber-Courses%2FCyber-Library%2Cnext-md-blog%2Fnext-md-blog&type=date&legend=top-left).
