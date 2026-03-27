# @next-md-blog/cli

Interactive and non-interactive **initializer** for Next.js projects using **`@next-md-blog/core`**: content directory, example post, `next-md-blog.config.ts`, blog routes, optional Open Graph image route, optional i18n layout, **`sitemap.ts` / `robots.ts` / `feed.xml` RSS route**, and dependency installs (`@next-md-blog/core`, `@tailwindcss/typography`, `@vercel/og` when enabled).

**SEO-only refresh:** `npx @next-md-blog/cli seo` (same content/i18n flags as init). **`--force`** overwrites existing SEO route files.

## Run

```bash
npx @next-md-blog/cli
```

Global binary: **`next-md-blog-init`** (after `npm i -g @next-md-blog/cli`).

## Documentation

- **Published docs:** [https://www.next-md-blog.com](https://www.next-md-blog.com)
- **Live demos:** [demo.next-md-blog.com](https://demo.next-md-blog.com) (single locale) · [demo.i18n.next-md-blog.com](https://demo.i18n.next-md-blog.com) (i18n)
- **Vercel:** single locale [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F) · i18n [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)
- **CLI reference (source MDX):** [docs/content/cli.mdx](https://github.com/next-md-blog/next-md-blog/blob/main/docs/content/cli.mdx)

Local preview: clone [the monorepo](https://github.com/next-md-blog/next-md-blog) (`git clone https://github.com/next-md-blog/next-md-blog.git`), then from the repo root `pnpm install && pnpm dev:docs` → [http://localhost:5101/cli](http://localhost:5101/cli).

## SEO routes only

```bash
npx @next-md-blog/cli seo --non-interactive --content-dir=posts
# Overwrite existing files
npx @next-md-blog/cli seo --non-interactive --content-dir=posts --force
```

## Non-interactive example

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

## Links

- [npm](https://www.npmjs.com/package/@next-md-blog/cli)
- [Core package](https://www.npmjs.com/package/@next-md-blog/core)
- [Issues](https://github.com/next-md-blog/next-md-blog/issues)

## License

MIT
